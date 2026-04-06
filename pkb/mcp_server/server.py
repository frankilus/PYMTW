"""MCP (Model Context Protocol) server for the Personal Knowledge Base.

This exposes your entire knowledge base as tools accessible from Claude,
Claude Code, ChatGPT, or any MCP-compatible client.

Usage:
    pkb mcp-serve                     # stdio transport (for Claude Code)
    pkb mcp-serve --transport sse     # SSE transport (for web clients)

Or add to your Claude Code MCP config:
    {
        "mcpServers": {
            "pkb": {
                "command": "pkb",
                "args": ["mcp-serve"]
            }
        }
    }
"""
from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

from pkb.core.entry import Entry, EntryType
from pkb.core.index import SearchIndex
from pkb.core.store import KnowledgeStore
from pkb.rules.engine import RulesEngine
from pkb.suggestions.engine import SuggestionsEngine

# ── Tool Definitions ───────────────────────────────────────────────

TOOLS = [
    {
        "name": "pkb_search",
        "description": "Search your personal knowledge base. Finds entries by keywords across titles, content, and tags.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search query"},
                "limit": {"type": "integer", "description": "Max results (default 10)", "default": 10},
            },
            "required": ["query"],
        },
    },
    {
        "name": "pkb_add",
        "description": "Add a new entry to your personal knowledge base.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "title": {"type": "string", "description": "Entry title"},
                "content": {"type": "string", "description": "Entry content (markdown)"},
                "entry_type": {
                    "type": "string",
                    "enum": [t.value for t in EntryType],
                    "description": "Type of entry",
                    "default": "note",
                },
                "tags": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Tags for categorization",
                },
                "source": {"type": "string", "description": "Source of the entry", "default": "manual"},
            },
            "required": ["title", "content"],
        },
    },
    {
        "name": "pkb_get",
        "description": "Get a specific entry by ID from your knowledge base.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "id": {"type": "string", "description": "Entry ID"},
            },
            "required": ["id"],
        },
    },
    {
        "name": "pkb_update",
        "description": "Update an existing entry in your knowledge base.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "id": {"type": "string", "description": "Entry ID to update"},
                "title": {"type": "string", "description": "New title (optional)"},
                "content": {"type": "string", "description": "New content (optional)"},
                "tags": {"type": "array", "items": {"type": "string"}, "description": "New tags (optional)"},
            },
            "required": ["id"],
        },
    },
    {
        "name": "pkb_delete",
        "description": "Delete an entry from your knowledge base (moves to trash).",
        "inputSchema": {
            "type": "object",
            "properties": {
                "id": {"type": "string", "description": "Entry ID to delete"},
            },
            "required": ["id"],
        },
    },
    {
        "name": "pkb_list",
        "description": "List entries in your knowledge base with optional filters.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "entry_type": {"type": "string", "enum": [t.value for t in EntryType], "description": "Filter by type"},
                "tag": {"type": "string", "description": "Filter by tag"},
                "source": {"type": "string", "description": "Filter by source"},
                "limit": {"type": "integer", "description": "Max results", "default": 20},
            },
        },
    },
    {
        "name": "pkb_tags",
        "description": "List all tags in your knowledge base with entry counts.",
        "inputSchema": {"type": "object", "properties": {}},
    },
    {
        "name": "pkb_stats",
        "description": "Get summary statistics about your knowledge base.",
        "inputSchema": {"type": "object", "properties": {}},
    },
    {
        "name": "pkb_suggest",
        "description": "Get proactive suggestions based on your knowledge base content.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "context": {"type": "string", "description": "Current context to base suggestions on (optional)"},
            },
        },
    },
    {
        "name": "pkb_recent",
        "description": "Get the most recent entries across all sources.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "limit": {"type": "integer", "description": "Number of entries", "default": 10},
            },
        },
    },
]

# ── Resource Definitions ───────────────────────────────────────────

RESOURCES = [
    {
        "uri": "pkb://stats",
        "name": "Knowledge Base Stats",
        "description": "Summary statistics about your personal knowledge base",
        "mimeType": "application/json",
    },
    {
        "uri": "pkb://recent",
        "name": "Recent Entries",
        "description": "The 20 most recent entries in your knowledge base",
        "mimeType": "application/json",
    },
]


class PKBServer:
    """Handles MCP protocol messages for the knowledge base."""

    def __init__(self, kb_root: str | Path | None = None):
        root = Path(kb_root) if kb_root else Path.home() / ".pkb"
        self.store = KnowledgeStore(root)
        self.index = SearchIndex(root / "indexes" / "search")
        self.rules = RulesEngine(root / "config" / "rules.yaml")
        self.suggestions = SuggestionsEngine(self.store)

    def handle_tool_call(self, name: str, arguments: dict[str, Any]) -> dict:
        """Route a tool call to the appropriate handler."""
        handlers = {
            "pkb_search": self._search,
            "pkb_add": self._add,
            "pkb_get": self._get,
            "pkb_update": self._update,
            "pkb_delete": self._delete,
            "pkb_list": self._list,
            "pkb_tags": self._tags,
            "pkb_stats": self._stats,
            "pkb_suggest": self._suggest,
            "pkb_recent": self._recent,
        }
        handler = handlers.get(name)
        if not handler:
            return {"error": f"Unknown tool: {name}"}
        try:
            return handler(arguments)
        except Exception as e:
            return {"error": str(e)}

    def handle_resource(self, uri: str) -> dict:
        """Handle a resource read request."""
        if uri == "pkb://stats":
            return self.store.stats()
        elif uri == "pkb://recent":
            entries = self.store.list_entries(limit=20)
            return {"entries": [e.model_dump(mode="json") for e in entries]}
        return {"error": f"Unknown resource: {uri}"}

    # ── Tool Handlers ──────────────────────────────────────────────

    def _search(self, args: dict) -> dict:
        results = self.index.search(args["query"], limit=args.get("limit", 10))
        return {"results": results, "count": len(results)}

    def _add(self, args: dict) -> dict:
        entry = Entry(
            title=args["title"],
            content=args["content"],
            entry_type=EntryType(args.get("entry_type", "note")),
            tags=args.get("tags", []),
            source=args.get("source", "manual"),
        )
        # Apply rules before saving
        entry = self.rules.apply(entry)
        path = self.store.save(entry)
        self.index.add(entry)
        return {"id": entry.id, "path": str(path), "message": f"Entry '{entry.title}' saved."}

    def _get(self, args: dict) -> dict:
        entry = self.store.get(args["id"])
        if not entry:
            return {"error": "Entry not found"}
        return entry.model_dump(mode="json")

    def _update(self, args: dict) -> dict:
        entry = self.store.get(args["id"])
        if not entry:
            return {"error": "Entry not found"}
        if "title" in args:
            entry.title = args["title"]
        if "content" in args:
            entry.content = args["content"]
        if "tags" in args:
            entry.tags = args["tags"]
        entry = self.rules.apply(entry)
        self.store.save(entry)
        self.index.add(entry)
        return {"id": entry.id, "message": "Entry updated."}

    def _delete(self, args: dict) -> dict:
        if self.store.delete(args["id"]):
            self.index.remove(args["id"])
            return {"message": "Entry moved to trash."}
        return {"error": "Entry not found"}

    def _list(self, args: dict) -> dict:
        entry_type = EntryType(args["entry_type"]) if args.get("entry_type") else None
        entries = self.store.list_entries(
            entry_type=entry_type,
            tag=args.get("tag"),
            source=args.get("source"),
            limit=args.get("limit", 20),
        )
        return {
            "entries": [
                {"id": e.id, "title": e.title, "type": e.entry_type.value, "tags": e.tags, "source": e.source}
                for e in entries
            ],
            "count": len(entries),
        }

    def _tags(self, _args: dict) -> dict:
        return {"tags": self.store.all_tags()}

    def _stats(self, _args: dict) -> dict:
        return self.store.stats()

    def _suggest(self, args: dict) -> dict:
        suggestions = self.suggestions.generate(context=args.get("context"))
        return {"suggestions": suggestions}

    def _recent(self, args: dict) -> dict:
        entries = self.store.list_entries(limit=args.get("limit", 10))
        return {
            "entries": [
                {
                    "id": e.id,
                    "title": e.title,
                    "type": e.entry_type.value,
                    "source": e.source,
                    "created_at": e.created_at.isoformat(),
                    "preview": e.content[:200],
                }
                for e in entries
            ]
        }


def run_stdio_server(kb_root: str | Path | None = None) -> None:
    """Run the MCP server over stdio (JSON-RPC 2.0)."""
    server = PKBServer(kb_root)

    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            request = json.loads(line)
        except json.JSONDecodeError:
            continue

        method = request.get("method", "")
        req_id = request.get("id")
        params = request.get("params", {})

        response: dict[str, Any] = {"jsonrpc": "2.0", "id": req_id}

        if method == "initialize":
            response["result"] = {
                "protocolVersion": "2024-11-05",
                "capabilities": {
                    "tools": {"listChanged": False},
                    "resources": {"subscribe": False, "listChanged": False},
                },
                "serverInfo": {"name": "pkb", "version": "0.1.0"},
            }
        elif method == "tools/list":
            response["result"] = {"tools": TOOLS}
        elif method == "tools/call":
            tool_name = params.get("name", "")
            tool_args = params.get("arguments", {})
            result = server.handle_tool_call(tool_name, tool_args)
            response["result"] = {
                "content": [{"type": "text", "text": json.dumps(result, indent=2, default=str)}]
            }
        elif method == "resources/list":
            response["result"] = {"resources": RESOURCES}
        elif method == "resources/read":
            uri = params.get("uri", "")
            result = server.handle_resource(uri)
            response["result"] = {
                "contents": [{"uri": uri, "mimeType": "application/json", "text": json.dumps(result, default=str)}]
            }
        elif method == "notifications/initialized":
            continue  # No response needed for notifications
        else:
            response["error"] = {"code": -32601, "message": f"Method not found: {method}"}

        sys.stdout.write(json.dumps(response) + "\n")
        sys.stdout.flush()

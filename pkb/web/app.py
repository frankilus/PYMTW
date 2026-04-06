"""FastAPI web application — serves the Notion-like UI and REST API."""
from __future__ import annotations

from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from pkb.core.entry import Entry, EntryType
from pkb.core.index import SearchIndex
from pkb.core.store import KnowledgeStore
from pkb.rules.engine import RulesEngine
from pkb.suggestions.engine import SuggestionsEngine

app = FastAPI(title="PKB — Personal Knowledge Base", version="0.1.0")

# These get initialized in create_app()
store: KnowledgeStore
index: SearchIndex
rules: RulesEngine
suggestions: SuggestionsEngine


def create_app(kb_root: str | Path | None = None) -> FastAPI:
    global store, index, rules, suggestions
    root = Path(kb_root) if kb_root else Path.home() / ".pkb"
    store = KnowledgeStore(root)
    index = SearchIndex(root / "indexes" / "search")
    rules = RulesEngine(root / "config" / "rules.yaml")
    suggestions = SuggestionsEngine(store)
    return app


# ── Request/Response Models ────────────────────────────────────────


class EntryCreate(BaseModel):
    title: str
    content: str = ""
    entry_type: str = "note"
    tags: list[str] = []
    source: str = "manual"


class EntryUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    tags: list[str] | None = None
    pinned: bool | None = None
    archived: bool | None = None


# ── API Routes ─────────────────────────────────────────────────────


@app.get("/api/entries")
def list_entries(
    entry_type: str | None = None,
    tag: str | None = None,
    source: str | None = None,
    limit: int = 50,
    offset: int = 0,
) -> dict[str, Any]:
    et = EntryType(entry_type) if entry_type else None
    entries = store.list_entries(entry_type=et, tag=tag, source=source, limit=limit, offset=offset)
    return {
        "entries": [e.model_dump(mode="json") for e in entries],
        "count": len(entries),
    }


@app.post("/api/entries")
def create_entry(body: EntryCreate) -> dict:
    entry = Entry(
        title=body.title,
        content=body.content,
        entry_type=EntryType(body.entry_type),
        tags=body.tags,
        source=body.source,
    )
    entry = rules.apply(entry)
    path = store.save(entry)
    index.add(entry)
    return {"id": entry.id, "path": str(path)}


@app.get("/api/entries/{entry_id}")
def get_entry(entry_id: str) -> dict:
    entry = store.get(entry_id)
    if not entry:
        raise HTTPException(404, "Entry not found")
    return entry.model_dump(mode="json")


@app.put("/api/entries/{entry_id}")
def update_entry(entry_id: str, body: EntryUpdate) -> dict:
    entry = store.get(entry_id)
    if not entry:
        raise HTTPException(404, "Entry not found")
    if body.title is not None:
        entry.title = body.title
    if body.content is not None:
        entry.content = body.content
    if body.tags is not None:
        entry.tags = body.tags
    if body.pinned is not None:
        entry.pinned = body.pinned
    if body.archived is not None:
        entry.archived = body.archived
    entry = rules.apply(entry)
    store.save(entry)
    index.add(entry)
    return {"id": entry.id, "message": "Updated"}


@app.delete("/api/entries/{entry_id}")
def delete_entry(entry_id: str) -> dict:
    if store.delete(entry_id):
        index.remove(entry_id)
        return {"message": "Moved to trash"}
    raise HTTPException(404, "Entry not found")


@app.get("/api/search")
def search(q: str, limit: int = 20) -> dict:
    results = index.search(q, limit=limit)
    return {"results": results, "count": len(results)}


@app.get("/api/tags")
def list_tags() -> dict:
    return {"tags": store.all_tags()}


@app.get("/api/stats")
def get_stats() -> dict:
    return store.stats()


@app.get("/api/suggestions")
def get_suggestions(context: str | None = None) -> dict:
    return {"suggestions": suggestions.generate(context=context)}


@app.get("/api/rules")
def list_rules() -> dict:
    return {"rules": rules.list_rules()}


# ── Web UI ─────────────────────────────────────────────────────────


@app.get("/", response_class=HTMLResponse)
def serve_ui():
    """Serve the single-page Notion-like UI."""
    html_path = Path(__file__).parent / "ui.html"
    return HTMLResponse(html_path.read_text(encoding="utf-8"))

"""Claude connector — imports conversations from Claude data exports.

How to use:
    1. Go to claude.ai → Settings → Export Data
    2. Download and extract the archive
    3. Point this connector at the extracted directory (contains conversations/)

Also supports importing Claude Code session logs from ~/.claude/
"""
from __future__ import annotations

import datetime as dt
import json
from pathlib import Path

from pkb.connectors.base import BaseConnector
from pkb.core.entry import Entry, EntryType


class ClaudeExportConnector(BaseConnector):
    """Import from Claude.ai data export."""

    name = "claude"

    def __init__(self, export_dir: str | Path):
        self.export_dir = Path(export_dir)

    def authenticate(self) -> None:
        if not self.export_dir.exists():
            raise FileNotFoundError(f"Export directory not found: {self.export_dir}")

    def fetch_new(self, since: dt.datetime | None = None) -> list[Entry]:
        entries = self.fetch_all()
        if since:
            entries = [e for e in entries if e.created_at >= since]
        return entries

    def fetch_all(self) -> list[Entry]:
        entries: list[Entry] = []

        # Try conversations.json (Claude.ai export format)
        convos_file = self.export_dir / "conversations.json"
        if convos_file.exists():
            entries.extend(self._parse_conversations_json(convos_file))

        # Try individual JSON files in conversations/ directory
        convos_dir = self.export_dir / "conversations"
        if convos_dir.is_dir():
            for f in convos_dir.glob("*.json"):
                try:
                    entries.extend(self._parse_single_conversation(f))
                except Exception:
                    continue

        return entries

    def _parse_conversations_json(self, path: Path) -> list[Entry]:
        data = json.loads(path.read_text(encoding="utf-8"))
        entries: list[Entry] = []
        for convo in data:
            entries.extend(self._convo_to_entries(convo))
        return entries

    def _parse_single_conversation(self, path: Path) -> list[Entry]:
        convo = json.loads(path.read_text(encoding="utf-8"))
        return self._convo_to_entries(convo)

    def _convo_to_entries(self, convo: dict) -> list[Entry]:
        title = convo.get("name", convo.get("title", "Untitled"))
        created_str = convo.get("created_at", "")
        created = (
            dt.datetime.fromisoformat(created_str.replace("Z", "+00:00"))
            if created_str
            else dt.datetime.now()
        )

        messages: list[str] = []
        for msg in convo.get("chat_messages", convo.get("messages", [])):
            role = msg.get("sender", msg.get("role", "unknown"))
            text = ""
            # Handle different content formats
            content = msg.get("content", msg.get("text", ""))
            if isinstance(content, list):
                text = " ".join(
                    p.get("text", str(p)) if isinstance(p, dict) else str(p)
                    for p in content
                )
            elif isinstance(content, str):
                text = content
            if text.strip():
                messages.append(f"**{role}:** {text}")

        content = "\n\n---\n\n".join(messages)

        return [
            Entry(
                title=title,
                content=content[:50000],
                entry_type=EntryType.CONVERSATION,
                source="claude",
                source_id=convo.get("uuid", convo.get("id", "")),
                tags=["claude", "ai-conversation"],
                created_at=created,
                metadata={"model": convo.get("model", "")},
            )
        ]


class ClaudeCodeConnector(BaseConnector):
    """Import Claude Code session history from ~/.claude/projects/."""

    name = "claude-code"

    def __init__(self, claude_dir: str | Path | None = None):
        self.claude_dir = Path(claude_dir) if claude_dir else Path.home() / ".claude"

    def authenticate(self) -> None:
        if not self.claude_dir.exists():
            raise FileNotFoundError(f"Claude Code directory not found: {self.claude_dir}")

    def fetch_new(self, since: dt.datetime | None = None) -> list[Entry]:
        entries = self.fetch_all()
        if since:
            entries = [e for e in entries if e.created_at >= since]
        return entries

    def fetch_all(self) -> list[Entry]:
        entries: list[Entry] = []
        projects_dir = self.claude_dir / "projects"
        if not projects_dir.exists():
            return entries

        for session_file in projects_dir.rglob("*.jsonl"):
            try:
                entries.extend(self._parse_session(session_file))
            except Exception:
                continue
        return entries

    def _parse_session(self, path: Path) -> list[Entry]:
        messages: list[str] = []
        first_ts = None

        for line in path.read_text(encoding="utf-8").splitlines():
            if not line.strip():
                continue
            try:
                msg = json.loads(line)
            except json.JSONDecodeError:
                continue

            role = msg.get("role", "unknown")
            ts = msg.get("timestamp")
            if ts and not first_ts:
                first_ts = dt.datetime.fromisoformat(ts.replace("Z", "+00:00"))

            content = msg.get("content", "")
            if isinstance(content, list):
                text = " ".join(
                    p.get("text", "") if isinstance(p, dict) else str(p)
                    for p in content
                )
            elif isinstance(content, str):
                text = content
            else:
                text = str(content)

            if text.strip():
                messages.append(f"**{role}:** {text[:2000]}")

        if not messages:
            return []

        project_name = path.parent.name
        content = "\n\n---\n\n".join(messages[:100])  # Cap at 100 messages

        return [
            Entry(
                title=f"Claude Code session: {project_name}",
                content=content[:50000],
                entry_type=EntryType.CONVERSATION,
                source="claude-code",
                source_id=path.stem,
                tags=["claude-code", "ai-conversation", project_name],
                created_at=first_ts or dt.datetime.now(),
                metadata={"project": project_name, "file": str(path)},
            )
        ]

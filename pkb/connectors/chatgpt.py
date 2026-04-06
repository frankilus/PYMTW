"""ChatGPT connector — imports conversations from the ChatGPT data export.

How to use:
    1. Go to ChatGPT → Settings → Data Controls → Export Data
    2. Download the .zip and extract it
    3. Point this connector at the extracted directory (contains conversations.json)
"""
from __future__ import annotations

import datetime as dt
import json
from pathlib import Path

from pkb.connectors.base import BaseConnector
from pkb.core.entry import Entry, EntryType


class ChatGPTConnector(BaseConnector):
    name = "chatgpt"

    def __init__(self, export_dir: str | Path):
        self.export_dir = Path(export_dir)

    def authenticate(self) -> None:
        convos = self.export_dir / "conversations.json"
        if not convos.exists():
            raise FileNotFoundError(
                f"conversations.json not found in {self.export_dir}. "
                "Export your data from ChatGPT Settings → Data Controls → Export."
            )

    def fetch_new(self, since: dt.datetime | None = None) -> list[Entry]:
        entries = self.fetch_all()
        if since:
            entries = [e for e in entries if e.created_at >= since]
        return entries

    def fetch_all(self) -> list[Entry]:
        convos_file = self.export_dir / "conversations.json"
        convos = json.loads(convos_file.read_text(encoding="utf-8"))
        entries: list[Entry] = []

        for convo in convos:
            title = convo.get("title", "Untitled Conversation")
            created = dt.datetime.fromtimestamp(convo.get("create_time", 0))
            updated = dt.datetime.fromtimestamp(convo.get("update_time", 0))

            # Build conversation text from the message mapping
            messages: list[str] = []
            mapping = convo.get("mapping", {})
            for node in mapping.values():
                msg = node.get("message")
                if not msg or not msg.get("content"):
                    continue
                role = msg.get("author", {}).get("role", "unknown")
                parts = msg["content"].get("parts", [])
                text = " ".join(str(p) for p in parts if isinstance(p, str))
                if text.strip():
                    messages.append(f"**{role}:** {text}")

            content = "\n\n---\n\n".join(messages)

            entries.append(
                Entry(
                    title=title,
                    content=content[:50000],  # Cap very long conversations
                    entry_type=EntryType.CONVERSATION,
                    source="chatgpt",
                    source_id=convo.get("id", ""),
                    tags=["chatgpt", "ai-conversation"],
                    created_at=created,
                    updated_at=updated,
                    metadata={"model": convo.get("default_model_slug", "")},
                )
            )
        return entries

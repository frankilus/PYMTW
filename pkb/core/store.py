"""File-based knowledge store — all entries are plain markdown files."""
from __future__ import annotations

import datetime as dt
import shutil
from pathlib import Path
from typing import Iterator

from pkb.core.entry import Entry, EntryType


class KnowledgeStore:
    """Manages entries on disk inside a root directory.

    Directory layout::

        <root>/
            entries/
                2024/
                    06/
                        abc123-my-note.md
            .trash/
    """

    def __init__(self, root: str | Path):
        self.root = Path(root)
        self.entries_dir = self.root / "entries"
        self.trash_dir = self.root / ".trash"
        self.entries_dir.mkdir(parents=True, exist_ok=True)
        self.trash_dir.mkdir(parents=True, exist_ok=True)

    # ── CRUD ───────────────────────────────────────────────────────

    def save(self, entry: Entry) -> Path:
        """Write an entry to disk. Creates or overwrites."""
        entry.updated_at = dt.datetime.now()
        path = self.entries_dir / entry.relative_path()
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(entry.to_markdown(), encoding="utf-8")
        return path

    def get(self, entry_id: str) -> Entry | None:
        """Find an entry by ID."""
        for path in self.entries_dir.rglob("*.md"):
            if path.stem.startswith(entry_id):
                return Entry.from_file(path)
        return None

    def delete(self, entry_id: str) -> bool:
        """Move an entry to .trash (soft delete)."""
        for path in self.entries_dir.rglob("*.md"):
            if path.stem.startswith(entry_id):
                dest = self.trash_dir / path.name
                shutil.move(str(path), str(dest))
                return True
        return False

    def list_entries(
        self,
        entry_type: EntryType | None = None,
        tag: str | None = None,
        source: str | None = None,
        limit: int = 100,
        offset: int = 0,
        archived: bool = False,
    ) -> list[Entry]:
        """List entries with optional filters."""
        results: list[Entry] = []
        for entry in self._iter_entries():
            if entry.archived != archived:
                continue
            if entry_type and entry.entry_type != entry_type:
                continue
            if tag and tag not in entry.tags:
                continue
            if source and entry.source != source:
                continue
            results.append(entry)
        # Sort newest first
        results.sort(key=lambda e: e.created_at, reverse=True)
        return results[offset : offset + limit]

    def all_tags(self) -> dict[str, int]:
        """Return tag -> count mapping."""
        tags: dict[str, int] = {}
        for entry in self._iter_entries():
            for t in entry.tags:
                tags[t] = tags.get(t, 0) + 1
        return dict(sorted(tags.items(), key=lambda kv: -kv[1]))

    def stats(self) -> dict:
        """Return summary statistics."""
        entries = list(self._iter_entries())
        by_type: dict[str, int] = {}
        by_source: dict[str, int] = {}
        for e in entries:
            by_type[e.entry_type.value] = by_type.get(e.entry_type.value, 0) + 1
            by_source[e.source] = by_source.get(e.source, 0) + 1
        return {
            "total_entries": len(entries),
            "by_type": by_type,
            "by_source": by_source,
            "tags": len(self.all_tags()),
        }

    # ── Internals ──────────────────────────────────────────────────

    def _iter_entries(self) -> Iterator[Entry]:
        for path in self.entries_dir.rglob("*.md"):
            try:
                yield Entry.from_file(path)
            except Exception:
                continue

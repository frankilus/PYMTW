"""iMessage connector — reads from the local macOS Messages database.

Requirements:
    - macOS only (reads ~/Library/Messages/chat.db)
    - Full Disk Access for the running process
"""
from __future__ import annotations

import datetime as dt
import sqlite3
from pathlib import Path

from pkb.connectors.base import BaseConnector
from pkb.core.entry import Entry, EntryType

# macOS stores iMessage in a SQLite DB
DEFAULT_DB = Path.home() / "Library" / "Messages" / "chat.db"

# Apple's Core Data epoch: 2001-01-01
APPLE_EPOCH = dt.datetime(2001, 1, 1)


def _apple_ts_to_datetime(ns: int) -> dt.datetime:
    """Convert Apple's nanosecond timestamp to a Python datetime."""
    return APPLE_EPOCH + dt.timedelta(seconds=ns / 1e9)


class IMessageConnector(BaseConnector):
    name = "imessage"

    def __init__(self, db_path: str | Path = DEFAULT_DB):
        self.db_path = Path(db_path)

    def authenticate(self) -> None:
        if not self.db_path.exists():
            raise FileNotFoundError(
                f"iMessage database not found at {self.db_path}. "
                "This connector only works on macOS with Full Disk Access enabled."
            )

    def fetch_new(self, since: dt.datetime | None = None) -> list[Entry]:
        since = since or dt.datetime.now() - dt.timedelta(days=7)
        # Convert back to Apple nanosecond timestamp
        delta = since - APPLE_EPOCH
        apple_ts = int(delta.total_seconds() * 1e9)
        return self._query(f"AND m.date > {apple_ts}")

    def fetch_all(self) -> list[Entry]:
        return self._query("")

    def _query(self, where_clause: str) -> list[Entry]:
        conn = sqlite3.connect(str(self.db_path))
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        sql = f"""
            SELECT
                m.guid,
                m.text,
                m.date,
                m.is_from_me,
                h.id AS handle_id
            FROM message m
            LEFT JOIN handle h ON m.handle_id = h.ROWID
            WHERE m.text IS NOT NULL
            {where_clause}
            ORDER BY m.date DESC
            LIMIT 5000
        """
        cursor.execute(sql)
        entries: list[Entry] = []
        for row in cursor.fetchall():
            direction = "sent" if row["is_from_me"] else "received"
            contact = row["handle_id"] or "unknown"
            created = _apple_ts_to_datetime(row["date"])
            entries.append(
                Entry(
                    title=f"iMessage with {contact}",
                    content=row["text"],
                    entry_type=EntryType.MESSAGE,
                    source="imessage",
                    source_id=row["guid"],
                    tags=["imessage", direction, contact],
                    created_at=created,
                    metadata={"direction": direction, "contact": contact},
                )
            )
        conn.close()
        return entries

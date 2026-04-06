"""Entry model — the atomic unit of knowledge."""
from __future__ import annotations

import datetime as dt
import enum
import hashlib
import uuid
from pathlib import Path
from typing import Any

import frontmatter
from pydantic import BaseModel, Field


class EntryType(str, enum.Enum):
    NOTE = "note"
    CONVERSATION = "conversation"
    BOOKMARK = "bookmark"
    CONTACT = "contact"
    IDEA = "idea"
    TASK = "task"
    JOURNAL = "journal"
    REFERENCE = "reference"
    MESSAGE = "message"
    EMAIL = "email"
    TWEET = "tweet"
    SNIPPET = "snippet"


class Entry(BaseModel):
    """A single knowledge entry stored as a markdown file with YAML front-matter."""

    id: str = Field(default_factory=lambda: uuid.uuid4().hex[:12])
    title: str
    content: str = ""
    entry_type: EntryType = EntryType.NOTE
    tags: list[str] = Field(default_factory=list)
    source: str = "manual"  # manual | imessage | twitter | email | chatgpt | claude
    source_id: str | None = None  # original ID from the source system
    created_at: dt.datetime = Field(default_factory=dt.datetime.now)
    updated_at: dt.datetime = Field(default_factory=dt.datetime.now)
    links: list[str] = Field(default_factory=list)  # IDs of related entries
    metadata: dict[str, Any] = Field(default_factory=dict)
    pinned: bool = False
    archived: bool = False

    # ── Serialization ──────────────────────────────────────────────

    def to_markdown(self) -> str:
        """Serialize to a markdown file with YAML front-matter."""
        meta = self.model_dump(exclude={"content"})
        meta["created_at"] = self.created_at.isoformat()
        meta["updated_at"] = self.updated_at.isoformat()
        post = frontmatter.Post(self.content, **meta)
        return frontmatter.dumps(post)

    @classmethod
    def from_markdown(cls, text: str) -> Entry:
        """Deserialize from a markdown string."""
        post = frontmatter.loads(text)
        data = dict(post.metadata)
        data["content"] = post.content
        return cls(**data)

    @classmethod
    def from_file(cls, path: Path) -> Entry:
        """Load an entry from a .md file."""
        return cls.from_markdown(path.read_text(encoding="utf-8"))

    def content_hash(self) -> str:
        return hashlib.sha256(self.to_markdown().encode()).hexdigest()[:16]

    def relative_path(self) -> str:
        """Return the relative storage path for this entry."""
        date_prefix = self.created_at.strftime("%Y/%m")
        safe_title = self.title.lower().replace(" ", "-")[:60]
        return f"{date_prefix}/{self.id}-{safe_title}.md"

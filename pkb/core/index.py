"""Full-text search index using Whoosh."""
from __future__ import annotations

from pathlib import Path

from whoosh import index as whoosh_index
from whoosh.fields import DATETIME, ID, KEYWORD, TEXT, Schema
from whoosh.qparser import MultifieldParser

from pkb.core.entry import Entry


def _schema() -> Schema:
    return Schema(
        id=ID(stored=True, unique=True),
        title=TEXT(stored=True),
        content=TEXT(stored=True),
        tags=KEYWORD(stored=True, commas=True, lowercase=True),
        entry_type=ID(stored=True),
        source=ID(stored=True),
        created_at=DATETIME(stored=True),
    )


class SearchIndex:
    """Wrapper around a Whoosh full-text index."""

    def __init__(self, index_dir: str | Path):
        self.index_dir = Path(index_dir)
        self.index_dir.mkdir(parents=True, exist_ok=True)
        if whoosh_index.exists_in(str(self.index_dir)):
            self.ix = whoosh_index.open_dir(str(self.index_dir))
        else:
            self.ix = whoosh_index.create_in(str(self.index_dir), _schema())

    def add(self, entry: Entry) -> None:
        writer = self.ix.writer()
        writer.update_document(
            id=entry.id,
            title=entry.title,
            content=entry.content,
            tags=",".join(entry.tags),
            entry_type=entry.entry_type.value,
            source=entry.source,
            created_at=entry.created_at,
        )
        writer.commit()

    def remove(self, entry_id: str) -> None:
        writer = self.ix.writer()
        writer.delete_by_term("id", entry_id)
        writer.commit()

    def search(self, query_str: str, limit: int = 20) -> list[dict]:
        """Search entries by query string. Returns list of {id, title, snippet}."""
        parser = MultifieldParser(["title", "content", "tags"], self.ix.schema)
        query = parser.parse(query_str)
        results = []
        with self.ix.searcher() as searcher:
            hits = searcher.search(query, limit=limit)
            for hit in hits:
                results.append({
                    "id": hit["id"],
                    "title": hit["title"],
                    "snippet": hit.highlights("content", top=3) or hit["content"][:200],
                    "score": hit.score,
                })
        return results

    def rebuild(self, entries: list[Entry]) -> None:
        """Rebuild the entire index from a list of entries."""
        writer = self.ix.writer()
        writer.mergetype = whoosh_index.writing.CLEAR
        for entry in entries:
            writer.add_document(
                id=entry.id,
                title=entry.title,
                content=entry.content,
                tags=",".join(entry.tags),
                entry_type=entry.entry_type.value,
                source=entry.source,
                created_at=entry.created_at,
            )
        writer.commit()

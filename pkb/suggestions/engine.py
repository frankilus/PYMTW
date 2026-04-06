"""Proactive suggestions engine.

Analyzes your knowledge base to surface actionable insights:
    - Entries you might want to revisit
    - Related entries you might want to link
    - Patterns in your data (frequent topics, contacts)
    - Reminders based on content (deadlines, follow-ups)
    - Knowledge gaps or areas to explore
"""
from __future__ import annotations

import datetime as dt
import re
from collections import Counter
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from pkb.core.store import KnowledgeStore


class SuggestionsEngine:
    """Generates proactive suggestions from knowledge base content."""

    def __init__(self, store: KnowledgeStore):
        self.store = store

    def generate(self, context: str | None = None) -> list[dict]:
        """Generate a list of suggestions.

        Each suggestion is a dict with:
            - type: category of suggestion
            - title: short summary
            - description: detailed explanation
            - entry_ids: related entry IDs (if any)
            - priority: 1 (low) to 5 (high)
        """
        suggestions: list[dict] = []
        entries = self.store.list_entries(limit=500)

        if not entries:
            suggestions.append({
                "type": "getting-started",
                "title": "Your knowledge base is empty!",
                "description": "Start by adding notes, syncing your messages, or importing data. "
                "Try: pkb sync imessage, pkb add, or use the web UI.",
                "entry_ids": [],
                "priority": 5,
            })
            return suggestions

        suggestions.extend(self._stale_entries(entries))
        suggestions.extend(self._frequent_topics(entries))
        suggestions.extend(self._follow_up_reminders(entries))
        suggestions.extend(self._untagged_entries(entries))
        suggestions.extend(self._related_by_context(entries, context))

        # Sort by priority (highest first)
        suggestions.sort(key=lambda s: s["priority"], reverse=True)
        return suggestions[:10]

    def _stale_entries(self, entries: list) -> list[dict]:
        """Find entries that haven't been updated in a while but might be worth revisiting."""
        suggestions = []
        cutoff = dt.datetime.now() - dt.timedelta(days=30)
        stale = [
            e for e in entries
            if e.updated_at < cutoff and e.pinned and not e.archived
        ]
        if stale:
            suggestions.append({
                "type": "revisit",
                "title": f"{len(stale)} pinned entries haven't been updated in 30+ days",
                "description": "Consider reviewing: " + ", ".join(e.title for e in stale[:5]),
                "entry_ids": [e.id for e in stale[:5]],
                "priority": 3,
            })
        return suggestions

    def _frequent_topics(self, entries: list) -> list[dict]:
        """Identify frequently discussed topics."""
        suggestions = []
        all_tags = Counter()
        for e in entries:
            all_tags.update(e.tags)
        top_tags = all_tags.most_common(5)
        if top_tags:
            tag_list = ", ".join(f"{tag} ({count})" for tag, count in top_tags)
            suggestions.append({
                "type": "insight",
                "title": "Your most frequent topics",
                "description": f"Top tags: {tag_list}. Consider creating summary notes for these areas.",
                "entry_ids": [],
                "priority": 2,
            })
        return suggestions

    def _follow_up_reminders(self, entries: list) -> list[dict]:
        """Find entries that mention follow-ups, deadlines, or TODOs."""
        suggestions = []
        patterns = [
            r"(?i)\bfollow[- ]?up\b",
            r"(?i)\btodo\b",
            r"(?i)\breminder\b",
            r"(?i)\bdeadline\b",
            r"(?i)\bby (monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow|next week)\b",
        ]
        actionable = []
        for e in entries:
            if e.archived:
                continue
            for pattern in patterns:
                if re.search(pattern, e.content):
                    actionable.append(e)
                    break

        if actionable:
            suggestions.append({
                "type": "action-needed",
                "title": f"{len(actionable)} entries have pending action items",
                "description": "Entries with follow-ups/TODOs: " + ", ".join(e.title for e in actionable[:5]),
                "entry_ids": [e.id for e in actionable[:5]],
                "priority": 4,
            })
        return suggestions

    def _untagged_entries(self, entries: list) -> list[dict]:
        """Find entries without any tags."""
        untagged = [e for e in entries if not e.tags and not e.archived]
        if len(untagged) > 5:
            return [{
                "type": "organization",
                "title": f"{len(untagged)} entries have no tags",
                "description": "Adding tags helps with search and auto-organization. "
                "Consider tagging: " + ", ".join(e.title for e in untagged[:5]),
                "entry_ids": [e.id for e in untagged[:5]],
                "priority": 2,
            }]
        return []

    def _related_by_context(self, entries: list, context: str | None) -> list[dict]:
        """Find entries related to the given context string."""
        if not context:
            return []
        context_lower = context.lower()
        words = set(context_lower.split())
        # Remove common words
        stop = {"the", "a", "an", "is", "are", "was", "were", "in", "on", "at", "to", "for", "of", "and", "or", "but", "i", "my", "me"}
        keywords = words - stop

        if not keywords:
            return []

        scored: list[tuple[int, object]] = []
        for e in entries:
            text = (e.title + " " + e.content + " " + " ".join(e.tags)).lower()
            score = sum(1 for kw in keywords if kw in text)
            if score > 0:
                scored.append((score, e))

        scored.sort(key=lambda x: x[0], reverse=True)
        top = scored[:5]

        if top:
            return [{
                "type": "related",
                "title": "Entries related to your current context",
                "description": "You might find these relevant: " + ", ".join(e.title for _, e in top),
                "entry_ids": [e.id for _, e in top],
                "priority": 3,
            }]
        return []

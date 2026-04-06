"""Rules engine — user-defined rules for auto-organizing entries.

Rules are defined in YAML and applied to entries on ingest.

Example rules.yaml:

    rules:
      - name: tag-work-emails
        description: Auto-tag emails from work domain
        when:
          source: email
          content_contains: "@company.com"
        then:
          add_tags: [work, important]
          set_type: reference

      - name: archive-old-tweets
        description: Archive tweets older than 30 days
        when:
          source: twitter
          older_than_days: 30
        then:
          archive: true

      - name: pin-ideas
        description: Pin entries that contain idea keywords
        when:
          content_contains: "idea:"
        then:
          set_type: idea
          add_tags: [idea]
          pin: true

      - name: auto-tag-code
        description: Tag entries containing code snippets
        when:
          content_matches: "```[a-z]+"
        then:
          add_tags: [code, snippet]
          set_type: snippet
"""
from __future__ import annotations

import datetime as dt
import re
from pathlib import Path
from typing import Any

import yaml

from pkb.core.entry import Entry, EntryType


class Rule:
    """A single auto-organization rule."""

    def __init__(self, data: dict[str, Any]):
        self.name = data.get("name", "unnamed")
        self.description = data.get("description", "")
        self.conditions = data.get("when", {})
        self.actions = data.get("then", {})
        self.enabled = data.get("enabled", True)

    def matches(self, entry: Entry) -> bool:
        """Check if an entry matches all conditions."""
        if not self.enabled:
            return False

        for key, value in self.conditions.items():
            if key == "source" and entry.source != value:
                return False
            if key == "entry_type" and entry.entry_type.value != value:
                return False
            if key == "has_tag" and value not in entry.tags:
                return False
            if key == "content_contains" and value.lower() not in entry.content.lower():
                return False
            if key == "title_contains" and value.lower() not in entry.title.lower():
                return False
            if key == "content_matches":
                if not re.search(value, entry.content):
                    return False
            if key == "older_than_days":
                cutoff = dt.datetime.now() - dt.timedelta(days=value)
                if entry.created_at > cutoff:
                    return False
            if key == "newer_than_days":
                cutoff = dt.datetime.now() - dt.timedelta(days=value)
                if entry.created_at < cutoff:
                    return False

        return True

    def apply(self, entry: Entry) -> Entry:
        """Apply actions to an entry."""
        for key, value in self.actions.items():
            if key == "add_tags":
                for tag in value:
                    if tag not in entry.tags:
                        entry.tags.append(tag)
            if key == "remove_tags":
                entry.tags = [t for t in entry.tags if t not in value]
            if key == "set_type":
                entry.entry_type = EntryType(value)
            if key == "pin":
                entry.pinned = bool(value)
            if key == "archive":
                entry.archived = bool(value)
            if key == "add_metadata":
                entry.metadata.update(value)
        return entry


class RulesEngine:
    """Loads and applies rules from a YAML config file."""

    def __init__(self, rules_path: str | Path):
        self.rules_path = Path(rules_path)
        self.rules: list[Rule] = []
        self._load()

    def _load(self) -> None:
        if not self.rules_path.exists():
            self._create_default()
        try:
            data = yaml.safe_load(self.rules_path.read_text(encoding="utf-8"))
            self.rules = [Rule(r) for r in data.get("rules", [])]
        except Exception:
            self.rules = []

    def _create_default(self) -> None:
        """Create a default rules file with examples."""
        self.rules_path.parent.mkdir(parents=True, exist_ok=True)
        default = {
            "rules": [
                {
                    "name": "auto-tag-code-snippets",
                    "description": "Tag entries containing code blocks",
                    "when": {"content_matches": "```[a-z]+"},
                    "then": {"add_tags": ["has-code"]},
                },
                {
                    "name": "pin-important",
                    "description": "Pin entries marked as important",
                    "when": {"content_contains": "!important"},
                    "then": {"pin": True, "add_tags": ["important"]},
                },
                {
                    "name": "tag-ai-conversations",
                    "description": "Add unified tag for AI conversations",
                    "when": {"entry_type": "conversation"},
                    "then": {"add_tags": ["ai"]},
                },
            ]
        }
        self.rules_path.write_text(yaml.dump(default, default_flow_style=False), encoding="utf-8")

    def apply(self, entry: Entry) -> Entry:
        """Apply all matching rules to an entry."""
        for rule in self.rules:
            if rule.matches(entry):
                entry = rule.apply(entry)
        return entry

    def reload(self) -> None:
        """Reload rules from disk."""
        self._load()

    def list_rules(self) -> list[dict]:
        """Return rules as dicts for display."""
        return [
            {"name": r.name, "description": r.description, "enabled": r.enabled}
            for r in self.rules
        ]

"""Sync manager — schedules automatic syncing of connectors."""
from __future__ import annotations

import datetime as dt
import logging
from pathlib import Path
from typing import Any

import yaml
from apscheduler.schedulers.background import BackgroundScheduler

from pkb.core.index import SearchIndex
from pkb.core.store import KnowledgeStore
from pkb.rules.engine import RulesEngine

logger = logging.getLogger(__name__)


class SyncManager:
    """Manages scheduled syncing from all configured connectors.

    Config file (sync.yaml):

        connectors:
          imessage:
            enabled: true
            interval_minutes: 30

          twitter:
            enabled: true
            interval_minutes: 60
            bearer_token: "..."
            user_id: "..."

          email:
            enabled: true
            interval_minutes: 15
            host: imap.gmail.com
            user: you@gmail.com
            password: "app-password"
            folder: INBOX

          chatgpt:
            enabled: false
            export_dir: ~/Downloads/chatgpt-export

          claude:
            enabled: false
            export_dir: ~/Downloads/claude-export

          claude-code:
            enabled: true
            interval_minutes: 120
    """

    def __init__(self, kb_root: str | Path):
        self.root = Path(kb_root)
        self.store = KnowledgeStore(self.root)
        self.index = SearchIndex(self.root / "indexes" / "search")
        self.rules = RulesEngine(self.root / "config" / "rules.yaml")
        self.config_path = self.root / "config" / "sync.yaml"
        self.scheduler = BackgroundScheduler()
        self._last_sync: dict[str, dt.datetime] = {}

    def load_config(self) -> dict[str, Any]:
        if not self.config_path.exists():
            self._create_default_config()
        return yaml.safe_load(self.config_path.read_text(encoding="utf-8"))

    def _create_default_config(self) -> None:
        self.config_path.parent.mkdir(parents=True, exist_ok=True)
        default = {
            "connectors": {
                "imessage": {"enabled": False, "interval_minutes": 30},
                "twitter": {"enabled": False, "interval_minutes": 60},
                "email": {"enabled": False, "interval_minutes": 15},
                "chatgpt": {"enabled": False, "export_dir": ""},
                "claude": {"enabled": False, "export_dir": ""},
                "claude-code": {"enabled": False, "interval_minutes": 120},
            }
        }
        self.config_path.write_text(yaml.dump(default, default_flow_style=False), encoding="utf-8")

    def start(self) -> None:
        """Start the sync scheduler."""
        config = self.load_config()

        for name, cfg in config.get("connectors", {}).items():
            if not cfg.get("enabled", False):
                continue
            interval = cfg.get("interval_minutes", 60)
            self.scheduler.add_job(
                self._sync_connector,
                "interval",
                minutes=interval,
                args=[name, cfg],
                id=f"sync_{name}",
                replace_existing=True,
            )
            logger.info(f"Scheduled {name} sync every {interval} minutes")

        self.scheduler.start()

    def stop(self) -> None:
        self.scheduler.shutdown()

    def _sync_connector(self, name: str, cfg: dict) -> None:
        """Run a single sync for a connector."""
        try:
            connector = self._build_connector(name, cfg)
            connector.authenticate()

            since = self._last_sync.get(name)
            entries = connector.fetch_new(since=since) if since else connector.fetch_all()

            saved = 0
            for entry in entries:
                if entry.source_id:
                    # Simple dedup
                    existing = False
                    for e in self.store._iter_entries():
                        if e.source_id == entry.source_id:
                            existing = True
                            break
                    if existing:
                        continue
                entry = self.rules.apply(entry)
                self.store.save(entry)
                self.index.add(entry)
                saved += 1

            self._last_sync[name] = dt.datetime.now()
            logger.info(f"Synced {saved} entries from {name}")
        except Exception as e:
            logger.error(f"Sync failed for {name}: {e}")

    @staticmethod
    def _build_connector(name: str, cfg: dict):
        if name == "imessage":
            from pkb.connectors.imessage import IMessageConnector
            return IMessageConnector()
        elif name == "twitter":
            from pkb.connectors.twitter import TwitterConnector
            return TwitterConnector(
                bearer_token=cfg.get("bearer_token"),
                user_id=cfg.get("user_id"),
            )
        elif name == "email":
            from pkb.connectors.email_imap import EmailConnector
            return EmailConnector(
                host=cfg.get("host"),
                user=cfg.get("user"),
                password=cfg.get("password"),
                folder=cfg.get("folder", "INBOX"),
            )
        elif name == "chatgpt":
            from pkb.connectors.chatgpt import ChatGPTConnector
            return ChatGPTConnector(cfg.get("export_dir", ""))
        elif name == "claude":
            from pkb.connectors.claude_export import ClaudeExportConnector
            return ClaudeExportConnector(cfg.get("export_dir", ""))
        elif name == "claude-code":
            from pkb.connectors.claude_export import ClaudeCodeConnector
            return ClaudeCodeConnector()
        else:
            raise ValueError(f"Unknown connector: {name}")

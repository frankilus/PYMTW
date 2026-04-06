"""Twitter/X connector — syncs bookmarks, likes, and your own tweets.

Requires a Twitter API Bearer Token (v2 API).
Set TWITTER_BEARER_TOKEN in your environment or pkb config.
"""
from __future__ import annotations

import datetime as dt
import os

import httpx

from pkb.connectors.base import BaseConnector
from pkb.core.entry import Entry, EntryType

API_BASE = "https://api.twitter.com/2"


class TwitterConnector(BaseConnector):
    name = "twitter"

    def __init__(self, bearer_token: str | None = None, user_id: str | None = None):
        self.bearer_token = bearer_token or os.environ.get("TWITTER_BEARER_TOKEN", "")
        self.user_id = user_id or os.environ.get("TWITTER_USER_ID", "")
        self._client: httpx.Client | None = None

    def authenticate(self) -> None:
        if not self.bearer_token:
            raise ValueError(
                "Twitter Bearer Token required. "
                "Set TWITTER_BEARER_TOKEN env var or pass it to the connector."
            )
        self._client = httpx.Client(
            base_url=API_BASE,
            headers={"Authorization": f"Bearer {self.bearer_token}"},
            timeout=30,
        )
        # Resolve user ID if not provided
        if not self.user_id:
            resp = self._client.get("/users/me")
            resp.raise_for_status()
            self.user_id = resp.json()["data"]["id"]

    def fetch_new(self, since: dt.datetime | None = None) -> list[Entry]:
        entries: list[Entry] = []
        entries.extend(self._fetch_bookmarks())
        entries.extend(self._fetch_likes())
        entries.extend(self._fetch_own_tweets())
        if since:
            entries = [e for e in entries if e.created_at >= since]
        return entries

    def fetch_all(self) -> list[Entry]:
        return self.fetch_new(since=None)

    def _fetch_bookmarks(self) -> list[Entry]:
        assert self._client
        resp = self._client.get(
            f"/users/{self.user_id}/bookmarks",
            params={"tweet.fields": "created_at,author_id,text", "max_results": 100},
        )
        if resp.status_code != 200:
            return []
        return [
            self._tweet_to_entry(t, tags=["bookmark"])
            for t in resp.json().get("data", [])
        ]

    def _fetch_likes(self) -> list[Entry]:
        assert self._client
        resp = self._client.get(
            f"/users/{self.user_id}/liked_tweets",
            params={"tweet.fields": "created_at,author_id,text", "max_results": 100},
        )
        if resp.status_code != 200:
            return []
        return [
            self._tweet_to_entry(t, tags=["liked"])
            for t in resp.json().get("data", [])
        ]

    def _fetch_own_tweets(self) -> list[Entry]:
        assert self._client
        resp = self._client.get(
            f"/users/{self.user_id}/tweets",
            params={"tweet.fields": "created_at,text", "max_results": 100},
        )
        if resp.status_code != 200:
            return []
        return [
            self._tweet_to_entry(t, tags=["own-tweet"])
            for t in resp.json().get("data", [])
        ]

    @staticmethod
    def _tweet_to_entry(tweet: dict, tags: list[str] | None = None) -> Entry:
        created = dt.datetime.fromisoformat(
            tweet.get("created_at", dt.datetime.now().isoformat()).replace("Z", "+00:00")
        )
        return Entry(
            title=tweet["text"][:80],
            content=tweet["text"],
            entry_type=EntryType.TWEET,
            source="twitter",
            source_id=tweet["id"],
            tags=["twitter"] + (tags or []),
            created_at=created,
            metadata={"author_id": tweet.get("author_id")},
        )

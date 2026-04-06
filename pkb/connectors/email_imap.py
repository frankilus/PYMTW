"""Email connector — syncs via IMAP.

Supports Gmail, Outlook, and any IMAP server.
Set EMAIL_HOST, EMAIL_USER, EMAIL_PASSWORD in env or pkb config.
"""
from __future__ import annotations

import datetime as dt
import email
import email.utils
import imaplib
import os
from email.header import decode_header

from pkb.connectors.base import BaseConnector
from pkb.core.entry import Entry, EntryType


def _decode_header_value(value: str) -> str:
    """Decode RFC 2047 encoded header."""
    parts = decode_header(value)
    decoded = []
    for content, charset in parts:
        if isinstance(content, bytes):
            decoded.append(content.decode(charset or "utf-8", errors="replace"))
        else:
            decoded.append(content)
    return " ".join(decoded)


def _get_text_body(msg: email.message.Message) -> str:
    """Extract plain text body from an email message."""
    if msg.is_multipart():
        for part in msg.walk():
            if part.get_content_type() == "text/plain":
                payload = part.get_payload(decode=True)
                if payload:
                    charset = part.get_content_charset() or "utf-8"
                    return payload.decode(charset, errors="replace")
    else:
        payload = msg.get_payload(decode=True)
        if payload:
            charset = msg.get_content_charset() or "utf-8"
            return payload.decode(charset, errors="replace")
    return ""


class EmailConnector(BaseConnector):
    name = "email"

    def __init__(
        self,
        host: str | None = None,
        user: str | None = None,
        password: str | None = None,
        port: int = 993,
        folder: str = "INBOX",
    ):
        self.host = host or os.environ.get("EMAIL_HOST", "imap.gmail.com")
        self.user = user or os.environ.get("EMAIL_USER", "")
        self.password = password or os.environ.get("EMAIL_PASSWORD", "")
        self.port = port
        self.folder = folder
        self._conn: imaplib.IMAP4_SSL | None = None

    def authenticate(self) -> None:
        if not self.user or not self.password:
            raise ValueError(
                "Email credentials required. Set EMAIL_USER and EMAIL_PASSWORD."
            )
        self._conn = imaplib.IMAP4_SSL(self.host, self.port)
        self._conn.login(self.user, self.password)

    def fetch_new(self, since: dt.datetime | None = None) -> list[Entry]:
        since = since or dt.datetime.now() - dt.timedelta(days=7)
        date_str = since.strftime("%d-%b-%Y")
        return self._fetch(f'(SINCE "{date_str}")')

    def fetch_all(self) -> list[Entry]:
        return self._fetch("ALL")

    def _fetch(self, search_criteria: str) -> list[Entry]:
        assert self._conn
        self._conn.select(self.folder, readonly=True)
        _, msg_ids = self._conn.search(None, search_criteria)
        if not msg_ids[0]:
            return []

        entries: list[Entry] = []
        ids = msg_ids[0].split()[-500:]  # Limit to most recent 500

        for mid in ids:
            _, data = self._conn.fetch(mid, "(RFC822)")
            if not data or not data[0]:
                continue
            raw = data[0]
            if isinstance(raw, tuple):
                raw = raw[1]
            msg = email.message_from_bytes(raw)

            subject = _decode_header_value(msg.get("Subject", "(no subject)"))
            sender = _decode_header_value(msg.get("From", "unknown"))
            date_tuple = email.utils.parsedate_to_datetime(msg["Date"]) if msg["Date"] else dt.datetime.now()
            body = _get_text_body(msg)
            message_id = msg.get("Message-ID", "")

            entries.append(
                Entry(
                    title=subject,
                    content=f"**From:** {sender}\n\n{body[:5000]}",
                    entry_type=EntryType.EMAIL,
                    source="email",
                    source_id=message_id,
                    tags=["email", self.folder.lower()],
                    created_at=date_tuple,
                    metadata={
                        "from": sender,
                        "to": msg.get("To", ""),
                        "folder": self.folder,
                    },
                )
            )
        return entries

"""Base connector interface."""
from __future__ import annotations

import abc
import datetime as dt
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from pkb.core.entry import Entry


class BaseConnector(abc.ABC):
    """All source connectors implement this interface."""

    name: str = "base"

    @abc.abstractmethod
    def authenticate(self) -> None:
        """Set up credentials / tokens."""

    @abc.abstractmethod
    def fetch_new(self, since: dt.datetime | None = None) -> list[Entry]:
        """Fetch new items since the given datetime.

        Returns a list of Entry objects ready to be saved.
        """

    @abc.abstractmethod
    def fetch_all(self) -> list[Entry]:
        """Full sync — fetch everything available."""

    def __repr__(self) -> str:
        return f"<{self.__class__.__name__} connector={self.name}>"

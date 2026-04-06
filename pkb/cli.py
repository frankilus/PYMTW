"""CLI interface for the Personal Knowledge Base."""
from __future__ import annotations

import datetime as dt
from pathlib import Path

import click
from rich.console import Console
from rich.table import Table

from pkb.core.entry import Entry, EntryType
from pkb.core.index import SearchIndex
from pkb.core.store import KnowledgeStore
from pkb.rules.engine import RulesEngine
from pkb.suggestions.engine import SuggestionsEngine

console = Console()
DEFAULT_ROOT = Path.home() / ".pkb"


def _get_root(root: str | None) -> Path:
    return Path(root) if root else DEFAULT_ROOT


@click.group()
@click.option("--root", default=None, help="Knowledge base root directory (default: ~/.pkb)")
@click.pass_context
def main(ctx: click.Context, root: str | None) -> None:
    """PKB — Personal Knowledge Base

    A self-updating, file-based knowledge system with MCP server.
    """
    ctx.ensure_object(dict)
    ctx.obj["root"] = _get_root(root)


@main.command()
@click.pass_context
def init(ctx: click.Context) -> None:
    """Initialize a new knowledge base."""
    root = ctx.obj["root"]
    store = KnowledgeStore(root)
    SearchIndex(root / "indexes" / "search")
    RulesEngine(root / "config" / "rules.yaml")
    console.print(f"[green]Knowledge base initialized at {root}[/green]")
    console.print(f"  entries/ — your knowledge files")
    console.print(f"  config/  — rules and settings")
    console.print(f"  indexes/ — search index")


@main.command()
@click.argument("title")
@click.option("--content", "-c", default="", help="Entry content")
@click.option("--type", "-t", "entry_type", default="note", help="Entry type")
@click.option("--tags", default="", help="Comma-separated tags")
@click.pass_context
def add(ctx: click.Context, title: str, content: str, entry_type: str, tags: str) -> None:
    """Add a new entry."""
    root = ctx.obj["root"]
    store = KnowledgeStore(root)
    index = SearchIndex(root / "indexes" / "search")
    rules = RulesEngine(root / "config" / "rules.yaml")

    tag_list = [t.strip() for t in tags.split(",") if t.strip()] if tags else []
    entry = Entry(
        title=title,
        content=content,
        entry_type=EntryType(entry_type),
        tags=tag_list,
    )
    entry = rules.apply(entry)
    path = store.save(entry)
    index.add(entry)
    console.print(f"[green]Added:[/green] {entry.title} ({entry.id})")
    console.print(f"  File: {path}")


@main.command()
@click.argument("query")
@click.option("--limit", "-l", default=10, help="Max results")
@click.pass_context
def search(ctx: click.Context, query: str, limit: int) -> None:
    """Search your knowledge base."""
    root = ctx.obj["root"]
    index = SearchIndex(root / "indexes" / "search")
    results = index.search(query, limit=limit)

    if not results:
        console.print("[yellow]No results found.[/yellow]")
        return

    table = Table(title=f"Search: {query}")
    table.add_column("ID", style="dim")
    table.add_column("Title")
    table.add_column("Score", justify="right")
    for r in results:
        table.add_row(r["id"], r["title"], f"{r['score']:.1f}")
    console.print(table)


@main.command("list")
@click.option("--type", "-t", "entry_type", default=None, help="Filter by type")
@click.option("--tag", default=None, help="Filter by tag")
@click.option("--source", "-s", default=None, help="Filter by source")
@click.option("--limit", "-l", default=20, help="Max entries")
@click.pass_context
def list_entries(ctx: click.Context, entry_type: str | None, tag: str | None, source: str | None, limit: int) -> None:
    """List entries with optional filters."""
    root = ctx.obj["root"]
    store = KnowledgeStore(root)
    et = EntryType(entry_type) if entry_type else None
    entries = store.list_entries(entry_type=et, tag=tag, source=source, limit=limit)

    if not entries:
        console.print("[yellow]No entries found.[/yellow]")
        return

    table = Table(title="Entries")
    table.add_column("ID", style="dim")
    table.add_column("Title")
    table.add_column("Type")
    table.add_column("Source")
    table.add_column("Tags")
    table.add_column("Created")
    for e in entries:
        table.add_row(
            e.id, e.title, e.entry_type.value, e.source,
            ", ".join(e.tags), e.created_at.strftime("%Y-%m-%d"),
        )
    console.print(table)


@main.command()
@click.pass_context
def stats(ctx: click.Context) -> None:
    """Show knowledge base statistics."""
    root = ctx.obj["root"]
    store = KnowledgeStore(root)
    s = store.stats()
    console.print(f"\n[bold]Knowledge Base Stats[/bold]\n")
    console.print(f"  Total entries: [cyan]{s['total_entries']}[/cyan]")
    console.print(f"  Unique tags:   [cyan]{s['tags']}[/cyan]")
    if s["by_type"]:
        console.print(f"\n  [bold]By Type:[/bold]")
        for t, c in sorted(s["by_type"].items(), key=lambda x: -x[1]):
            console.print(f"    {t}: {c}")
    if s["by_source"]:
        console.print(f"\n  [bold]By Source:[/bold]")
        for src, c in sorted(s["by_source"].items(), key=lambda x: -x[1]):
            console.print(f"    {src}: {c}")


@main.command()
@click.pass_context
def suggest(ctx: click.Context) -> None:
    """Get proactive suggestions."""
    root = ctx.obj["root"]
    store = KnowledgeStore(root)
    engine = SuggestionsEngine(store)
    suggestions = engine.generate()

    if not suggestions:
        console.print("[yellow]No suggestions right now.[/yellow]")
        return

    for s in suggestions:
        priority_color = "red" if s["priority"] >= 4 else "yellow" if s["priority"] >= 3 else "dim"
        console.print(f"\n  [{priority_color}][P{s['priority']}][/{priority_color}] [bold]{s['title']}[/bold]")
        console.print(f"    {s['description']}")


@main.command()
@click.argument("connector_name")
@click.option("--since", default=None, help="Sync since date (YYYY-MM-DD)")
@click.option("--export-dir", default=None, help="Export directory (for chatgpt/claude)")
@click.pass_context
def sync(ctx: click.Context, connector_name: str, since: str | None, export_dir: str | None) -> None:
    """Sync entries from a source connector."""
    root = ctx.obj["root"]
    store = KnowledgeStore(root)
    index = SearchIndex(root / "indexes" / "search")
    rules = RulesEngine(root / "config" / "rules.yaml")

    since_dt = dt.datetime.fromisoformat(since) if since else None
    connector = _get_connector(connector_name, export_dir)

    console.print(f"[cyan]Authenticating with {connector_name}...[/cyan]")
    connector.authenticate()

    console.print(f"[cyan]Fetching entries...[/cyan]")
    entries = connector.fetch_new(since=since_dt) if since_dt else connector.fetch_all()

    console.print(f"[cyan]Processing {len(entries)} entries...[/cyan]")
    saved = 0
    for entry in entries:
        # Skip duplicates by source_id
        if entry.source_id:
            existing = _find_by_source_id(store, entry.source_id)
            if existing:
                continue
        entry = rules.apply(entry)
        store.save(entry)
        index.add(entry)
        saved += 1

    console.print(f"[green]Synced {saved} new entries from {connector_name}.[/green]")


@main.command("mcp-serve")
@click.pass_context
def mcp_serve(ctx: click.Context) -> None:
    """Start the MCP server (stdio transport)."""
    from pkb.mcp_server.server import run_stdio_server
    run_stdio_server(ctx.obj["root"])


@main.command("web")
@click.option("--port", "-p", default=8899, help="Port to serve on")
@click.option("--host", default="127.0.0.1", help="Host to bind to")
@click.pass_context
def web(ctx: click.Context, port: int, host: str) -> None:
    """Start the web UI."""
    import uvicorn
    from pkb.web.app import create_app
    create_app(ctx.obj["root"])
    console.print(f"[green]PKB web UI starting at http://{host}:{port}[/green]")
    uvicorn.run("pkb.web.app:app", host=host, port=port, reload=False)


@main.command()
@click.pass_context
def reindex(ctx: click.Context) -> None:
    """Rebuild the search index from all entries."""
    root = ctx.obj["root"]
    store = KnowledgeStore(root)
    index = SearchIndex(root / "indexes" / "search")
    entries = list(store._iter_entries())
    index.rebuild(entries)
    console.print(f"[green]Reindexed {len(entries)} entries.[/green]")


# ── Helpers ────────────────────────────────────────────────────────

def _get_connector(name: str, export_dir: str | None = None):
    """Get a connector by name."""
    if name == "imessage":
        from pkb.connectors.imessage import IMessageConnector
        return IMessageConnector()
    elif name == "twitter":
        from pkb.connectors.twitter import TwitterConnector
        return TwitterConnector()
    elif name == "email":
        from pkb.connectors.email_imap import EmailConnector
        return EmailConnector()
    elif name == "chatgpt":
        if not export_dir:
            raise click.UsageError("--export-dir required for chatgpt connector")
        from pkb.connectors.chatgpt import ChatGPTConnector
        return ChatGPTConnector(export_dir)
    elif name == "claude":
        if not export_dir:
            raise click.UsageError("--export-dir required for claude connector")
        from pkb.connectors.claude_export import ClaudeExportConnector
        return ClaudeExportConnector(export_dir)
    elif name == "claude-code":
        from pkb.connectors.claude_export import ClaudeCodeConnector
        return ClaudeCodeConnector()
    else:
        raise click.UsageError(f"Unknown connector: {name}. Available: imessage, twitter, email, chatgpt, claude, claude-code")


def _find_by_source_id(store: KnowledgeStore, source_id: str) -> Entry | None:
    """Check if an entry with this source_id already exists."""
    for entry in store._iter_entries():
        if entry.source_id == source_id:
            return entry
    return None


if __name__ == "__main__":
    main()

# PKB — Personal Knowledge Base

A self-updating, file-based personal knowledge system. Everything is stored as plain markdown files with YAML front-matter — fully observable, fully yours.

## Features

- **File-based storage** — All entries are `.md` files you can read, edit, grep, and version control
- **MCP server** — Access your knowledge from Claude, Claude Code, ChatGPT, or any MCP client
- **Notion-like web UI** — Edit entries with a clean, dark-themed interface
- **Source connectors** — Auto-sync from iMessage, Twitter/X, Email (IMAP), ChatGPT exports, Claude exports, and Claude Code sessions
- **Rules engine** — Define YAML rules to auto-tag, auto-categorize, pin, or archive entries
- **Proactive suggestions** — Surface actionable insights, stale entries, follow-ups, and related content
- **Full-text search** — Fast search across all your knowledge with Whoosh
- **CLI** — Manage everything from the terminal

## Quick Start

```bash
# Install
cd pkb && pip install -e .

# Initialize your knowledge base
pkb init

# Add your first entry
pkb add "My first note" -c "Hello, PKB!" --tags "getting-started"

# Start the web UI
pkb web

# Search
pkb search "first note"

# Sync from sources
pkb sync imessage
pkb sync twitter
pkb sync email
pkb sync chatgpt --export-dir ~/Downloads/chatgpt-export
pkb sync claude --export-dir ~/Downloads/claude-export
pkb sync claude-code

# Get suggestions
pkb suggest

# View stats
pkb stats
```

## MCP Server

Add PKB to your Claude Code or Claude Desktop config:

```json
{
    "mcpServers": {
        "pkb": {
            "command": "pkb",
            "args": ["mcp-serve"]
        }
    }
}
```

This exposes 10 tools to any MCP client:

| Tool | Description |
|------|-------------|
| `pkb_search` | Search your knowledge base |
| `pkb_add` | Add a new entry |
| `pkb_get` | Get an entry by ID |
| `pkb_update` | Update an existing entry |
| `pkb_delete` | Delete (trash) an entry |
| `pkb_list` | List entries with filters |
| `pkb_tags` | List all tags |
| `pkb_stats` | Knowledge base statistics |
| `pkb_suggest` | Get proactive suggestions |
| `pkb_recent` | Get recent entries |

## File Structure

```
~/.pkb/
├── entries/              # Your knowledge files (markdown + YAML front-matter)
│   ├── 2024/
│   │   └── 06/
│   │       ├── abc123-my-note.md
│   │       └── def456-meeting-notes.md
│   └── ...
├── .trash/               # Soft-deleted entries
├── config/
│   ├── rules.yaml        # Auto-organization rules
│   ├── sync.yaml         # Connector sync schedule
│   └── settings.yaml     # General settings
└── indexes/
    └── search/           # Whoosh full-text search index
```

## Entry Format

Every entry is a markdown file with YAML front-matter:

```markdown
---
id: abc123def456
title: Meeting with Alice
entry_type: note
tags: [meeting, project-x, alice]
source: manual
created_at: 2024-06-15T10:30:00
updated_at: 2024-06-15T10:30:00
pinned: false
archived: false
---

Discussed the project timeline. Key decisions:
- Launch date moved to Q3
- Need to hire 2 more engineers

**Follow-up:** Send proposal by Friday
```

## Rules Engine

Define auto-organization rules in `~/.pkb/config/rules.yaml`:

```yaml
rules:
  - name: tag-work-emails
    description: Auto-tag emails from work domain
    when:
      source: email
      content_contains: "@company.com"
    then:
      add_tags: [work, important]

  - name: pin-ideas
    when:
      content_contains: "idea:"
    then:
      set_type: idea
      add_tags: [idea]
      pin: true

  - name: auto-tag-code
    when:
      content_matches: "```[a-z]+"
    then:
      add_tags: [has-code]
      set_type: snippet
```

### Available Conditions
- `source` — Match by source (manual, imessage, twitter, email, chatgpt, claude, claude-code)
- `entry_type` — Match by type
- `has_tag` — Entry has a specific tag
- `content_contains` — Case-insensitive content match
- `title_contains` — Case-insensitive title match
- `content_matches` — Regex match on content
- `older_than_days` / `newer_than_days` — Age-based rules

### Available Actions
- `add_tags` / `remove_tags` — Modify tags
- `set_type` — Change entry type
- `pin` / `archive` — Pin or archive
- `add_metadata` — Add key-value metadata

## Connectors

| Source | Method | Setup |
|--------|--------|-------|
| iMessage | Direct DB read | macOS + Full Disk Access |
| Twitter/X | API v2 | `TWITTER_BEARER_TOKEN` env var |
| Email | IMAP | `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASSWORD` |
| ChatGPT | Data export | Download from ChatGPT Settings |
| Claude | Data export | Download from claude.ai Settings |
| Claude Code | Session logs | Reads `~/.claude/projects/` automatically |

## Philosophy

1. **Files, not databases** — Everything is a markdown file. You can `cat`, `grep`, `git` your knowledge.
2. **Observable** — No hidden state. Open `~/.pkb/entries/` and see everything.
3. **Personal** — Designed for individuals, not teams. Your brain's external hard drive.
4. **Composable** — MCP server means any AI assistant can read/write your knowledge.
5. **Rules, not AI** — Organization is deterministic. You define the rules, the system follows them.

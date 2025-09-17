[![Add to Cursor](https://fastmcp.me/badges/cursor_dark.svg)](https://fastmcp.me/MCP/Details/1100/pinemcp-multi-database)
[![Add to VS Code](https://fastmcp.me/badges/vscode_dark.svg)](https://fastmcp.me/MCP/Details/1100/pinemcp-multi-database)
[![Add to Claude](https://fastmcp.me/badges/claude_dark.svg)](https://fastmcp.me/MCP/Details/1100/pinemcp-multi-database)
[![Add to ChatGPT](https://fastmcp.me/badges/chatgpt_dark.svg)](https://fastmcp.me/MCP/Details/1100/pinemcp-multi-database)
[![Add to Codex](https://fastmcp.me/badges/codex_dark.svg)](https://fastmcp.me/MCP/Details/1100/pinemcp-multi-database)
[![Add to Gemini](https://fastmcp.me/badges/gemini_dark.svg)](https://fastmcp.me/MCP/Details/1100/pinemcp-multi-database)

![PineMCP Logo](https://raw.githubusercontent.com/Zyleree/PineMCP/main/docs/assets/PineMCP.png)

[![Node.js >= 18](https://img.shields.io/badge/node-%3E%3D18.0.0-green)](https://nodejs.org)
[![npm package](https://img.shields.io/npm/v/pinemcp.svg)](https://www.npmjs.com/package/pinemcp)
[![GitHub Issues](https://img.shields.io/github/issues/Zyleree/PineMCP)](https://github.com/Zyleree/PineMCP/issues)
[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## PineMCP

PineMCP is a professional Model Context Protocol (MCP) server that provides a unified, safe interface to multiple database types. It ships with robust connection management, schema tooling, data import/export, and query analysis — all exposed as MCP tools over stdio.

—

### Why PineMCP?
- Unified access to PostgreSQL, MySQL, SQLite, Redis, MongoDB, Cassandra, MSSQL, and DynamoDB
- Safe query execution with guardrails and transaction support
- Schema comparison, DDL generation, and migration scaffolding
- Data export/import (JSON, CSV, SQL, XML)
- Query analysis with heuristics, history, and templates

—

### Quick Start
- Installation and environment setup: see the Installation Guide
  - [npm (global)](docs/installation.md#option-1-npm-global-install)
  - [npx (no install)](docs/installation.md#option-2-npx-no-global-install)
  - [Docker (local image)](docs/installation.md#option-3-docker-build-image-locally)
  - [Git clone (local build)](docs/installation.md#option-4-git-clone-local-build)

- Configure databases in your MCP client (no local setup step). See [MCP Integration](docs/mcp-integration.md) for client-specific instructions and examples.

—

### Documentation
- [Installation](docs/installation.md)
- [Tools Reference](docs/tools-reference.md)
- [Troubleshooting](docs/troubleshooting.md)
- [MCP Integration](docs/mcp-integration.md)
- [Contributing](CONTRIBUTING.md)

—

### CLI Overview
PineMCP exposes a CLI via the `pinemcp` binary. For a complete list of commands and options, see the Installation Guide. Common tasks:

```bash
pinemcp start
pinemcp test-connection --name <connectionName>
```

Note: PineMCP 2.0.0 does not persist configuration. Connections are supplied by your MCP client. Only the `data/` directory is used to store history/templates; mount it in Docker if you want persistence.

—

### Deployment
See detailed instructions in the Installation Guide:
- [npm (global)](docs/installation.md#option-1-npm-global-install)
- [npx (no install)](docs/installation.md#option-2-npx-no-global-install)
- [Docker (local image)](docs/installation.md#option-3-docker-build-image-locally)
- [Git clone (local build)](docs/installation.md#option-4-git-clone-local-build)

—

### License
PineMCP is released under the MIT License. See [LICENSE](LICENSE).



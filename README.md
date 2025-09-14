# PineMCP

A Model Context Protocol (MCP) server that connects to multiple database types and gives you powerful tools for managing your data. Works with Cursor, Claude Desktop, and other MCP-compatible clients.

[![npm version](https://badge.fury.io/js/pinemcp.svg)](https://badge.fury.io/js/pinemcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)

## Quick Start

Install it with one command:

```bash
# Linux/macOS/WSL
curl -fsSL https://raw.githubusercontent.com/Zyleree/PineMCP/main/install.sh | bash

# Windows (PowerShell)
iwr -useb https://raw.githubusercontent.com/Zyleree/PineMCP/main/install.ps1 | iex
```

Then set up your databases and start using it:

```bash
# Add your database connections
pinemcp setup

# Add to your MCP client (see Integration below)
# Now you can ask questions about your data in plain English!
```

## What it does

### Works with your databases
- **PostgreSQL** - Full SQL support
- **MySQL** - Popular relational database
- **SQLite** - Lightweight file-based database  
- **Redis** - In-memory data store
- **MongoDB** - Document database
- **Cassandra** - Wide-column NoSQL database
- **Microsoft SQL Server** - Enterprise SQL database
- **Amazon DynamoDB** - Managed NoSQL database

### Tools you get
- **Schema stuff** - Compare, migrate, and validate schemas
- **Data operations** - Export/import in JSON, CSV, SQL, XML formats
- **Query analysis** - Performance optimization and monitoring
- **Connection management** - Add, edit, remove, and test database connections
- **Transactions** - Full ACID transaction support
- **CLI** - Command-line tools for everything

### AI features
- **Natural language** - Ask questions in plain English
- **Smart suggestions** - Get optimization recommendations
- **Query templates** - Save and reuse common queries
- **Performance insights** - Automatic query analysis

## Installation

### Easiest way (one command)

**Linux/macOS/WSL:**
```bash
curl -fsSL https://raw.githubusercontent.com/Zyleree/PineMCP/main/install.sh | bash
```

**Windows (PowerShell):**
```powershell
iwr -useb https://raw.githubusercontent.com/Zyleree/PineMCP/main/install.ps1 | iex
```

### Or use npm

```bash
npm install -g pinemcp
```

### Or Docker

```bash
git clone https://github.com/Zyleree/PineMCP.git
cd pinemcp
docker-compose up -d
```

## Setting up with your MCP client

### 1. Add your databases
```bash
pinemcp setup
```

### 2. Add to your MCP client

**Cursor IDE:**
- **Windows**: `%APPDATA%\Cursor\User\globalStorage\cursor.mcp\mcp.json`
- **macOS**: `~/Library/Application Support/Cursor/User/globalStorage/cursor.mcp/mcp.json`
- **Linux**: `~/.config/Cursor/User/globalStorage/cursor.mcp/mcp.json`

**Claude Desktop:**
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

**Other MCP clients:**
Check your client's docs for MCP server configuration.

**Add this to your config:**
```json
{
  "mcpServers": {
    "pinemcp": {
      "command": "pinemcp",
      "args": ["start"],
      "env": {}
    }
  }
}
```

**Restart your MCP client** and you're good to go.

## Documentation

- **[Installation Guide](docs/installation.md)** - Detailed installation instructions
- **[Tools Reference](docs/tools-reference.md)** - Complete MCP tools documentation
- **[MCP Client Integration](docs/mcp-integration.md)** - Setup guides for different MCP clients
- **[Configuration Guide](docs/configuration.md)** - Database configuration
- **[Examples](docs/examples.md)** - Practical use cases
- **[Troubleshooting](docs/troubleshooting.md)** - Common issues and solutions

## Usage Examples

### Ask questions naturally
```
"Show me all users created in the last month"
"Find orders with total amount greater than $100"
"Export the products table to CSV"
"Compare the schema between dev and production databases"
```

### CLI commands
```bash
# See what's available
pinemcp --help

# Setup and config
pinemcp setup                    # Interactive setup
pinemcp config                   # Show current configuration
pinemcp reset-config             # Reset to defaults

# Manage connections
pinemcp connections              # List all connections
pinemcp add-connection           # Add new connection
pinemcp edit-connection -n <name> # Edit existing connection
pinemcp remove-connection -n <name> # Remove connection
pinemcp test-connection -n <name> # Test connection

# Start the server
pinemcp start                    # Start MCP server
```

## Available MCP Tools

### Database operations
- `execute_query` - Run queries on any database
- `get_tables` - List all tables/collections
- `get_table_info` - Get detailed table information
- `get_database_stats` - Database statistics
- `validate_connection` - Test database connection

### Schema management
- `compare_schemas` - Compare database schemas
- `generate_migration` - Generate migration scripts
- `generate_ddl` - Export database structure
- `validate_schema` - Check schema consistency

### Data operations
- `export_data` - Export data to files (JSON, CSV, SQL, XML)
- `import_data` - Import data from files
- `begin_transaction` - Start database transaction
- `commit_transaction` - Commit transaction
- `rollback_transaction` - Rollback transaction

### Query analysis
- `analyze_query` - Performance analysis and recommendations
- `get_query_history` - Query execution history
- `get_slow_queries` - Find slow queries
- `save_query_template` - Save reusable query templates
- `execute_template` - Run parameterized queries

### Connection management
- `add_connection` - Add new database connection
- `remove_connection` - Remove database connection
- `list_connections` - List all connections
- `switch_connection` - Switch active connection

## Connection Management

Manage your database connections through CLI commands and MCP tools:

### CLI Commands
- **`pinemcp connections`** - List all configured database connections
- **`pinemcp add-connection`** - Interactive setup for new connections
- **`pinemcp edit-connection -n <name>`** - Edit existing connection settings
- **`pinemcp remove-connection -n <name>`** - Remove a connection (with confirmation)
- **`pinemcp test-connection -n <name>`** - Test connection and show database info
- **`pinemcp reset-config`** - Reset all configuration to defaults

### What you get
- **Interactive setup** - Guided connection configuration for all database types
- **Connection testing** - Real-time validation of database connections
- **Safe operations** - Confirmation prompts for destructive actions
- **Multi-database support** - Manage connections to different database types simultaneously
- **Configuration validation** - Automatic validation before saving changes

## Configuration

The server uses a JSON configuration file with database connections:

```json
{
  "databases": [
    {
      "name": "main-db",
      "type": "postgresql",
      "host": "localhost",
      "port": 5432,
      "database": "myapp",
      "username": "user",
      "password": "password"
    },
    {
      "name": "cache",
      "type": "redis",
      "host": "localhost",
      "port": 6379,
      "db": 0
    }
  ],
  "server": {
    "name": "PineMCP",
    "version": "1.0.0"
  },
  "logging": {
    "level": "info",
    "format": "text"
  }
}
```

## Development

```bash
# Clone and setup
git clone https://github.com/Zyleree/PineMCP.git
cd pinemcp
npm install

# Development
npm run dev          # Start in development mode
npm run build        # Build the project
npm test            # Run tests
npm run lint        # Lint code
```

## Requirements

- **Node.js 18+** - [Download](https://nodejs.org/)
- **One or more database servers** (PostgreSQL, MySQL, SQLite, Redis, MongoDB, Cassandra, Microsoft SQL Server, Amazon DynamoDB)
- **MCP-compatible client** (Cursor, Claude Desktop, or other MCP clients)

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/Zyleree/PineMCP/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Zyleree/PineMCP/discussions)

---

**Ready to supercharge your database workflow with AI? Install now and start querying with natural language!** 🚀

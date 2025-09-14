# Installation Guide

Here's how to install PineMCP on your system.

## What you need

- **Node.js 18+** - [Download](https://nodejs.org/)
- **One or more database servers** (PostgreSQL, MySQL, SQLite, Redis, MongoDB, Cassandra, Microsoft SQL Server, Amazon DynamoDB)
- **MCP-compatible client** (Cursor, Claude Desktop, or other MCP clients)

## Quick Installation

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
# Install globally
npm install -g pinemcp

# Check it worked
pinemcp --version
```

### Or Docker

```bash
# Clone repository
git clone https://github.com/Zyleree/PineMCP.git
cd pinemcp

# Build and run
docker-compose up -d

# Or build manually
docker build -t pinemcp .
docker run -d --name pinemcp -v $(pwd)/config:/app/config pinemcp
```

## After Installation

### 1. Add your databases

Run the interactive setup:
```bash
pinemcp setup
```

This will walk you through:
- Adding database connections
- Testing connections
- Saving configuration

### 2. Connect to your MCP client

**Cursor IDE:**
- **Windows**: `%APPDATA%\Cursor\User\globalStorage\cursor.mcp\mcp.json`
- **macOS**: `~/Library/Application Support/Cursor/User/globalStorage/cursor.mcp/mcp.json`
- **Linux**: `~/.config/Cursor/User/globalStorage/cursor.mcp/mcp.json`

**Claude Desktop:**
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

**Other MCP clients:**
Check your client's documentation for MCP server configuration.

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

### 3. Restart your MCP client

After adding the configuration, restart your MCP client to load the server.

**For detailed integration guides, see [MCP Client Integration](mcp-integration.md)**

## Test it works

```bash
# Check version
pinemcp --version

# Show help
pinemcp --help

# Test configuration
pinemcp config

# Start server (for testing)
pinemcp start
```

## Platform notes

### Windows
- Needs PowerShell 5.1+ or PowerShell Core
- Might need to run as Administrator for global installation
- Use `winget install OpenJS.NodeJS` for Node.js installation

### Linux
- Works on Ubuntu, Debian, CentOS, RHEL, and other distributions
- Might need `sudo` for global installation
- Use your package manager for Node.js installation

### macOS
- Works on macOS 10.15+ (Catalina and later)
- Use Homebrew: `brew install node`
- Might need `sudo` for global installation

### WSL (Windows Subsystem for Linux)
- Use the Linux installation method
- Make sure Node.js is installed in WSL, not Windows

## Troubleshooting

### Common problems

**"Command not found" after installation:**
- Restart your terminal
- Check if npm global bin is in your PATH
- Run `npm config get prefix` to find global installation path

**Permission denied errors:**
- Use `sudo` on Linux/macOS
- Run PowerShell as Administrator on Windows
- Check npm permissions: `npm config get prefix`

**Node.js version too old:**
- Update Node.js to version 18 or later
- Use `nvm` to manage Node.js versions

**Database connection fails:**
- Make sure database server is running
- Check firewall settings
- Verify connection credentials
- Test connection manually

### Getting help

- Check the [Troubleshooting Guide](troubleshooting.md)
- Open an [issue](https://github.com/Zyleree/PineMCP/issues)

## Uninstalling

### NPM installation
```bash
npm uninstall -g pinemcp
```

### Docker installation
```bash
docker stop pinemcp
docker rm pinemcp
docker rmi pinemcp
```

### Manual cleanup
- Remove configuration files from `~/.pinemcp/` or `%APPDATA%\.pinemcp\`
- Remove MCP client configuration (Cursor, Claude Desktop, etc.)
- Restart your MCP client

### Complete removal
```bash
# Remove global package
npm uninstall -g pinemcp

# Remove configuration directory
rm -rf ~/.pinemcp  # Linux/macOS
rmdir /s %APPDATA%\.pinemcp  # Windows

# Remove from MCP client configuration
# Edit your MCP client's config file and remove the pinemcp entry
```

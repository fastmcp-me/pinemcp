# MCP Client Integration

How to connect PineMCP with different MCP-compatible clients.

## Supported clients

- **Claude Desktop** - Anthropic's desktop application
- **Cursor IDE** - AI-powered code editor
- **Other MCP clients** - Any client supporting the MCP protocol

## Cursor IDE

### Config file location
- **Windows**: `%APPDATA%\Cursor\User\globalStorage\cursor.mcp\mcp.json`
- **macOS**: `~/Library/Application Support/Cursor/User/globalStorage/cursor.mcp/mcp.json`
- **Linux**: `~/.config/Cursor/User/globalStorage/cursor.mcp/mcp.json`

### Setup steps

1. **Open Cursor Settings** (`Ctrl/Cmd + ,`)
2. **Search for "MCP"**
3. **Add this config:**

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

4. **Restart Cursor IDE**

### Or do it manually

1. Go to the config file location
2. Create or edit the `mcp.json` file
3. Add the server configuration
4. Save and restart Cursor

## Claude Desktop

### Config file location
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

### Setup steps

1. **Find the config file**
2. **Add this config:**

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

3. **Restart Claude Desktop**

## Other MCP clients

### Generic config

Most MCP clients use a similar configuration format:

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

### Client-specific notes

- **Check your client's docs** for exact configuration file locations
- **Some clients use different field names** (e.g., `servers` instead of `mcpServers`)
- **Environment variables** can be added to the `env` object if needed

## Test it works

### Check the integration

1. **Start your MCP client**
2. **Look for PineMCP** in available tools
3. **Try a simple query** like "Show me all tables"
4. **Check the server logs** if issues occur

### Troubleshooting

**Server not showing up:**
- Check the configuration file syntax
- Make sure the server is installed globally
- Restart your MCP client
- Check file permissions

**Connection errors:**
- Run `pinemcp setup` to configure databases
- Test with `pinemcp start` directly
- Check database server status

**Permission issues:**
- Make sure the MCP server is in your PATH
- Check file permissions on configuration files
- Run installation with appropriate privileges

## Advanced config

### Custom environment variables

```json
{
  "mcpServers": {
    "pinemcp": {
      "command": "pinemcp",
      "args": ["start"],
      "env": {
        "NODE_ENV": "production",
        "LOG_LEVEL": "debug"
      }
    }
  }
}
```

### Multiple server instances

```json
{
  "mcpServers": {
    "pinemcp-dev": {
      "command": "pinemcp",
      "args": ["start", "--config", "dev-config.json"],
      "env": {}
    },
    "pinemcp-prod": {
      "command": "pinemcp",
      "args": ["start", "--config", "prod-config.json"],
      "env": {}
    }
  }
}
```

### Custom config files

```json
{
  "mcpServers": {
    "pinemcp": {
      "command": "pinemcp",
      "args": ["start", "--config", "/path/to/custom/config.json"],
      "env": {}
    }
  }
}
```

## Security stuff

### Database credentials
- Store sensitive credentials in environment variables
- Use connection strings with encrypted passwords
- Regularly rotate database passwords

### Network security
- Use SSL/TLS for database connections
- Restrict database access to necessary IPs
- Consider using VPNs for remote connections

### File permissions
- Secure configuration files with appropriate permissions
- Avoid storing credentials in plain text
- Use system keychains when available

## Getting help

- **Check the [Troubleshooting Guide](troubleshooting.md)**
- **Open an [issue](https://github.com/Zyleree/PineMCP/issues)**
- **Join our [discussions](https://github.com/Zyleree/PineMCP/discussions)**

## Examples

### Basic query
```
"Show me all users in the database"
```

### Schema analysis
```
"Compare the schema between my dev and production databases"
```

### Data export
```
"Export the orders table to CSV format"
```

### Performance analysis
```
"Analyze the performance of this query: SELECT * FROM users WHERE email = 'test@example.com'"
```

# Tools Reference

This page documents all MCP tools exposed by PineMCP. Shapes shown below reflect the server’s behavior; adapters may add minor variations in result fields.

Conventions:
- Inputs are listed with required/optional fields.
- Outputs show typical JSON returned in the `content[0].text` field.
- Examples use nominal values; adjust `connection` to your configured name.

## Query & Metadata

### execute_query
- Required: `query`
- Optional: `parameters[]`, `connection`
- Returns: `{ rows, rowCount, fields }`
- Example:
```json
{
  "name": "execute_query",
  "arguments": {
    "connection": "main",
    "query": "SELECT id, name FROM users WHERE id = $1",
    "parameters": ["42"]
  }
}
```

### get_tables
- Optional: `connection`
- Returns: `[{ name, schema, type }]`
- Example:
```json
{ "name": "get_tables", "arguments": { "connection": "main" } }
```

### get_table_info
- Required: `table_name`
- Optional: `schema`, `connection`
- Returns: `{ columns[], indexes[], constraints[] }`
- Example:
```json
{
  "name": "get_table_info",
  "arguments": { "connection": "main", "table_name": "users", "schema": "public" }
}
```

### get_database_stats
- Optional: `connection`
- Returns: `{ totalTables, totalViews, totalIndexes, databaseSize, connectionCount? }`
- Example:
```json
{ "name": "get_database_stats", "arguments": { "connection": "main" } }
```

### validate_connection
- Optional: `connection`
- Returns: `{ connected: boolean }`
- Example:
```json
{ "name": "validate_connection", "arguments": { "connection": "main" } }
```

## Transactions & Batch

### begin_transaction
- Optional: `connection`
- Side effect: starts a transaction on the connection.
- Example:
```json
{ "name": "begin_transaction", "arguments": { "connection": "main" } }
```

### commit_transaction
- Optional: `connection`
- Side effect: commits current transaction.
- Example:
```json
{ "name": "commit_transaction", "arguments": { "connection": "main" } }
```

### rollback_transaction
- Optional: `connection`
- Side effect: rolls back current transaction.
- Example:
```json
{ "name": "rollback_transaction", "arguments": { "connection": "main" } }
```

### execute_batch
- Required: `operations[]` with items `{ type: 'SELECT'|'INSERT'|'UPDATE'|'DELETE'|'CREATE'|'DROP'|'ALTER', query, parameters[] }`
- Optional: `connection`
- Returns: `QueryResult[]`
- Example:
```json
{
  "name": "execute_batch",
  "arguments": {
    "connection": "main",
    "operations": [
      { "type": "INSERT", "query": "INSERT INTO tags(name) VALUES ($1)", "parameters": ["dev"] },
      { "type": "SELECT", "query": "SELECT * FROM tags WHERE name=$1", "parameters": ["dev"] }
    ]
  }
}
```

## Connection Management

Note: PineMCP expects connections to be provided via client configuration. These tools remain available for dynamic sessions.

### add_connection
- Required: `name`, `config { type, ... }`
- `config.type` supports: `postgresql`, `mysql`, `sqlite`, `redis`, `mongodb`, `cassandra`, `mssql`, `dynamodb`
- Example:
```json
{
  "name": "add_connection",
  "arguments": {
    "name": "pg-temp",
    "config": {
      "type": "postgresql",
      "host": "localhost",
      "port": 5432,
      "database": "app",
      "username": "user",
      "password": "pass",
      "ssl": false
    }
  }
}
```

### remove_connection
- Required: `name`
- Example:
```json
{ "name": "remove_connection", "arguments": { "name": "pg-temp" } }
```

### list_connections
- Returns: `[{ name, type, connected }]`
- Example:
```json
{ "name": "list_connections", "arguments": {} }
```

### switch_connection
- Required: `name`
- Example:
```json
{ "name": "switch_connection", "arguments": { "name": "main" } }
```

### get_current_connection
- Returns: `{ currentConnection }`
- Example:
```json
{ "name": "get_current_connection", "arguments": {} }
```

## Schema Operations

### compare_schemas
- Required: `source_connection`, `target_connection`
- Returns: `{ identical, differences[], summary{ tablesAdded, tablesRemoved, tablesModified, columnsAdded, columnsRemoved, columnsModified } }`
- Example:
```json
{
  "name": "compare_schemas",
  "arguments": { "source_connection": "main", "target_connection": "staging" }
}
```

### generate_migration
- Required: `source_connection`, `target_connection`, `migration_name`
- Returns: `Migration { id, name, timestamp, steps[] }`
- Example:
```json
{
  "name": "generate_migration",
  "arguments": { "source_connection": "main", "target_connection": "staging", "migration_name": "align-staging" }
}
```

### generate_ddl
- Required: `connection`
- Optional: `include_data`, `include_indexes`, `include_constraints`, `format: sql|json|yaml`
- Returns: string (DDL or serialized representation)
- Example:
```json
{
  "name": "generate_ddl",
  "arguments": { "connection": "main", "include_indexes": true, "include_constraints": true, "format": "sql" }
}
```

### validate_schema
- Required: `connection`
- Returns: `{ valid, issues[] }`
- Example:
```json
{ "name": "validate_schema", "arguments": { "connection": "main" } }
```

## Data Export / Import

### export_data
- Required: `connection`, `output_path`, `format: json|csv|sql|xml`
- Optional: `tables[]`, `where_clause`, `limit`, `include_schema`, `pretty_print`
- Returns: `{ success, message, recordCount }`
- Example:
```json
{
  "name": "export_data",
  "arguments": {
    "connection": "main",
    "output_path": "./data/export.sql",
    "format": "sql",
    "tables": ["users"],
    "limit": 100
  }
}
```

### import_data
- Required: `connection`, `file_path`, `format: json|csv|sql|xml`, `table_name`
- Optional: `mode: insert|upsert|replace`, `batch_size`, `skip_errors`, `mapping{}`
- Returns: `{ success, message, recordCount }`
- Example:
```json
{
  "name": "import_data",
  "arguments": {
    "connection": "main",
    "file_path": "./data/users.csv",
    "format": "csv",
    "table_name": "users",
    "mode": "insert",
    "batch_size": 500,
    "skip_errors": true
  }
}
```

## Query Analysis & Templates

### analyze_query
- Required: `connection`, `query`
- Optional: `parameters[]`
- Returns: `{ executionTime, rowsAffected, performance{ slow, score, recommendations[] }, executionPlan? }`
- Example:
```json
{
  "name": "analyze_query",
  "arguments": { "connection": "main", "query": "SELECT * FROM users WHERE email LIKE '%@example.com'" }
}
```

### get_query_history
- Optional: `limit` (default 50)
- Returns: `QueryAnalysisResult[]`
- Example:
```json
{ "name": "get_query_history", "arguments": { "limit": 20 } }
```

### get_slow_queries
- Optional: `threshold` (ms, default 1000)
- Returns: `QueryAnalysisResult[]`
- Example:
```json
{ "name": "get_slow_queries", "arguments": { "threshold": 800 } }
```

### get_query_statistics
- Returns: `{ totalQueries, averageExecutionTime, slowQueries, mostCommonIssues[] }`
- Example:
```json
{ "name": "get_query_statistics", "arguments": {} }
```

### save_query_template
- Required: `name`, `description`, `query`, `parameters[]`, `connection_type`
- Optional: `tags[]`
- Returns: `Template { id, name, description, query, parameters[], tags[], connectionType, createdAt, updatedAt }`
- Example:
```json
{
  "name": "save_query_template",
  "arguments": {
    "name": "find-user-by-email",
    "description": "Select user by email",
    "query": "SELECT * FROM users WHERE email = {email}",
    "parameters": [ { "name": "email", "type": "string", "required": true } ],
    "tags": ["users"],
    "connection_type": "postgresql"
  }
}
```

### get_query_templates
- Optional: `connection_type`, `tags[]`
- Returns: `Template[]`
- Example:
```json
{ "name": "get_query_templates", "arguments": { "connection_type": "postgresql", "tags": ["users"] } }
```

### execute_template
- Required: `connection`, `template_id`, `parameters{}`
- Returns: same shape as `analyze_query`
- Example:
```json
{
  "name": "execute_template",
  "arguments": {
    "connection": "main",
    "template_id": "template_123",
    "parameters": { "email": "test@example.com" }
  }
}
```

## Supported Database Types
- postgresql, mysql, sqlite, redis, mongodb, cassandra, mssql, dynamodb

For client wiring, see [MCP Integration](./mcp-integration.md). For installation methods, see [Installation](./installation.md).

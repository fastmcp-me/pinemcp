# MCP Tools Reference

All the MCP tools you can use with PineMCP.

## Database operations

### execute_query
Run queries on any connected database.

**What you need:**
- `query` (string, required) - SQL query, JSON for MongoDB, or Redis commands
- `parameters` (array, optional) - Query parameters
- `connection` (string, optional) - Connection name (uses current if not specified)

**Example:**
```json
{
  "query": "SELECT * FROM users WHERE age > ?",
  "parameters": ["25"],
  "connection": "main-db"
}
```

### get_tables
List all tables/collections in the current database.

**What you need:**
- `connection` (string, optional) - Connection name

**Example:**
```json
{
  "connection": "main-db"
}
```

### get_table_info
Get detailed info about a specific table/collection.

**What you need:**
- `table_name` (string, required) - Name of the table/collection
- `schema` (string, optional) - Schema name
- `connection` (string, optional) - Connection name

**Example:**
```json
{
  "table_name": "users",
  "schema": "public",
  "connection": "main-db"
}
```

### get_database_stats
Get database statistics and info.

**What you need:**
- `connection` (string, optional) - Connection name

**Example:**
```json
{
  "connection": "main-db"
}
```

### validate_connection
Test database connection.

**What you need:**
- `connection` (string, optional) - Connection name

**Example:**
```json
{
  "connection": "main-db"
}
```

## Transaction management

### begin_transaction
Start a database transaction.

**What you need:**
- `connection` (string, optional) - Connection name

### commit_transaction
Commit the current transaction.

**What you need:**
- `connection` (string, optional) - Connection name

### rollback_transaction
Rollback the current transaction.

**What you need:**
- `connection` (string, optional) - Connection name

### execute_batch
Run multiple queries in a transaction.

**What you need:**
- `operations` (array, required) - Array of database operations
- `connection` (string, optional) - Connection name

**Example:**
```json
{
  "operations": [
    {
      "type": "INSERT",
      "query": "INSERT INTO users (name, email) VALUES (?, ?)",
      "parameters": ["John", "john@example.com"]
    },
    {
      "type": "UPDATE",
      "query": "UPDATE users SET last_login = NOW() WHERE email = ?",
      "parameters": ["john@example.com"]
    }
  ],
  "connection": "main-db"
}
```

## Connection management

### add_connection
Add a new database connection.

**What you need:**
- `name` (string, required) - Connection name
- `config` (object, required) - Database configuration

**Example:**
```json
{
  "name": "redis-cache",
  "config": {
    "type": "redis",
    "host": "localhost",
    "port": 6379,
    "db": 0
  }
}
```

### remove_connection
Remove a database connection.

**What you need:**
- `name` (string, required) - Connection name

### list_connections
List all database connections.

**What you need:** Nothing

### switch_connection
Switch to a different database connection.

**What you need:**
- `name` (string, required) - Connection name

### get_current_connection
Get the current active connection name.

**What you need:** Nothing

## Schema management

### compare_schemas
Compare schemas between two database connections.

**What you need:**
- `source_connection` (string, required) - Source connection name
- `target_connection` (string, required) - Target connection name

**Example:**
```json
{
  "source_connection": "dev-db",
  "target_connection": "prod-db"
}
```

### generate_migration
Generate migration script from schema comparison.

**What you need:**
- `source_connection` (string, required) - Source connection name
- `target_connection` (string, required) - Target connection name
- `migration_name` (string, required) - Migration name

**Example:**
```json
{
  "source_connection": "dev-db",
  "target_connection": "prod-db",
  "migration_name": "add_user_roles"
}
```

### generate_ddl
Generate DDL for a database connection.

**What you need:**
- `connection` (string, required) - Connection name
- `include_data` (boolean, optional) - Include data in DDL
- `include_indexes` (boolean, optional) - Include indexes
- `include_constraints` (boolean, optional) - Include constraints
- `format` (string, optional) - Output format (sql, json, yaml)

**Example:**
```json
{
  "connection": "main-db",
  "include_indexes": true,
  "include_constraints": true,
  "format": "sql"
}
```

### validate_schema
Validate schema consistency.

**What you need:**
- `connection` (string, required) - Connection name

## Data export/import

### export_data
Export data from database to file.

**What you need:**
- `connection` (string, required) - Connection name
- `output_path` (string, required) - Output file path
- `format` (string, required) - Export format (json, csv, sql, xml)
- `tables` (array, optional) - Specific tables to export
- `where_clause` (string, optional) - WHERE clause for filtering
- `limit` (number, optional) - Limit number of records
- `include_schema` (boolean, optional) - Include schema information
- `pretty_print` (boolean, optional) - Pretty print output

**Example:**
```json
{
  "connection": "main-db",
  "output_path": "/tmp/users_export.json",
  "format": "json",
  "tables": ["users", "orders"],
  "where_clause": "created_at > '2024-01-01'",
  "limit": 1000,
  "pretty_print": true
}
```

### import_data
Import data from file to database.

**What you need:**
- `connection` (string, required) - Connection name
- `file_path` (string, required) - Input file path
- `format` (string, required) - Import format (json, csv, sql, xml)
- `table_name` (string, required) - Target table name
- `mode` (string, optional) - Import mode (insert, upsert, replace)
- `batch_size` (number, optional) - Batch size for import
- `skip_errors` (boolean, optional) - Skip errors and continue
- `mapping` (object, optional) - Column mapping

**Example:**
```json
{
  "connection": "main-db",
  "file_path": "/tmp/users_import.csv",
  "format": "csv",
  "table_name": "users",
  "mode": "insert",
  "batch_size": 1000,
  "skip_errors": false
}
```

## Query analysis

### analyze_query
Analyze query performance and get recommendations.

**What you need:**
- `connection` (string, required) - Connection name
- `query` (string, required) - Query to analyze
- `parameters` (array, optional) - Query parameters

**Example:**
```json
{
  "connection": "main-db",
  "query": "SELECT * FROM users WHERE email = ?",
  "parameters": ["john@example.com"]
}
```

### get_query_history
Get query execution history.

**What you need:**
- `limit` (number, optional) - Number of queries to return

### get_slow_queries
Get slow queries from history.

**What you need:**
- `threshold` (number, optional) - Execution time threshold in milliseconds

### get_query_statistics
Get query performance statistics.

**What you need:** Nothing

### save_query_template
Save a query template.

**What you need:**
- `name` (string, required) - Template name
- `description` (string, required) - Template description
- `query` (string, required) - Query template with {parameter} placeholders
- `parameters` (array, required) - Template parameters
- `tags` (array, optional) - Template tags
- `connection_type` (string, required) - Database type

**Example:**
```json
{
  "name": "find_user_by_email",
  "description": "Find user by email address",
  "query": "SELECT * FROM users WHERE email = {email}",
  "parameters": [
    {
      "name": "email",
      "type": "string",
      "required": true
    }
  ],
  "tags": ["user", "search"],
  "connection_type": "postgresql"
}
```

### get_query_templates
Get query templates.

**What you need:**
- `connection_type` (string, optional) - Filter by database type
- `tags` (array, optional) - Filter by tags

### execute_template
Run a query template with parameters.

**What you need:**
- `connection` (string, required) - Connection name
- `template_id` (string, required) - Template ID
- `parameters` (object, required) - Parameter values

**Example:**
```json
{
  "connection": "main-db",
  "template_id": "find_user_by_email",
  "parameters": {
    "email": "john@example.com"
  }
}
```

## Error handling

All tools return standardized responses:

**Success response:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "Operation completed successfully"
    }
  ]
}
```

**Error response:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "Error: Connection not found"
    }
  ],
  "isError": true
}
```

## Best practices

1. **Always specify connection names** for multi-database setups
2. **Use transactions** for related operations
3. **Validate connections** before executing queries
4. **Use query templates** for frequently used queries
5. **Monitor performance** with query analysis tools
6. **Export data regularly** for backup purposes
7. **Use appropriate data types** for parameters

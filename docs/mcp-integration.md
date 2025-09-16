# MCP Integration

This guide shows how to register PineMCP as an MCP stdio server in common MCP clients and how to define database connections. It also documents all supported configuration tags and provides templates per database type.

## How PineMCP runs (stdio)
Start PineMCP as a stdio server:
```bash
pinemcp start
```
You can also run a built file or dockerized server. Your MCP client will launch the command you specify.

## Client Integration
Below are standard client-specific setup methods. Prefer using each client’s Settings UI when available. For each client we include four ways to launch PineMCP: npm (global), npx, Docker (local image), and local build.

### Cursor
Settings → Tools & Integrations → Add Custom MCP.
- npm (global):
  - Command: `pinemcp`
  - Args: `start`
- npx:
  - Command: `npx`
  - Args: `pinemcp start`
- Docker (local image you built):
  - Command: `docker`
  - Args: `run --rm -i pinemcp:latest start`
- Local build (from repo `dist/`):
  - Command: `node`
  - Args: `./dist/index.js start`

Add your databases using the client’s fields for server configuration (JSON snippet or UI), e.g. a map of `databases` or list of `connections` as shown in the Templates section below. PineMCP does not read a separate CLI config file; it discovers connections from the MCP client configuration.

### Claude Desktop
Settings → Developer → Edit Config.
- npm (global): command `pinemcp`, args `start`
- npx: command `npx`, args `pinemcp start`
- Docker: command `docker`, args `run --rm -i pinemcp:latest start`
- Local build: command `node`, args `./dist/index.js start`

Add your databases under this server entry using the JSON fields from the Templates section.

### VS Code (extensions with MCP support)
Open the extension’s MCP settings (or workspace settings if supported) and add a new MCP server.
- npm (global): command `pinemcp`, args `start`
- npx: command `npx`, args `pinemcp start`
- Docker: command `docker`, args `run --rm -i pinemcp:latest start`
- Local build: command `node`, args `./dist/index.js start`

Provide connection definitions for PineMCP via the extension’s server-config JSON. PineMCP does not require a `--config` file.

### Cline (VS Code extension)
Cline → MCP Servers → Configure (UI).
- npm (global): command `pinemcp`, args `start`
- npx: command `npx`, args `pinemcp start`
- Docker: command `docker`, args `run --rm -i pinemcp:latest start`
- Local build: command `node`, args `./dist/index.js start`

Add your database entries in the PineMCP server config block using the fields below. No separate CLI config is needed.

Note: Each client may name fields slightly differently (e.g., a `parameters` or `config` block associated with the server). Use the templates below to populate `databases`, `connections`, or similar properties your client exposes.

## All Supported Config Tags per Database Type
You can define connections as full objects or URLs. PineMCP merges and normalizes your entries.

Common fields:
- `name` (string)
- `type` (enum): `postgresql`, `mysql`, `sqlite`, `redis`, `mongodb`, `cassandra`, `mssql`, `dynamodb`
- `url` (string, optional) – can encode host/port/db/credentials where supported
- `host` (string, optional)
- `port` (number, optional)
- `database` (string, optional) – SQL DB name; MongoDB database; Cassandra keyspace alternative
- `username` (string, optional)
- `password` (string, optional)
- `ssl` (boolean, optional)

Type-specific:
- PostgreSQL (`postgresql`)
  - Defaults: port 5432; `url` supports `?sslmode=require|disable`
- MySQL (`mysql`)
  - Defaults: port 3306; `url` supports `?ssl=true`
- SQLite (`sqlite`)
  - `filename` (string), e.g., `:memory:` or path
- Redis (`redis`)
  - `db` (number), default 0; defaults port 6379
- MongoDB (`mongodb`)
  - `authSource`; defaults port 27017
- Cassandra (`cassandra`)
  - `keyspace`, `datacenter`; defaults port 9042
- Microsoft SQL Server (`mssql`)
  - Defaults: port 1433
- DynamoDB (`dynamodb`)
  - `region` or `endpoint` required; AWS creds via environment variables

URL parsing examples supported by PineMCP:
- Postgres: `postgres://user:pass@host:5432/db?sslmode=require`
- MySQL: `mysql://user:pass@host:3306/db?ssl=true`
- SQLite: `sqlite:///absolute/path/to/file.db` or `sqlite::memory:`
- Redis: `redis://:pass@host:6379/0`
- MongoDB: `mongodb://user:pass@host:27017/db?authSource=admin`
- Cassandra: `cassandra://user:pass@host:9042/ks?datacenter=dc1`
- MSSQL: `mssql://user:pass@host:1433/app`
- DynamoDB: `dynamodb://?region=us-east-1` or endpoint `http://localhost:8000`

## Templates: Database Config Entries
Use these JSON snippets in your MCP client’s server config block for PineMCP. You can place them under the field your client uses (e.g., `databases`, `connections`, or a custom `config` object).

### PostgreSQL
```json
{
  "name": "pg-main",
  "type": "postgresql",
  "host": "localhost",
  "port": 5432,
  "database": "app",
  "username": "user",
  "password": "pass",
  "ssl": false
}
```
URL: `postgres://user:pass@localhost:5432/app?sslmode=require`

### MySQL
```json
{
  "name": "mysql-main",
  "type": "mysql",
  "host": "localhost",
  "port": 3306,
  "database": "app",
  "username": "user",
  "password": "pass",
  "ssl": true
}
```
URL: `mysql://user:pass@localhost:3306/app?ssl=true`

### SQLite
```json
{
  "name": "sqlite-local",
  "type": "sqlite",
  "filename": ":memory:"
}
```
URL: `sqlite:///absolute/path/to/file.db`

### Redis
```json
{
  "name": "redis-cache",
  "type": "redis",
  "host": "localhost",
  "port": 6379,
  "db": 0,
  "password": "pass"
}
```
URL: `redis://:pass@localhost:6379/0`

### MongoDB
```json
{
  "name": "mongo-docs",
  "type": "mongodb",
  "host": "localhost",
  "port": 27017,
  "database": "docs",
  "username": "user",
  "password": "pass",
  "authSource": "admin"
}
```
URL: `mongodb://user:pass@localhost:27017/docs?authSource=admin`

### Cassandra
```json
{
  "name": "cassandra-ks",
  "type": "cassandra",
  "host": "localhost",
  "port": 9042,
  "keyspace": "ks1",
  "username": "user",
  "password": "pass",
  "datacenter": "dc1"
}
```
URL: `cassandra://user:pass@localhost:9042/ks1?datacenter=dc1`

### MSSQL
```json
{
  "name": "mssql-main",
  "type": "mssql",
  "host": "localhost",
  "port": 1433,
  "database": "app",
  "username": "user",
  "password": "pass"
}
```
URL: `mssql://user:pass@localhost:1433/app`

### DynamoDB
```json
{
  "name": "dynamodb-local",
  "type": "dynamodb",
  "region": "us-east-1"
}
```
Local endpoint:
```json
{
  "name": "dynamodb-local",
  "type": "dynamodb",
  "endpoint": "http://localhost:8000"
}
```

## Notes
- PineMCP does not persist configuration and does not accept a `--config` file. Define all connections in your MCP client’s configuration.
- You can use URLs instead of individual fields where supported; PineMCP will parse and normalize them.
- Keep credentials secure and limit DB user privileges.

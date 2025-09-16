# Installation Guide

Install the PineMCP server using one of the following methods.

## Option 1: npm (global install)
Install the CLI globally:
```bash
npm install -g pinemcp
```
Run:
```bash
pinemcp start
```
Upgrade:
```bash
npm update -g pinemcp
```
Uninstall:
```bash
npm uninstall -g pinemcp
```

## Option 2: npx (no global install)
Run the CLI without installing globally:
```bash
npx pinemcp start
```

## Option 3: Docker (build image locally)
Build the image from this repository:
```bash
docker build -t pinemcp:latest .
```
Run the server (stdio):
```bash
docker run --rm -i pinemcp:latest start
```
Persist data (optional):
```bash
docker run --rm -i \
  -v "$PWD/data:/app/data" \
  pinemcp:latest start
```
Using docker-compose:
```bash
docker-compose up --build
```

## Option 4: Git clone (local build)
Clone the repository and build locally:
```bash
git clone https://github.com/Zyleree/PineMCP.git
cd PineMCP
npm ci
npm run build
```
Run the CLI from source or the built output:
```bash
npm start -- start
```

## Quick check
After installing by any method, verify the CLI works:
```bash
pinemcp --help
```
Configure connections via your MCP client configuration; see [MCP Integration](./mcp-integration.md). For tool shapes and examples, see [Tools Reference](./tools-reference.md).

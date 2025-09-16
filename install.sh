#!/bin/bash

#!/bin/bash

# PineMCP - Universal Installer (Linux, macOS, WSL)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}PineMCP - Universal Installer${NC}"
echo -e "${BLUE}=======================================${NC}"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed.${NC}"
    echo -e "${YELLOW}Please install Node.js 18+ from https://nodejs.org/${NC}"
    echo -e "${YELLOW}Or run: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}Error: Node.js version 18+ is required. Current version: $(node -v)${NC}"
    echo -e "${YELLOW}Please upgrade Node.js from https://nodejs.org/${NC}"
    exit 1
fi

echo -e "${GREEN}Node.js version: $(node -v) ✓${NC}"
echo ""

# Install globally
echo -e "${YELLOW}Installing PineMCP globally...${NC}"
npm install -g pinemcp

echo ""
echo -e "${GREEN}Installation completed successfully!${NC}"
echo ""
echo -e "${BLUE}Usage:${NC}"
echo -e "  ${YELLOW}pinemcp start${NC}                  # Start the server (stdio)"
echo -e "  ${YELLOW}pinemcp test-connection --name <n>${NC}  # Validate a connection"
echo -e "  ${YELLOW}pinemcp --help${NC}                 # Show all options"
echo ""
echo -e "${BLUE}Configure connections via your MCP client configuration.${NC}"
echo -e "See docs/mcp-integration.md for client setup guides."

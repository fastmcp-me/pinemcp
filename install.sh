#!/bin/bash

# MCP MultiDB Server - Universal Installer
# Works on Linux, macOS, and WSL

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
echo -e "  ${YELLOW}pinemcp setup${NC}    # Configure database connections"
echo -e "  ${YELLOW}pinemcp start${NC}    # Start the server"
echo -e "  ${YELLOW}pinemcp --help${NC}   # Show all options"
echo ""
echo -e "${BLUE}For MCP client integration:${NC}"
echo -e "1. Run: ${YELLOW}pinemcp setup${NC} to configure databases"
echo -e "2. Add to your MCP client configuration:"
echo ""
echo -e "${YELLOW}\"pinemcp\": {${NC}"
echo -e "${YELLOW}  \"command\": \"pinemcp\",${NC}"
echo -e "${YELLOW}  \"args\": [\"start\"]${NC}"
echo -e "${YELLOW}}${NC}"
echo ""
echo -e "${GREEN}Ready to use! Run 'pinemcp setup' to get started.${NC}"
echo -e "${BLUE}See docs/mcp-integration.md for detailed client setup guides.${NC}"

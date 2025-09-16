# PineMCP - Windows Installer
# PowerShell script for Windows 10/11

Write-Host "PineMCP - Windows Installer" -ForegroundColor Blue
Write-Host "=====================================" -ForegroundColor Blue
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node -v
    Write-Host "Node.js version: $nodeVersion ✓" -ForegroundColor Green
} catch {
    Write-Host "Error: Node.js is not installed." -ForegroundColor Red
    Write-Host "Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "Or run: winget install OpenJS.NodeJS" -ForegroundColor Yellow
    exit 1
}

# Check Node.js version
$version = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
if ($version -lt 18) {
    Write-Host "Error: Node.js version 18+ is required. Current version: $nodeVersion" -ForegroundColor Red
    Write-Host "Please upgrade Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Install globally
Write-Host "Installing PineMCP globally..." -ForegroundColor Yellow
npm install -g pinemcp

Write-Host ""
Write-Host "Installation completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Usage:" -ForegroundColor Cyan
Write-Host "  pinemcp start                 # Start the server (stdio)" -ForegroundColor White
Write-Host "  pinemcp test-connection --name <name>  # Validate a connection" -ForegroundColor White
Write-Host "  pinemcp --help                # Show all options" -ForegroundColor White
Write-Host ""
Write-Host "Configure connections via your MCP client configuration." -ForegroundColor Cyan
Write-Host "See docs/mcp-integration.md for client setup guides." -ForegroundColor Blue

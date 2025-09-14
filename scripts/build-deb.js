#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Read package.json for version info
const packageJson = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf-8'));

// Create Debian package structure
const debDir = join(projectRoot, 'debian-package');
const debianDir = join(debDir, 'DEBIAN');
const usrDir = join(debDir, 'usr');
const binDir = join(usrDir, 'local', 'bin');
const shareDir = join(usrDir, 'share', 'mcp-multidb-server');
const etcDir = join(debDir, 'etc', 'mcp-multidb-server');

// Clean and create directories
if (existsSync(debDir)) {
  execSync(`rm -rf ${debDir}`);
}

mkdirSync(debianDir, { recursive: true });
mkdirSync(binDir, { recursive: true });
mkdirSync(shareDir, { recursive: true });
mkdirSync(etcDir, { recursive: true });

// Create control file
const controlContent = `Package: mcp-multidb-server
Version: ${packageJson.version}
Section: utils
Priority: optional
Architecture: all
Depends: nodejs (>= 18.0.0), npm
Maintainer: MCP MultiDB Server Team <team@mcp-multidb.com>
Description: A professional MCP server supporting multiple database types
 This MCP server supports PostgreSQL, MySQL, and SQLite databases with
 comprehensive database operations including CRUD operations, schema
 inspection, transaction management, and more.
 .
 Features:
 - Support for PostgreSQL, MySQL, and SQLite
 - Comprehensive database operations (CRUD)
 - Schema inspection and metadata retrieval
 - Transaction management
 - Batch operations
 - Professional MCP protocol implementation
 - Easy configuration and setup
 .
 The server can be configured through interactive setup or configuration files.
`;

writeFileSync(join(debianDir, 'control'), controlContent);

// Create postinst script
const postinstContent = `#!/bin/bash
set -e

# Set executable permissions
chmod +x /usr/local/bin/mcp-multidb-server

# Create default configuration if it doesn't exist
if [ ! -f /etc/mcp-multidb-server/mcp-config.json ]; then
    cp /usr/share/mcp-multidb-server/config/mcp-config.default.json /etc/mcp-multidb-server/mcp-config.json
    chmod 644 /etc/mcp-multidb-server/mcp-config.json
fi

# Install npm dependencies
cd /usr/share/mcp-multidb-server
npm install --production

echo "MCP MultiDB Server installed successfully!"
echo "Run 'mcp-multidb-server setup' to configure the server."
echo "Run 'mcp-multidb-server start' to start the server."
`;

writeFileSync(join(debianDir, 'postinst'), postinstContent);
execSync(`chmod +x ${join(debianDir, 'postinst')}`);

// Create prerm script
const prermContent = `#!/bin/bash
set -e

# Stop the server if it's running
if systemctl is-active --quiet mcp-multidb-server 2>/dev/null; then
    systemctl stop mcp-multidb-server
fi

# Disable the service if it exists
if systemctl is-enabled --quiet mcp-multidb-server 2>/dev/null; then
    systemctl disable mcp-multidb-server
fi
`;

writeFileSync(join(debianDir, 'prerm'), prermContent);
execSync(`chmod +x ${join(debianDir, 'prerm')}`);

// Create postrm script
const postrmContent = `#!/bin/bash
set -e

# Remove configuration files on purge
if [ "$1" = "purge" ]; then
    rm -rf /etc/mcp-multidb-server
    rm -rf /usr/share/mcp-multidb-server
fi
`;

writeFileSync(join(debianDir, 'postrm'), postrmContent);
execSync(`chmod +x ${join(debianDir, 'postrm')}`);

// Build the application
console.log('Building application...');
execSync('npm run build', { cwd: projectRoot, stdio: 'inherit' });

// Copy built files
console.log('Copying files...');

// Copy executable
copyFileSync(join(projectRoot, 'dist', 'index.js'), join(binDir, 'mcp-multidb-server'));

// Copy package.json and other necessary files
copyFileSync(join(projectRoot, 'package.json'), join(shareDir, 'package.json'));
copyFileSync(join(projectRoot, 'package-lock.json'), join(shareDir, 'package-lock.json'));

// Copy configuration files
const configDir = join(shareDir, 'config');
mkdirSync(configDir, { recursive: true });
copyFileSync(join(projectRoot, 'config', 'mcp-config.default.json'), join(configDir, 'mcp-config.default.json'));

// Copy source files (for runtime)
const distDir = join(shareDir, 'dist');
mkdirSync(distDir, { recursive: true });
execSync(`cp -r ${join(projectRoot, 'dist')}/* ${distDir}/`);

// Create systemd service file
const serviceContent = `[Unit]
Description=MCP MultiDB Server
After=network.target

[Service]
Type=simple
User=mcp-multidb
Group=mcp-multidb
WorkingDirectory=/usr/share/mcp-multidb-server
ExecStart=/usr/local/bin/mcp-multidb-server start
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
`;

writeFileSync(join(shareDir, 'mcp-multidb-server.service'), serviceContent);

// Build the Debian package
console.log('Building Debian package...');
execSync(`dpkg-deb --build ${debDir}`, { stdio: 'inherit' });

// Move the package to the project root
const packageName = `mcp-multidb-server_${packageJson.version}_all.deb`;
execSync(`mv ${join(debDir, packageName)} ${join(projectRoot, packageName)}`);

console.log(`✅ Debian package created: ${packageName}`);
console.log(`📦 Install with: sudo dpkg -i ${packageName}`);
console.log(`🔧 Configure with: mcp-multidb-server setup`);
console.log(`🚀 Start with: mcp-multidb-server start`);
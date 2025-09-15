# Troubleshooting

This guide covers common installation and runtime issues for PineMCP.

## Windows global install errors (ENOTDIR/ENOTEMPTY)

If a previous global install is corrupted, you may see errors like ENOTDIR or ENOTEMPTY when installing pinemcp globally.

Fix by cleaning the broken global install and reinstalling:

```powershell
# Close any apps that might be locking files (PowerShell/VSCode/Terminals)
# Remove the broken global install
Remove-Item -Recurse -Force "$env:APPDATA\npm\node_modules\pinemcp" -ErrorAction SilentlyContinue

# Clear/verify cache
npm cache verify

# Reinstall the latest version
npm i -g pinemcp@latest

# Verify
pinemcp --version
```

If you still see directory removal errors, run PowerShell as Administrator and try again.

## WSL vs Windows path/environment

- Installing in WSL installs to the Linux environment inside WSL, not Windows.
- Use pinemcp from the same environment where you installed it.
- If you need it on both sides, install globally in each environment separately.

## sqlite3/node-gyp errors on Windows

If you see messages about node-gyp or missing modules like detect-libc or env-paths during install:

1. First, clean the global install as above (corruption can cause cascading errors).
2. Ensure you have Node.js 18+ and a recent npm.
3. If rebuilds are required, install build tools:
   - PowerShell (Admin):
     ```powershell
     npm install --global --production windows-build-tools
     ```
   - Or install Visual Studio Build Tools (C++) and Python 3.x, then:
     ```powershell
     npm config set msvs_version 2022
     ```
4. Try reinstalling:
   ```powershell
   npm i -g pinemcp@latest
   ```

## ESM import resolution issues

If you see ERR_MODULE_NOT_FOUND or ESM complaints:

- Ensure you're on pinemcp >= 1.1.2.
- If you are developing locally, run the CLI via:
  ```bash
  node dist/index.js setup
  ```
- If globally installed, run:
  ```bash
  npm link
  pinemcp setup
  ```

## General tips

- Check your Node.js version: node -v (must be >= 18)
- Ensure npm global bin is on PATH:
  - PowerShell: npm config get prefix then add <prefix>\ to PATH
- Restart your terminal after install.

If issues persist, please open an issue with your OS, Node.js version, npm version, and error logs.

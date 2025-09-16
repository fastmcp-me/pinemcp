# Contributing to PineMCP

Thank you for your interest in contributing! This guide explains our expectations and the quickest path to getting your changes merged.

## Code of Conduct
By participating, you agree to uphold a respectful, inclusive environment.

## Getting Started
1. Fork the repo and create a feature branch from `main`.
2. Ensure Node.js >= 18 is installed.
3. Install dependencies:
   ```bash
   npm ci
   ```
4. Build and run tests:
   ```bash
   npm run build
   npm test
   ```

## Development Workflow
- Type-check and lint before committing:
  ```bash
  npm run type-check
  npm run lint
  ```
- Prefer small, focused PRs with clear descriptions and rationale.
- Add tests for new features and bug fixes when practical.

## Commit Messages
- Use clear, descriptive messages.
- Reference issues where relevant, e.g. `fix: handle SQLite :memory: (#123)`.

## Pull Requests
- Ensure CI passes (build, lint, tests).
- Update documentation where user-facing changes occur:
  - `README.md`
  - `docs/installation.md`
  - `docs/tools-reference.md`
  - `docs/troubleshooting.md`

## Project Structure
- CLI: `src/index.ts`
- Configuration: `src/core/configuration.ts`
- MCP Server: `src/services/mcp-server-service.ts`
- Adapters: `src/adapters/*`
- Services: `src/services/*`
- Types: `src/types/*`

## Code Style
- TypeScript strict mode is enabled; avoid `any`.
- Prefer early returns and shallow nesting.
- Keep functions small and intention-revealing.

## Testing
- Jest is configured. Add tests under `src/__tests__/`.
- Run `npm test` locally; ensure coverage is reasonable for new code.

## Releasing
- Maintainers will handle versioning and publishing to npm.

Thanks for helping improve PineMCP!

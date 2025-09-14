# Contributing to PineMCP

Thank you for your interest in contributing to PineMCP! This document provides guidelines and information for contributors.

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/Zyleree/PineMCP.git
   cd pinemcp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Run tests**
   ```bash
   npm test
   ```

## Development Workflow

### Code Style

- Use TypeScript for all new code
- Follow the existing code style and patterns
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### Testing

- Write tests for new features
- Ensure all tests pass before submitting PR
- Aim for good test coverage

### Linting and Formatting

- Run `npm run lint` to check for linting issues
- Run `npm run format` to format code
- Fix any linting errors before submitting

### Commit Messages

Use conventional commits format:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for test changes
- `chore:` for maintenance tasks

Examples:
```
feat: add Redis database support
fix: resolve connection timeout issue
docs: update installation guide
```

## Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write code following the style guidelines
   - Add tests for new functionality
   - Update documentation if needed

3. **Test your changes**
   ```bash
   npm run build
   npm test
   npm run lint
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Provide a clear description of your changes
   - Reference any related issues
   - Ensure CI passes

## Issue Reporting

When reporting issues, please include:

- **Description**: Clear description of the issue
- **Steps to reproduce**: Detailed steps to reproduce the problem
- **Expected behavior**: What you expected to happen
- **Actual behavior**: What actually happened
- **Environment**: OS, Node.js version, PineMCP version
- **Logs**: Any relevant error messages or logs

## Feature Requests

For feature requests, please:

- Check existing issues first
- Provide a clear description of the proposed feature
- Explain the use case and benefits
- Consider implementation complexity

## Database Adapters

When adding support for new database types:

1. Create a new adapter in `src/adapters/`
2. Extend `BaseDatabaseAdapter`
3. Implement all required methods
4. Add database type to `DatabaseType` enum
5. Update `DatabaseAdapterFactory`
6. Add tests for the new adapter
7. Update documentation

## Documentation

- Keep README.md up to date
- Add examples for new features
- Update API documentation
- Include installation instructions

## Release Process

Releases are handled automatically via GitHub Actions:

1. Create a new tag: `git tag v1.0.1`
2. Push the tag: `git push origin v1.0.1`
3. GitHub Actions will automatically publish to npm

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Follow the golden rule

## Questions?

- Open an issue for questions
- Join discussions in GitHub Discussions
- Check existing documentation first

Thank you for contributing to PineMCP! 🚀

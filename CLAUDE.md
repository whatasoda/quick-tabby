# QuickTabby - Claude Code Guidelines

## Project Overview

QuickTabby is a Chrome extension (MV3) for managing tabs with MRU (Most Recently Used) tracking.

**Tech Stack:**
- Solid.js + TypeScript
- PandaCSS (CSS-in-JS)
- Vite + CRXJS (Chrome extension bundler)
- Vitest (testing)
- Biome (linting/formatting)

## Quick Commands

```bash
bun install          # Install dependencies
bun run dev          # Start development server
bun run build        # Build for production
bun run test         # Run tests
bun run test:watch   # Run tests in watch mode
bun run typecheck    # Type check
bun run lint         # Lint code
bun run format       # Format code
bun run check        # Run all checks (lint + format)
bun run check:fix    # Fix all auto-fixable issues
```

## Architecture

### Module Separation Philosophy

The codebase follows a strict layered architecture:

```
src/
├── core/           # Pure functions, no side effects
├── infrastructure/ # Chrome API abstraction, IndexedDB
├── services/       # Business logic with DI pattern
├── popup/          # Popup UI (Solid.js components)
├── options/        # Options page UI
├── background/     # Service worker
└── shared/         # Shared types and utilities
```

#### Layer Responsibilities

1. **core/** - Pure domain logic
   - No external dependencies (no Chrome APIs, no DOM)
   - Easily testable with simple unit tests
   - Examples: settings migration, keybinding matching, MRU operations

2. **infrastructure/** - External system abstraction
   - Chrome API wrappers with type-safe interfaces
   - IndexedDB operations
   - Test doubles for unit testing

3. **services/** - Application services
   - Dependency injection pattern
   - Compose core logic with infrastructure
   - Single responsibility per service

4. **popup/, options/** - UI layers
   - Solid.js components with hooks
   - Use services through background connection
   - Presentational and container component separation

## Development Guidelines

### Think and Write in English

Always think and write code, comments, and documentation in English. This ensures consistency and makes the codebase accessible to all contributors.

### Quality Checks

After completing medium to large work, run quality checks:

```bash
bun run typecheck    # Check TypeScript types
bun run lint         # Check linting rules
bun run format:check # Check formatting
bun run test         # Run tests
bun run build        # Verify build succeeds
```

For quick validation during development:
```bash
bun run check        # Combined lint + format check
```

## Git Workflow

### Branch Creation

When starting new work:
- Create a new branch from `main` or from a detached HEAD
- Use descriptive branch names: `feat/feature-name`, `fix/bug-name`, `chore/task-name`

### Commit Planning

Plans should include commit planning with:
- Clear commit boundaries
- Conventional commit messages
- Atomic commits (one logical change per commit)

### Conventional Commits

Use conventional commit prefixes:
- `feat:` - New features
- `fix:` - Bug fixes
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `docs:` - Documentation changes
- `chore:` - Build, tooling, dependencies
- `ci:` - CI/CD changes

Examples:
```
feat: add dark mode toggle to settings
fix: resolve tab switching delay on slow networks
refactor: extract keybinding logic to core module
test: add unit tests for MRU operations
chore: update dependencies
```

## Testing

### Test Organization

Tests are co-located with their source files:
```
src/core/mru/
├── mru-operations.ts
├── mru-operations.test.ts
├── mru-state.ts
└── index.ts
```

### Test Doubles

Use the test doubles from `src/infrastructure/test-doubles/`:
- `chrome-api.mock.ts` - Mock Chrome APIs
- `indexed-db.mock.ts` - Mock IndexedDB storage

### Writing Tests

```typescript
import { describe, expect, test, beforeEach } from "vitest";
import { createMockStorage } from "../infrastructure/test-doubles/chrome-api.mock.ts";

describe("FeatureName", () => {
  let mockDeps: Dependencies;

  beforeEach(() => {
    mockDeps = createMockDependencies();
  });

  test("should do something", () => {
    // Arrange
    const input = ...;

    // Act
    const result = doSomething(input);

    // Assert
    expect(result).toBe(expected);
  });
});
```

## File Naming Conventions

- Components: `PascalCase.tsx`
- Hooks: `use-kebab-case.ts` or `useKebabCase.ts`
- Services: `kebab-case.service.ts`
- Types: `kebab-case-types.ts` or in same file
- Tests: `*.test.ts`

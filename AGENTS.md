# Agent Instructions for Svelte MiniApps

## Build/Lint/Test Commands

- **Build**: `bun run build` or `vite build`
- **Lint**: `npm run lint` (prettier + eslint) - Note: May fail on AI-generated files in `ai-generated/` folder
- **Typecheck**: `bun check` (preferred over `npx tsc`) - Run this instead of lint for code validation
- **Test Suite**: `npm run test` (unit + e2e)
- **Unit Tests**: `npm run test:unit` or `vitest run`
- **Single Unit Test**: `vitest run <test-file>`
- **E2E Tests**: `npm run test:e2e` or `playwright test`
- **Single E2E Test**: `playwright test <test-file>`
- **Watch Tests**: `npm run test:watch` or `vitest`

## Code Style Guidelines

### Formatting (Prettier)

- Use tabs (not spaces)
- Single quotes
- No trailing commas
- Print width: 100 characters
- Plugins: prettier-plugin-svelte, prettier-plugin-tailwindcss

### Linting (ESLint)

- TypeScript ESLint + Svelte plugin
- Prettier integration
- Ignores: build/, .svelte-kit/, dist/

### TypeScript

- Strict mode enabled
- ESNext modules with bundler resolution
- Path aliases: `$lib` → `/src/lib`, `@` → `/src`

### Svelte 5 Syntax (REQUIRED)

- **State**: `let count = $state(0)` (not legacy `$:`)
- **Props**: `let { title } = $props()`
- **Derived**: `let doubled = $derived(count * 2)`
- **Effects**: `$effect()` only for side effects (logging, DOM, external APIs)
- **Events**: `onclick={handler}` (not `on:click`)

### Naming & Organization

- Components: PascalCase
- Files: kebab-case
- Functions/variables: camelCase
- Types: PascalCase
- Pages: `src/routes/`
- Components: `src/lib/components/`
- Utilities: `src/lib/utility/`
- Server code: `src/lib/server/`
- Types: `src/types/`

### Imports & Error Handling

- Use path aliases (`$lib/`, `@/`)
- Prefer async/await over promises
- Use try/catch for error handling
- Export types from `.svelte` files for TypeScript

### Database & Deployment

- **DB Studio**: `npm run db:studio`
- **DB Push**: `npm run db:push`
- **DB Migrate**: `npm run db:migrate`
- **Dev Server**: `bun run dev` (port 5178)
- **Preview**: `vite preview`

## Copilot Instructions Integration

Follow all Svelte 5 rules from `.github/copilot-instructions.md`:

- Modern reactive syntax only
- Prefer `$derived()` over `$effect()` for computations
- Use callback props over event dispatchers
- Place AI-generated docs in `ai-generated/` folder

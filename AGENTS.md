# Agent Instructions for Svelte MiniApps

A modern Svelte 5 PWA with multiple single-purpose mini-apps, built on SvelteKit with TypeScript, Tailwind CSS, and Prisma.

## Build / Lint / Test Commands

### Development

- **Install**: `bun install`
- **Dev**: `bun run dev` (port 5178)
- **Dev with Service Worker**: `bun run dev:with-sw`
- **Typecheck**: `bun check` (preferred over `npx tsc`) — run this instead of lint for code validation

### Testing & Quality

- **Test Suite**: `npm run test` (unit)
- **Unit Tests**: `npm run test:unit` or `vitest run`
- **Single Unit Test**: `vitest run <test-file>`
- **Watch Tests**: `npm run test:watch` or `vitest`
- **Format check**: `npm run format:check` (Prettier)
- **Format**: `npm run format`

### Build & Deploy

- **Build**: `bun run build` or `vite build`
- **Preview**: `vite preview`

### Database

- **Studio**: `npm run db:studio`
- **Push**: `npm run db:push`
- **Migrate**: `npm run db:migrate`

## Project Overview

This is a collection of productivity mini-apps including:

- Budget Tracker, Currency Converter, Todo List
- Markdown Editor, QR Code Generator, Password Generator
- Text Summarizer, Dictionary App, Unit Converter
- GitHub Contribution Tracker, Advanced Emoji Tools

## Project Structure

```
src/
├── routes/                     # Pages & API endpoints
│   ├── apps/(app)/            # Individual mini-apps
│   ├── (auth)/                # Authentication pages
│   ├── api/                   # API endpoints
│   └── +layout.svelte         # Root layout
├── lib/
│   ├── components/
│   │   ├── ui/                # shadcn-svelte components
│   │   └── blocks/            # Layout components (Navbar, Footer)
│   ├── server/                # Server-side utilities
│   ├── utility/               # Client utilities
│   └── stores/                # Svelte stores
├── types/                     # TypeScript definitions
└── app.css                    # Global styles
prisma/                        # Database schema & migrations
static/                        # Static assets & PWA files
```

## Technology Stack

- **Framework**: SvelteKit (Svelte 5)
- **Runtime**: Bun (package manager & runtime)
- **Styling**: Tailwind CSS + shadcn-svelte components
- **Database**: Prisma ORM with PostgreSQL
- **Testing**: Vitest (unit)
- **PWA**: Service Worker with Vite PWA plugin
- **Formatting**: Prettier (no ESLint)

## Svelte 5 Rules (Required)

### Modern Svelte 5 Syntax

**Reactive Variables:**

```svelte
// ✅ Use $state() for reactive variables
let count = $state(0);
let user = $state({ name: '', email: '' });

// ❌ Don't use legacy reactive statements
// $: count = 0;
```

**Component Props:**

```svelte
// ✅ Use $props() to destructure component props
let { title, description, children } = $props();

// ✅ With types
interface Props {
  title: string;
  description?: string;
  children?: Snippet;
}
let { title, description, children }: Props = $props();
```

**Computed Values:**

```svelte
// ✅ Use $derived() for computed values
let doubled = $derived(count * 2);
let fullName = $derived(`${firstName} ${lastName}`);

// ✅ Use $derived.by() for complex computations
let expensiveCalculation = $derived.by(() => {
  // Complex logic here
  return items.filter(i => i.active).reduce((sum, i) => sum + i.value, 0);
});

// ❌ Don't use legacy reactive statements
// $: doubled = count * 2;
```

**Side Effects (Use Sparingly!):**

```svelte
// ⚠️ IMPORTANT: Prefer $derived() over $effect() whenever possible
// Only use $effect() for TRUE side effects (not for computing values)

// ✅ Use $effect() ONLY for side effects like logging, analytics, DOM manipulation
$effect(() => {
  console.log('Count changed:', count);
  // Or: trackAnalytics(count);
  // Or: updateExternalDOM(element, count);
});

// ✅ With cleanup for subscriptions, timers, listeners
$effect(() => {
  const interval = setInterval(() => {
    count++;
  }, 1000);

  return () => clearInterval(interval);
});

// ❌ NEVER assign to reactive state inside $effect() without guards
// This creates infinite loops!
$effect(() => {
  derived = count * 2; // ❌ WRONG - use $derived() instead
});
```

**Reactive State Priority:**

1. **First choice**: `$state()` for mutable values
2. **Second choice**: `$derived()` or `$derived.by()` for computed values
3. **Last resort**: `$effect()` only for true side effects (logging, DOM, external APIs)

**Event Handling:**

```svelte
<!-- ✅ Use onclick={handler} for events -->
<button onclick={() => count++}>Click me</button>
<button onclick={handleClick}>Click me</button>

<!-- ❌ Don't use deprecated on:event syntax -->
<!-- <button on:click={handleClick}>Click me</button> -->
```

**Component Initialization:**

```svelte
// ✅ Use mount() for component initialization
import { mount } from 'svelte';

mount(() => {
  // Component mounted
});
```

### Deprecated Patterns to Avoid

- ❌ Legacy `$:` reactive statements → Use `$state()`, `$derived()`, `$effect()`
- ❌ `on:click="string"` or `on:event` directive syntax → Use `onclick={fn}`
- ❌ `createEventDispatcher()` → Prefer callback props
- ❌ `SvelteComponentTyped` → Use `Component` types instead

## Svelte Development Tools

### Svelte MCP for Documentation

- When you need to look up Svelte or SvelteKit documentation, use the Svelte MCP tools.
- Use `list_sections` to see all available documentation sections.
- Use `get_documentation` with the section name to get the full documentation.

### Svelte Autofixer

- After making any changes to Svelte files, you must run the `svelte_autofixer` tool.
- This tool will check for errors and provide suggestions for fixing them.
- Apply the suggestions to ensure the code is correct and follows best practices.

## Code Style Guidelines

### Formatting (Prettier)

Prettier is the only formatter/linter in this repo — there is no ESLint.

- Use tabs (not spaces)
- Single quotes
- No trailing commas
- Print width: 100 characters
- Plugins: prettier-plugin-svelte, prettier-plugin-tailwindcss
- Ignores: build/, .svelte-kit/, dist/

### TypeScript

- Strict mode enabled
- ESNext modules with bundler resolution
- Path aliases:
  - `#lib/*` → `src/lib/*` (subpath imports declared in `package.json`)
  - `@/*` → `src/lib/components/*`

### Naming & Organization

- Components: PascalCase
- Files: kebab-case
- Functions/variables: camelCase
- Types: PascalCase

### Imports & Error Handling

- Use path aliases (`#lib/`, `@/`)
- Prefer async/await over promises
- Use try/catch for error handling
- Export types from `.svelte` files for TypeScript

## Critical Gotchas & Best Practices

### Port Configuration

- **Development port**: 5178 (not 5173)
- Service worker auto-generates hash (don't edit manually)

### Event Handling

```svelte
<!-- ✅ Correct: Modern Svelte 5 syntax -->
<button onclick={handleClick}>Click me</button>
<button onclick={() => doSomething()}>Click me</button>

<!-- ❌ Wrong: Deprecated directive syntax -->
<button on:click={handleClick}>Click me</button>
```

### Layout Components

```svelte
<!-- ✅ Correct: Use $props() in layouts -->
<script lang="ts">
	let { children } = $props();
</script>

{@render children()}
```

### Styling Patterns

- Use `size-[number]` instead of separate `h-[number]` and `w-[number]`
- Prefer Tailwind classes over custom CSS when possible
- Use CSS custom properties for theme colors (already configured)

### Type Safety

- Ensure `.svelte` files export types referenced in `index.ts`
- Use TypeScript interfaces for component props
- Leverage SvelteKit's generated types (`$types`)

### File Organization

- Pages: `src/routes/`
- Components: `src/lib/components/`
- Utilities: `src/lib/utility/`
- Server code: `src/lib/server/`
- Types: `src/types/`
- **AI-generated documentation**: Always place AI-generated markdown files (technical docs, implementation guides, fix explanations) in the `ai-generated/` folder at project root, NOT in feature folders
- **AI-generated code**: AI-generated JavaScript/TypeScript code may be placed in `src/lib/assets/ai-digest/` but may cause linting errors — these files are for reference only

## Remote Functions Pattern

**Query/Command Pattern for Server Communication:**

```typescript
// src/lib/remote/example.remote.ts
import { query, command } from '$app/server';
import { prisma } from '#lib/server/db.js';
import * as v from 'valibot';

// Query for reading data
export const getData = query(async () => {
	return await prisma.example.findMany();
});

// Command for mutations with validation
export const saveData = command(
	v.object({
		name: v.pipe(v.string(), v.nonEmpty()),
		value: v.number()
	}),
	async (data) => {
		const result = await prisma.example.create({ data });
		await getData().refresh(); // Refresh queries
		return result;
	}
);
```

**Key Patterns:**

- Use `query()` for read operations
- Use `command()` with Valibot validation for mutations
- Call `.refresh()` after mutations to update cached queries
- Import from `#lib/remote/index.js` for centralized exports

## App Architecture Patterns

**Mini-App Structure:**

```
src/routes/apps/(app)/[app-name]/
├── +page.svelte          # Main app component
├── +page.server.ts       # Server-side data loading (optional)
├── how-to-use-config.ts  # Help documentation (optional)
└── [Component].svelte    # App-specific components
```

**Consistent Layout Integration:**

- Apps use shared `+layout.svelte` in the `(app)` route group
- Breadcrumb navigation with GitHub source links
- App tracker for usage analytics
- Keyboard shortcuts (Alt+D for app menu)

## Database Schema Patterns

**User-Centric Models:**

- All app data linked to authenticated users
- Complex relationships (User → Sessions, Passwords, Budgets, etc.)
- Soft deletes and audit trails with `createdAt`/`updatedAt`
- PostgreSQL with Prisma ORM

**Migration Workflow:**

1. Update `schema.prisma`
2. Run `npm run db:migrate` (creates migration files)
3. Run `npm run db:push` (applies to dev database)

## External API Integration

**API Client Patterns:**

- GitHub API for contribution data
- Currency exchange APIs
- Dictionary APIs with error handling
- Web Speech API for audio features

**Error Handling:**

- Try/catch blocks with user-friendly toast messages
- Loading states with skeleton components
- Graceful degradation for offline functionality

## Testing Strategy

**Unit Tests (Vitest):**

- Component logic and utilities
- Custom hooks and stores
- API client functions

**Test File Organization:**

Tests are colocated with the code they cover:

```
src/**/*.test.ts          # Vitest unit tests
```

## Build & Deployment

**Custom Build Process:**

- Service worker hash generation
- Changelog generation from commits
- Enhanced image optimization
- Partytown for third-party scripts

**Environment Setup:**

- PostgreSQL database required
- Environment variables in `.env`
- Prisma client generation
- PWA manifest and icons

## AI Development Guidelines

**Content Organization:**

- Technical documentation → `ai-generated/` folder
- Generated code → `src/lib/assets/ai-digest/` (reference only)
- Implementation guides → `ai-generated/` with descriptive names
- Fix explanations → `ai-generated/` with timestamps

**Code Generation Rules:**

- Always use Svelte 5 runes syntax
- Follow existing component patterns
- Use proper TypeScript types
- Include error handling and loading states
- Test generated code before committing
- **ALWAYS update the `done()` function in `src/lib/index.svelte.ts` with the current date whenever an app is updated or a new one is created.**

**Documentation Standards:**

- Include code examples from the codebase
- Reference specific file paths
- Document integration points
- Explain architectural decisions

## Development Workflow

### Adding a New Mini-App

1. Create a folder in `src/routes/apps/(app)/[app-name]/`
2. Add `+page.svelte` with the app interface
3. Add `+page.server.ts` if server-side logic is needed
4. Update the app listing in the appropriate places

### Database Changes

1. Modify `prisma/schema.prisma`
2. Run `npm run db:migrate` to create a migration
3. Run `npm run db:push` for development changes

### Service Worker Updates

- Hash auto-generates on build/dev
- Don't manually edit `static/service-worker-hash.json`
- Use `bun run dev:with-sw` for SW development

## Memory & Tools Integration

- **NEVER run `bun dev`** — the dev server is always running or the user will start it themselves
- **ALWAYS run `bun check`** after making changes to verify TypeScript errors are fixed (preferred over lint)
- Prefer `bun check` over `npx tsc` for TypeScript checking

## Common Issues & Solutions

### Build Errors

- Check imports use proper aliases (`@/` for components, `#lib/` for the lib root)
- Ensure all dependencies are installed with `bun install`
- Verify TypeScript types are properly exported

### Styling Issues

- Use Tailwind's design system consistently
- Check dark mode implementation with `mode-watcher`
- Ensure responsive design with container queries

### Performance

- Lazy load heavy components with `await import()`
- Use Svelte's built-in optimization features
- Minimize bundle size with proper tree shaking

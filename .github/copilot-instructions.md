# Svelte MiniApps Instructions

A modern Svelte 5 PWA featuring multiple single-purpose mini-apps built on SvelteKit with TypeScript, Tailwind CSS, and Prisma.

## Project Overview

This is a collection of productivity mini-apps including:

- Budget Tracker, Currency Converter, Todo List
- Markdown Editor, QR Code Generator, Password Generator
- Text Summarizer, Dictionary App, Unit Converter
- GitHub Contribution Tracker, Advanced Emoji Tools

## Quick Start Commands

### Development

- **Install**: `bun install`
- **Dev**: `bun run dev` (port 5178)
- **Dev with Service Worker**: `bun run dev:with-sw`
- **Typecheck**: `bun check` (preferred over `npx tsc`)

### Testing & Quality

- **Tests**: `npm run test` (unit + e2e)
- **Unit Tests**: `npm run test:unit`
- **E2E Tests**: `npm run test:e2e`
- **Watch Tests**: `npm run test:watch`
- **Lint**: `npm run lint`
- **Format**: `npm run format`

### Build & Deploy

- **Build**: `bun run build`
- **Preview**: `vite preview`

### Database

- **Studio**: `npm run db:studio`
- **Push**: `npm run db:push`
- **Migrate**: `npm run db:migrate`

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

## Technology Stack

- **Framework**: SvelteKit (Svelte 5)
- **Runtime**: Bun (package manager & runtime)
- **Styling**: Tailwind CSS + shadcn-svelte components
- **Database**: Prisma ORM with SQLite
- **Testing**: Vitest (unit) + Playwright (e2e)
- **PWA**: Service Worker with Vite PWA plugin
- **Linting**: ESLint + Prettier

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

## Development Workflow

### Adding a New Mini-App

1. Create folder in `src/routes/apps/(app)/[app-name]/`
2. Add `+page.svelte` with the app interface
3. Add `+page.server.ts` if server-side logic needed
4. Update app listing in appropriate places
5. Add tests in `e2e/` and unit tests as needed

### Database Changes

1. Modify `prisma/schema.prisma`
2. Run `npm run db:migrate` to create migration
3. Run `npm run db:push` for development changes

### Service Worker Updates

- Hash auto-generates on build/dev
- Don't manually edit `static/service-worker-hash.json`
- Use `bun run dev:with-sw` for SW development

## Memory & Tools Integration

- Always check `user_preferences` from memory MCP at session start
- Use Context7 for Svelte 5/SvelteKit docs when uncertain about APIs
- **NEVER run `bun dev`** - the dev server is always running or the user will start it themselves
- **ALWAYS run `bun check`** after making changes to verify TypeScript errors are fixed
- Prefer `bun check` over `npx tsc` for TypeScript checking

## Common Issues & Solutions

### Build Errors

- Check imports use proper aliases (`@/` for components)
- Ensure all dependencies are installed with `bun install`
- Verify TypeScript types are properly exported

### Styling Issues

- Use Tailwind's design system consistently
- Check dark mode implementation with `mode-watcher`
- Ensure responsive design with container queries

### Performance

- Lazy load heavy components with `await import()`
- Use Svelte's built-in optimization features
- Minimize bundle size with proper tree-shaking

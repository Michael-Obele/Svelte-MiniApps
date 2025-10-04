# Contributing to Svelte MiniApps

Thank you for your interest in contributing to Svelte MiniApps! This project aims to provide a collection of beautifully crafted tools built with Svelte 5, TypeScript, and TailwindCSS.

## Getting Started

1. Fork the repository
2. Clone your fork:

```bash
git clone https://github.com/your-username/Svelte-MiniApps.git
```

3. Install dependencies:

```bash
npm install
```

4. Create a new branch for your contribution:

```bash
git checkout -b feature/your-feature-name
```

## Development

### Environment Setup

1. Copy `.env.example` to `.env` and fill in required values
2. Make sure you have the following installed:

- Node.js 18+
- npm or bun
- A modern web browser

### Running the Project

```bash
# Development mode
npm run dev

# Build
npm run build

# Preview production build
npm run preview
```

### Project Structure

```
src/
├── lib/            # Shared components and utilities
├── routes/         # SvelteKit routes and pages
├── app.html        # Main HTML template
├── app.css         # Global styles
└── app.d.ts        # TypeScript declarations
```

## Contribution Guidelines

### Code Style

- We use Prettier and ESLint for code formatting
- Run `npm run format` before committing
- Run `npm run lint` to check for issues

### Components

1. Place reusable components in `src/lib/components/`
2. Follow the established component structure:

```svelte
<script lang="ts">
	// Props first
	let { prop = $props() } = $props();

	// State
	let someState = $state();

	// Effects last
	$effect(() => {
		// ...
	});
</script>

<div>
	<!-- Template -->
</div>

<style>
	/* Component styles */
</style>
```

### Commits

- Use conventional commits format:
  - `feat:` New features
  - `fix:` Bug fixes
  - `docs:` Documentation changes
  - `style:` Code style changes
  - `refactor:` Code refactoring
  - `test:` Adding or modifying tests
  - `chore:` Maintenance tasks

### Pull Requests

1. Create pull requests against the `main` branch
2. Include a clear description of changes
3. Reference any related issues
4. Ensure all tests pass
5. Keep PRs focused on a single concern

## Features and Bugs

### Reporting Bugs

1. Use the GitHub issues template
2. Include steps to reproduce
3. Include browser/environment information
4. Add screenshots if relevant

### Requesting Features

1. Check existing issues first
2. Use the feature request template
3. Explain the use case
4. Provide example usage if possible

## Working with Svelte 5

This project uses Svelte 5 with runes. Key things to remember:

- Use `$state()` for reactive state
- Use `$props()` for component props
- Use `$effect()` for side effects
- Use `$derived()` for computed values
- Follow the [Svelte 5 docs](https://svelte.dev/docs/svelte/overview) for best practices

## Help and Support

- Create a discussion on GitHub
- Read the [documentation](/docs)
- Email us at [contrib@svelte-apps.me](mailto:contrib@svelte-apps.me) for contribution-related questions

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License.

# GitHub Contribution Tracker: `set_context_after_init` Error Fix

## Problem Summary

The GitHub Contribution Tracker was throwing the error:

```
Error Loading Data
set_context_after_init `setContext` must be called when a component first initializes,
not in a subsequent effect or after an `await` expression
```

## Root Cause

This error occurred due to a conflict between three factors:

1. **Svelte 5 Experimental Async Mode**: The project has `experimental.async: true` enabled in `svelte.config.js`, which allows `await` expressions in component markup.

2. **Layerchart's Context Usage**: The `Chart` component from the `layerchart` library uses `setContext()` internally to share data with child components (`Bars`, `Axis`, `Tooltip`, etc.).

3. **Await in Component Markup**: The component was using `{@const computed = computeStats(await contributionData)}` which awaits remote function data before rendering.

### Why This Causes an Error

In Svelte 5's experimental async mode, `setContext()` must be called during component initialization, **before** any `await` expressions. When you use `await` in component markup and then render a component that calls `setContext()` (like `Chart`), Svelte throws this error because the context API requires synchronous initialization.

From the Svelte docs:

> "`setContext` must be called when a component first initializes, not in a subsequent effect or after an `await` expression. This restriction only applies when using the `experimental.async` option."

## Solution

Instead of using `await` in the markup, use the **query object's properties** provided by SvelteKit's remote functions:

- `contributionData.loading` - Boolean indicating if data is loading
- `contributionData.error` - Error object if query failed
- `contributionData.current` - Current data value (undefined while loading)

### Changes Made

1. **Added computed stats derived from query**:

```typescript
const computed = $derived.by(() => {
	const data = contributionData.current;
	if (!data) return null;
	return computeStats(data);
});
```

2. **Replaced `<svelte:boundary>` with conditional rendering**:

```svelte
{#if contributionData.loading}
	<!-- Loading skeleton -->
{:else if contributionData.error}
	<!-- Error state -->
{:else if computed}
	<!-- Main content with Chart components -->
{/if}
```

This ensures that:

- The `Chart` component is only rendered after data is available
- `setContext()` is called during normal component initialization (not after await)
- The component is compatible with Svelte 5's async mode

## Alternative Solutions (Not Implemented)

### Option 1: Disable Async Mode

Remove `experimental.async: true` from `svelte.config.js`. This would allow the old `await` pattern but loses the benefits of async mode.

### Option 2: Wrap Chart in Non-Async Component

Create a wrapper component that doesn't use await, but this adds unnecessary complexity.

## Related Files

- `/src/routes/apps/(app)/github-contribution-tracker/[user]/[year]/+page.svelte` - Fixed component
- `/svelte.config.js` - Contains `experimental.async: true`
- `/src/lib/remote/data.remote.ts` - Remote function definition

## Token Requirements

The original issue was about GitHub API tokens. Make sure to set:

```bash
VITE_GITHUB_TOKEN=your_personal_access_token
```

The token needs these scopes:

- `user` - Read basic user profile information
- `read:user` - Read private user profile information
- `public_repo` - Read public repository information

## Testing

After applying this fix:

1. Ensure `VITE_GITHUB_TOKEN` is set in `.env`
2. Restart the dev server
3. Navigate to `/apps/github-contribution-tracker`
4. Enter a username (e.g., "torvalds") and year
5. The page should load without the `set_context_after_init` error

## References

- [Svelte Runtime Errors - set_context_after_init](https://svelte.dev/docs/svelte/runtime-errors#Client-errors-set_context_after_init)
- [SvelteKit Remote Functions](https://svelte.dev/docs/kit/remote-functions)
- [Svelte 5 Context API](https://svelte.dev/docs/svelte/context)

# SSR and Browser Guards: Best Practices Guide

## Overview

SvelteKit supports Server-Side Rendering (SSR) by default, which means components render on both the server and in the browser. This guide covers how to properly handle browser-only APIs like `localStorage`, `window`, and `document` to prevent SSR errors.

## The Problem

Browser-only APIs don't exist on the server:

```typescript
// ❌ This will crash during SSR
let data = localStorage.getItem('my-data');

// ❌ This will also crash
window.addEventListener('resize', handleResize);

// ❌ And this
document.querySelector('#my-element');
```

**Error:** `ReferenceError: localStorage is not defined`

## The Solution: Browser Guards

SvelteKit provides the `browser` boolean from `$app/environment`:

```typescript
import { browser } from '$app/environment';

// ✅ Safe: only runs in browser
if (browser) {
	const data = localStorage.getItem('my-data');
}
```

## Core Patterns

### 1. Basic Browser Guard

```typescript
import { browser } from '$app/environment';

if (browser) {
	// Browser-only code here
	localStorage.setItem('key', 'value');
}
```

### 2. Guard in Functions

```typescript
import { browser } from '$app/environment';

export function getStoredData(): Data[] {
	if (!browser) return [];
	
	const stored = localStorage.getItem('data');
	return stored ? JSON.parse(stored) : [];
}
```

### 3. Guard in Derived States

```svelte
<script lang="ts">
	import { browser } from '$app/environment';
	
	// ❌ WRONG - will crash during SSR
	let data = $derived(localStorage.getItem('data'));
	
	// ✅ CORRECT - safe for SSR
	let data = $derived(browser ? localStorage.getItem('data') : null);
</script>
```

### 4. Guard in Effects

```svelte
<script lang="ts">
	import { browser } from '$app/environment';
	
	$effect(() => {
		// Guard at the top of the effect
		if (!browser) return;
		
		// Now safe to use browser APIs
		const stored = localStorage.getItem('data');
		// ... rest of effect
	});
</script>
```

### 5. Guard in onMount (Usually Not Needed)

```svelte
<script lang="ts">
	import { onMount } from 'svelte';
	
	onMount(() => {
		// onMount only runs in browser, so guard not needed here
		localStorage.setItem('mounted', 'true');
	});
</script>
```

**Note:** `onMount` only runs in the browser, so you don't need guards inside it.

## PersistedState Pattern

When using `PersistedState` or similar localStorage wrappers:

### ❌ WRONG: Direct Access

```typescript
import { PersistedState } from 'runed';

const myState = new PersistedState('key', []);

// ❌ This crashes during SSR
let data = myState.current;
```

### ✅ CORRECT: Guarded Access

```typescript
import { browser } from '$app/environment';
import { PersistedState } from 'runed';

const myState = new PersistedState('key', []);

// ✅ Safe for SSR
let data = $derived(browser ? myState.current : []);
```

### Helper Functions with Guards

```typescript
import { browser } from '$app/environment';
import { PersistedState } from 'runed';

const sessions = new PersistedState<Session[]>('sessions', []);

// ✅ All getter functions should be guarded
export function getActiveSession(): Session | undefined {
	if (!browser) return undefined;
	return sessions.current.find(s => s.isActive);
}

export function getAllSessions(): Session[] {
	if (!browser) return [];
	return sessions.current;
}

export function getSessionById(id: string): Session | undefined {
	if (!browser) return undefined;
	return sessions.current.find(s => s.id === id);
}
```

## Return Value Guidelines

Choose appropriate return values for SSR:

| Return Type | SSR Value | Example |
|-------------|-----------|---------|
| Single item | `undefined` | `getActiveSession()` |
| Array | `[]` | `getAllSessions()` |
| Object | `null` or `{}` | `getConfig()` |
| Boolean | `false` | `isAuthenticated()` |
| Number | `0` | `getCount()` |
| String | `''` | `getUserName()` |

```typescript
// ✅ Good return values
export function getActiveItem(): Item | undefined {
	if (!browser) return undefined; // ✅ undefined for single items
	return items.current.find(i => i.active);
}

export function getItems(): Item[] {
	if (!browser) return []; // ✅ empty array
	return items.current;
}

export function getConfig(): Config | null {
	if (!browser) return null; // ✅ null for objects
	return config.current;
}
```

## Common Scenarios

### Scenario 1: Component with localStorage

```svelte
<script lang="ts">
	import { browser } from '$app/environment';
	
	let savedTheme = $state('light');
	
	// Load from localStorage
	$effect(() => {
		if (!browser) return;
		
		const stored = localStorage.getItem('theme');
		if (stored) {
			savedTheme = stored;
		}
	});
	
	// Save to localStorage
	function saveTheme(theme: string) {
		if (!browser) return;
		
		savedTheme = theme;
		localStorage.setItem('theme', theme);
	}
</script>
```

### Scenario 2: Window Event Listeners

```svelte
<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount, onDestroy } from 'svelte';
	
	let windowWidth = $state(0);
	
	onMount(() => {
		// onMount only runs in browser, no guard needed
		windowWidth = window.innerWidth;
		
		function handleResize() {
			windowWidth = window.innerWidth;
		}
		
		window.addEventListener('resize', handleResize);
		
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	});
</script>
```

### Scenario 3: Document Queries

```svelte
<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	
	let element = $state<HTMLElement | null>(null);
	
	onMount(() => {
		// Safe: onMount only runs in browser
		element = document.querySelector('#my-element');
	});
	
	function updateElement() {
		// ✅ Guard when called outside onMount
		if (!browser) return;
		
		const el = document.querySelector('#my-element');
		if (el) {
			el.textContent = 'Updated!';
		}
	}
</script>
```

### Scenario 4: Third-Party Browser Libraries

```svelte
<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	
	let chart: any = null;
	
	onMount(async () => {
		// Dynamic import for browser-only libraries
		const ChartJS = await import('chart.js');
		
		chart = new ChartJS.Chart(/* ... */);
		
		return () => {
			chart?.destroy();
		};
	});
</script>
```

### Scenario 5: Initial Data Sync

```svelte
<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	
	let { data } = $props(); // Server data
	
	onMount(() => {
		// Only sync in browser after mount
		if (browser && data?.sessions) {
			const localData = localStorage.getItem('sessions');
			// Merge server and local data
			// ...
		}
	});
</script>
```

## Testing for SSR Issues

### 1. Check Build Output

```bash
npm run build
npm run preview
```

Look for errors mentioning `localStorage`, `window`, `document`, etc.

### 2. Disable JavaScript

Test with JavaScript disabled to see SSR output:
- Chrome DevTools → Settings → Debugger → Disable JavaScript

### 3. Check Console

Look for errors like:
- `ReferenceError: localStorage is not defined`
- `ReferenceError: window is not defined`
- `SyntaxError: "undefined" is not valid JSON`

## Real-World Example: Medication Tracker

### Before (Crashes on SSR)

```typescript
// states.svelte.ts
export function getActiveSession(): TreatmentSession | undefined {
	// ❌ Crashes: accessing .current during SSR
	return treatmentSessions.current.find(s => s.isActive);
}
```

```svelte
<!-- +page.svelte -->
<script lang="ts">
	// ❌ Crashes: derived state accesses persisted state during SSR
	let activeSession = $derived(medState.getActiveSession());
</script>
```

### After (SSR Safe)

```typescript
// states.svelte.ts
import { browser } from '$app/environment';

export function getActiveSession(): TreatmentSession | undefined {
	// ✅ Guard prevents SSR crash
	if (!browser) return undefined;
	return treatmentSessions.current.find(s => s.isActive);
}
```

```svelte
<!-- +page.svelte -->
<script lang="ts">
	import { browser } from '$app/environment';
	
	// ✅ Safe: guard in derived state
	let activeSession = $derived(browser ? medState.getActiveSession() : undefined);
</script>
```

## Common Mistakes

### ❌ Mistake 1: No Guard in Derived State

```typescript
// ❌ WRONG
let data = $derived(localStorage.getItem('data'));
```

### ✅ Fix: Add Browser Guard

```typescript
// ✅ CORRECT
let data = $derived(browser ? localStorage.getItem('data') : null);
```

---

### ❌ Mistake 2: Forgetting to Guard Helper Functions

```typescript
// ❌ WRONG
export function getItems() {
	return items.current; // Crashes during SSR
}
```

### ✅ Fix: Guard at Function Start

```typescript
// ✅ CORRECT
export function getItems() {
	if (!browser) return [];
	return items.current;
}
```

---

### ❌ Mistake 3: Guards in Wrong Place

```typescript
// ❌ WRONG - Guard too late
$effect(() => {
	const data = localStorage.getItem('data'); // Crashes here
	if (browser) {
		// ...
	}
});
```

### ✅ Fix: Guard First

```typescript
// ✅ CORRECT - Guard first
$effect(() => {
	if (!browser) return;
	const data = localStorage.getItem('data'); // Safe
	// ...
});
```

---

### ❌ Mistake 4: Guarding State Declaration

```typescript
// ❌ WRONG - State runs during module load
if (browser) {
	let data = $state([]); // This doesn't work
}
```

### ✅ Fix: Guard the Access, Not Declaration

```typescript
// ✅ CORRECT
let data = $state([]);

$effect(() => {
	if (!browser) return;
	data = localStorage.getItem('data');
});
```

## Performance Considerations

### Guards Have Minimal Cost

```typescript
// Performance impact: ~0.001ms
if (!browser) return [];
```

Guards are simple boolean checks—they don't impact performance.

### Avoid Unnecessary Guards

```typescript
// ❌ Unnecessary: onMount only runs in browser
onMount(() => {
	if (browser) { // Don't need this
		localStorage.setItem('key', 'value');
	}
});

// ✅ Better
onMount(() => {
	localStorage.setItem('key', 'value');
});
```

## When NOT to Use Guards

### 1. Inside onMount

```typescript
onMount(() => {
	// No guard needed - onMount only runs in browser
	window.addEventListener('resize', handler);
});
```

### 2. Inside Event Handlers

```typescript
function handleClick() {
	// No guard needed - user events only happen in browser
	localStorage.setItem('clicked', 'true');
}
```

### 3. Inside Browser-Only Callbacks

```typescript
fetch('/api/data').then(data => {
	// No guard needed - fetch only happens in browser
	localStorage.setItem('data', JSON.stringify(data));
});
```

## TypeScript Integration

### Type-Safe Guards

```typescript
import { browser } from '$app/environment';

function getStoredData(): Data[] | undefined {
	if (!browser) {
		return undefined; // Type matches return
	}
	
	const stored = localStorage.getItem('data');
	return stored ? JSON.parse(stored) : [];
}

// Usage with type narrowing
const data = getStoredData();
if (data) { // TypeScript knows data is Data[] here
	console.log(data.length);
}
```

## Debugging Tips

### 1. Add Console Logs

```typescript
export function getActiveSession() {
	console.log('getActiveSession called, browser:', browser);
	if (!browser) {
		console.log('Returning undefined (SSR)');
		return undefined;
	}
	return sessions.current.find(s => s.isActive);
}
```

### 2. Test SSR Explicitly

```bash
# Build and preview to test SSR
npm run build && npm run preview
```

### 3. Check Browser DevTools

Look for errors in:
- Console tab
- Network tab (check SSR HTML response)
- Application tab (localStorage)

## Checklist

Before deploying code that uses browser APIs:

- [ ] Import `browser` from `$app/environment`
- [ ] Guard all `localStorage` access
- [ ] Guard all `window` access
- [ ] Guard all `document` access
- [ ] Guard all PersistedState `.current` access
- [ ] Guard helper functions that access persisted state
- [ ] Add guards to derived states that use browser APIs
- [ ] Add guards to effects that use browser APIs
- [ ] Test with `npm run build && npm run preview`
- [ ] Check console for SSR errors
- [ ] Return appropriate default values from guards

## References

- [SvelteKit Docs: $app/environment](https://kit.svelte.dev/docs/modules#$app-environment)
- [Medication Tracker SSR Fix](../medication-tracker-ssr-fix.md)
- [PersistedState Migration](../medication-tracker-persistedstate-revert.md)

## Summary

**Golden Rules:**
1. Always import `browser` from `$app/environment`
2. Guard before accessing browser-only APIs
3. Return safe default values ([], undefined, null)
4. Guards at the start of functions/effects
5. Don't guard inside `onMount` (unnecessary)
6. Test with build + preview

**Quick Reference:**
```typescript
import { browser } from '$app/environment';

// ✅ Functions
if (!browser) return defaultValue;

// ✅ Derived
$derived(browser ? browserValue : defaultValue)

// ✅ Effects
$effect(() => {
	if (!browser) return;
	// ...
});
```

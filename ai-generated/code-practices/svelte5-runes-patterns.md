# Svelte 5 Runes and Reactivity Patterns

## Overview

Svelte 5 introduces **runes** - a new reactive system replacing legacy reactive statements (`$:`). This guide covers modern Svelte 5 patterns used throughout the Svelte-MiniApps project.

## Core Runes

### `$state()` - Reactive Variables

Creates a reactive state variable that triggers updates when changed.

#### Basic Usage

```svelte
<script lang="ts">
	// ✅ Svelte 5: Use $state()
	let count = $state(0);
	let user = $state({ name: 'John', age: 30 });
	
	// ❌ Svelte 4: Legacy reactive statements (DON'T USE)
	// $: count = 0;
</script>

<button onclick={() => count++}>
	Count: {count}
</button>
```

#### Arrays and Objects

```svelte
<script lang="ts">
	let items = $state<string[]>([]);
	let config = $state({ theme: 'dark', fontSize: 16 });
	
	function addItem(item: string) {
		items.push(item); // ✅ Direct mutation works
		items = items; // Not needed with $state
	}
	
	function updateTheme() {
		config.theme = 'light'; // ✅ Direct property mutation works
	}
</script>
```

#### Initial Values

```svelte
<script lang="ts">
	// ✅ Simple initial value
	let count = $state(0);
	
	// ✅ Computed initial value
	let timestamp = $state(Date.now());
	
	// ✅ From props or external data
	let { initialValue } = $props();
	let data = $state(initialValue || []);
	
	// ❌ WRONG: Don't use derived values directly
	// let count = $state(activeSession?.count || 0); // Warning!
	// Use $effect to sync instead
</script>
```

### `$derived()` - Computed Values

Creates a reactive value computed from other state.

#### Basic Usage

```svelte
<script lang="ts">
	let count = $state(0);
	
	// ✅ Svelte 5: Use $derived()
	let doubled = $derived(count * 2);
	let isEven = $derived(count % 2 === 0);
	
	// ❌ Svelte 4: Legacy (DON'T USE)
	// $: doubled = count * 2;
</script>

<p>Count: {count}</p>
<p>Doubled: {doubled}</p>
<p>Even: {isEven}</p>
```

#### Complex Derivations

```svelte
<script lang="ts">
	let items = $state<Item[]>([]);
	let filter = $state('all');
	
	// ✅ Simple derived
	let itemCount = $derived(items.length);
	
	// ✅ Filtered derived
	let filteredItems = $derived(
		items.filter(item => {
			if (filter === 'active') return item.active;
			if (filter === 'done') return !item.active;
			return true;
		})
	);
	
	// ✅ Multiple dependencies
	let summary = $derived(`${filteredItems.length} of ${items.length} items`);
</script>
```

#### `$derived.by()` - Complex Computations

For expensive or multi-line computations:

```svelte
<script lang="ts">
	let sessions = $state<Session[]>([]);
	let logs = $state<Log[]>([]);
	
	// ✅ Use $derived.by() for complex logic
	let stats = $derived.by(() => {
		const activeSession = sessions.find(s => s.isActive);
		if (!activeSession) return null;
		
		const sessionLogs = logs.filter(l => l.sessionId === activeSession.id);
		const taken = sessionLogs.filter(l => l.status === 'taken').length;
		const total = sessionLogs.length;
		
		return {
			taken,
			total,
			adherence: total > 0 ? (taken / total) * 100 : 0
		};
	});
	
	// ❌ Don't use $derived() for multi-line (won't work)
	// let stats = $derived(/* multiple lines */);
</script>
```

### `$effect()` - Side Effects

Runs code when dependencies change. **Use sparingly!**

#### When to Use `$effect()`

✅ **ONLY use for TRUE side effects:**
- Logging / analytics
- DOM manipulation (rarely needed)
- External API calls
- Subscriptions
- localStorage writes

❌ **DON'T use for computing values:**
- Use `$derived()` instead!

#### Basic Usage

```svelte
<script lang="ts">
	let count = $state(0);
	
	// ✅ CORRECT: Side effect (logging)
	$effect(() => {
		console.log('Count changed:', count);
		// Or: trackAnalytics('count_change', count);
	});
	
	// ❌ WRONG: Computing value (use $derived instead!)
	let doubled = $state(0);
	$effect(() => {
		doubled = count * 2; // DON'T DO THIS - creates issues
	});
	
	// ✅ CORRECT: Use $derived for computed values
	let doubled = $derived(count * 2);
</script>
```

#### With Cleanup

```svelte
<script lang="ts">
	let isActive = $state(false);
	
	$effect(() => {
		if (!isActive) return;
		
		// Setup
		const interval = setInterval(() => {
			console.log('Tick');
		}, 1000);
		
		// Cleanup function
		return () => {
			clearInterval(interval);
		};
	});
</script>
```

#### Browser Guards in Effects

```svelte
<script lang="ts">
	import { browser } from '$app/environment';
	
	$effect(() => {
		// ✅ Always guard browser APIs in effects
		if (!browser) return;
		
		localStorage.setItem('data', JSON.stringify(data));
	});
</script>
```

#### Effect Dependencies

```svelte
<script lang="ts">
	let count = $state(0);
	let name = $state('John');
	
	// ✅ Effect runs when count changes
	$effect(() => {
		console.log('Count:', count);
		// name is not accessed, so changes to name won't trigger this
	});
	
	// ✅ Effect runs when either changes
	$effect(() => {
		console.log('Count:', count, 'Name:', name);
		// Both are dependencies
	});
	
	// ✅ Effect runs once (no dependencies)
	$effect(() => {
		console.log('Component initialized');
		// No reactive state accessed
	});
</script>
```

### `$props()` - Component Props

Receives props from parent components.

#### Basic Usage

```svelte
<script lang="ts">
	// ✅ Svelte 5: Use $props()
	let { title, description, count } = $props();
	
	// ❌ Svelte 4: export let (DON'T USE)
	// export let title: string;
</script>

<h1>{title}</h1>
<p>{description}</p>
<p>Count: {count}</p>
```

#### With TypeScript

```svelte
<script lang="ts">
	interface Props {
		title: string;
		description?: string;
		count: number;
		onUpdate?: (value: number) => void;
	}
	
	let { title, description = 'No description', count, onUpdate }: Props = $props();
</script>
```

#### Bindable Props

```svelte
<script lang="ts">
	// ✅ Make props bindable with $bindable()
	let { open = $bindable(false) } = $props();
	
	function close() {
		open = false; // Updates parent's bound value
	}
</script>

<!-- Parent usage -->
<!-- <Modal bind:open={showModal} /> -->
```

#### Children (Snippets)

```svelte
<script lang="ts">
	import type { Snippet } from 'svelte';
	
	interface Props {
		title: string;
		children: Snippet;
	}
	
	let { title, children }: Props = $props();
</script>

<div class="container">
	<h2>{title}</h2>
	{@render children()}
</div>
```

## Event Handling

### Modern Event Syntax

```svelte
<script lang="ts">
	let count = $state(0);
	
	function handleClick() {
		count++;
	}
	
	function handleClickWithEvent(event: MouseEvent) {
		console.log('Clicked at', event.clientX, event.clientY);
		count++;
	}
</script>

<!-- ✅ Svelte 5: Use onclick={handler} -->
<button onclick={handleClick}>Click me</button>
<button onclick={() => count++}>Inline increment</button>
<button onclick={handleClickWithEvent}>With event</button>

<!-- ❌ Svelte 4: on:click (DEPRECATED) -->
<!-- <button on:click={handleClick}>Click me</button> -->
```

### All Event Types

```svelte
<script lang="ts">
	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		console.log(target.value);
	}
</script>

<!-- Keyboard events -->
<input onkeydown={(e) => console.log(e.key)} />
<input onkeyup={(e) => console.log(e.key)} />

<!-- Mouse events -->
<div onclick={handler}></div>
<div onmouseenter={handler}></div>
<div onmouseleave={handler}></div>

<!-- Form events -->
<input oninput={handleInput} />
<input onchange={handler} />
<form onsubmit={handler}></form>

<!-- Focus events -->
<input onfocus={handler} />
<input onblur={handler} />
```

### Event Modifiers (NOT Available in Svelte 5)

```svelte
<!-- ❌ Svelte 4: Event modifiers (DON'T USE) -->
<!-- <button on:click|preventDefault={handler}>Click</button> -->

<!-- ✅ Svelte 5: Handle manually -->
<button onclick={(e) => {
	e.preventDefault();
	handler();
}}>
	Click
</button>
```

## Component Lifecycle

### `onMount()`

```svelte
<script lang="ts">
	import { onMount } from 'svelte';
	
	onMount(() => {
		// Runs after component mounts (browser only)
		console.log('Component mounted');
		
		// Optional cleanup
		return () => {
			console.log('Component unmounted');
		};
	});
</script>
```

### `onDestroy()`

```svelte
<script lang="ts">
	import { onDestroy } from 'svelte';
	
	const interval = setInterval(() => {
		console.log('Tick');
	}, 1000);
	
	onDestroy(() => {
		clearInterval(interval);
	});
</script>
```

### `tick()`

```svelte
<script lang="ts">
	import { tick } from 'svelte';
	
	let count = $state(0);
	
	async function incrementAndLog() {
		count++;
		await tick(); // Wait for DOM update
		console.log('DOM updated with new count');
	}
</script>
```

## Common Patterns

### Pattern 1: Form Handling

```svelte
<script lang="ts">
	let name = $state('');
	let email = $state('');
	let isSubmitting = $state(false);
	
	// Derived validation
	let isValid = $derived(name.length > 0 && email.includes('@'));
	
	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!isValid) return;
		
		isSubmitting = true;
		try {
			await submitForm({ name, email });
		} finally {
			isSubmitting = false;
		}
	}
</script>

<form onsubmit={handleSubmit}>
	<input bind:value={name} placeholder="Name" />
	<input bind:value={email} type="email" placeholder="Email" />
	<button type="submit" disabled={!isValid || isSubmitting}>
		Submit
	</button>
</form>
```

### Pattern 2: Fetching Data

```svelte
<script lang="ts">
	import { onMount } from 'svelte';
	
	let data = $state<Data[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	
	onMount(async () => {
		try {
			const response = await fetch('/api/data');
			data = await response.json();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to fetch';
		} finally {
			loading = false;
		}
	});
</script>

{#if loading}
	<p>Loading...</p>
{:else if error}
	<p>Error: {error}</p>
{:else}
	<ul>
		{#each data as item}
			<li>{item.name}</li>
		{/each}
	</ul>
{/if}
```

### Pattern 3: Toggle State

```svelte
<script lang="ts">
	let isOpen = $state(false);
	let count = $state(0);
	
	// Toggle function
	function toggle() {
		isOpen = !isOpen;
	}
	
	// Derived state
	let buttonText = $derived(isOpen ? 'Close' : 'Open');
</script>

<button onclick={toggle}>
	{buttonText}
</button>

{#if isOpen}
	<div class="content">
		<!-- Content here -->
	</div>
{/if}
```

### Pattern 4: List Management

```svelte
<script lang="ts">
	interface Todo {
		id: string;
		text: string;
		done: boolean;
	}
	
	let todos = $state<Todo[]>([]);
	let filter = $state<'all' | 'active' | 'done'>('all');
	
	// Derived filtered list
	let filteredTodos = $derived(
		todos.filter(todo => {
			if (filter === 'active') return !todo.done;
			if (filter === 'done') return todo.done;
			return true;
		})
	);
	
	// Derived counts
	let activeCount = $derived(todos.filter(t => !t.done).length);
	let doneCount = $derived(todos.filter(t => t.done).length);
	
	function addTodo(text: string) {
		todos.push({
			id: crypto.randomUUID(),
			text,
			done: false
		});
		todos = todos; // Trigger reactivity (usually not needed with $state)
	}
	
	function toggleTodo(id: string) {
		const todo = todos.find(t => t.id === id);
		if (todo) {
			todo.done = !todo.done;
		}
	}
	
	function deleteTodo(id: string) {
		todos = todos.filter(t => t.id !== id);
	}
</script>
```

### Pattern 5: Debounced Input

```svelte
<script lang="ts">
	let searchQuery = $state('');
	let debouncedQuery = $state('');
	let timeoutId: ReturnType<typeof setTimeout> | null = null;
	
	$effect(() => {
		// Debounce the search query
		if (timeoutId) clearTimeout(timeoutId);
		
		timeoutId = setTimeout(() => {
			debouncedQuery = searchQuery;
		}, 300);
		
		return () => {
			if (timeoutId) clearTimeout(timeoutId);
		};
	});
	
	// Perform search with debounced query
	$effect(() => {
		if (debouncedQuery) {
			console.log('Searching for:', debouncedQuery);
			// performSearch(debouncedQuery);
		}
	});
</script>

<input bind:value={searchQuery} placeholder="Search..." />
<p>Searching for: {debouncedQuery}</p>
```

## Migration from Svelte 4

### Reactive Statements

```svelte
<!-- ❌ Svelte 4 -->
<script>
	let count = 0;
	$: doubled = count * 2;
	$: if (count > 10) {
		console.log('Count is high');
	}
</script>

<!-- ✅ Svelte 5 -->
<script lang="ts">
	let count = $state(0);
	let doubled = $derived(count * 2);
	
	$effect(() => {
		if (count > 10) {
			console.log('Count is high');
		}
	});
</script>
```

### Props

```svelte
<!-- ❌ Svelte 4 -->
<script>
	export let title;
	export let count = 0;
</script>

<!-- ✅ Svelte 5 -->
<script lang="ts">
	let { title, count = 0 } = $props();
</script>
```

### Events

```svelte
<!-- ❌ Svelte 4 -->
<script>
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	
	function handleClick() {
		dispatch('clicked', { value: 42 });
	}
</script>
<button on:click={handleClick}>Click</button>

<!-- ✅ Svelte 5 -->
<script lang="ts">
	let { onClicked } = $props<{ onClicked?: (value: number) => void }>();
	
	function handleClick() {
		onClicked?.(42);
	}
</script>
<button onclick={handleClick}>Click</button>

<!-- Parent usage: <Component onClicked={(v) => console.log(v)} /> -->
```

## Best Practices

### 1. Prefer `$derived()` over `$effect()`

```svelte
<script lang="ts">
	let count = $state(0);
	
	// ❌ WRONG: Using effect to compute value
	let doubled = $state(0);
	$effect(() => {
		doubled = count * 2; // Creates infinite loops!
	});
	
	// ✅ CORRECT: Use derived
	let doubled = $derived(count * 2);
</script>
```

### 2. Keep Effects Simple

```svelte
<script lang="ts">
	let data = $state([]);
	
	// ❌ Complex effect
	$effect(() => {
		const filtered = data.filter(/*...*/);
		const sorted = filtered.sort(/*...*/);
		const grouped = Object.groupBy(sorted, /*...*/);
		// ...
	});
	
	// ✅ Use derived for transformations
	let filtered = $derived(data.filter(/*...*/));
	let sorted = $derived([...filtered].sort(/*...*/));
	
	// ✅ Effect only for side effects
	$effect(() => {
		console.log('Data changed:', filtered.length);
	});
</script>
```

### 3. Type Your State

```typescript
// ✅ Always add types
let count = $state<number>(0);
let items = $state<Item[]>([]);
let user = $state<User | null>(null);

// ❌ Avoid implicit any
let data = $state(undefined);
```

### 4. Guard Browser APIs

```typescript
import { browser } from '$app/environment';

// ✅ Always guard browser APIs
let data = $derived(browser ? localStorage.getItem('key') : null);

$effect(() => {
	if (!browser) return;
	localStorage.setItem('key', value);
});
```

### 5. Cleanup Effects

```typescript
// ✅ Always cleanup timers, listeners, subscriptions
$effect(() => {
	const interval = setInterval(() => {
		// ...
	}, 1000);
	
	return () => clearInterval(interval);
});
```

## Common Mistakes

### Mistake 1: Infinite Loops

```typescript
// ❌ WRONG: Creates infinite loop
let count = $state(0);
$effect(() => {
	count++; // Don't modify state in effect without guards!
});

// ✅ CORRECT: Guard with condition
let count = $state(0);
$effect(() => {
	if (count < 10) {
		count++;
	}
});
```

### Mistake 2: Missing Dependencies

```typescript
// ⚠️ WARNING: effect won't re-run when name changes
let count = $state(0);
let name = $state('John');

$effect(() => {
	console.log('Count:', count);
	// name not accessed, so changes to name won't trigger effect
});

// ✅ CORRECT: Access all dependencies
$effect(() => {
	console.log('Count:', count, 'Name:', name);
	// Both are dependencies now
});
```

### Mistake 3: Using $effect for Derived Values

```typescript
// ❌ WRONG
let price = $state(100);
let tax = $state(0);
$effect(() => {
	tax = price * 0.2; // DON'T
});

// ✅ CORRECT
let price = $state(100);
let tax = $derived(price * 0.2);
```

## Reference

### Rune Priority

1. **`$state()`** - For mutable reactive values
2. **`$derived()` or `$derived.by()`** - For computed values
3. **`$effect()`** - ONLY for true side effects (last resort!)

### Quick Cheat Sheet

| Need | Use | Example |
|------|-----|---------|
| Mutable value | `$state()` | `let count = $state(0)` |
| Computed value | `$derived()` | `let doubled = $derived(count * 2)` |
| Complex computation | `$derived.by()` | `let stats = $derived.by(() => {...})` |
| Side effect | `$effect()` | `$effect(() => console.log(count))` |
| Props | `$props()` | `let { title } = $props()` |
| Bindable prop | `$bindable()` | `let { open = $bindable() } = $props()` |

## Additional Resources

- [Svelte 5 Runes Documentation](https://svelte-5-preview.vercel.app/docs/runes)
- [Project Copilot Instructions](../../.github/copilot-instructions.md)
- [Migration Guide](https://svelte.dev/docs/v5-migration-guide)
# Select Component Usage Guide

## Overview

The `Select` component from `shadcn-svelte` is used throughout the Svelte-MiniApps project for dropdown selection interfaces. This guide covers the correct API usage, common patterns, and troubleshooting.

## Basic Import

```typescript
import * as Select from '@/ui/select';
```

## Component Structure

```svelte
<Select.Root type="single" bind:value={selectedValue}>
	<Select.Trigger class="w-[280px]">
		<span>{displayText}</span>
	</Select.Trigger>
	<Select.Content>
		<Select.Group>
			<Select.Item value="option1" label="Option 1">
				Option 1 Display
			</Select.Item>
			<Select.Item value="option2" label="Option 2">
				Option 2 Display
			</Select.Item>
		</Select.Group>
	</Select.Content>
</Select.Root>
```

## Core API

### Select.Root

The root container that manages the select state.

**Required Props:**
- `type: "single" | "multiple"` - Selection mode

**Optional Props:**
- `bind:value={variable}` - Two-way binding for selected value(s)
- `onValueChange={(value) => handler(value)}` - Callback when value changes
- `disabled={boolean}` - Disable the entire select

**Example:**
```svelte
<Select.Root 
	type="single" 
	bind:value={selectedCurrency}
	onValueChange={(value) => handleChange(value)}
>
	<!-- content -->
</Select.Root>
```

### Select.Trigger

The button that opens the dropdown.

**Props:**
- `class={string}` - Styling classes

**Content:**
Display the selected value or placeholder text inside the trigger.

**Example:**
```svelte
<Select.Trigger class="w-full">
	<span>{selectedValue || 'Select option'}</span>
</Select.Trigger>
```

### Select.Content

The dropdown panel containing options.

**Example:**
```svelte
<Select.Content>
	<Select.Group>
		<!-- items here -->
	</Select.Group>
</Select.Content>
```

### Select.Item

Individual selectable option.

**Props:**
- `value={string}` - The value to bind when selected (required)
- `label={string}` - Accessible label (required)
- `disabled={boolean}` - Make option non-selectable

**Content:**
The display content (can be different from value).

**Example:**
```svelte
<Select.Item value="usd" label="US Dollar">
	<div class="flex items-center gap-2">
		<span>🇺🇸</span>
		<span>US Dollar (USD)</span>
	</div>
</Select.Item>
```

## Common Patterns

### 1. Simple String Selection

```svelte
<script lang="ts">
	let selectedFruit = $state('apple');
	const fruits = ['apple', 'banana', 'orange', 'grape'];
</script>

<Select.Root type="single" bind:value={selectedFruit}>
	<Select.Trigger class="w-[200px]">
		<span>{selectedFruit}</span>
	</Select.Trigger>
	<Select.Content>
		<Select.Group>
			{#each fruits as fruit}
				<Select.Item value={fruit} label={fruit}>
					{fruit}
				</Select.Item>
			{/each}
		</Select.Group>
	</Select.Content>
</Select.Root>
```

### 2. Object-Based Selection with Display Name

```svelte
<script lang="ts">
	let selectedSessionId = $state('');
	let selectedSessionName = $state('Select Session');
	
	interface Session {
		id: string;
		name: string;
	}
	
	const sessions: Session[] = [
		{ id: '1', name: 'Morning Session' },
		{ id: '2', name: 'Evening Session' }
	];
	
	function handleSessionChange(sessionId: string | undefined) {
		if (sessionId) {
			const session = sessions.find(s => s.id === sessionId);
			selectedSessionName = session ? session.name : 'Select Session';
		}
	}
</script>

<Select.Root 
	type="single" 
	bind:value={selectedSessionId}
	onValueChange={handleSessionChange}
>
	<Select.Trigger class="w-[280px]">
		<span>{selectedSessionName}</span>
	</Select.Trigger>
	<Select.Content>
		<Select.Group>
			{#each sessions as session}
				<Select.Item value={session.id} label={session.name}>
					<div class="flex flex-col">
						<span class="font-medium">{session.name}</span>
						<span class="text-xs text-gray-500">ID: {session.id}</span>
					</div>
				</Select.Item>
			{/each}
		</Select.Group>
	</Select.Content>
</Select.Root>
```

### 3. With Icons and Rich Content

```svelte
<script lang="ts">
	import { Circle, CheckCircle2, XCircle } from '@lucide/svelte';
	
	let selectedStatus = $state('active');
	
	const statuses = [
		{ value: 'active', label: 'Active', icon: CheckCircle2, color: 'text-green-600' },
		{ value: 'pending', label: 'Pending', icon: Circle, color: 'text-yellow-600' },
		{ value: 'ended', label: 'Ended', icon: XCircle, color: 'text-red-600' }
	];
</script>

<Select.Root type="single" bind:value={selectedStatus}>
	<Select.Trigger class="w-[200px]">
		<span>{statuses.find(s => s.value === selectedStatus)?.label}</span>
	</Select.Trigger>
	<Select.Content>
		<Select.Group>
			{#each statuses as status}
				<Select.Item value={status.value} label={status.label}>
					<div class="flex items-center gap-2">
						<status.icon class="size-4 {status.color}" />
						<span>{status.label}</span>
					</div>
				</Select.Item>
			{/each}
		</Select.Group>
	</Select.Content>
</Select.Root>
```

### 4. Reactive Value Sync with $effect

When you need to sync the select value with external state:

```svelte
<script lang="ts">
	let activeSession = $derived(getActiveSession());
	let selectedSessionValue = $state('');
	
	// Sync select value when active session changes
	$effect(() => {
		if (activeSession) {
			selectedSessionValue = activeSession.id;
		} else {
			selectedSessionValue = '';
		}
	});
</script>

<Select.Root 
	type="single" 
	bind:value={selectedSessionValue}
	onValueChange={(value) => setActiveSession(value)}
>
	<!-- content -->
</Select.Root>
```

## Common Mistakes & Solutions

### ❌ WRONG: Using deprecated API

```svelte
<!-- DON'T DO THIS -->
<Select.Root
	selected={{ value: selectedValue, label: displayLabel }}
	onSelectedChange={(selected) => handleChange(selected?.value)}
>
```

**Error:** `'selected' does not exist in type 'SelectRootPropsWithoutHTML'`

### ✅ CORRECT: Use type and bind:value

```svelte
<!-- DO THIS -->
<Select.Root 
	type="single" 
	bind:value={selectedValue}
	onValueChange={(value) => handleChange(value)}
>
```

---

### ❌ WRONG: Using Select.Value component

```svelte
<!-- DON'T DO THIS -->
<Select.Trigger>
	<Select.Value placeholder="Select option" />
</Select.Trigger>
```

**Error:** `Property 'Value' does not exist on type...`

### ✅ CORRECT: Use plain content in trigger

```svelte
<!-- DO THIS -->
<Select.Trigger>
	<span>{selectedValue || 'Select option'}</span>
</Select.Trigger>
```

---

### ❌ WRONG: Missing type prop

```svelte
<!-- DON'T DO THIS -->
<Select.Root bind:value={selected}>
```

**Error:** Required prop 'type' is missing

### ✅ CORRECT: Always specify type

```svelte
<!-- DO THIS -->
<Select.Root type="single" bind:value={selected}>
```

---

### ❌ WRONG: Direct state initialization with derived value

```svelte
<!-- DON'T DO THIS -->
let selectedValue = $state(activeSession?.id || '');
```

**Warning:** "This reference only captures the initial value..."

### ✅ CORRECT: Use $effect for reactive sync

```svelte
<!-- DO THIS -->
let selectedValue = $state('');

$effect(() => {
	if (activeSession) {
		selectedValue = activeSession.id;
	}
});
```

## Styling

### Width Control

```svelte
<!-- Fixed width -->
<Select.Trigger class="w-[280px]">

<!-- Responsive width -->
<Select.Trigger class="w-full sm:w-[280px]">

<!-- Flex-based width -->
<Select.Trigger class="flex-1">
```

### Custom Styling

```svelte
<Select.Root type="single" bind:value={value}>
	<Select.Trigger class="w-[280px] bg-gray-50 dark:bg-gray-800">
		<span class="font-medium">{displayText}</span>
	</Select.Trigger>
	<Select.Content class="max-h-[300px]">
		<Select.Item 
			value="option1" 
			label="Option 1"
			class="hover:bg-primary/10"
		>
			Custom styled option
		</Select.Item>
	</Select.Content>
</Select.Root>
```

## TypeScript Types

```typescript
// For single selection
let selectedValue: string = $state('');

// For multiple selection
let selectedValues: string[] = $state([]);

// Typed options
interface Option {
	value: string;
	label: string;
	disabled?: boolean;
}

const options: Option[] = [
	{ value: 'a', label: 'Option A' },
	{ value: 'b', label: 'Option B', disabled: true }
];
```

## Accessibility

The Select component is built with accessibility in mind:

- ✅ Keyboard navigation (Arrow keys, Enter, Escape)
- ✅ ARIA attributes automatically applied
- ✅ Screen reader support
- ✅ Focus management

**Best practices:**
- Always provide meaningful `label` props
- Use descriptive trigger text
- Consider disabled states appropriately
- Test with keyboard-only navigation

## Real-World Examples from Project

### Budget Tracker (Currency Selection)

```svelte
<Select.Root type="single" bind:value={selectedCurrency}>
	<Select.Trigger class="w-[180px]">{selectedCurrency}</Select.Trigger>
	<Select.Content>
		<Select.Group>
			{#each currencies as currency}
				<Select.Item value={currency} label={currency}>
					{currency}
				</Select.Item>
			{/each}
		</Select.Group>
	</Select.Content>
</Select.Root>
```

### Medication Tracker (Session Selection)

```svelte
<Select.Root 
	type="single" 
	bind:value={selectedSessionValue}
	onValueChange={(value) => switchSession(value)}
>
	<Select.Trigger class="w-[280px]">
		<span>{activeSession?.name || 'Select session'}</span>
	</Select.Trigger>
	<Select.Content>
		<Select.Group>
			{#each sessions as session}
				<Select.Item value={session.id} label={session.name}>
					<div class="flex items-center gap-2">
						{#if session.isActive}
							<CheckCircle2 class="size-4 text-green-600" />
						{:else}
							<Circle class="size-4 text-gray-400" />
						{/if}
						<span>{session.name}</span>
					</div>
				</Select.Item>
			{/each}
		</Select.Group>
	</Select.Content>
</Select.Root>
```

### Unit Converter (Unit Selection)

```svelte
<Select.Root 
	type="single" 
	bind:value={fromUnit} 
	onValueChange={handleFromUnitChange}
>
	<Select.Trigger id="fromUnit" class="w-full min-w-0">
		<span class="block truncate">{fromUnitLabel}</span>
	</Select.Trigger>
	<Select.Content>
		{#each units[unitType] as unit}
			<Select.Item value={unit.value} label={unit.label}>
				{unit.label}
			</Select.Item>
		{/each}
	</Select.Content>
</Select.Root>
```

## Performance Considerations

- ✅ Select component is lightweight and optimized
- ✅ Use `bind:value` for efficient two-way binding
- ✅ Avoid expensive operations in `onValueChange` callbacks
- ✅ Consider virtualization for very long lists (100+ items)

## Testing

```typescript
// Example test patterns
import { render, fireEvent } from '@testing-library/svelte';

test('select changes value', async () => {
	const { getByRole } = render(SelectComponent);
	const trigger = getByRole('combobox');
	
	await fireEvent.click(trigger);
	const option = getByRole('option', { name: 'Option 2' });
	await fireEvent.click(option);
	
	expect(trigger).toHaveTextContent('Option 2');
});
```

## Related Components

- **Dialog**: For modal select experiences
- **Popover**: For custom dropdown positioning
- **Combobox**: For searchable selects (consider for 20+ items)

## References

- [shadcn-svelte Select Docs](https://www.shadcn-svelte.com/docs/components/select)
- [Project UI Components](../../../src/lib/components/ui/select/)
- [Medication Tracker Implementation](../../src/routes/apps/(app)/medication-tracker/+page.svelte)

## Changelog

- **2024-01**: Updated for Svelte 5 runes syntax
- **2024-01**: Added medication tracker session selector example
- **2024-01**: Documented common mistakes and solutions
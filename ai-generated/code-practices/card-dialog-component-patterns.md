# Card and Dialog Component Patterns

## Overview

This guide covers best practices for using Card and Dialog components from shadcn-svelte in the Svelte-MiniApps project. These components are foundational UI elements used throughout the application.

## Card Component

### Basic Import

```typescript
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/ui/card';
```

### Basic Structure

```svelte
<Card>
	<CardHeader>
		<CardTitle>Card Title</CardTitle>
		<CardDescription>Optional description</CardDescription>
	</CardHeader>
	<CardContent>
		<!-- Main content here -->
	</CardContent>
</Card>
```

### Simple Card (Content Only)

```svelte
<Card>
	<CardContent class="pt-6">
		<!-- No header needed -->
		<p>Simple card content</p>
	</CardContent>
</Card>
```

**Note:** Add `pt-6` class when using CardContent without CardHeader for consistent spacing.

### Card with Actions

```svelte
<Card>
	<CardHeader>
		<CardTitle>Settings</CardTitle>
	</CardHeader>
	<CardContent>
		<p>Your settings content</p>
	</CardContent>
	<CardFooter>
		<Button>Save</Button>
		<Button variant="outline">Cancel</Button>
	</CardFooter>
</Card>
```

## Styling Cards

### Border Variants

```svelte
<!-- Default border -->
<Card class="border-gray-200 dark:border-gray-700">

<!-- Accent border (left side) -->
<Card class="border-l-4 border-l-primary">

<!-- Dashed border (for empty states) -->
<Card class="border-dashed">

<!-- No border -->
<Card class="border-none">
```

### Background Colors

```svelte
<!-- Subtle background -->
<Card class="bg-gray-50 dark:bg-gray-800">

<!-- Accent background -->
<Card class="bg-primary/5">

<!-- Gradient background -->
<Card class="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
```

### Active/Selected States

```svelte
<script lang="ts">
	let isActive = $state(false);
</script>

<Card 
	class="transition-all {isActive 
		? 'border-primary bg-primary/5 border-l-4' 
		: 'border-gray-200 dark:border-gray-700'}"
>
	<CardContent>
		{#if isActive}
			<Badge class="mb-2">Active</Badge>
		{/if}
		<p>Content</p>
	</CardContent>
</Card>
```

### Hover Effects

```svelte
<!-- Simple hover -->
<Card class="transition-all hover:shadow-md">

<!-- Hover with border -->
<Card class="transition-all hover:border-gray-300 hover:shadow-md">

<!-- Hover with scale -->
<Card class="transition-all hover:scale-105 hover:shadow-lg">
```

## Common Card Patterns

### 1. Stats Card

```svelte
<Card>
	<CardContent class="py-4">
		<div class="text-center">
			<div class="text-3xl font-bold text-primary">
				{stats.adherenceRate.toFixed(1)}%
			</div>
			<div class="text-sm text-gray-500">Adherence Rate</div>
		</div>
	</CardContent>
</Card>
```

### 2. Empty State Card

```svelte
<Card class="border-dashed">
	<CardContent class="pt-6 pb-6 text-center">
		<Icon class="mx-auto mb-4 size-16 text-gray-400" />
		<h3 class="mb-2 text-lg font-semibold">No Data Yet</h3>
		<p class="mb-4 text-gray-600 dark:text-gray-400">
			Get started by creating your first item
		</p>
		<Button onclick={createFirst}>
			<Plus class="mr-2 size-4" />
			Create First Item
		</Button>
	</CardContent>
</Card>
```

### 3. List Item Card

```svelte
<Card class="transition-all hover:shadow-md">
	<CardContent class="py-4">
		<div class="flex items-center justify-between">
			<div class="flex-1">
				<h4 class="font-semibold">{item.name}</h4>
				<p class="text-sm text-gray-600">{item.description}</p>
			</div>
			<div class="flex gap-2">
				<Button variant="ghost" size="sm">Edit</Button>
				<Button variant="ghost" size="sm">Delete</Button>
			</div>
		</div>
	</CardContent>
</Card>
```

### 4. Information Card with Icon

```svelte
<Card class="border-l-4 border-l-primary">
	<CardContent class="py-4">
		<div class="flex items-start gap-3">
			<Activity class="size-5 text-primary flex-shrink-0" />
			<div class="flex-1">
				<h3 class="font-bold text-lg">{session.name}</h3>
				<p class="text-sm text-gray-600">{session.description}</p>
			</div>
		</div>
	</CardContent>
</Card>
```

## Interactive Cards

### ❌ WRONG: onclick on Card Component

```svelte
<!-- DON'T DO THIS - Card doesn't support onclick -->
<Card onclick={handleClick}>
	<CardContent>Click me</CardContent>
</Card>
```

**Error:** `This type of directive is not valid on components`

### ✅ CORRECT: Wrap in Div

```svelte
<script lang="ts">
	function handleClick() {
		console.log('Card clicked');
	}
</script>

<div
	class="cursor-pointer"
	onclick={handleClick}
	role="button"
	tabindex="0"
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			handleClick();
		}
	}}
>
	<Card class="transition-all hover:shadow-md">
		<CardContent>
			<p>Clickable card content</p>
		</CardContent>
	</Card>
</div>
```

### Clickable Card with Stop Propagation

```svelte
<div onclick={handleCardClick} role="button" tabindex="0">
	<Card>
		<CardContent>
			<p>Card content</p>
			<div class="flex gap-2" onclick={(e) => e.stopPropagation()}>
				<Button>Action 1</Button>
				<Button>Action 2</Button>
			</div>
		</CardContent>
	</Card>
</div>
```

## Dialog Component

### Basic Import

```typescript
import * as Dialog from '@/ui/dialog';
```

### Basic Structure

```svelte
<script lang="ts">
	let open = $state(false);
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>
		<Button>Open Dialog</Button>
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Dialog Title</Dialog.Title>
			<Dialog.Description>
				Optional description explaining the dialog purpose
			</Dialog.Description>
		</Dialog.Header>
		
		<!-- Main content -->
		<div class="space-y-4">
			<p>Dialog content goes here</p>
		</div>
		
		<Dialog.Footer>
			<Button variant="outline" onclick={() => open = false}>Cancel</Button>
			<Button onclick={handleSave}>Save</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
```

### Controlled Dialog (No Trigger)

```svelte
<script lang="ts">
	let showDialog = $state(false);
	
	function openDialog() {
		showDialog = true;
	}
</script>

<Button onclick={openDialog}>Open</Button>

<Dialog.Root bind:open={showDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Controlled Dialog</Dialog.Title>
		</Dialog.Header>
		<!-- Content -->
	</Dialog.Content>
</Dialog.Root>
```

### Dialog with Form

```svelte
<script lang="ts">
	let open = $state(false);
	let name = $state('');
	let email = $state('');
	
	function handleSubmit(e: Event) {
		e.preventDefault();
		console.log({ name, email });
		open = false;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>User Information</Dialog.Title>
			<Dialog.Description>
				Enter your details below
			</Dialog.Description>
		</Dialog.Header>
		
		<form onsubmit={handleSubmit} class="space-y-4">
			<div>
				<Label for="name">Name</Label>
				<Input id="name" bind:value={name} required />
			</div>
			<div>
				<Label for="email">Email</Label>
				<Input id="email" type="email" bind:value={email} required />
			</div>
			
			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => open = false}>
					Cancel
				</Button>
				<Button type="submit">Submit</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
```

### Scrollable Dialog

```svelte
<Dialog.Root bind:open>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>Long Content</Dialog.Title>
		</Dialog.Header>
		
		<div class="space-y-4">
			<!-- Long content that scrolls -->
			{#each items as item}
				<Card>
					<CardContent>
						{item.content}
					</CardContent>
				</Card>
			{/each}
		</div>
	</Dialog.Content>
</Dialog.Root>
```

### Large Dialog

```svelte
<Dialog.Root bind:open>
	<Dialog.Content class="max-w-3xl">
		<!-- Large content -->
	</Dialog.Content>
</Dialog.Root>

<!-- Other sizes -->
<Dialog.Content class="max-w-md">   <!-- Small -->
<Dialog.Content class="max-w-lg">   <!-- Medium -->
<Dialog.Content class="max-w-xl">   <!-- Large -->
<Dialog.Content class="max-w-2xl">  <!-- Extra Large -->
<Dialog.Content class="max-w-4xl">  <!-- 2X Large -->
```

## AlertDialog Component

For destructive actions:

```typescript
import * as AlertDialog from '@/ui/alert-dialog';
```

### Confirmation Dialog

```svelte
<script lang="ts">
	let showDeleteDialog = $state(false);
	let itemToDelete = $state<Item | null>(null);
	
	function confirmDelete(item: Item) {
		itemToDelete = item;
		showDeleteDialog = true;
	}
	
	function handleDelete() {
		if (itemToDelete) {
			// Delete logic
			console.log('Deleting:', itemToDelete);
		}
		showDeleteDialog = false;
		itemToDelete = null;
	}
</script>

<Button onclick={() => confirmDelete(item)}>Delete</Button>

<AlertDialog.Root bind:open={showDeleteDialog}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Are you sure?</AlertDialog.Title>
			<AlertDialog.Description>
				This will permanently delete "{itemToDelete?.name}". 
				This action cannot be undone.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action onclick={handleDelete}>
				Delete
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
```

## Common Patterns

### Pattern 1: Edit Dialog

```svelte
<script lang="ts">
	let editingItem = $state<Item | null>(null);
	let editName = $state('');
	let editDescription = $state('');
	
	function openEdit(item: Item) {
		editingItem = item;
		editName = item.name;
		editDescription = item.description;
	}
	
	function saveEdit() {
		if (editingItem) {
			updateItem(editingItem.id, {
				name: editName,
				description: editDescription
			});
		}
		editingItem = null;
	}
</script>

<Dialog.Root open={!!editingItem} onOpenChange={(open) => !open && (editingItem = null)}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Edit Item</Dialog.Title>
		</Dialog.Header>
		
		<div class="space-y-4">
			<div>
				<Label for="edit-name">Name</Label>
				<Input id="edit-name" bind:value={editName} />
			</div>
			<div>
				<Label for="edit-desc">Description</Label>
				<Textarea id="edit-desc" bind:value={editDescription} />
			</div>
		</div>
		
		<Dialog.Footer>
			<Button variant="outline" onclick={() => editingItem = null}>
				Cancel
			</Button>
			<Button onclick={saveEdit}>Save Changes</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
```

### Pattern 2: Multi-Step Dialog

```svelte
<script lang="ts">
	let open = $state(false);
	let step = $state(1);
	
	function nextStep() {
		step++;
	}
	
	function prevStep() {
		step--;
	}
	
	function resetDialog() {
		step = 1;
		open = false;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Setup Wizard - Step {step} of 3</Dialog.Title>
		</Dialog.Header>
		
		{#if step === 1}
			<div>Step 1 content</div>
		{:else if step === 2}
			<div>Step 2 content</div>
		{:else}
			<div>Step 3 content</div>
		{/if}
		
		<Dialog.Footer>
			{#if step > 1}
				<Button variant="outline" onclick={prevStep}>Back</Button>
			{/if}
			{#if step < 3}
				<Button onclick={nextStep}>Next</Button>
			{:else}
				<Button onclick={resetDialog}>Finish</Button>
			{/if}
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
```

### Pattern 3: Cards in Dialog

```svelte
<Dialog.Root bind:open>
	<Dialog.Content class="max-h-[90vh] max-w-3xl overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>Select an Option</Dialog.Title>
		</Dialog.Header>
		
		<div class="space-y-3">
			{#each options as option}
				<Card 
					class="cursor-pointer transition-all hover:shadow-md {selectedOption === option ? 'border-primary' : ''}"
					onclick={() => selectedOption = option}
				>
					<CardContent class="py-4">
						<div class="flex items-center gap-3">
							{#if selectedOption === option}
								<CheckCircle2 class="size-5 text-primary" />
							{:else}
								<Circle class="size-5 text-gray-400" />
							{/if}
							<div>
								<h4 class="font-semibold">{option.name}</h4>
								<p class="text-sm text-gray-600">{option.description}</p>
							</div>
						</div>
					</CardContent>
				</Card>
			{/each}
		</div>
	</Dialog.Content>
</Dialog.Root>
```

## Animations and Transitions

### Card Transitions (Svelte 5)

```svelte
<script lang="ts">
	import { slide } from 'svelte/transition';
</script>

{#each items as item (item.id)}
	<div transition:slide>
		<Card>
			<CardContent>{item.name}</CardContent>
		</Card>
	</div>
{/each}
```

**Important:** Apply transitions to wrapper `div`, not directly to Card component.

### ❌ WRONG: Transition on Card

```svelte
<!-- DON'T DO THIS -->
<Card transition:slide>
	<CardContent>Content</CardContent>
</Card>
```

**Error:** `This type of directive is not valid on components`

### ✅ CORRECT: Transition on Wrapper

```svelte
<!-- DO THIS -->
<div transition:slide>
	<Card>
		<CardContent>Content</CardContent>
	</Card>
</div>
```

## Accessibility Best Practices

### Interactive Cards

```svelte
<!-- ✅ Proper accessibility attributes -->
<div
	onclick={handleClick}
	role="button"
	tabindex="0"
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleClick();
		}
	}}
	aria-label="Select this option"
>
	<Card>...</Card>
</div>
```

### Dialog Focus Management

Dialogs automatically handle:
- ✅ Focus trap (Tab cycles through dialog elements)
- ✅ Escape key to close
- ✅ Focus return to trigger on close
- ✅ ARIA attributes

## Common Mistakes

### Mistake 1: Using onclick on Card

```svelte
<!-- ❌ WRONG -->
<Card onclick={handler}>
	Content
</Card>

<!-- ✅ CORRECT -->
<div onclick={handler}>
	<Card>Content</Card>
</div>
```

### Mistake 2: Using transition on Card

```svelte
<!-- ❌ WRONG -->
<Card transition:slide>
	Content
</Card>

<!-- ✅ CORRECT -->
<div transition:slide>
	<Card>Content</Card>
</div>
```

### Mistake 3: Missing pt-6 on Content Without Header

```svelte
<!-- ❌ Wrong spacing -->
<Card>
	<CardContent>
		Content looks too close to top
	</CardContent>
</Card>

<!-- ✅ Correct spacing -->
<Card>
	<CardContent class="pt-6">
		Content has proper spacing
	</CardContent>
</Card>
```

### Mistake 4: Forgetting Dialog.Footer

```svelte
<!-- ❌ Buttons not properly aligned -->
<Dialog.Content>
	<Dialog.Header>...</Dialog.Header>
	<div>Content</div>
	<div class="flex gap-2">
		<Button>Cancel</Button>
		<Button>Save</Button>
	</div>
</Dialog.Content>

<!-- ✅ Proper footer alignment -->
<Dialog.Content>
	<Dialog.Header>...</Dialog.Header>
	<div>Content</div>
	<Dialog.Footer>
		<Button>Cancel</Button>
		<Button>Save</Button>
	</Dialog.Footer>
</Dialog.Content>
```

## TypeScript Tips

```typescript
// Define item types for type safety
interface CardItem {
	id: string;
	name: string;
	description: string;
	isActive: boolean;
}

let items = $state<CardItem[]>([]);
let selectedItem = $state<CardItem | null>(null);
let showDialog = $state(false);
```

## Performance Considerations

- ✅ Cards are lightweight, render many without issues
- ✅ Dialogs use portal rendering (no performance impact)
- ✅ Use `{#key}` blocks for proper list rendering
- ⚠️ Avoid complex computations in card render loops
- ⚠️ Lazy load dialog content if heavy

## Real-World Examples

### Medication Tracker Session Card

```svelte
<Card class="border-l-4 border-l-primary">
	<CardContent class="py-4">
		<div class="flex items-center justify-between">
			<div class="flex-1">
				<div class="flex items-center gap-2 mb-1">
					<Activity class="size-5 text-primary" />
					<h2 class="text-xl font-bold">{session.name}</h2>
				</div>
				{#if session.description}
					<p class="text-sm text-gray-600 mb-2">{session.description}</p>
				{/if}
				<div class="flex gap-4 text-sm text-gray-500">
					<span>Started {formatDate(session.startDate)}</span>
					<span class="text-green-600">• Ongoing</span>
					<span>• {session.medications.length} medications</span>
				</div>
			</div>
			<div class="bg-gray-50 rounded-lg px-4 py-3">
				<div class="text-3xl font-bold text-primary">
					{stats.adherenceRate.toFixed(1)}%
				</div>
				<div class="text-xs text-gray-500">Adherence</div>
			</div>
		</div>
	</CardContent>
</Card>
```

## References

- [shadcn-svelte Card](https://www.shadcn-svelte.com/docs/components/card)
- [shadcn-svelte Dialog](https://www.shadcn-svelte.com/docs/components/dialog)
- [shadcn-svelte Alert Dialog](https://www.shadcn-svelte.com/docs/components/alert-dialog)
- [Session Switcher Implementation](../medication-tracker-session-switcher-improvements.md)

## Summary

**Card Component:**
- Use CardHeader + CardContent + CardFooter structure
- Wrap in div for onclick/transitions
- Add pt-6 to CardContent when no header
- Use border-l-4 for accent borders

**Dialog Component:**
- Always bind:open for controlled state
- Use Dialog.Footer for proper button alignment
- AlertDialog for destructive actions
- Dialogs handle accessibility automatically

**Golden Rule:** Components don't accept directives (onclick, transition) - wrap in div instead!
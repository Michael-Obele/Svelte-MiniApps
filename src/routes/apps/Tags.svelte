<script lang="ts">
	import { PiggyBank, Heart, Speaker, Code } from 'lucide-svelte';
	import { Box, Lock, Pen, CheckSquare, Book } from 'lucide-svelte';
	import { PartyPopper, Diff, Gamepad2 } from 'lucide-svelte';

	export let item;
</script>

<span
	class={`mb-2 inline-flex items-center rounded-md px-2.5 py-0.5 text-sm font-medium text-green-800 ${item.tag}`}
>
	{#if item.tag === 'utility'}
		<Box size="16" class="mx-1" />
	{:else if item.tag === 'game'}
		<Gamepad2 size="16" class="mx-1" />
	{:else if item.tag === 'math'}
		<Diff size="16" class="mx-1" />
	{:else if item.tag === 'fun'}
		<PartyPopper size="16" class="mx-1" />
	{:else if item.tag === 'security'}
		<Lock size="16" class="mx-1" />
	{:else if item.tag === 'design'}
		<Pen size="16" class="mx-1" />
	{:else if item.tag === 'productivity'}
		<CheckSquare size="16" class="mx-1" />
	{:else if item.tag === 'education'}
		<Book size="16" class="mx-1" />
	{:else if item.tag === 'finance'}
		<PiggyBank size="16" class="mx-1" />
	{:else if item.tag === 'health'}
		<Heart size="16" class="mx-1" />
	{:else if item.tag === 'multimedia'}
		<Speaker size="16" class="mx-1" />
	{:else if item.tag === 'developer-tools'}
		<Code size="16" class="mx-1" />
	{/if}
	{item.tag.split('-').join(' ')}
</span>

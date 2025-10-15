<script lang="ts">
	import { PiggyBank, Heart, Speaker, Code } from '@lucide/svelte';
	import { Box, Lock, Pen, CheckSquare, Book } from '@lucide/svelte';
	import { PartyPopper, Diff, Gamepad2 } from '@lucide/svelte';
	import { done, isNewApp, isRecentlyUpdated } from '$lib/index';

	let { item } = $props();
</script>

<div class="flex flex-wrap items-center gap-2">
	<span
		class={`inline-flex items-center rounded-md px-2.5 py-0.5 text-sm font-medium text-green-800 ${item.tag}`}
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

	{#if done.some((d) => d.name === item.link) && isNewApp(item.link)}
		<span
			class="inline-flex items-center rounded-md bg-green-100 px-2.5 py-0.5 text-sm font-medium text-green-800 dark:bg-green-900 dark:text-green-300"
		>
			NEW
		</span>
	{/if}

	{#if done.some((d) => d.name === item.link) && isRecentlyUpdated(item.link)}
		<span
			class="inline-flex items-center rounded-md bg-blue-100 px-2.5 py-0.5 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300"
		>
			UPDATED
		</span>
	{/if}
</div>

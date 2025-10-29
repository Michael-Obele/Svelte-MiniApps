<script lang="ts">
	import { PiggyBank, Heart, Speaker, Code } from '@lucide/svelte';
	import { Box, Lock, Pen, CheckSquare, Book } from '@lucide/svelte';
	import { PartyPopper, Diff, Gamepad2 } from '@lucide/svelte';
	import { done, isNewApp, isRecentlyUpdated } from '$lib/index.svelte';

	let { item } = $props();

	// Map of tag classes to their corresponding icons
	const tagIcons = {
		utility: Box,
		game: Gamepad2,
		math: Diff,
		fun: PartyPopper,
		security: Lock,
		design: Pen,
		productivity: CheckSquare,
		education: Book,
		finance: PiggyBank,
		health: Heart,
		multimedia: Speaker,
		'developer-tools': Code
	} as const;

	type TagClass = keyof typeof tagIcons;
</script>

{#snippet icon(tagClass: string)}
	{#if tagClass in tagIcons}
		{@const IconComponent = tagIcons[tagClass as TagClass]}
		<IconComponent size="16" class="mx-1" />
	{/if}
{/snippet}

<div class="flex flex-wrap items-center gap-2">
	<span
		class={`inline-flex items-center rounded-md px-2.5 py-0.5 text-sm font-medium text-green-800 ${item.tagClass}`}
	>
		{@render icon(item.tagClass)}
		{item.tag.split('-').join(' ')}
	</span>

	{#if done().some((d) => d.name === item.link) && isNewApp(item.link)}
		<span
			class="inline-flex items-center rounded-md bg-green-100 px-2.5 py-0.5 text-sm font-medium text-green-800 dark:bg-green-900 dark:text-green-300"
		>
			NEW
		</span>
	{/if}

	{#if done().some((d) => d.name === item.link) && isRecentlyUpdated(item.link)}
		<span
			class="inline-flex items-center rounded-md bg-blue-100 px-2.5 py-0.5 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300"
		>
			UPDATED
		</span>
	{/if}
</div>

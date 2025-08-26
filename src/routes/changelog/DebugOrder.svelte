<!-- Debug component to show timeline sorting -->
<script lang="ts">
	import { Button } from '@/ui/button';
	import { allTimeline } from './data';

	let showDebug = $state(false);
</script>

<Button
	class="mb-4 rounded bg-gray-200 px-3 py-1 text-xs transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
	onclick={() => (showDebug = !showDebug)}
>
	{showDebug ? 'Hide' : 'Show'} Debug Order
</Button>

{#if showDebug}
	<div
		class="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20"
	>
		<h4 class="mb-2 font-semibold text-yellow-800 dark:text-yellow-200">
			Debug: Timeline Order (Total: {allTimeline.length})
		</h4>
		<div class="max-h-60 space-y-1 overflow-y-auto text-sm">
			{#each allTimeline as item, index}
				<div class="flex items-center gap-2">
					<span class="w-6 text-gray-500 dark:text-gray-400">{index + 1}.</span>
					<span class="font-mono text-xs text-gray-700 dark:text-gray-300">{item.date}</span>
					<span
						class="rounded px-2 py-1 text-xs {item.source === 'manual'
							? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
							: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'}"
					>
						{item.source || 'manual'}
					</span>
					<span class="truncate text-gray-700 dark:text-gray-300">{item.title}</span>
				</div>
			{/each}
		</div>
	</div>
{/if}

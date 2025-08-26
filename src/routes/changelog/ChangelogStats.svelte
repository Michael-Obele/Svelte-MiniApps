<!-- Changelog Statistics Component -->
<script lang="ts">
	import { allTimeline } from './data';
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Bot, SquarePen, TrendingUp, Calendar, Code } from 'lucide-svelte';

	const stats = $derived.by(() => {
		const manual = allTimeline.filter((item) => !('source' in item) || item.source === 'manual');
		const generated = allTimeline.filter((item) => 'source' in item && item.source === 'generated');

		const typeStats = allTimeline.reduce(
			(acc, item) => {
				acc[item.type] = (acc[item.type] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>
		);

		return {
			total: allTimeline.length,
			manual: manual.length,
			generated: generated.length,
			types: typeStats
		};
	});

	const typeIcons = {
		feature: '🚀',
		fix: '🔧',
		improvement: '⚡',
		breaking: '⚠️',
		deprecation: '🗑️'
	};

	const typeColors = {
		feature: 'text-green-600 dark:text-green-400',
		fix: 'text-blue-600 dark:text-blue-400',
		improvement: 'text-purple-600 dark:text-purple-400',
		breaking: 'text-red-600 dark:text-red-400',
		deprecation: 'text-yellow-600 dark:text-yellow-400'
	};

	let showStats = $state(false);
</script>

{#if showStats}
	<Card class="mb-6">
		<CardHeader>
			<CardTitle class="flex items-center gap-2 text-lg">
				<TrendingUp class="h-5 w-5" />
				Changelog Statistics
			</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
				<!-- Total Entries -->
				<div class="rounded-lg bg-gray-50 p-3 text-center dark:bg-gray-800">
					<div class="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</div>
					<div
						class="flex items-center justify-center gap-1 text-sm text-gray-600 dark:text-gray-400"
					>
						<Calendar class="h-4 w-4" />
						Total Entries
					</div>
				</div>

				<!-- Manual Entries -->
				<div class="rounded-lg bg-blue-50 p-3 text-center dark:bg-blue-900/20">
					<div class="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.manual}</div>
					<div
						class="flex items-center justify-center gap-1 text-sm text-blue-600 dark:text-blue-400"
					>
						<SquarePen class="h-4 w-4" />
						Manual
					</div>
				</div>

				<!-- Generated Entries -->
				<div class="rounded-lg bg-green-50 p-3 text-center dark:bg-green-900/20">
					<div class="text-2xl font-bold text-green-900 dark:text-green-100">{stats.generated}</div>
					<div
						class="flex items-center justify-center gap-1 text-sm text-green-600 dark:text-green-400"
					>
						<Bot class="h-4 w-4" />
						Auto-Generated
					</div>
				</div>
			</div>

			<!-- Type Breakdown -->
			<div class="border-t pt-4">
				<h4 class="mb-3 flex items-center gap-2 font-semibold">
					<Code class="h-4 w-4" />
					By Type
				</h4>
				<div class="flex flex-wrap gap-2">
					{#each Object.entries(stats.types) as [type, count]}
						<Badge variant="outline" class="flex items-center gap-1">
							<span>{typeIcons[type as keyof typeof typeIcons] || '📝'}</span>
							<span class="capitalize {typeColors[type as keyof typeof typeColors] || ''}"
								>{type}</span
							>
							<span class="text-muted-foreground">({count})</span>
						</Badge>
					{/each}
				</div>
			</div>
		</CardContent>
	</Card>
{/if}

<button
	class="mb-4 flex items-center gap-1 rounded bg-blue-100 px-3 py-1 text-xs text-blue-800 transition-colors hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:hover:bg-blue-900/50"
	onclick={() => (showStats = !showStats)}
>
	<TrendingUp class="h-3 w-3" />
	{showStats ? 'Hide' : 'Show'} Statistics
</button>

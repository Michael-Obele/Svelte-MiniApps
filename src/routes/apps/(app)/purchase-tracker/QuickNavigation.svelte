<script lang="ts">
	import { Button } from '@/ui/button';
	import { Card } from '@/ui/card';
	import { Calendar, Filter, TrendingUp } from '@lucide/svelte';

	interface Props {
		onFilterChange?: (filter: string) => void;
		activeFilter?: string;
	}

	let { onFilterChange, activeFilter = 'all' }: Props = $props();

	const timeFilters = [
		{ id: 'all', label: 'All Time', icon: Calendar },
		{ id: 'week', label: 'This Week', icon: TrendingUp },
		{ id: 'month', label: 'This Month', icon: Filter },
		{ id: 'quarter', label: 'This Quarter', icon: Calendar }
	];

	function handleFilterClick(filterId: string) {
		if (onFilterChange) {
			onFilterChange(filterId);
		}
	}
</script>

<Card>
	<div class="p-4">
		<h2 class="text-muted-foreground mb-3 text-sm font-semibold">Quick Filters</h2>
		<div class="flex flex-wrap gap-2">
			{#each timeFilters as filter}
				<Button
					variant={activeFilter === filter.id ? 'default' : 'outline'}
					size="sm"
					onclick={() => handleFilterClick(filter.id)}
					class="flex items-center gap-2"
				>
					<filter.icon class="h-3 w-3" />
					{filter.label}
				</Button>
			{/each}
		</div>
	</div>
</Card>

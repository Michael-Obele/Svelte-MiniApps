<script lang="ts">
	import { Package, History, Cloud, Loader2, HelpCircle, RefreshCw } from '@lucide/svelte';
	import { Button } from '@/ui/button';

	interface Props {
		activeTab: 'items' | 'purchases';
		isAuthenticated: boolean;
		isBackingUp: boolean;
		isRefreshing?: boolean;
		onTabChange?: (tab: 'items' | 'purchases') => void;
		onHelpClick?: () => void;
		onBackupClick?: () => void;
		onRefreshClick?: () => void;
	}

	let {
		activeTab = $bindable('items'),
		isAuthenticated,
		isBackingUp,
		isRefreshing = false,
		onTabChange,
		onHelpClick,
		onBackupClick,
		onRefreshClick
	}: Props = $props();

	function handleTabChange(tab: 'items' | 'purchases') {
		activeTab = tab;
		onTabChange?.(tab);
	}
</script>

<div class="mb-8 flex flex-col items-start justify-between gap-4 sm:items-center md:flex-row">
	<div>
		<h1 class="text-3xl font-bold text-gray-900 dark:text-white">Purchase Tracker</h1>
		<p class="mt-1 text-gray-600 dark:text-gray-400">Track items and record purchases over time</p>
	</div>
	<div class="flex flex-wrap gap-2 space-y-2 space-x-2 md:flex-nowrap md:space-y-0">
		<Button
			variant={activeTab === 'items' ? 'default' : 'outline'}
			onclick={() => handleTabChange('items')}
			class="sm:min-w-0 sm:flex-1 md:flex-none"
		>
			<Package class="mr-2 h-4 w-4 flex-shrink-0" />
			<span class="truncate">Items</span>
		</Button>
		<Button
			variant={activeTab === 'purchases' ? 'default' : 'outline'}
			onclick={() => handleTabChange('purchases')}
			class="sm:min-w-0 sm:flex-1 md:flex-none"
		>
			<History class="mr-2 h-4 w-4 flex-shrink-0" />
			<span class="truncate">Purchase History</span>
		</Button>
		<Button variant="outline" onclick={onHelpClick} class="sm:min-w-0 sm:flex-1 md:flex-none">
			<HelpCircle class="mr-2 h-4 w-4 flex-shrink-0" />
			<span class="truncate">How to Use</span>
		</Button>
		{#if isAuthenticated}
			<Button
				variant="outline"
				onclick={onRefreshClick}
				disabled={isRefreshing}
				class="sm:min-w-0 sm:flex-1 md:flex-none"
				title="Refresh data from server"
			>
				{#if isRefreshing}
					<Loader2 class="mr-2 h-4 w-4 flex-shrink-0 animate-spin" />
					<span class="truncate">Refreshing...</span>
				{:else}
					<RefreshCw class="mr-2 h-4 w-4 flex-shrink-0" />
					<span class="truncate">Refresh</span>
				{/if}
			</Button>
			<Button
				variant="outline"
				onclick={onBackupClick}
				disabled={isBackingUp}
				class="sm:min-w-0 sm:flex-1 md:flex-none"
			>
				{#if isBackingUp}
					<Loader2 class="mr-2 h-4 w-4 flex-shrink-0 animate-spin" />
					<span class="truncate">Backing up...</span>
				{:else}
					<Cloud class="mr-2 h-4 w-4 flex-shrink-0" />
					<span class="truncate">Backup</span>
				{/if}
			</Button>
		{/if}
	</div>
</div>

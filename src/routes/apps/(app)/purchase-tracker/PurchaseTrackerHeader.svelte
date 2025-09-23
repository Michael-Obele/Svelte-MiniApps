<script lang="ts">
	import { Package, History, Cloud, Loader2, HelpCircle } from '@lucide/svelte';
	import { Button } from '@/ui/button';

	interface Props {
		activeTab: 'items' | 'purchases';
		isAuthenticated: boolean;
		isBackingUp: boolean;
		onTabChange?: (tab: 'items' | 'purchases') => void;
		onHelpClick?: () => void;
		onBackupClick?: () => void;
	}

	let { activeTab = $bindable('items'), isAuthenticated, isBackingUp, onTabChange, onHelpClick, onBackupClick }: Props = $props();

	function handleTabChange(tab: 'items' | 'purchases') {
		activeTab = tab;
		onTabChange?.(tab);
	}
</script>

<div class="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row sm:items-center">
	<div>
		<h1 class="text-3xl font-bold text-gray-900 dark:text-white">Purchase Tracker</h1>
		<p class="mt-1 text-gray-600 dark:text-gray-400">
			Track items and record purchases over time
		</p>
	</div>
	<div class="gap-2 flex space-x-2 space-y-2 md:flex-nowrap md:space-y-0 flex-wrap">
		<Button
			variant={activeTab === 'items' ? 'default' : 'outline'}
			onclick={() => handleTabChange('items')}
			class="sm:flex-1 sm:min-w-0 md:flex-none"
		>
			<Package class="mr-2 h-4 w-4 flex-shrink-0" />
			<span class="truncate">Items</span>
		</Button>
		<Button
			variant={activeTab === 'purchases' ? 'default' : 'outline'}
			onclick={() => handleTabChange('purchases')}
			class="sm:flex-1 sm:min-w-0 md:flex-none"
		>
			<History class="mr-2 h-4 w-4 flex-shrink-0" />
			<span class="truncate">Purchase History</span>
		</Button>
		<Button variant="outline" onclick={onHelpClick} class="sm:flex-1 sm:min-w-0 md:flex-none">
			<HelpCircle class="mr-2 h-4 w-4 flex-shrink-0" />
			<span class="truncate">How to Use</span>
		</Button>
		{#if isAuthenticated}
			<Button variant="outline" onclick={onBackupClick} disabled={isBackingUp} class="sm:flex-1 sm:min-w-0 md:flex-none md:ml-4">
				{#if isBackingUp}
					<Loader2 class="mr-2 h-4 w-4 animate-spin flex-shrink-0" />
					<span class="truncate">Backing up...</span>
				{:else}
					<Cloud class="mr-2 h-4 w-4 flex-shrink-0" />
					<span class="truncate">Backup</span>
				{/if}
			</Button>
		{/if}
	</div>
</div>
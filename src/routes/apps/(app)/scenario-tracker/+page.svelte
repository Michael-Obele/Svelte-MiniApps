<script lang="ts">
	import { onMount } from 'svelte';
	import RouteHead from '$lib/components/blocks/RouteHead.svelte';
	import HowToUseDialog from '@/ui/HowToUseDialog.svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import {
		LayoutDashboard,
		Target,
		Calendar,
		AlertTriangle,
		Plus,
		Save,
		RotateCcw
	} from 'lucide-svelte';

	import Dashboard from './Dashboard.svelte';
	import OptionDetail from './OptionDetail.svelte';
	import Timeline from './Timeline.svelte';
	import Risks from './Risks.svelte';
	import { scenarioTrackerHowToUse } from './how-to-use-config';
	import { PersistedState } from 'runed';

	import {
		options,
		initializeDefaultOptions,
		addOption,
		deleteOption,
		timelineEntries,
		risks
	} from './stores.svelte';

	let activeTab = $state('dashboard');
	let showAddOptionDialog = $state(false);
	let showResetDialog = $state(false);
	let showHowToUseDialog = $state(false);

	// Track if user has seen the guide
	const hasSeenGuide = new PersistedState<boolean>(scenarioTrackerHowToUse.storageKey, false);

	// New option form
	let newOptionForm = $state({
		name: '',
		description: '',
		color: 'bg-emerald-500',
		allocation: 10
	});

	const colorOptions = [
		{ value: 'bg-blue-500', label: 'Blue' },
		{ value: 'bg-amber-500', label: 'Amber' },
		{ value: 'bg-purple-500', label: 'Purple' },
		{ value: 'bg-emerald-500', label: 'Emerald' },
		{ value: 'bg-rose-500', label: 'Rose' },
		{ value: 'bg-cyan-500', label: 'Cyan' },
		{ value: 'bg-orange-500', label: 'Orange' },
		{ value: 'bg-indigo-500', label: 'Indigo' }
	];

	onMount(() => {
		initializeDefaultOptions();
		// Show guide on first visit
		if (!hasSeenGuide.current) {
			showHowToUseDialog = true;
		}
	});

	function handleAddOption() {
		addOption(
			newOptionForm.name,
			newOptionForm.description,
			newOptionForm.color,
			newOptionForm.allocation
		);
		newOptionForm = {
			name: '',
			description: '',
			color: 'bg-emerald-500',
			allocation: 10
		};
		showAddOptionDialog = false;
	}

	function handleReset() {
		if (
			confirm(
				'This will delete ALL your data including options, activities, timeline entries, and risks. Are you absolutely sure?'
			)
		) {
			options.current = [];
			timelineEntries.current = [];
			risks.current = [];
			initializeDefaultOptions();
			showResetDialog = false;
		}
	}

	function handleDeleteOption(optionId: string) {
		if (
			confirm(
				'Are you sure you want to delete this option? All related activities and risks will also be deleted.'
			)
		) {
			deleteOption(optionId);
			if (activeTab === optionId) {
				activeTab = 'dashboard';
			}
		}
	}
</script>

<RouteHead
	title="Scenario Tracker"
	description="Track multiple life/career options with time investments, progress metrics, and risks over a 10-year planning horizon."
/>

<div class="container mx-auto max-w-7xl space-y-6 p-4">
	<!-- Header -->
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Scenario Tracker</h1>
			<p class="text-muted-foreground">
				Plan your future: track options, investments, and risks over your 10-year horizon
			</p>
		</div>
		<div class="flex gap-2">
			<Button variant="outline" onclick={() => (showHowToUseDialog = true)}>Help</Button>
			<Button variant="outline" onclick={() => (showResetDialog = true)}>
				<RotateCcw class="mr-2 size-4" />
				Reset
			</Button>
			<Button onclick={() => (showAddOptionDialog = true)}>
				<Plus class="mr-2 size-4" />
				Add Option
			</Button>
		</div>
	</div>

	<!-- Main Tabs -->
	<Tabs.Root bind:value={activeTab}>
		<Tabs.List class="flex flex-wrap gap-1">
			<Tabs.Trigger value="dashboard" class="flex items-center gap-2">
				<LayoutDashboard class="size-4" />
				<span class="hidden sm:inline">Dashboard</span>
			</Tabs.Trigger>
			{#each options.current as option (option.id)}
				<Tabs.Trigger value={option.id} class="flex items-center gap-2">
					<div class="{option.color} size-3 rounded-full"></div>
					<span class="hidden sm:inline">{option.name}</span>
					<span class="sm:hidden">{option.name.slice(0, 8)}...</span>
				</Tabs.Trigger>
			{/each}
			<Tabs.Trigger value="timeline" class="flex items-center gap-2">
				<Calendar class="size-4" />
				<span class="hidden sm:inline">Timeline</span>
			</Tabs.Trigger>
			<Tabs.Trigger value="risks" class="flex items-center gap-2">
				<AlertTriangle class="size-4" />
				<span class="hidden sm:inline">Risks</span>
			</Tabs.Trigger>
		</Tabs.List>

		<div class="mt-6">
			<Tabs.Content value="dashboard">
				<Dashboard />
			</Tabs.Content>

			{#each options.current as option (option.id)}
				<Tabs.Content value={option.id}>
					<div class="mb-4 flex justify-end">
						<Button variant="destructive" size="sm" onclick={() => handleDeleteOption(option.id)}>
							Delete Option
						</Button>
					</div>
					<OptionDetail optionId={option.id} />
				</Tabs.Content>
			{/each}

			<Tabs.Content value="timeline">
				<Timeline />
			</Tabs.Content>

			<Tabs.Content value="risks">
				<Risks />
			</Tabs.Content>
		</div>
	</Tabs.Root>
</div>

<!-- Add Option Dialog -->
<Dialog.Root bind:open={showAddOptionDialog}>
	<Dialog.Content class="sm:max-w-[500px]">
		<Dialog.Header>
			<Dialog.Title>Add New Option</Dialog.Title>
			<Dialog.Description>Create a new scenario option to track.</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="space-y-2">
				<Label for="optionName">Name</Label>
				<Input
					id="optionName"
					bind:value={newOptionForm.name}
					placeholder="e.g., Start a Business"
				/>
			</div>
			<div class="space-y-2">
				<Label for="optionDescription">Description</Label>
				<Textarea
					id="optionDescription"
					bind:value={newOptionForm.description}
					placeholder="Brief description of this option"
					rows={2}
				/>
			</div>
			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label>Color</Label>
					<div class="flex flex-wrap gap-2">
						{#each colorOptions as color (color.value)}
							<button
								type="button"
								class="{color.value} size-8 rounded-full ring-2 ring-offset-2 transition-all {newOptionForm.color ===
								color.value
									? 'ring-primary'
									: 'ring-transparent'}"
								onclick={() => (newOptionForm.color = color.value)}
								aria-label="Select {color.label} color"
							></button>
						{/each}
					</div>
				</div>
				<div class="space-y-2">
					<Label for="allocation">Allocation (%)</Label>
					<Input
						id="allocation"
						type="number"
						min="0"
						max="100"
						bind:value={newOptionForm.allocation}
					/>
				</div>
			</div>
		</div>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (showAddOptionDialog = false)}>Cancel</Button>
			<Button onclick={handleAddOption} disabled={!newOptionForm.name}>
				<Save class="mr-2 size-4" />
				Add Option
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Reset Confirmation Dialog -->
<Dialog.Root bind:open={showResetDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Reset All Data?</Dialog.Title>
			<Dialog.Description>
				This will permanently delete all your options, activities, timeline entries, and risks. The
				default options will be restored. This action cannot be undone.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (showResetDialog = false)}>Cancel</Button>
			<Button variant="destructive" onclick={handleReset}>Yes, Reset Everything</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- How To Use Dialog -->
<HowToUseDialog
	bind:open={showHowToUseDialog}
	onClose={() => (hasSeenGuide.current = true)}
	title={scenarioTrackerHowToUse.title}
	description={scenarioTrackerHowToUse.description}
	tabs={scenarioTrackerHowToUse.tabs}
	showFooterHelpText={scenarioTrackerHowToUse.showFooterHelpText}
/>

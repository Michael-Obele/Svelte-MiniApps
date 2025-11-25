<script lang="ts">
	import type { TimelineEntry } from './types';
	import { formatDate } from './types';
	import {
		options,
		timelineEntries,
		addTimelineEntry,
		updateTimelineEntry,
		deleteTimelineEntry
	} from './stores.svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Checkbox } from '@/ui/checkbox';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Badge } from '$lib/components/ui/badge';
	import { Plus, Pencil, Trash2, Calendar, Save } from 'lucide-svelte';

	// Dialog states
	let showEntryDialog = $state(false);
	let editingEntry = $state<TimelineEntry | null>(null);

	// Form states
	let entryForm = $state({
		optionsWorked: [] as string[],
		timeAllocation: {} as Record<string, number>,
		outcomes: '',
		adjustments: ''
	});

	function openAddEntryDialog() {
		editingEntry = null;
		entryForm = {
			optionsWorked: [],
			timeAllocation: {},
			outcomes: '',
			adjustments: ''
		};
		showEntryDialog = true;
	}

	function openEditEntryDialog(entry: TimelineEntry) {
		editingEntry = entry;
		entryForm = {
			optionsWorked: [...entry.optionsWorked],
			timeAllocation: { ...entry.timeAllocation },
			outcomes: entry.outcomes,
			adjustments: entry.adjustments
		};
		showEntryDialog = true;
	}

	function toggleOption(optionId: string) {
		if (entryForm.optionsWorked.includes(optionId)) {
			entryForm.optionsWorked = entryForm.optionsWorked.filter((id) => id !== optionId);
			delete entryForm.timeAllocation[optionId];
			entryForm.timeAllocation = { ...entryForm.timeAllocation };
		} else {
			entryForm.optionsWorked = [...entryForm.optionsWorked, optionId];
			entryForm.timeAllocation[optionId] = 0;
		}
	}

	function saveEntry() {
		if (editingEntry) {
			updateTimelineEntry(editingEntry.id, entryForm);
		} else {
			addTimelineEntry(
				entryForm.optionsWorked,
				entryForm.timeAllocation,
				entryForm.outcomes,
				entryForm.adjustments
			);
		}
		showEntryDialog = false;
	}

	function handleDeleteEntry(entryId: string) {
		if (confirm('Are you sure you want to delete this timeline entry?')) {
			deleteTimelineEntry(entryId);
		}
	}

	function getOptionName(optionId: string): string {
		return options.current.find((o) => o.id === optionId)?.name ?? 'Unknown';
	}

	function getOptionColor(optionId: string): string {
		return options.current.find((o) => o.id === optionId)?.color ?? 'bg-slate-500';
	}

	// Sort entries by date (newest first)
	let sortedEntries = $derived(
		timelineEntries.current
			.slice()
			.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
	);
</script>

<div class="space-y-6">
	<Card.Root>
		<Card.Header>
			<div class="flex items-center justify-between">
				<div>
					<Card.Title class="flex items-center gap-2">
						<Calendar class="size-5" />
						Timeline Log
					</Card.Title>
					<Card.Description>Track your daily/weekly progress across all options</Card.Description>
				</div>
				<Button onclick={openAddEntryDialog}>
					<Plus class="mr-2 size-4" />
					Add Entry
				</Button>
			</div>
		</Card.Header>
		<Card.Content>
			{#if sortedEntries.length > 0}
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Date</Table.Head>
							<Table.Head>Options Worked</Table.Head>
							<Table.Head>Time Allocation</Table.Head>
							<Table.Head>Outcomes</Table.Head>
							<Table.Head>Adjustments</Table.Head>
							<Table.Head class="w-[100px]">Actions</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each sortedEntries as entry (entry.id)}
							<Table.Row>
								<Table.Cell class="font-medium">
									{formatDate(entry.date)}
								</Table.Cell>
								<Table.Cell>
									<div class="flex flex-wrap gap-1">
										{#each entry.optionsWorked as optionId (optionId)}
											<Badge class={getOptionColor(optionId)}>
												{getOptionName(optionId)}
											</Badge>
										{/each}
									</div>
								</Table.Cell>
								<Table.Cell>
									<div class="space-y-1 text-sm">
										{#each Object.entries(entry.timeAllocation) as [optionId, percentage] (optionId)}
											<div class="flex items-center gap-1">
												<div class="{getOptionColor(optionId)} size-2 rounded-full"></div>
												<span>{getOptionName(optionId)}: {percentage}%</span>
											</div>
										{/each}
									</div>
								</Table.Cell>
								<Table.Cell>
									<p class="max-w-[200px] truncate text-sm" title={entry.outcomes}>
										{entry.outcomes || '-'}
									</p>
								</Table.Cell>
								<Table.Cell>
									<p class="max-w-[200px] truncate text-sm" title={entry.adjustments}>
										{entry.adjustments || '-'}
									</p>
								</Table.Cell>
								<Table.Cell>
									<div class="flex gap-1">
										<Button variant="ghost" size="icon" onclick={() => openEditEntryDialog(entry)}>
											<Pencil class="size-4" />
										</Button>
										<Button variant="ghost" size="icon" onclick={() => handleDeleteEntry(entry.id)}>
											<Trash2 class="size-4" />
										</Button>
									</div>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			{:else}
				<div class="text-muted-foreground py-8 text-center">
					<p>No timeline entries yet.</p>
					<p class="text-sm">Start tracking your weekly progress by adding an entry.</p>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</div>

<!-- Timeline Entry Dialog -->
<Dialog.Root bind:open={showEntryDialog}>
	<Dialog.Content class="sm:max-w-[600px]">
		<Dialog.Header>
			<Dialog.Title>{editingEntry ? 'Edit Timeline Entry' : 'Add Timeline Entry'}</Dialog.Title>
			<Dialog.Description>
				{editingEntry ? 'Update the entry details.' : 'Log your progress for this period.'}
			</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<!-- Options Selection -->
			<div class="space-y-2">
				<Label>Options Worked On</Label>
				<div class="grid gap-2">
					{#each options.current as option (option.id)}
						<div class="flex items-center gap-3 rounded-lg border p-3">
							<Checkbox
								checked={entryForm.optionsWorked.includes(option.id)}
								onCheckedChange={() => toggleOption(option.id)}
							/>
							<div class="{option.color} size-3 rounded-full"></div>
							<span class="flex-1">{option.name}</span>
							{#if entryForm.optionsWorked.includes(option.id)}
								<div class="flex items-center gap-2">
									<Input
										type="number"
										min="0"
										max="100"
										class="w-20"
										value={entryForm.timeAllocation[option.id] ?? 0}
										oninput={(e) => {
											const target = e.target as HTMLInputElement;
											entryForm.timeAllocation[option.id] = parseInt(target.value) || 0;
										}}
									/>
									<span class="text-muted-foreground text-sm">%</span>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>

			<div class="space-y-2">
				<Label for="outcomes">Outcomes</Label>
				<Textarea
					id="outcomes"
					bind:value={entryForm.outcomes}
					placeholder="What did you accomplish?"
					rows={2}
				/>
			</div>

			<div class="space-y-2">
				<Label for="adjustments">Adjustments/Notes</Label>
				<Textarea
					id="adjustments"
					bind:value={entryForm.adjustments}
					placeholder="Any changes to your strategy?"
					rows={2}
				/>
			</div>
		</div>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (showEntryDialog = false)}>Cancel</Button>
			<Button onclick={saveEntry}>
				<Save class="mr-2 size-4" />
				{editingEntry ? 'Update' : 'Add'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

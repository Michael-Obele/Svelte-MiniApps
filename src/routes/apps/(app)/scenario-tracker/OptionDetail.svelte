<script lang="ts">
	import type { Option, Activity, Status } from './types';
	import { formatDate, getStatusColor } from './types';
	import {
		options,
		risks,
		updateOption,
		addActivity,
		updateActivity,
		deleteActivity,
		getRisksByOption
	} from './stores.svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Progress } from '@/ui/progress';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Select from '$lib/components/ui/select';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Badge } from '$lib/components/ui/badge';
	import {
		Plus,
		Pencil,
		Trash2,
		Clock,
		Target,
		TrendingUp,
		AlertTriangle,
		Save
	} from 'lucide-svelte';

	interface Props {
		optionId: string;
	}

	let { optionId }: Props = $props();

	let option = $derived(options.current.find((o) => o.id === optionId));
	let optionRisks = $derived(getRisksByOption(optionId));

	// Dialog states
	let showActivityDialog = $state(false);
	let showEditOptionDialog = $state(false);
	let editingActivity = $state<Activity | null>(null);

	// Form states
	let activityForm = $state({
		description: '',
		timeSpent: 0,
		progressMetric: '',
		status: 'active' as Status,
		notes: ''
	});

	let optionForm = $state({
		name: '',
		description: '',
		allocation: 0,
		progress: 0,
		estimatedTimeToCompletion: ''
	});

	// Status options for select
	const statusOptions: { value: Status; label: string }[] = [
		{ value: 'planning', label: 'Planning' },
		{ value: 'active', label: 'Active' },
		{ value: 'paused', label: 'Paused' },
		{ value: 'complete', label: 'Complete' }
	];

	function openEditOptionDialog() {
		if (option) {
			optionForm = {
				name: option.name,
				description: option.description,
				allocation: option.allocation,
				progress: option.progress,
				estimatedTimeToCompletion: option.estimatedTimeToCompletion
			};
			showEditOptionDialog = true;
		}
	}

	function saveOption() {
		if (option) {
			updateOption(option.id, optionForm);
			showEditOptionDialog = false;
		}
	}

	function openAddActivityDialog() {
		editingActivity = null;
		activityForm = {
			description: '',
			timeSpent: 0,
			progressMetric: '',
			status: 'active',
			notes: ''
		};
		showActivityDialog = true;
	}

	function openEditActivityDialog(activity: Activity) {
		editingActivity = activity;
		activityForm = {
			description: activity.description,
			timeSpent: activity.timeSpent,
			progressMetric: activity.progressMetric,
			status: activity.status,
			notes: activity.notes
		};
		showActivityDialog = true;
	}

	function saveActivity() {
		if (!option) return;

		if (editingActivity) {
			updateActivity(option.id, editingActivity.id, activityForm);
		} else {
			addActivity(
				option.id,
				activityForm.description,
				activityForm.timeSpent,
				activityForm.progressMetric,
				activityForm.status,
				activityForm.notes
			);
		}
		showActivityDialog = false;
	}

	function handleDeleteActivity(activityId: string) {
		if (option && confirm('Are you sure you want to delete this activity?')) {
			deleteActivity(option.id, activityId);
		}
	}

	// Sort activities by date (newest first)
	let sortedActivities = $derived(
		option?.activities
			.slice()
			.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) ?? []
	);
</script>

{#if option}
	<div class="space-y-6">
		<!-- Option Header Card -->
		<Card.Root>
			<Card.Header>
				<div class="flex items-start justify-between">
					<div class="flex items-center gap-3">
						<div class="{option.color} size-4 rounded-full"></div>
						<div>
							<Card.Title class="text-xl">{option.name}</Card.Title>
							<Card.Description>{option.description}</Card.Description>
						</div>
					</div>
					<Button variant="outline" size="sm" onclick={openEditOptionDialog}>
						<Pencil class="mr-2 size-4" />
						Edit
					</Button>
				</div>
			</Card.Header>
			<Card.Content>
				<div class="grid gap-4 md:grid-cols-4">
					<div class="flex items-center gap-2">
						<Clock class="text-muted-foreground size-4" />
						<div>
							<p class="text-sm font-medium">{option.totalTimeSpent} hrs</p>
							<p class="text-muted-foreground text-xs">Time Invested</p>
						</div>
					</div>
					<div class="flex items-center gap-2">
						<Target class="text-muted-foreground size-4" />
						<div>
							<p class="text-sm font-medium">{option.allocation}%</p>
							<p class="text-muted-foreground text-xs">Allocation</p>
						</div>
					</div>
					<div class="flex items-center gap-2">
						<TrendingUp class="text-muted-foreground size-4" />
						<div>
							<p class="text-sm font-medium">{option.progress}%</p>
							<p class="text-muted-foreground text-xs">Progress</p>
						</div>
					</div>
					<div class="flex items-center gap-2">
						<AlertTriangle class="text-muted-foreground size-4" />
						<div>
							<p class="text-sm font-medium">{optionRisks.length}</p>
							<p class="text-muted-foreground text-xs">Risks</p>
						</div>
					</div>
				</div>
				<div class="mt-4">
					<Progress
						value={option.progress}
						class="h-3"
						classInner="{option.color.replace('bg-', 'bg-')} transition-all"
					/>
					<p class="text-muted-foreground mt-1 text-xs">
						Est. completion: {option.estimatedTimeToCompletion}
					</p>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Activities Table -->
		<Card.Root>
			<Card.Header>
				<div class="flex items-center justify-between">
					<div>
						<Card.Title>Activity Log</Card.Title>
						<Card.Description>Track your work sessions and progress</Card.Description>
					</div>
					<Button onclick={openAddActivityDialog}>
						<Plus class="mr-2 size-4" />
						Add Activity
					</Button>
				</div>
			</Card.Header>
			<Card.Content>
				{#if sortedActivities.length > 0}
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>Date</Table.Head>
								<Table.Head>Description</Table.Head>
								<Table.Head>Time</Table.Head>
								<Table.Head>Progress</Table.Head>
								<Table.Head>Status</Table.Head>
								<Table.Head class="w-[100px]">Actions</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each sortedActivities as activity (activity.id)}
								<Table.Row>
									<Table.Cell class="font-medium">
										{formatDate(activity.date)}
									</Table.Cell>
									<Table.Cell>
										<div>
											<p>{activity.description}</p>
											{#if activity.notes}
												<p class="text-muted-foreground text-xs">{activity.notes}</p>
											{/if}
										</div>
									</Table.Cell>
									<Table.Cell>{activity.timeSpent} hrs</Table.Cell>
									<Table.Cell>{activity.progressMetric}</Table.Cell>
									<Table.Cell>
										<Badge class={getStatusColor(activity.status)}>
											{activity.status}
										</Badge>
									</Table.Cell>
									<Table.Cell>
										<div class="flex gap-1">
											<Button
												variant="ghost"
												size="icon"
												onclick={() => openEditActivityDialog(activity)}
											>
												<Pencil class="size-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												onclick={() => handleDeleteActivity(activity.id)}
											>
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
						<p>No activities logged yet.</p>
						<p class="text-sm">Start tracking your work by adding an activity.</p>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Activity Dialog -->
	<Dialog.Root bind:open={showActivityDialog}>
		<Dialog.Content class="sm:max-w-[500px]">
			<Dialog.Header>
				<Dialog.Title>{editingActivity ? 'Edit Activity' : 'Add Activity'}</Dialog.Title>
				<Dialog.Description>
					{editingActivity
						? 'Update the activity details.'
						: 'Log a new work session or milestone.'}
				</Dialog.Description>
			</Dialog.Header>
			<div class="grid gap-4 py-4">
				<div class="space-y-2">
					<Label for="description">Description</Label>
					<Input
						id="description"
						bind:value={activityForm.description}
						placeholder="What did you work on?"
					/>
				</div>
				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="timeSpent">Time Spent (hours)</Label>
						<Input
							id="timeSpent"
							type="number"
							min="0"
							step="0.5"
							bind:value={activityForm.timeSpent}
						/>
					</div>
					<div class="space-y-2">
						<Label for="status">Status</Label>
						<Select.Root
							type="single"
							value={activityForm.status}
							onValueChange={(val) => {
								if (val) activityForm.status = val as Status;
							}}
						>
							<Select.Trigger class="w-full">
								{statusOptions.find((s) => s.value === activityForm.status)?.label ??
									'Select status'}
							</Select.Trigger>
							<Select.Content>
								{#each statusOptions as status (status.value)}
									<Select.Item value={status.value}>{status.label}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>
				</div>
				<div class="space-y-2">
					<Label for="progressMetric">Progress Metric</Label>
					<Input
						id="progressMetric"
						bind:value={activityForm.progressMetric}
						placeholder="e.g., $500 earned, 2 certs completed"
					/>
				</div>
				<div class="space-y-2">
					<Label for="notes">Notes (optional)</Label>
					<Textarea
						id="notes"
						bind:value={activityForm.notes}
						placeholder="Additional notes or observations"
						rows={3}
					/>
				</div>
			</div>
			<Dialog.Footer>
				<Button variant="outline" onclick={() => (showActivityDialog = false)}>Cancel</Button>
				<Button onclick={saveActivity}>
					<Save class="mr-2 size-4" />
					{editingActivity ? 'Update' : 'Add'}
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>

	<!-- Edit Option Dialog -->
	<Dialog.Root bind:open={showEditOptionDialog}>
		<Dialog.Content class="sm:max-w-[500px]">
			<Dialog.Header>
				<Dialog.Title>Edit Option</Dialog.Title>
				<Dialog.Description>Update the option settings and targets.</Dialog.Description>
			</Dialog.Header>
			<div class="grid gap-4 py-4">
				<div class="space-y-2">
					<Label for="optionName">Name</Label>
					<Input id="optionName" bind:value={optionForm.name} />
				</div>
				<div class="space-y-2">
					<Label for="optionDescription">Description</Label>
					<Textarea id="optionDescription" bind:value={optionForm.description} rows={2} />
				</div>
				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="optionAllocation">Allocation (%)</Label>
						<Input
							id="optionAllocation"
							type="number"
							min="0"
							max="100"
							bind:value={optionForm.allocation}
						/>
					</div>
					<div class="space-y-2">
						<Label for="optionProgress">Progress (%)</Label>
						<Input
							id="optionProgress"
							type="number"
							min="0"
							max="100"
							bind:value={optionForm.progress}
						/>
					</div>
				</div>
				<div class="space-y-2">
					<Label for="optionEst">Est. Time to Completion</Label>
					<Input
						id="optionEst"
						bind:value={optionForm.estimatedTimeToCompletion}
						placeholder="e.g., 2-4 years"
					/>
				</div>
			</div>
			<Dialog.Footer>
				<Button variant="outline" onclick={() => (showEditOptionDialog = false)}>Cancel</Button>
				<Button onclick={saveOption}>
					<Save class="mr-2 size-4" />
					Save Changes
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
{:else}
	<div class="text-muted-foreground py-8 text-center">
		<p>Option not found.</p>
	</div>
{/if}

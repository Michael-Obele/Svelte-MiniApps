<script lang="ts">
	import type { Risk, Severity } from './types';
	import { formatDate, getSeverityColor } from './types';
	import { options, risks, addRisk, updateRisk, deleteRisk } from './stores.svelte';
	import {
		getScenarioData,
		addScenarioRisk,
		updateScenarioRisk,
		deleteScenarioRisk
	} from '$lib/remote';
	import { toast } from 'svelte-sonner';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Select from '$lib/components/ui/select';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Badge } from '$lib/components/ui/badge';
	import DeleteConfirmationDialog from './DeleteConfirmationDialog.svelte';
	import { Plus, Pencil, Trash2, AlertTriangle, Shield, Save } from 'lucide-svelte';

	interface Props {
		currentUser?: { id: string; username: string; role: string } | null;
	}

	let { currentUser = null }: Props = $props();

	// Dialog states
	let showRiskDialog = $state(false);
	let showDeleteRiskDialog = $state(false);
	let riskToDelete = $state<string | null>(null);
	let editingRisk = $state<Risk | null>(null);

	// Form states
	let riskForm = $state({
		description: '',
		severity: 'medium' as Severity,
		mitigation: '',
		optionId: null as string | null
	});

	// Severity options
	const severityOptions: { value: Severity; label: string }[] = [
		{ value: 'low', label: 'Low' },
		{ value: 'medium', label: 'Medium' },
		{ value: 'high', label: 'High' },
		{ value: 'critical', label: 'Critical' }
	];

	function openAddRiskDialog() {
		editingRisk = null;
		riskForm = {
			description: '',
			severity: 'medium',
			mitigation: '',
			optionId: null
		};
		showRiskDialog = true;
	}

	function openEditRiskDialog(risk: Risk) {
		editingRisk = risk;
		riskForm = {
			description: risk.description,
			severity: risk.severity,
			mitigation: risk.mitigation,
			optionId: risk.optionId
		};
		showRiskDialog = true;
	}

	async function saveRisk() {
		if (currentUser) {
			// Save to server for authenticated users with loading toast
			const saveRiskPromise = async () => {
				if (editingRisk) {
					await updateScenarioRisk({
						id: editingRisk.id,
						description: riskForm.description,
						severity: riskForm.severity,
						mitigation: riskForm.mitigation,
						optionId: riskForm.optionId
					});
				} else {
					await addScenarioRisk({
						description: riskForm.description,
						severity: riskForm.severity,
						mitigation: riskForm.mitigation,
						optionId: riskForm.optionId
					});
				}
				// Reload data from server
				const serverData = await getScenarioData();
				if (serverData) {
					risks.current = serverData.risks.map((risk) => ({
						id: risk.id,
						description: risk.description,
						severity: risk.severity as 'low' | 'medium' | 'high' | 'critical',
						mitigation: risk.mitigation || '',
						optionId: risk.optionId,
						createdAt: risk.createdAt
					}));
				}
			};

			try {
				await toast.promise(saveRiskPromise(), {
					loading: editingRisk ? 'Updating risk...' : 'Adding risk...',
					success: editingRisk ? 'Risk updated' : 'Risk added',
					error: editingRisk ? 'Failed to update risk' : 'Failed to add risk'
				});
			} catch (error) {
				console.error('Failed to save risk:', error);
			}
		} else {
			// Local storage for unauthenticated users
			if (editingRisk) {
				updateRisk(editingRisk.id, riskForm);
			} else {
				addRisk(riskForm.description, riskForm.severity, riskForm.mitigation, riskForm.optionId);
			}
		}
		showRiskDialog = false;
	}

	async function handleDeleteRisk(riskId: string) {
		riskToDelete = riskId;
		showDeleteRiskDialog = true;
	}

	async function confirmDeleteRisk() {
		if (!riskToDelete) return;

		const riskId = riskToDelete;
		riskToDelete = null;
		showDeleteRiskDialog = false;

		if (currentUser) {
			// Delete from server with loading toast
			const deleteRiskPromise = async () => {
				await deleteScenarioRisk(riskId);
				// Reload data from server
				const serverData = await getScenarioData();
				if (serverData) {
					risks.current = serverData.risks.map((risk) => ({
						id: risk.id,
						description: risk.description,
						severity: risk.severity as 'low' | 'medium' | 'high' | 'critical',
						mitigation: risk.mitigation || '',
						optionId: risk.optionId,
						createdAt: risk.createdAt
					}));
				}
			};

			try {
				await toast.promise(deleteRiskPromise(), {
					loading: 'Deleting risk...',
					success: 'Risk deleted',
					error: 'Failed to delete risk'
				});
			} catch (error) {
				console.error('Failed to delete risk:', error);
			}
		} else {
			// Local storage for unauthenticated users
			deleteRisk(riskId);
		}
	}

	function getOptionName(optionId: string | null): string {
		if (!optionId) return 'General';
		return options.current.find((o) => o.id === optionId)?.name ?? 'Unknown';
	}

	function getOptionColor(optionId: string | null): string {
		if (!optionId) return 'bg-slate-500';
		return options.current.find((o) => o.id === optionId)?.color ?? 'bg-slate-500';
	}

	// Group risks by severity
	let criticalRisks = $derived(risks.current.filter((r) => r.severity === 'critical'));
	let highRisks = $derived(risks.current.filter((r) => r.severity === 'high'));
	let mediumRisks = $derived(risks.current.filter((r) => r.severity === 'medium'));
	let lowRisks = $derived(risks.current.filter((r) => r.severity === 'low'));

	// Sort risks by severity (critical first)
	let sortedRisks = $derived([...criticalRisks, ...highRisks, ...mediumRisks, ...lowRisks]);
</script>

<div class="space-y-6">
	<!-- Risk Summary Cards -->
	<div class="grid gap-4 md:grid-cols-4">
		<Card.Root class="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
			<Card.Content class="pt-4">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-2xl font-bold text-red-700 dark:text-red-400">{criticalRisks.length}</p>
						<p class="text-sm text-red-600 dark:text-red-500">Critical</p>
					</div>
					<AlertTriangle class="size-8 text-red-500" />
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950">
			<Card.Content class="pt-4">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-2xl font-bold text-orange-700 dark:text-orange-400">
							{highRisks.length}
						</p>
						<p class="text-sm text-orange-600 dark:text-orange-500">High</p>
					</div>
					<AlertTriangle class="size-8 text-orange-500" />
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
			<Card.Content class="pt-4">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-2xl font-bold text-amber-700 dark:text-amber-400">
							{mediumRisks.length}
						</p>
						<p class="text-sm text-amber-600 dark:text-amber-500">Medium</p>
					</div>
					<Shield class="size-8 text-amber-500" />
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
			<Card.Content class="pt-4">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-2xl font-bold text-green-700 dark:text-green-400">{lowRisks.length}</p>
						<p class="text-sm text-green-600 dark:text-green-500">Low</p>
					</div>
					<Shield class="size-8 text-green-500" />
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Risks Table -->
	<Card.Root>
		<Card.Header>
			<div class="flex items-center justify-between">
				<div>
					<Card.Title class="flex items-center gap-2">
						<AlertTriangle class="size-5" />
						Risks & Assumptions
					</Card.Title>
					<Card.Description>Track and mitigate potential risks to your plans</Card.Description>
				</div>
				<Button onclick={openAddRiskDialog}>
					<Plus class="mr-2 size-4" />
					Add Risk
				</Button>
			</div>
		</Card.Header>
		<Card.Content>
			{#if sortedRisks.length > 0}
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Severity</Table.Head>
							<Table.Head>Option</Table.Head>
							<Table.Head>Description</Table.Head>
							<Table.Head>Mitigation</Table.Head>
							<Table.Head>Added</Table.Head>
							<Table.Head class="w-[100px]">Actions</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each sortedRisks as risk (risk.id)}
							<Table.Row>
								<Table.Cell>
									<Badge class={getSeverityColor(risk.severity)}>
										{risk.severity}
									</Badge>
								</Table.Cell>
								<Table.Cell>
									<div class="flex items-center gap-2">
										<div class="{getOptionColor(risk.optionId)} size-2 rounded-full"></div>
										<span class="text-sm">{getOptionName(risk.optionId)}</span>
									</div>
								</Table.Cell>
								<Table.Cell>
									<p class="max-w-[200px]" title={risk.description}>
										{risk.description}
									</p>
								</Table.Cell>
								<Table.Cell>
									<p class="max-w-[200px] text-sm" title={risk.mitigation}>
										{risk.mitigation || '-'}
									</p>
								</Table.Cell>
								<Table.Cell class="text-muted-foreground text-sm">
									{formatDate(risk.createdAt)}
								</Table.Cell>
								<Table.Cell>
									<div class="flex gap-1">
										<Button variant="ghost" size="icon" onclick={() => openEditRiskDialog(risk)}>
											<Pencil class="size-4" />
										</Button>
										<Button variant="ghost" size="icon" onclick={() => handleDeleteRisk(risk.id)}>
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
					<p>No risks tracked yet.</p>
					<p class="text-sm">Add risks to keep track of potential challenges.</p>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</div>

<!-- Risk Dialog -->
<Dialog.Root bind:open={showRiskDialog}>
	<Dialog.Content class="sm:max-w-[500px]">
		<Dialog.Header>
			<Dialog.Title>{editingRisk ? 'Edit Risk' : 'Add Risk'}</Dialog.Title>
			<Dialog.Description>
				{editingRisk ? 'Update the risk details.' : 'Document a potential risk or assumption.'}
			</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="space-y-2">
				<Label for="riskDescription">Description</Label>
				<Textarea
					id="riskDescription"
					bind:value={riskForm.description}
					placeholder="Describe the risk or assumption"
					rows={2}
				/>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label>Severity</Label>
					<Select.Root
						type="single"
						value={riskForm.severity}
						onValueChange={(val) => {
							if (val) riskForm.severity = val as Severity;
						}}
					>
						<Select.Trigger class="w-full">
							{severityOptions.find((s) => s.value === riskForm.severity)?.label ??
								'Select severity'}
						</Select.Trigger>
						<Select.Content>
							{#each severityOptions as severity (severity.value)}
								<Select.Item value={severity.value}>{severity.label}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				<div class="space-y-2">
					<Label>Related Option</Label>
					<Select.Root
						type="single"
						value={riskForm.optionId ?? 'general'}
						onValueChange={(val) => {
							riskForm.optionId = val === 'general' ? null : val;
						}}
					>
						<Select.Trigger class="w-full">
							{riskForm.optionId
								? options.current.find((o) => o.id === riskForm.optionId)?.name
								: 'General'}
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="general">General</Select.Item>
							{#each options.current as option (option.id)}
								<Select.Item value={option.id}>{option.name}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
			</div>

			<div class="space-y-2">
				<Label for="mitigation">Mitigation Strategy</Label>
				<Textarea
					id="mitigation"
					bind:value={riskForm.mitigation}
					placeholder="How will you address this risk?"
					rows={3}
				/>
			</div>
		</div>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (showRiskDialog = false)}>Cancel</Button>
			<Button onclick={saveRisk}>
				<Save class="mr-2 size-4" />
				{editingRisk ? 'Update' : 'Add'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Delete Risk Confirmation Dialog -->
<DeleteConfirmationDialog
	open={showDeleteRiskDialog}
	title="Delete Risk"
	description="Are you sure you want to delete this risk? This action cannot be undone."
	onConfirm={confirmDeleteRisk}
	onCancel={() => { showDeleteRiskDialog = false; riskToDelete = null; }}
/>

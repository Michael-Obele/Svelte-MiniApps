<script lang="ts">
	import { Plus, Trash2, CheckCircle2, Circle, Calendar, XCircle, Pill } from '@lucide/svelte';
	import { Button } from '@/ui/button';
	import { Input } from '@/ui/input';
	import { Label } from '@/ui/label';
	import { Textarea } from '@/ui/textarea';
	import * as Dialog from '@/ui/dialog';
	import * as AlertDialog from '@/ui/alert-dialog';
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/ui/card';
	import { toast } from 'svelte-sonner';
	import { slide } from 'svelte/transition';
	import { browser } from '$app/environment';

	import * as medState from './states.svelte';
	import type { TreatmentSession } from './states.svelte';

	// Import remote functions
	import { deleteMedicationSession } from '$lib/remote';

	// Props
	let { open = $bindable(false) } = $props();

	// State
	let sessionName = $state('');
	let sessionDescription = $state('');
	let sessionStartDate = $state(new Date().toISOString().split('T')[0]);
	let showDeleteDialog = $state(false);
	let sessionToDelete = $state<TreatmentSession | null>(null);
	let showEditDialog = $state(false);
	let editingSession = $state<TreatmentSession | null>(null);
	let editName = $state('');
	let editDescription = $state('');

	// Load sessions using reactive state
	let allSessions = $derived(browser ? medState.treatmentSessions.current : []);

	// Create new session
	function createSession() {
		if (!sessionName.trim()) {
			toast.error('Please enter a session name');
			return;
		}

		const newSession = medState.createSession(
			sessionName.trim(),
			sessionDescription.trim(),
			new Date(sessionStartDate).toISOString()
		);

		medState.addSession(newSession);
		toast.success('Treatment session created successfully');

		// Reset form
		sessionName = '';
		sessionDescription = '';
		sessionStartDate = new Date().toISOString().split('T')[0];
		open = false;
	}

	// Set active session
	function setActive(sessionId: string) {
		medState.setActiveSession(sessionId);
		toast.success('Active session changed');
	}

	// End session
	function endSession(sessionId: string) {
		medState.updateSession(sessionId, {
			endDate: new Date().toISOString(),
			isActive: false
		});
		toast.success('Session ended');
	}

	// Restart ended session
	function restartSession(sessionId: string) {
		medState.updateSession(sessionId, {
			endDate: undefined,
			isActive: true
		});
		toast.success('Treatment session restarted');
	}

	// Open edit dialog
	// Edit session
	function openEditDialog(session: TreatmentSession) {
		editingSession = session;
		editName = session.name;
		editDescription = session.description || '';
		showEditDialog = true;
	}

	function saveEdits() {
		if (!editingSession || !editName.trim()) {
			toast.error('Please enter a session name');
			return;
		}

		medState.updateSession(editingSession.id, {
			name: editName.trim(),
			description: editDescription.trim()
		});

		toast.success('Session updated successfully');
		showEditDialog = false;
		editingSession = null;
	}

	// Confirm delete
	function confirmDelete(session: TreatmentSession) {
		sessionToDelete = session;
		showDeleteDialog = true;
	}

	// Delete session
	async function deleteSession() {
		if (sessionToDelete) {
			try {
				// Delete from server first
				await deleteMedicationSession({ sessionId: sessionToDelete.id });

				// Then delete from local state
				medState.deleteSession(sessionToDelete.id);
				toast.success('Session deleted');
				sessionToDelete = null;
				showDeleteDialog = false;
			} catch (error) {
				console.error('Failed to delete session:', error);
				toast.error('Failed to delete session. Please try again.');
			}
		}
	}

	// Format date
	function formatDate(isoString: string): string {
		return new Date(isoString).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-h-[90vh] max-w-3xl overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>Treatment Sessions</Dialog.Title>
			<Dialog.Description>
				Manage your treatment sessions. Each session groups medications for a specific treatment
				period.
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-6">
			<!-- Create New Session Form -->
			<Card>
				<CardHeader>
					<CardTitle class="text-lg">Create New Session</CardTitle>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-2">
						<Label for="session-name">Session Name *</Label>
						<Input
							id="session-name"
							bind:value={sessionName}
							placeholder="e.g., Flu Treatment - January 2024"
						/>
					</div>

					<div class="space-y-2">
						<Label for="session-description">Description (optional)</Label>
						<Textarea
							id="session-description"
							bind:value={sessionDescription}
							placeholder="Brief description of this treatment period..."
							rows={3}
						/>
					</div>

					<div class="space-y-2">
						<Label for="session-start">Start Date</Label>
						<Input id="session-start" type="date" bind:value={sessionStartDate} />
					</div>

					<Button onclick={createSession} class="w-full">
						<Plus class="mr-2 size-4" />
						Create Session
					</Button>
				</CardContent>
			</Card>

			<!-- Existing Sessions -->
			<div class="space-y-3">
				<div class="flex items-center justify-between">
					<h3 class="font-semibold text-gray-900 dark:text-white">Your Sessions</h3>
					<span class="text-sm text-gray-500 dark:text-gray-400">
						{allSessions?.length || 0} total
					</span>
				</div>

				{#if allSessions && allSessions.length === 0}
					<Card class="border-dashed">
						<CardContent class="pt-6 pb-6 text-center text-gray-500 dark:text-gray-400">
							No treatment sessions yet. Create one above to get started.
						</CardContent>
					</Card>
				{:else}
					<div class="space-y-3">
						{#each allSessions || [] as session (session.id)}
							<div
								class="cursor-pointer"
								onclick={() => !session.isActive && setActive(session.id)}
								role="button"
								tabindex="0"
								onkeydown={(e) => {
									if ((e.key === 'Enter' || e.key === ' ') && !session.isActive) {
										setActive(session.id);
									}
								}}
								transition:slide
							>
								<Card
									class="relative transition-all hover:shadow-md {session.isActive
										? 'border-primary bg-primary/5 border-l-4'
										: 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'}"
								>
									<CardContent class="py-4">
										{#if session.isActive}
											<div
												class="bg-primary/10 text-primary absolute top-2 right-2 rounded-full px-2 py-1 text-xs font-medium"
											>
												Active
											</div>
										{/if}
										<div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
											<div class="flex-1 pr-16 sm:pr-0">
												<div class="mb-2 flex items-center gap-2">
													{#if session.isActive}
														<CheckCircle2 class="text-primary size-5 flex-shrink-0" />
													{:else}
														<Circle class="size-5 flex-shrink-0 text-gray-400" />
													{/if}
													<h4 class="font-semibold text-gray-900 dark:text-white">
														{session.name}
													</h4>
												</div>

												{#if session.description}
													<p class="mb-2 text-sm text-gray-600 dark:text-gray-400">
														{session.description}
													</p>
												{/if}

												<div
													class="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400"
												>
													<span class="flex items-center gap-1">
														<Calendar class="size-3" />
														{formatDate(session.startDate)}
													</span>
													{#if session.endDate}
														<span class="flex items-center gap-1 text-red-600 dark:text-red-400">
															<XCircle class="size-3" />
															Ended {formatDate(session.endDate)}
														</span>
													{:else}
														<span
															class="flex items-center gap-1 text-green-600 dark:text-green-400"
														>
															<CheckCircle2 class="size-3" />
															Ongoing
														</span>
													{/if}
													<span class="flex items-center gap-1">
														<Pill class="size-3" />
														{session.medications.length} med{session.medications.length !== 1
															? 's'
															: ''}
													</span>
												</div>
											</div>

											<div class="flex flex-wrap gap-2" onclick={(e) => e.stopPropagation()}>
												{#if !session.isActive && !session.endDate}
													<Button
														variant="default"
														size="sm"
														onclick={() => setActive(session.id)}
														class="bg-primary hover:bg-primary/90"
													>
														<CheckCircle2 class="mr-1 size-4" />
														Activate
													</Button>
												{/if}

												{#if session.isActive && !session.endDate}
													<Button
														variant="outline"
														size="sm"
														onclick={() => endSession(session.id)}
													>
														<XCircle class="mr-1 size-4" />
														End
													</Button>
												{/if}

												{#if session.endDate}
													<Button
														variant="outline"
														size="sm"
														onclick={() => restartSession(session.id)}
													>
														<CheckCircle2 class="mr-1 size-4" />
														Restart
													</Button>
												{/if}

												<Button variant="ghost" size="sm" onclick={() => openEditDialog(session)}>
													Edit
												</Button>

												<Button
													variant="ghost"
													size="sm"
													onclick={() => confirmDelete(session)}
													class="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950"
												>
													<Trash2 class="size-4" />
												</Button>
											</div>
										</div>
									</CardContent>
								</Card>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>

<!-- Delete Confirmation Dialog -->
<AlertDialog.Root bind:open={showDeleteDialog}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Delete Treatment Session?</AlertDialog.Title>
			<AlertDialog.Description>
				This will permanently delete "{sessionToDelete?.name}" and all associated medication logs.
				This action cannot be undone.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action onclick={deleteSession}>Delete</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

<!-- Edit Session Dialog -->
<Dialog.Root bind:open={showEditDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Edit Treatment Session</Dialog.Title>
			<Dialog.Description>
				Update the name and description of your treatment session.
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4">
			<div class="space-y-2">
				<Label for="edit-session-name">Session Name *</Label>
				<Input
					id="edit-session-name"
					bind:value={editName}
					placeholder="e.g., Flu Treatment - January 2024"
				/>
			</div>

			<div class="space-y-2">
				<Label for="edit-session-description">Description (optional)</Label>
				<Textarea
					id="edit-session-description"
					bind:value={editDescription}
					placeholder="Brief description of this treatment period..."
					rows={3}
				/>
			</div>
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => (showEditDialog = false)}>Cancel</Button>
			<Button onclick={saveEdits}>Save Changes</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

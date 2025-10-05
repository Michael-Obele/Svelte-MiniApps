<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { fade, slide } from 'svelte/transition';
	import { PersistedState } from 'runed';
	import {
		Plus,
		Pill,
		Calendar,
		Clock,
		CheckCircle2,
		XCircle,
		AlertCircle,
		TrendingUp,
		Activity,
		Settings,
		ChevronRight,
		CalendarDays,
		ListChecks,
		Cloud,
		CloudOff,
		RefreshCw,
		RefreshCcwDot,
		HelpCircle
	} from '@lucide/svelte';

	import RouteHead from '@/blocks/RouteHead.svelte';
	import { Button } from '@/ui/button';
	import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/ui/card';
	import { Badge } from '@/ui/badge';
	import * as Dialog from '@/ui/dialog';
	import * as Tabs from '@/ui/tabs';
	import * as AlertDialog from '@/ui/alert-dialog';
	import * as Tooltip from '@/ui/tooltip';
	import { toast } from 'svelte-sonner';

	// Import state management
	import * as medState from './states.svelte';
	import type { TreatmentSession, Medication, MedicationLog } from './states.svelte';

	// Import remote functions
	import { backupMedicationData, loadMedicationData, syncMedicationData } from '$lib/remote';

	// Component imports
	import SessionManager from './SessionManager.svelte';
	import MedicationList from './MedicationList.svelte';
	import TodayTracker from './TodayTracker.svelte';
	import StatsView from './StatsView.svelte';
	import HistoryView from './HistoryView.svelte';
	import HowToUseDialog from './HowToUseDialog.svelte';

	// Props from load function
	let { data } = $props<{ data: any }>();

	// Authentication and backup state
	let isAuthenticated = $state(!!data.user);
	let hasUnsavedChanges = $state(false);
	let needsBackup = $state(true); // Track if data needs to be backed up
	let isBackingUp = $state(false);
	let showBackupDialog = $state(false);
	let isRefreshing = $state(false);
	let isSyncing = $state(false);
	let autoBackupTimer: ReturnType<typeof setTimeout> | null = null;

	// Reactive state
	// Note: activeSession, todayLogs, upcomingLogs, and stats are now $derived below

	let showSessionDialog = $state(false);
	let showMedicationDialog = $state(false);
	let activeTab = $state('today');
	let showHowToUseDialog = $state(false);

	// Track if user has seen the how-to guide
	let hasSeenGuide = new PersistedState<boolean>('medication-tracker-has-seen-guide', false, {
		storage: 'local'
	});

	// Sync with server data on mount
	onMount(() => {
		// For authenticated users, sync with server data on mount
		if (isAuthenticated && data?.sessions && data.sessions.length > 0) {
			const localSessionsCount = medState.treatmentSessions.current.length;
			const serverSessionsCount = data.sessions.length;

			// If local storage is empty or server has data, sync from server
			if (localSessionsCount === 0 || serverSessionsCount > 0) {
				console.log(
					`🔄 Syncing data from server: ${serverSessionsCount} sessions, ${data.logs?.length || 0} logs`
				);

				medState.treatmentSessions.current = data.sessions.map((session: any) => ({
					...session,
					medications: session.medications || []
				}));

				medState.medicationLogs.current = data.logs || [];

				toast.success('Data synced from server');
				needsBackup = false; // Data just loaded from server
			}
		}

		// Show how-to guide for new users
		if (!hasSeenGuide.current) {
			showHowToUseDialog = true;
		}
	});

	// Auto-backup functionality
	function scheduleAutoBackup() {
		// Clear existing timer
		if (autoBackupTimer) {
			clearTimeout(autoBackupTimer);
		}

		// Only schedule if authenticated and needs backup
		if (isAuthenticated && needsBackup && !isBackingUp) {
			autoBackupTimer = setTimeout(() => {
				handleBackup();
			}, 15000); // 15 seconds
		}
	}

	// Watch for changes to trigger auto-backup
	$effect(() => {
		if (needsBackup) {
			scheduleAutoBackup();
		}
	});

	// Cleanup on component unmount
	onDestroy(() => {
		if (autoBackupTimer) {
			clearTimeout(autoBackupTimer);
		}
	});

	// Load active session and related data - use $derived for computed values
	let activeSession = $derived(medState.getActiveSession());
	let todayLogs = $derived(activeSession ? medState.getTodayLogs(activeSession.id) : []);
	let upcomingLogs = $derived(activeSession ? medState.getUpcomingLogs(activeSession.id, 24) : []);
	let stats = $derived(activeSession ? medState.calculateStats(activeSession.id) : null);

	// Note: hasUnsavedChanges tracking removed to prevent infinite loops
	// In a production app, you'd want to track this more carefully with proper guards

	// Backup to server
	async function handleBackup() {
		if (!isAuthenticated) {
			toast.error('You must be logged in to backup data');
			return;
		}

		isBackingUp = true;

		try {
			await backupMedicationData({
				sessions: medState.treatmentSessions.current,
				logs: medState.medicationLogs.current
			});

			hasUnsavedChanges = false;
			needsBackup = false;
			// Clear auto-backup timer since we just backed up
			if (autoBackupTimer) {
				clearTimeout(autoBackupTimer);
				autoBackupTimer = null;
			}
			toast.success('Data backed up successfully');
		} catch (error) {
			console.error('Backup failed:', error);
			toast.error('Failed to backup data');
		} finally {
			isBackingUp = false;
		}
	}

	// Sync with server
	async function handleSync() {
		if (!isAuthenticated) {
			toast.error('You must be logged in to sync data');
			return;
		}

		isSyncing = true;

		try {
			const syncedData = await syncMedicationData({
				sessions: medState.treatmentSessions.current,
				logs: medState.medicationLogs.current
			});

			medState.treatmentSessions.current = syncedData.sessions;
			medState.medicationLogs.current = syncedData.logs;

			hasUnsavedChanges = false;
			toast.success('Data synced successfully');
		} catch (error) {
			console.error('Sync failed:', error);
			toast.error('Failed to sync data');
		} finally {
			isSyncing = false;
		}
	}

	// Refresh from server
	async function handleRefresh() {
		if (!isAuthenticated) {
			toast.error('You must be logged in to refresh data');
			return;
		}

		isRefreshing = true;

		try {
			const serverData = await loadMedicationData();

			medState.treatmentSessions.current = serverData.sessions;
			medState.medicationLogs.current = serverData.logs;

			hasUnsavedChanges = false;
			toast.success('Data refreshed from server');
		} catch (error) {
			console.error('Refresh failed:', error);
			toast.error('Failed to refresh data');
		} finally {
			isRefreshing = false;
		}
	}

	// Mark a log as taken
	function markAsTaken(logId: string) {
		medState.updateLog(logId, {
			status: 'taken',
			actualTime: new Date().toISOString()
		});
		needsBackup = true;
		toast.success('Medication marked as taken');
	}

	// Mark a log as skipped
	function markAsSkipped(logId: string, notes?: string) {
		medState.updateLog(logId, {
			status: 'skipped',
			notes
		});
		needsBackup = true;
		toast.info('Medication marked as skipped');
	}

	// Get medication by ID
	function getMedication(medicationId: string): Medication | undefined {
		if (!activeSession) return undefined;
		return activeSession.medications.find((m) => m.id === medicationId);
	}

	// Format time
	function formatTime(isoString: string): string {
		return new Date(isoString).toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true
		});
	}

	// Format date
	function formatDate(isoString: string): string {
		return new Date(isoString).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	// Check if a time has passed
	function isPast(isoString: string): boolean {
		return new Date(isoString) < new Date();
	}

	// Calculate adherence color
	function getAdherenceColor(rate: number): string {
		if (rate >= 90) return 'text-green-600 dark:text-green-400';
		if (rate >= 70) return 'text-yellow-600 dark:text-yellow-400';
		return 'text-red-600 dark:text-red-400';
	}
</script>

<RouteHead
	title="Medication Tracker - Track Your Medications"
	description="Track your medications, treatment sessions, and medication adherence. Never miss a dose with our comprehensive medication tracking system."
	keywords="medication tracker, pill tracker, medicine reminder, treatment tracker, medication adherence, health tracker"
	route="/apps/medication-tracker"
/>

<main class="container mx-auto max-w-7xl px-2 py-4 sm:px-4 sm:py-8">
	<!-- Header -->
	<div class="mb-4 sm:mb-8">
		<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<h1
					class="flex items-center gap-2 text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white"
				>
					<Pill class="size-6 sm:size-8" />
					Medication Tracker
				</h1>
				<p class="mt-1 text-sm text-gray-600 sm:mt-2 sm:text-base dark:text-gray-400">
					Track your treatment sessions and medication adherence
				</p>
			</div>

			<div class="flex flex-wrap gap-2">
				{#if isAuthenticated}
					<div class="flex flex-wrap items-center gap-2">
						{#if needsBackup}
							<Badge variant="outline" class="text-orange-600 dark:text-orange-400">
								<CloudOff class="mr-1 size-3" />
								<span class="inline">Not Backed Up</span>
							</Badge>
						{:else}
							<Badge variant="outline" class="text-green-600 dark:text-green-400">
								<Cloud class="mr-1 size-3" />
								<span class="inline">Backed Up</span>
							</Badge>
						{/if}

						<Tooltip.Provider>
							<Tooltip.Root>
								<Tooltip.Trigger>
									<Button
										variant="outline"
										size="sm"
										onclick={handleRefresh}
										disabled={isRefreshing}
									>
										<RefreshCw class="size-4 {isRefreshing ? 'animate-spin' : ''}" />
									</Button>
								</Tooltip.Trigger>
								<Tooltip.Content>
									<p class="text-sm">Refresh: Load latest data from server</p>
								</Tooltip.Content>
							</Tooltip.Root>
						</Tooltip.Provider>

						<Tooltip.Provider>
							<Tooltip.Root>
								<Tooltip.Trigger>
									<Button variant="outline" size="sm" onclick={handleSync} disabled={isSyncing}>
										{#if isSyncing}
											<RefreshCcwDot class="mr-1 size-4 animate-spin sm:mr-2" />

											<span class=" inline">Syncing...</span>
										{:else}
											<span class=" inline">Sync</span>
											<RefreshCcwDot class="size-4 sm:hidden" />
										{/if}
									</Button>
								</Tooltip.Trigger>
								<Tooltip.Content>
									<p class="max-w-xs text-sm">
										<strong>Sync:</strong> Merge your local data with the server. Use this when working
										across multiple devices.
									</p>
								</Tooltip.Content>
							</Tooltip.Root>
						</Tooltip.Provider>

						<Tooltip.Provider>
							<Tooltip.Root>
								<Tooltip.Trigger>
									<Button variant="outline" size="sm" onclick={handleBackup} disabled={isBackingUp}>
										{#if isBackingUp}
											<RefreshCw class="mr-1 size-4 animate-spin sm:mr-2" />
											<span class=" inline">Backing up...</span>
										{:else}
											<Cloud class="mr-1 size-4 sm:mr-2" />
											<span class=" inline">Backup</span>
										{/if}
									</Button>
								</Tooltip.Trigger>
								<Tooltip.Content>
									<p class="max-w-xs text-sm">
										<strong>Backup:</strong> Save your current local data to the server. Use this to
										prevent data loss.
									</p>
								</Tooltip.Content>
							</Tooltip.Root>
						</Tooltip.Provider>
					</div>
				{/if}

				<Button
					onclick={() => (showHowToUseDialog = true)}
					variant="outline"
					size="sm"
					class="w-full sm:w-auto"
				>
					<HelpCircle class="mr-2 size-4" />
					<span class="hidden sm:inline">How to Use</span>
					<span class="sm:hidden">Help</span>
				</Button>

				<Button onclick={() => (showSessionDialog = true)} size="sm" class="w-full sm:w-auto">
					<Plus class="mr-2 size-4" />
					<span class="hidden sm:inline">New Session</span>
					<span class="sm:hidden">New</span>
				</Button>
			</div>
		</div>

		<!-- Active Session Info -->
		{#if activeSession}
			<Card class="mt-6 py-3 sm:py-5">
				<CardHeader>
					<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div class="flex-1">
							<CardTitle class="flex items-center gap-2">
								<Activity class="size-5" />
								<span class="text-lg sm:text-xl">{activeSession.name}</span>
							</CardTitle>
							<CardDescription class="text-sm">
								Started {formatDate(activeSession.startDate)}
								{#if activeSession.endDate}
									- Ended {formatDate(activeSession.endDate)}
								{:else}
									- Ongoing
								{/if}
							</CardDescription>
						</div>
						{#if stats}
							<div class="text-left sm:text-right">
								<div class="text-xl font-bold sm:text-2xl {getAdherenceColor(stats.adherenceRate)}">
									{stats.adherenceRate.toFixed(1)}%
								</div>
								<div class="text-xs text-gray-500 sm:text-sm dark:text-gray-400">
									Adherence Rate
								</div>
							</div>
						{/if}
					</div>
				</CardHeader>
				{#if activeSession.description}
					<CardContent>
						<p class="text-sm text-gray-600 dark:text-gray-400">{activeSession.description}</p>
					</CardContent>
				{/if}
			</Card>
		{:else}
			<Card class="mt-6 border-dashed">
				<CardContent class="pt-6">
					<div class="py-8 text-center">
						<Pill class="mx-auto mb-4 size-16 text-gray-400" />
						<h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
							No Active Treatment Session
						</h3>
						<p class="mb-4 text-gray-600 dark:text-gray-400">
							Create a treatment session to start tracking your medications
						</p>
						<Button onclick={() => (showSessionDialog = true)}>
							<Plus class="mr-2 size-4" />
							Create Treatment Session
						</Button>
					</div>
				</CardContent>
			</Card>
		{/if}
	</div>

	{#if activeSession}
		<!-- Main Content Tabs -->
		<Tabs.Root bind:value={activeTab} class="w-full">
			<Tabs.List class="grid w-full grid-cols-4">
				<Tabs.Trigger value="today">
					<CalendarDays class="mr-2 hidden size-4 sm:block" />
					Today
				</Tabs.Trigger>
				<Tabs.Trigger value="medications">
					<Pill class="mr-2 hidden size-4 sm:block" />
					Medications
				</Tabs.Trigger>
				<Tabs.Trigger value="history">
					<ListChecks class="mr-2 hidden size-4 sm:block" />
					History
				</Tabs.Trigger>
				<Tabs.Trigger value="stats">
					<TrendingUp class="mr-2 hidden size-4 sm:block" />
					Statistics
				</Tabs.Trigger>
			</Tabs.List>

			<!-- Today View -->
			<Tabs.Content value="today">
				<div class="mt-6 grid gap-6">
					<!-- Quick Stats -->
					{#if stats}
						<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" transition:fade>
							<Card>
								<CardContent class="pt-6">
									<div class="flex items-center justify-between">
										<div>
											<p class="text-sm font-medium text-gray-600 dark:text-gray-400">
												Total Doses
											</p>
											<p class="text-2xl font-bold text-gray-900 dark:text-white">
												{stats.totalDoses}
											</p>
										</div>
										<Clock class="size-8 text-gray-400" />
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardContent class="pt-6">
									<div class="flex items-center justify-between">
										<div>
											<p class="text-sm font-medium text-gray-600 dark:text-gray-400">Taken</p>
											<p class="text-2xl font-bold text-green-600 dark:text-green-400">
												{stats.takenDoses}
											</p>
										</div>
										<CheckCircle2 class="size-8 text-green-400" />
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardContent class="pt-6">
									<div class="flex items-center justify-between">
										<div>
											<p class="text-sm font-medium text-gray-600 dark:text-gray-400">Skipped</p>
											<p class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
												{stats.skippedDoses}
											</p>
										</div>
										<XCircle class="size-8 text-yellow-400" />
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardContent class="pt-6">
									<div class="flex items-center justify-between">
										<div>
											<p class="text-sm font-medium text-gray-600 dark:text-gray-400">Missed</p>
											<p class="text-2xl font-bold text-red-600 dark:text-red-400">
												{stats.missedDoses}
											</p>
										</div>
										<AlertCircle class="size-8 text-red-400" />
									</div>
								</CardContent>
							</Card>
						</div>
					{/if}

					<!-- Today's Schedule -->
					<TodayTracker
						{todayLogs}
						{activeSession}
						onMarkTaken={markAsTaken}
						onMarkSkipped={markAsSkipped}
						{getMedication}
						{formatTime}
						{isPast}
						onDataChanged={() => (needsBackup = true)}
					/>
				</div>
			</Tabs.Content>

			<!-- Medications View -->
			<Tabs.Content value="medications">
				<MedicationList
					session={activeSession}
					onAddMedication={() => (showMedicationDialog = true)}
				/>
			</Tabs.Content>

			<!-- History View -->
			<Tabs.Content value="history">
				<HistoryView
					session={activeSession}
					logs={medState.getLogsForSession(activeSession.id)}
					{getMedication}
					onDataChanged={() => (needsBackup = true)}
					onMarkTaken={markAsTaken}
					onMarkSkipped={markAsSkipped}
				/>
			</Tabs.Content>

			<!-- Stats View -->
			<Tabs.Content value="stats">
				<StatsView session={activeSession} {stats} />
			</Tabs.Content>
		</Tabs.Root>
	{/if}

	<!-- Session Manager Dialog -->
	<SessionManager bind:open={showSessionDialog} />

	<!-- How to Use Dialog -->
	<HowToUseDialog bind:open={showHowToUseDialog} onClose={() => (hasSeenGuide.current = true)} />
</main>

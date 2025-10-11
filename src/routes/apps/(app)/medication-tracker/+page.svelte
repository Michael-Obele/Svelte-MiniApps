<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { fade, slide } from 'svelte/transition';
	import { browser } from '$app/environment';
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
		HelpCircle,
		Circle
	} from '@lucide/svelte';

	import RouteHead from '@/blocks/RouteHead.svelte';
	import { Button } from '@/ui/button';
	import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/ui/card';
	import { Badge } from '@/ui/badge';
	import * as Dialog from '@/ui/dialog';
	import * as Tabs from '@/ui/tabs';
	import * as AlertDialog from '@/ui/alert-dialog';
	import * as Tooltip from '@/ui/tooltip';
	import * as Select from '@/ui/select';
	import { toast } from 'svelte-sonner';

	// Import state management (PersistedState-based)
	import * as medState from './states.svelte';
	import type { TreatmentSession, Medication, MedicationLog } from './states.svelte';

	// Import persisted UI config
	import { hasSeenGuide } from './persisted-config.svelte';

	// Import remote functions
	import { backupMedicationData, loadMedicationData, syncMedicationData } from '$lib/remote';

	// Component imports
	import SessionManager from './SessionManager.svelte';
	import MedicationList from './MedicationList.svelte';
	import TodayTracker from './TodayTracker.svelte';
	import StatsView from './StatsView.svelte';
	import HistoryView from './HistoryView.svelte';
	import HowToUseDialog from '@/ui/HowToUseDialog.svelte';
	import { medicationTrackerHowToUse } from './how-to-use-config';

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

	// Sync with server data on mount using timestamp-based merging
	onMount(() => {
		let didSync = false;

		// For authenticated users, sync with server data on mount
		if (browser && isAuthenticated && data?.sessions && data.sessions.length > 0) {
			const localSessions = medState.treatmentSessions.current;
			const serverSessions = data.sessions;

			console.log(
				`🔄 Syncing data from server: ${serverSessions.length} sessions, ${data.logs?.length || 0} logs`
			);

			// Merge sessions using updatedAt timestamps
			const mergedSessions: TreatmentSession[] = [];
			const processedServerIds = new Set<string>();

			// Process server sessions
			for (const serverSession of serverSessions) {
				const localSession = localSessions.find((s: TreatmentSession) => s.id === serverSession.id);

				if (!localSession) {
					// New session from server - add updatedAt if missing
					const sessionWithTimestamp = {
						...serverSession,
						updatedAt: (serverSession as any).updatedAt || serverSession.createdAt
					};
					mergedSessions.push(sessionWithTimestamp);
				} else {
					// Compare timestamps and keep the newer one
					const serverTime = new Date(
						(serverSession as any).updatedAt || serverSession.createdAt
					).getTime();
					const localTime = new Date(localSession.updatedAt || localSession.createdAt).getTime();

					const newerSession = serverTime >= localTime ? serverSession : localSession;
					mergedSessions.push({
						...newerSession,
						updatedAt: (newerSession as any).updatedAt || newerSession.createdAt
					});
				}
				processedServerIds.add(serverSession.id);
			}

			// Add local sessions that aren't on server yet
			for (const localSession of localSessions) {
				if (!processedServerIds.has(localSession.id)) {
					mergedSessions.push(localSession);
				}
			}

			// Merge logs using updatedAt timestamps
			const localLogs = medState.medicationLogs.current;
			const serverLogs = data.logs || [];
			const mergedLogs: MedicationLog[] = [];
			const processedLogIds = new Set<string>();

			// Process server logs
			for (const serverLog of serverLogs) {
				const localLog = localLogs.find((l: MedicationLog) => l.id === serverLog.id);

				if (!localLog) {
					// New log from server - add updatedAt if missing
					const logWithTimestamp = {
						...serverLog,
						updatedAt: (serverLog as any).updatedAt || serverLog.createdAt
					};
					mergedLogs.push(logWithTimestamp);
				} else {
					// Compare timestamps and keep the newer one
					const serverTime = new Date(
						(serverLog as any).updatedAt || serverLog.createdAt
					).getTime();
					const localTime = new Date(localLog.updatedAt || localLog.createdAt).getTime();

					const newerLog = serverTime >= localTime ? serverLog : localLog;
					mergedLogs.push({
						...newerLog,
						updatedAt: (newerLog as any).updatedAt || newerLog.createdAt
					});
				}
				processedLogIds.add(serverLog.id);
			}

			// Add local logs that aren't on server yet
			for (const localLog of localLogs) {
				if (!processedLogIds.has(localLog.id)) {
					mergedLogs.push(localLog);
				}
			}

			// Update local state with merged data
			medState.treatmentSessions.current = mergedSessions;
			medState.medicationLogs.current = mergedLogs;

			toast.success('Data synced from server');
			needsBackup = false; // Data just loaded from server
			didSync = true;
		}

		// Show how-to guide for new users, but delay slightly if we just synced
		// This prevents the guide from showing during the sync process
		if (!hasSeenGuide.current) {
			if (didSync) {
				// Delay showing the guide if we just synced to prevent UI conflicts
				setTimeout(() => {
					showHowToUseDialog = true;
				}, 500);
			} else {
				showHowToUseDialog = true;
			}
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

	// Auto-mark overdue pending logs as missed
	let missedCheckTimer: ReturnType<typeof setInterval> | null = null;

	function checkAndMarkMissedLogs() {
		if (!browser) return;

		const now = new Date();
		let hasChanges = false;

		const allLogs = medState.medicationLogs.current;

		for (const log of allLogs) {
			// Only check pending logs
			if (log.status === 'pending') {
				const scheduledTime = new Date(log.scheduledTime);
				// Mark as missed if the scheduled time has passed
				if (scheduledTime < now) {
					medState.updateLog(log.id, { status: 'missed' });
					hasChanges = true;
				}
			}
		}

		if (hasChanges) {
			needsBackup = true;
		}
	}

	// Run missed check on mount and every minute
	onMount(() => {
		checkAndMarkMissedLogs(); // Initial check

		missedCheckTimer = setInterval(() => {
			checkAndMarkMissedLogs();
		}, 60000); // Check every minute
	});

	// Cleanup on component unmount
	onDestroy(() => {
		if (autoBackupTimer) {
			clearTimeout(autoBackupTimer);
		}
		if (missedCheckTimer) {
			clearInterval(missedCheckTimer);
		}
	});

	// Load active session and related data - use reactive state with PersistedState
	let activeSession = $derived(browser ? medState.getActiveSession() : undefined);
	let allSessions = $derived(browser ? medState.treatmentSessions.current : []);
	let todayLogs = $derived(activeSession ? medState.getTodayLogs(activeSession.id) : []);
	let upcomingLogs = $derived(activeSession ? medState.getUpcomingLogs(activeSession.id, 24) : []);
	let allSessionLogs = $derived(activeSession ? medState.getLogsForSession(activeSession.id) : []);
	let stats = $derived(activeSession ? medState.calculateStats(activeSession.id) : null);

	// Session selector state
	let selectedSessionValue = $state('');

	// Update selected value when active session changes
	$effect(() => {
		if (activeSession) {
			selectedSessionValue = activeSession.id;
		} else {
			selectedSessionValue = '';
		}
	});

	function switchSession(sessionId: string | undefined) {
		if (sessionId) {
			medState.setActiveSession(sessionId);
			toast.success('Switched to session');
		}
	}

	// Track changes for backup
	$effect(() => {
		if (!browser) return;

		// Access the reactive state to trigger effect
		medState.treatmentSessions.current;
		medState.medicationLogs.current;

		// Mark as needing backup when data changes
		if (isAuthenticated) {
			needsBackup = true;
		}
	});

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
			const result = await backupMedicationData({
				sessions: medState.treatmentSessions.current,
				logs: medState.medicationLogs.current
			});

			if (result.success) {
				toast.success('Data backed up successfully');
				needsBackup = false;
				hasUnsavedChanges = false;

				// Clear auto-backup timer
				if (autoBackupTimer) {
					clearTimeout(autoBackupTimer);
					autoBackupTimer = null;
				}
			} else {
				toast.error('Failed to backup data');
			}
		} catch (error) {
			console.error('Backup error:', error);
			toast.error('An error occurred during backup');
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

			// Merge synced data using timestamp-based conflict resolution
			const mergedSessions: TreatmentSession[] = [];
			const processedServerIds = new Set<string>();

			// Process server sessions
			for (const serverSession of syncedData.sessions) {
				const localSession = medState.treatmentSessions.current.find(
					(s: TreatmentSession) => s.id === serverSession.id
				);

				if (!localSession) {
					const sessionWithTimestamp = {
						...serverSession,
						updatedAt: (serverSession as any).updatedAt || serverSession.createdAt
					};
					mergedSessions.push(sessionWithTimestamp);
				} else {
					const serverTime = new Date(
						(serverSession as any).updatedAt || serverSession.createdAt
					).getTime();
					const localTime = new Date(localSession.updatedAt || localSession.createdAt).getTime();
					const newerSession = serverTime >= localTime ? serverSession : localSession;
					mergedSessions.push({
						...newerSession,
						updatedAt: (newerSession as any).updatedAt || newerSession.createdAt
					});
				}
				processedServerIds.add(serverSession.id);
			}

			// Add local sessions not on server
			for (const localSession of medState.treatmentSessions.current) {
				if (!processedServerIds.has(localSession.id)) {
					mergedSessions.push(localSession);
				}
			}

			// Merge logs
			const mergedLogs: MedicationLog[] = [];
			const processedLogIds = new Set<string>();

			for (const serverLog of syncedData.logs) {
				const localLog = medState.medicationLogs.current.find(
					(l: MedicationLog) => l.id === serverLog.id
				);

				if (!localLog) {
					const logWithTimestamp = {
						...serverLog,
						updatedAt: (serverLog as any).updatedAt || serverLog.createdAt
					};
					mergedLogs.push(logWithTimestamp);
				} else {
					const serverTime = new Date(
						(serverLog as any).updatedAt || serverLog.createdAt
					).getTime();
					const localTime = new Date(localLog.updatedAt || localLog.createdAt).getTime();
					const newerLog = serverTime >= localTime ? serverLog : localLog;
					mergedLogs.push({
						...newerLog,
						updatedAt: (newerLog as any).updatedAt || newerLog.createdAt
					});
				}
				processedLogIds.add(serverLog.id);
			}

			for (const localLog of medState.medicationLogs.current) {
				if (!processedLogIds.has(localLog.id)) {
					mergedLogs.push(localLog);
				}
			}

			// Update local state
			medState.treatmentSessions.current = mergedSessions;
			medState.medicationLogs.current = mergedLogs;

			hasUnsavedChanges = false;
			needsBackup = false;
			toast.success('Data synced successfully');
		} catch (error) {
			console.error('Sync failed:', error);
			toast.error('Failed to sync data');
		} finally {
			isSyncing = false;
		}
	}

	// Refresh from server (overwrites local data)
	async function handleRefresh() {
		if (!isAuthenticated) {
			toast.error('You must be logged in to refresh data');
			return;
		}

		isRefreshing = true;

		try {
			const serverData = await loadMedicationData();

			// Replace local data with server data - add updatedAt timestamps if missing
			medState.treatmentSessions.current = serverData.sessions.map((session: any) => ({
				...session,
				updatedAt: (session as any).updatedAt || session.createdAt
			}));
			medState.medicationLogs.current = serverData.logs.map((log: any) => ({
				...log,
				updatedAt: (log as any).updatedAt || log.createdAt
			}));

			hasUnsavedChanges = false;
			needsBackup = false;
			toast.success('Data refreshed successfully');
		} catch (error) {
			console.error('Refresh failed:', error);
			toast.error('Failed to refresh data');
		} finally {
			isRefreshing = false;
		}
	}

	function markAsTaken(logId: string) {
		medState.updateLog(logId, {
			status: 'taken',
			actualTime: new Date().toISOString()
		});
		needsBackup = true;
	}

	function markAsSkipped(logId: string) {
		medState.updateLog(logId, {
			status: 'skipped'
		});
		needsBackup = true;
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
		<div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
			<div class="flex-1">
				<h1
					class="flex items-center gap-2 text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white"
				>
					<Pill class="size-6 sm:size-8" />
					Medication Tracker
				</h1>
				<p class="mt-1 text-sm text-gray-600 sm:mt-2 sm:text-base dark:text-gray-400">
					Track your treatment sessions and medication adherence
				</p>

				<!-- Quick Session Switcher -->
				{#if allSessions && allSessions.length > 1}
					<div class="mt-3 flex items-center gap-2">
						<span class="text-sm font-medium text-gray-700 dark:text-gray-300">Active Session:</span
						>
						<Select.Root
							type="single"
							bind:value={selectedSessionValue}
							onValueChange={(value) => switchSession(value)}
						>
							<Select.Trigger class="w-[280px]">
								<span>{activeSession?.name || 'Select session'}</span>
							</Select.Trigger>
							<Select.Content>
								<Select.Group>
									{#each allSessions as session (session.id)}
										<Select.Item value={session.id} label={session.name}>
											<div class="flex items-center gap-2">
												{#if session.isActive}
													<CheckCircle2 class="size-4 text-green-600" />
												{:else}
													<Circle class="size-4 text-gray-400" />
												{/if}
												<div class="flex flex-col">
													<span class="font-medium">{session.name}</span>
													<span class="text-xs text-gray-500">
														{session.medications.length} medications
														{#if session.endDate}
															• Ended
														{:else}
															• Ongoing
														{/if}
													</span>
												</div>
											</div>
										</Select.Item>
									{/each}
								</Select.Group>
							</Select.Content>
						</Select.Root>
						<Button
							variant="ghost"
							size="sm"
							onclick={() => (showSessionDialog = true)}
							class="ml-2"
						>
							<Settings class="size-4" />
						</Button>
					</div>
				{/if}
			</div>

			<div class="flex flex-col flex-wrap gap-2">
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
										<span class="inline">Refresh from server</span>
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
				<div class="flex flex-wrap gap-2">
					<Button
						onclick={() => (showHowToUseDialog = true)}
						variant="outline"
						size="sm"
						class="flex-1 sm:flex-none"
					>
						<HelpCircle class="mr-2 size-4" />
						<span class="hidden sm:inline">How to Use</span>
						<span class="sm:hidden">Help</span>
					</Button>

					<Button onclick={() => (showSessionDialog = true)} size="sm" class="flex-1 sm:flex-none">
						<Settings class="mr-2 size-4" />
						<span class="hidden sm:inline">Manage Sessions</span>
						<span class="sm:hidden">Manage</span>
					</Button>
				</div>
			</div>
		</div>

		<!-- Active Session Info Card -->
		{#if activeSession}
			<Card class="border-l-primary mt-6 border-l-4">
				<CardContent class="py-4">
					<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div class="flex-1">
							<div class="mb-1 flex items-center gap-2">
								<Activity class="text-primary size-5" />
								<h2 class="text-lg font-bold text-gray-900 sm:text-xl dark:text-white">
									{activeSession.name}
								</h2>
							</div>
							{#if activeSession.description}
								<p class="mb-2 text-sm text-gray-600 dark:text-gray-400">
									{activeSession.description}
								</p>
							{/if}
							<div
								class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 sm:text-sm dark:text-gray-400"
							>
								<span>Started {formatDate(activeSession.startDate)}</span>
								{#if activeSession.endDate}
									<span>• Ended {formatDate(activeSession.endDate)}</span>
								{:else}
									<span class="text-green-600 dark:text-green-400">• Ongoing</span>
								{/if}
								<span>• {activeSession.medications.length} medications</span>
							</div>
						</div>
						{#if stats}
							<div class="flex items-center gap-4 rounded-lg bg-gray-50 px-4 py-3 dark:bg-gray-800">
								<div class="text-center">
									<div
										class="text-2xl font-bold sm:text-3xl {getAdherenceColor(stats.adherenceRate)}"
									>
										{stats.adherenceRate.toFixed(1)}%
									</div>
									<div class="text-xs text-gray-500 dark:text-gray-400">Adherence</div>
								</div>
								<div class="h-12 w-px bg-gray-300 dark:bg-gray-600"></div>
								<div class="text-center">
									<div class="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
										{stats.takenDoses}
									</div>
									<div class="text-xs text-gray-500 dark:text-gray-400">Taken</div>
								</div>
							</div>
						{/if}
					</div>
				</CardContent>
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
					logs={allSessionLogs}
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
	<HowToUseDialog
		bind:open={showHowToUseDialog}
		onClose={() => (hasSeenGuide.current = true)}
		title={medicationTrackerHowToUse.title}
		description={medicationTrackerHowToUse.description}
		tabs={medicationTrackerHowToUse.tabs}
		showFooterHelpText={medicationTrackerHowToUse.showFooterHelpText}
	/>
</main>

<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { fade, slide } from 'svelte/transition';
	import { browser } from '$app/environment';
	import {
		Clock,
		TrendingUp,
		DollarSign,
		Cigarette,
		Trophy,
		Heart,
		RotateCcw,
		Plus,
		AlertCircle,
		Sparkles,
		Target,
		Calendar,
		Activity,
		Settings as SettingsIcon,
		MessageSquare,
		Award
	} from '@lucide/svelte';

	import RouteHead from '@/blocks/RouteHead.svelte';
	import { Button } from '@/ui/button';
	import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/ui/card';
	import { Badge } from '@/ui/badge';
	import * as Dialog from '@/ui/dialog';
	import * as Tabs from '@/ui/tabs';
	import * as AlertDialog from '@/ui/alert-dialog';
	import { Progress } from '@/ui/progress';
	import { toast } from 'svelte-sonner';

	// Import remote functions for backup
	import { backupSmokeFreeData, loadSmokeFreeData, syncSmokeFreeData } from '$lib/remote';

	// Import state management
	import * as smokeState from './states.svelte';
	import type { SmokingAttempt, CravingLog } from './states.svelte';

	// Component imports
	import {
		StreakTimer,
		StatisticsView,
		MilestonesView,
		CravingLogger,
		SettingsDialog,
		HistoryView
	} from './components';

	// Props from load function
	let { data } = $props<{ data: any }>();

	// State
	let activeAttempt = $state<SmokingAttempt | null>(null);
	let currentTime = $state(new Date());
	let timeInterval: ReturnType<typeof setInterval> | null = null;

	let showResetDialog = $state(false);
	let showResetConfirmationDialog = $state(false);
	let showStartDialog = $state(false);
	let showCravingDialog = $state(false);
	let showSettingsDialog = $state(false);
	let activeTab = $state('overview');

	// Backup state
	let isAuthenticated = $state(false);
	let needsBackup = $state(true);
	let isBackingUp = $state(false);
	let showBackupDialog = $state(false);
	let isSyncing = $state(false);
	let autoBackupTimer: ReturnType<typeof setTimeout> | null = null;

	// Reactive calculations
	let statistics = $derived(
		activeAttempt && browser
			? smokeState.getStatistics(activeAttempt, smokeState.userSettings.current)
			: null
	);

	let randomQuote = $derived(
		smokeState.getMotivationalQuotes()[
			Math.floor(Math.random() * smokeState.getMotivationalQuotes().length)
		]
	);

	// Initialize
	onMount(() => {
		// Set authentication state
		isAuthenticated = !!data.user;

		// Check if user has been away for a while and trigger backup if needed
		if (browser && isAuthenticated) {
			const lastBackupTime = smokeState.lastBackupTime.current;
			const now = Date.now();
			const timeSinceLastBackup = lastBackupTime ? now - parseInt(lastBackupTime) : Infinity;

			// If more than 30 minutes since last backup, trigger a backup
			if (timeSinceLastBackup > 30 * 60 * 1000) {
				console.log('🔄 User returned after extended absence, triggering backup');
				needsBackup = true;
			}
		}

		// Load active attempt from local state
		activeAttempt = smokeState.getActiveAttempt() ?? null;

		// For authenticated users, sync with server data on mount
		if (browser && isAuthenticated && data?.attempts) {
			const localAttempts = smokeState.smokingAttempts.current;
			const serverAttempts = data.attempts;

			console.log(
				`🔄 Syncing smoke-free data: ${localAttempts.length} local attempts, ${serverAttempts.length} server attempts, ${data.cravings?.length || 0} server cravings`
			);

			// Improved merge strategy
			if (serverAttempts.length > 0) {
				// Create a map of existing attempts by ID for quick lookup
				const localAttemptMap = new Map(localAttempts.map((a) => [a.id, a]));

				// Merge server attempts with local attempts
				const mergedAttempts = [...localAttempts]; // Start with local attempts

				for (const serverAttempt of serverAttempts) {
					const existingAttempt = localAttemptMap.get(serverAttempt.id);
					if (!existingAttempt) {
						// Server has an attempt that local doesn't have
						mergedAttempts.push(serverAttempt);
					} else {
						// Both have the attempt, decide which version to keep
						const winner = resolveAttemptConflict(existingAttempt, serverAttempt);
						if (winner !== existingAttempt) {
							const index = mergedAttempts.findIndex((a) => a.id === serverAttempt.id);
							mergedAttempts[index] = serverAttempt;
						}
						// If winner is existingAttempt, keep local version (already in array)
					}
				}

				smokeState.smokingAttempts.current = mergedAttempts;
				console.log(`✅ Merged to ${mergedAttempts.length} total attempts`);

				// Ensure only one attempt is active - keep the most recent active one
				const activeAttempts = mergedAttempts.filter((a) => a.isActive);
				if (activeAttempts.length > 1) {
					console.log(
						`🔧 Found ${activeAttempts.length} active attempts, keeping only the most recent`
					);
					// Sort by start date descending (most recent first)
					activeAttempts.sort(
						(a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
					);
					// Keep the most recent active, deactivate the others
					const mostRecentActive = activeAttempts[0];
					smokeState.smokingAttempts.current = mergedAttempts.map((a) =>
						a.id === mostRecentActive.id
							? a
							: { ...a, isActive: false, endDate: a.endDate || new Date().toISOString() }
					);
				}
			}

			// Handle cravings similarly
			if (data.cravings && data.cravings.length > 0) {
				const localCravings = smokeState.cravingLogs.current;
				const serverCravings = data.cravings;

				// Simple merge: add server cravings that don't exist locally
				const localCravingIds = new Set(localCravings.map((c: smokeState.CravingLog) => c.id));
				const newCravings = serverCravings.filter(
					(c: smokeState.CravingLog) => !localCravingIds.has(c.id)
				);

				if (newCravings.length > 0) {
					smokeState.cravingLogs.current = [...localCravings, ...newCravings];
					console.log(`✅ Added ${newCravings.length} new cravings from server`);
				}
			}

			// Handle settings - prioritize local settings over server settings
			if (data.settings) {
				const currentSettings = smokeState.userSettings.current;
				const serverSettings = data.settings;

				// Only update from server if local settings are empty/default
				// This preserves user preferences and prevents server from overriding local changes
				const isUsingDefaults =
					currentSettings.cigarettesPerDay === 20 &&
					currentSettings.pricePerPack === 10 &&
					currentSettings.cigarettesPerPack === 20 &&
					currentSettings.currency === '$' &&
					currentSettings.motivationalGoals.length === 0 &&
					currentSettings.customStartDateEnabled === false;

				if (isUsingDefaults && JSON.stringify(currentSettings) !== JSON.stringify(serverSettings)) {
					smokeState.userSettings.current = serverSettings;
					console.log(`✅ Loaded settings from server (local settings were defaults)`);
				} else {
					console.log(`✅ Kept local user settings (server settings not applied)`);
				}
			}

			activeAttempt = smokeState.getActiveAttempt() ?? null;
			needsBackup = false; // Data just synced
		} // Update time every second for live countdown
		timeInterval = setInterval(() => {
			currentTime = new Date();
		}, 1000);
	});

	onDestroy(() => {
		if (timeInterval) {
			clearInterval(timeInterval);
		}
		if (autoBackupTimer) {
			clearTimeout(autoBackupTimer);
		}
	});

	// Functions
	function startNewAttempt() {
		const attempt = smokeState.addAttempt();
		activeAttempt = attempt || null;
		showStartDialog = false;
		toast.success('Your smoke-free journey begins now! 🎉');
		needsBackup = true;
		scheduleAutoBackup();
	}

	// Helper function to determine which attempt to keep when merging
	function resolveAttemptConflict(
		localAttempt: smokeState.SmokingAttempt,
		serverAttempt: smokeState.SmokingAttempt
	): smokeState.SmokingAttempt {
		// If local is active and server is not, keep local active attempt
		if (localAttempt.isActive && !serverAttempt.isActive) {
			return localAttempt;
		}

		// If local is not active and server is, keep server active attempt
		if (!localAttempt.isActive && serverAttempt.isActive) {
			return serverAttempt;
		}

		// If both are active, keep the one with more recent start date
		if (localAttempt.isActive && serverAttempt.isActive) {
			const localStart = new Date(localAttempt.startDate).getTime();
			const serverStart = new Date(serverAttempt.startDate).getTime();
			return serverStart > localStart ? serverAttempt : localAttempt;
		}

		// Both are completed - keep the one with more recent end date
		const localEnd = localAttempt.endDate ? new Date(localAttempt.endDate).getTime() : 0;
		const serverEnd = serverAttempt.endDate ? new Date(serverAttempt.endDate).getTime() : 0;
		return serverEnd > localEnd ? serverAttempt : localAttempt;
	}

	function handleReset() {
		if (!activeAttempt) return;

		const newAttempt = smokeState.resetAttempt(activeAttempt.id);
		activeAttempt = newAttempt ?? null;
		showResetDialog = false;
		toast.info('Previous attempt saved to history. Starting fresh! 💪');
		needsBackup = true;
		scheduleAutoBackup();
	}

	function handleCravingLogged() {
		showCravingDialog = false;
		toast.success('Craving logged! Stay strong! 💪');
		needsBackup = true;
		scheduleAutoBackup();
	}

	// Auto-backup functionality
	function scheduleAutoBackup() {
		if (autoBackupTimer) {
			clearTimeout(autoBackupTimer);
		}

		// Only schedule if authenticated and needs backup
		if (isAuthenticated && needsBackup && !isBackingUp) {
			autoBackupTimer = setTimeout(() => {
				handleBackup();
			}, 300000); // 5 minutes delay
		}
	}

	// Watch for changes to trigger auto-backup
	$effect(() => {
		if (needsBackup) {
			scheduleAutoBackup();
		}
	});

	// Backup to server
	async function handleBackup() {
		if (!isAuthenticated) {
			toast.error('You must be logged in to backup data');
			return;
		}

		isBackingUp = true;

		try {
			const result = await backupSmokeFreeData({
				attempts: smokeState.smokingAttempts.current,
				cravings: smokeState.cravingLogs.current,
				settings: smokeState.userSettings.current
			});

			if (result.success) {
				toast.success('Data backed up successfully');
				needsBackup = false;

				// Store last backup time
				smokeState.lastBackupTime.current = Date.now().toString();

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

	// Sync from server
	async function handleSync() {
		if (!isAuthenticated) {
			toast.error('You must be logged in to sync data');
			return;
		}

		isSyncing = true;

		try {
			const result = await syncSmokeFreeData({
				attempts: smokeState.smokingAttempts.current,
				cravings: smokeState.cravingLogs.current,
				settings: smokeState.userSettings.current
			});

			if (result.action === 'backed_up') {
				toast.success('Local data synced to cloud');
				needsBackup = false;
			} else if (result.action === 'use_server') {
				// Update local state with server data, but preserve local active attempts
				const localActiveAttempts = smokeState.smokingAttempts.current.filter((a) => a.isActive);
				const serverAttempts = result.data.attempts;

				// Keep local active attempts, merge in server completed attempts
				const mergedAttempts = [...localActiveAttempts];
				const localActiveIds = new Set(localActiveAttempts.map((a) => a.id));

				for (const serverAttempt of serverAttempts) {
					if (!localActiveIds.has(serverAttempt.id)) {
						mergedAttempts.push(serverAttempt);
					}
				}

				smokeState.smokingAttempts.current = mergedAttempts;
				smokeState.cravingLogs.current = result.data.cravings;
				toast.success('Data synced from cloud');
				needsBackup = false;
			}
		} catch (error) {
			console.error('Sync error:', error);
			toast.error('An error occurred during sync');
		} finally {
			isSyncing = false;
		}
	}
</script>

<RouteHead
	route="/apps/smoke-free-tracker"
	title="Smoke-Free Tracker"
	description="Track your smoke-free streak, monitor health improvements, and stay motivated on your journey to quit smoking."
/>

<div class="container mx-auto max-w-7xl space-y-6 p-4">
	<!-- Header -->
	<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
		<div class="min-w-0 flex-1">
			<h1 class="text-2xl font-bold tracking-tight sm:text-3xl">Smoke-Free Tracker</h1>
			<p class="text-muted-foreground text-sm sm:text-base">Your journey to a healthier life</p>
		</div>
		<div class="flex flex-wrap gap-1 sm:gap-2">
			<Button
				variant="outline"
				size="sm"
				onclick={() => (showSettingsDialog = true)}
				class="shrink-0"
			>
				<SettingsIcon class="size-4" />
			</Button>
			{#if isAuthenticated}
				<Button
					variant="outline"
					size="sm"
					onclick={handleSync}
					disabled={isSyncing}
					class="shrink-0"
				>
					{#if isSyncing}
						Syncing...
					{:else}
						🔄 Sync
					{/if}
				</Button>
				<Button
					variant="outline"
					size="sm"
					onclick={handleBackup}
					disabled={isBackingUp}
					class="shrink-0"
				>
					{#if isBackingUp}
						Backing up...
					{:else}
						☁️ Backup
					{/if}
				</Button>
			{/if}
			{#if activeAttempt}
				<Button
					variant="outline"
					size="sm"
					onclick={() => (showCravingDialog = true)}
					class="shrink-0"
				>
					<Plus class="mr-1 size-3 sm:mr-2 sm:size-4" />
					<span class="hidden sm:inline">Log Craving</span>
				</Button>
				<Button
					variant="destructive"
					size="sm"
					onclick={() => (showResetConfirmationDialog = true)}
					class="shrink-0"
				>
					<RotateCcw class="mr-1 size-3 sm:mr-2 sm:size-4" />
					<span class="hidden sm:inline">I Smoked</span>
				</Button>
			{/if}
		</div>
	</div>

	{#if !activeAttempt}
		<!-- Welcome Screen -->
		<div transition:fade>
			<Card class="border-dashed">
				<CardContent class="py-12 text-center">
					<div
						class="bg-primary/10 mx-auto mb-6 flex size-20 items-center justify-center rounded-full"
					>
						<Sparkles class="text-primary size-10" />
					</div>
					<h2 class="mb-2 text-2xl font-bold">Ready to Quit Smoking?</h2>
					<p class="text-muted-foreground mb-6">
						Track your progress, monitor health improvements, and stay motivated on your smoke-free
						journey.
					</p>
					<Button size="lg" onclick={() => (showStartDialog = true)}>
						<Target class="mr-2 size-5" />
						Start Your Journey
					</Button>
				</CardContent>
			</Card>
		</div>
	{:else}
		<!-- Main Dashboard -->
		<Tabs.Root bind:value={activeTab}>
			<Tabs.List class="grid w-full grid-cols-4">
				<Tabs.Trigger value="overview">Overview</Tabs.Trigger>
				<Tabs.Trigger value="milestones">Milestones</Tabs.Trigger>
				<Tabs.Trigger value="cravings">Cravings</Tabs.Trigger>
				<Tabs.Trigger value="history">History</Tabs.Trigger>
			</Tabs.List>

			<!-- Overview Tab -->
			<Tabs.Content value="overview" class="space-y-6">
				<!-- Main Streak Timer -->
				<StreakTimer attempt={activeAttempt} {currentTime} />

				<!-- Motivational Quote -->
				<Card class="border-primary/20 bg-primary/5">
					<CardContent class="py-4">
						<p class="text-center text-lg font-medium">{randomQuote}</p>
					</CardContent>
				</Card>

				<!-- Statistics Grid -->
				{#if statistics}
					<StatisticsView {statistics} />
				{/if}

				<!-- Quick Stats -->
				<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					<Card>
						<CardContent class="py-6 text-center">
							<DollarSign class="mx-auto mb-2 size-8 text-green-500" />
							<div class="text-2xl font-bold">
								{smokeState.userSettings.current.currency}
								{statistics?.moneySaved.toFixed(2) ?? '0.00'}
							</div>
							<p class="text-muted-foreground text-sm">Money Saved</p>
						</CardContent>
					</Card>

					<Card>
						<CardContent class="py-6 text-center">
							<Cigarette class="mx-auto mb-2 size-8 text-red-500" />
							<div class="text-2xl font-bold">{statistics?.cigarettesAvoided ?? 0}</div>
							<p class="text-muted-foreground text-sm">Cigarettes Avoided</p>
						</CardContent>
					</Card>

					<Card>
						<CardContent class="py-6 text-center">
							<Heart class="mx-auto mb-2 size-8 text-pink-500" />
							<div class="text-2xl font-bold">{statistics?.achievedMilestones.length ?? 0}</div>
							<p class="text-muted-foreground text-sm">Milestones Reached</p>
						</CardContent>
					</Card>

					<Card>
						<CardContent class="py-6 text-center">
							<Activity class="mx-auto mb-2 size-8 text-blue-500" />
							<div class="text-2xl font-bold">{statistics?.cravingSuccessRate ?? 0}%</div>
							<p class="text-muted-foreground text-sm">Craving Success</p>
						</CardContent>
					</Card>
				</div>

				<!-- Next Milestone -->
				{#if statistics?.nextMilestone}
					<Card>
						<CardHeader>
							<CardTitle class="flex items-center gap-2">
								<Trophy class="size-5" />
								Next Milestone
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div class="flex items-center gap-4">
								<div class="text-4xl">{statistics.nextMilestone.icon}</div>
								<div class="flex-1">
									<h3 class="font-semibold">{statistics.nextMilestone.name}</h3>
									<p class="text-muted-foreground text-sm">
										{statistics.nextMilestone.description}
									</p>
									<div class="mt-2">
										<Progress
											value={(statistics.streakMinutes / statistics.nextMilestone.duration) * 100}
											class="h-2"
										/>
										<p class="text-muted-foreground mt-1 text-xs">
											{smokeState.formatDuration(
												statistics.nextMilestone.duration - statistics.streakMinutes
											)} remaining
										</p>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				{/if}
			</Tabs.Content>

			<!-- Milestones Tab -->
			<Tabs.Content value="milestones">
				{#if statistics}
					<MilestonesView {statistics} attempt={activeAttempt} />
				{/if}
			</Tabs.Content>

			<!-- Cravings Tab -->
			<Tabs.Content value="cravings">
				<CravingLogger attempt={activeAttempt} />
			</Tabs.Content>

			<!-- History Tab -->
			<Tabs.Content value="history">
				<HistoryView />
			</Tabs.Content>
		</Tabs.Root>
	{/if}
</div>

<!-- Start Dialog -->
<Dialog.Root bind:open={showStartDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Start Your Smoke-Free Journey</Dialog.Title>
			<Dialog.Description>
				When did you have your last cigarette? We'll track your progress from that moment.
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4 py-4">
			<div class="border-primary/20 bg-primary/5 rounded-lg border p-4 text-center">
				<Sparkles class="text-primary mx-auto mb-2 size-8" />
				<p class="font-medium">Starting now with your last cigarette being right now</p>
				<p class="text-muted-foreground text-sm">Your timer will begin from this moment</p>
			</div>

			<div class="space-y-2">
				<h4 class="font-semibold">What to expect:</h4>
				<ul class="text-muted-foreground space-y-1 text-sm">
					<li>• Track your real-time smoke-free streak</li>
					<li>• Celebrate health improvement milestones</li>
					<li>• Monitor money saved and cigarettes avoided</li>
					<li>• Log and manage cravings effectively</li>
				</ul>
			</div>
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => (showStartDialog = false)}>Cancel</Button>
			<Button onclick={startNewAttempt}>
				<Target class="mr-2 size-4" />
				Start Journey
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Reset Confirmation Dialog -->
<Dialog.Root bind:open={showResetConfirmationDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Confirm You Smoked</Dialog.Title>
			<Dialog.Description>
				Before we reset your streak, please confirm that you actually had a cigarette. This helps
				ensure accurate tracking.
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4 py-4">
			<div
				class="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950"
			>
				<AlertCircle class="mb-2 size-6 text-amber-600 dark:text-amber-400" />
				<h4 class="font-semibold text-amber-800 dark:text-amber-200">
					What happens when you reset?
				</h4>
				<ul class="mt-2 space-y-1 text-sm text-amber-700 dark:text-amber-300">
					<li>• Your current streak timer will stop</li>
					<li>• This attempt will be saved to your history</li>
					<li>• A new streak will begin immediately</li>
					<li>• Your longest streak record remains intact</li>
				</ul>
			</div>

			<div class="space-y-2">
				<h4 class="font-semibold">Are you sure you smoked?</h4>
				<p class="text-muted-foreground text-sm">
					Only proceed if you actually had a cigarette. If this was a craving you resisted, consider
					logging it instead.
				</p>
			</div>
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => (showResetConfirmationDialog = false)}>
				Cancel
			</Button>
			<Button
				variant="destructive"
				onclick={() => {
					showResetConfirmationDialog = false;
					showResetDialog = true;
				}}
			>
				Yes, I Smoked - Reset Streak
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Reset Dialog -->
<AlertDialog.Root bind:open={showResetDialog}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Record a Smoke?</AlertDialog.Title>
			<AlertDialog.Description>
				Don't be too hard on yourself. Recovery isn't linear. Let's reset your streak and keep
				going. Your longest streak of {statistics?.longestStreak ?? '0 minutes'} is still an achievement!
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action onclick={handleReset}>Reset Streak</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

<!-- Craving Dialog -->
<Dialog.Root bind:open={showCravingDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Log a Craving</Dialog.Title>
			<Dialog.Description>
				Track your cravings to understand your triggers and improve your strategy.
			</Dialog.Description>
		</Dialog.Header>

		{#if activeAttempt}
			<CravingLogger attempt={activeAttempt} onLogged={handleCravingLogged} compact={true} />
		{/if}
	</Dialog.Content>
</Dialog.Root>

<!-- Settings Dialog -->
<SettingsDialog bind:open={showSettingsDialog} />

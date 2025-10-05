<script lang="ts">
	import {
		Clock,
		CheckCircle2,
		TrendingUp,
		HelpCircle,
		Activity,
		XCircle,
		Calendar,
		AlertCircle,
		Pill,
		type Icon as IconType
	} from '@lucide/svelte';
	import { Button } from '@/ui/button';
	import * as Dialog from '@/ui/dialog';
	import * as Tabs from '@/ui/tabs';
	import { Badge } from '@/ui/badge';

	interface Props {
		open: boolean;
		onClose?: () => void;
	}

	interface Step {
		number: number;
		title: string;
		description: string;
		color: string;
	}

	interface StatusIndicator {
		variant: 'default' | 'secondary' | 'destructive' | 'outline';
		bgColor?: string;
		icon: typeof IconType;
		label: string;
		description: string;
	}

	interface ManagementFeature {
		icon: typeof IconType;
		title: string;
		description: string;
	}

	interface Tip {
		text: string;
	}

	let { open = $bindable(false) }: Props = $props();
	let activeTab = $state('start');

	// Getting Started Steps
	const gettingStartedSteps: Step[] = [
		{
			number: 1,
			title: 'Create a Session',
			description:
				'Click <strong>"New Session"</strong> and give it a meaningful name like "Morning Routine", "Weekly Meds", or "Antibiotics Course".',
			color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
		},
		{
			number: 2,
			title: 'Add Medications',
			description:
				'In your session, click <strong>"Add Medication"</strong>. Include the medication name, dosage (e.g., "500mg"), and any special instructions.',
			color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
		},
		{
			number: 3,
			title: 'Set Schedule Times',
			description:
				'Choose specific times for each medication (e.g., 9:00 AM, 2:00 PM, 9:00 PM). The app will automatically generate your daily schedule.',
			color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
		}
	];

	// Daily Tracking Steps
	const trackingSteps: Step[] = [
		{
			number: 1,
			title: "Check Today's Schedule",
			description:
				'The <strong>"Today"</strong> tab displays all medications due today with their scheduled times and current status.',
			color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
		},
		{
			number: 2,
			title: 'Mark as Taken',
			description:
				'Click the <strong>✓ Taken</strong> button when you take each medication. The app records the actual time and you can add optional notes.',
			color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
		},
		{
			number: 3,
			title: 'Handle Exceptions',
			description:
				'If you miss a dose, use <strong>"Skip"</strong> (with reason) or <strong>"Reschedule"</strong> (to a different time) to keep your tracking accurate.',
			color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
		}
	];

	// Status Indicators
	const statusIndicators: StatusIndicator[] = [
		{
			variant: 'default',
			bgColor: 'bg-green-500  text-black hover:bg-green-600',
			icon: CheckCircle2,
			label: 'Taken',
			description: 'Medication successfully taken at the recorded time'
		},
		{
			variant: 'secondary',
			icon: XCircle,
			label: 'Skipped',
			description: 'Dose intentionally skipped with optional reason'
		},
		{
			variant: 'destructive',
			icon: AlertCircle,
			label: 'Missed',
			description: 'Overdue medication that needs attention'
		},
		{
			variant: 'outline',
			icon: Clock,
			label: 'Pending',
			description: 'Scheduled medication waiting to be taken'
		}
	];

	// Management Features
	const managementFeatures: ManagementFeature[] = [
		{
			icon: Calendar,
			title: 'View History',
			description:
				'The <strong>"History"</strong> tab shows all past medication logs grouped by date. Edit times, undo actions, or add notes to any entry.'
		},
		{
			icon: TrendingUp,
			title: 'Track Statistics',
			description:
				'The <strong>"Stats"</strong> tab displays adherence rates, current streaks, missed doses, and detailed medication patterns over time.'
		},
		{
			icon: Clock,
			title: 'Manage Schedules',
			description:
				'Edit medication details, adjust dosages, modify schedules, or reschedule individual doses from the <strong>"Medications"</strong> tab.'
		}
	];

	// Quick Tips
	const quickTips: Tip[] = [
		{ text: 'Set reminders on your phone for critical medications' },
		{ text: 'Review your adherence statistics weekly to identify patterns' },
		{ text: 'Use the notes field to track side effects or effectiveness' },
		{ text: 'Backup your data regularly if logged in (cloud icon in header)' },
		{ text: 'The app works offline - perfect for travel and areas with poor connectivity' }
	];
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-h-[80vh] overflow-y-auto sm:max-w-[650px]">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				<HelpCircle class="h-5 w-5" />
				Medication Tracker Guide
			</Dialog.Title>
			<Dialog.Description
				>Simple steps to manage your medication schedule effectively</Dialog.Description
			>
		</Dialog.Header>

		<Tabs.Root bind:value={activeTab} class="py-4">
			<Tabs.List class="grid w-full grid-cols-3 gap-2">
				<Tabs.Trigger value="start" class="flex items-center justify-center gap-1.5">
					<Pill class="h-4 w-4" />
					<span class="hidden sm:inline">Start</span>
				</Tabs.Trigger>
				<Tabs.Trigger value="track" class="flex items-center justify-center gap-1.5">
					<CheckCircle2 class="h-4 w-4" />
					<span class="hidden sm:inline">Track</span>
				</Tabs.Trigger>
				<Tabs.Trigger value="manage" class="flex items-center justify-center gap-1.5">
					<Activity class="h-4 w-4" />
					<span class="hidden sm:inline">Manage</span>
				</Tabs.Trigger>
			</Tabs.List>

			<!-- Getting Started Tab -->
			<Tabs.Content value="start" class="space-y-5 pt-5">
				<div class="space-y-4">
					{#each gettingStartedSteps as step}
						<div class="flex gap-3">
							<div
								class="flex size-8 flex-shrink-0 items-center justify-center rounded-full font-semibold {step.color}"
							>
								{step.number}
							</div>
							<div class="min-w-0 flex-1">
								<h4 class="mb-1 font-semibold text-gray-900 dark:text-white">{step.title}</h4>
								<p class="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
									{@html step.description}
								</p>
							</div>
						</div>
					{/each}
				</div>

				<div
					class="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/50"
				>
					<div class="flex gap-2">
						<Pill class="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
						<div>
							<p class="font-semibold text-blue-900 dark:text-blue-300">Pro tip:</p>
							<p class="mt-1 text-sm text-blue-800 dark:text-blue-200">
								Start with just 1-2 medications to get familiar with the system. You can always add
								more medications and adjust schedules as needed!
							</p>
						</div>
					</div>
				</div>
			</Tabs.Content>

			<!-- Daily Tracking Tab -->
			<Tabs.Content value="track" class="space-y-5 pt-5">
				<div class="space-y-4">
					{#each trackingSteps as step}
						<div class="flex gap-3">
							<div
								class="flex size-8 flex-shrink-0 items-center justify-center rounded-full font-semibold {step.color}"
							>
								{step.number}
							</div>
							<div class="min-w-0 flex-1">
								<h4 class="mb-1 font-semibold text-gray-900 dark:text-white">{step.title}</h4>
								<p class="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
									{@html step.description}
								</p>
							</div>
						</div>
					{/each}
				</div>

				<div
					class="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50"
				>
					<h4 class="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
						<Activity class="h-4 w-4" />
						Status Indicators
					</h4>
					<div class="grid gap-3">
						{#each statusIndicators as indicator}
							<div class="flex items-start gap-3">
								<Badge variant={indicator.variant} class={indicator.bgColor || ''}>
									<indicator.icon class="mr-1 h-3 w-3" />
									{indicator.label}
								</Badge>
								<span class="flex-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
									{indicator.description}
								</span>
							</div>
						{/each}
					</div>
				</div>
			</Tabs.Content>

			<!-- Management Tab -->
			<Tabs.Content value="manage" class="space-y-5 pt-5">
				<div class="space-y-3">
					{#each managementFeatures as feature}
						<div
							class="rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800/30 dark:hover:border-gray-600 dark:hover:bg-gray-800/50"
						>
							<h4 class="mb-2 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
								<feature.icon class="h-4 w-4 text-blue-600 dark:text-blue-400" />
								{feature.title}
							</h4>
							<p class="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
								{@html feature.description}
							</p>
						</div>
					{/each}
				</div>

				<div
					class="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-950/50"
				>
					<h4
						class="mb-3 flex items-center gap-2 font-semibold text-purple-900 dark:text-purple-300"
					>
						<TrendingUp class="h-4 w-4" />
						Quick Tips
					</h4>
					<ul class="space-y-2">
						{#each quickTips as tip}
							<li class="flex items-start gap-2 text-sm text-purple-800 dark:text-purple-200">
								<span class="mt-0.5 flex-shrink-0 text-purple-600 dark:text-purple-400">•</span>
								<span class="leading-relaxed">{tip.text}</span>
							</li>
						{/each}
					</ul>
				</div>
			</Tabs.Content>
		</Tabs.Root>

		<Dialog.Footer
			class="flex items-center justify-between gap-3 border-t border-gray-200 pt-4 dark:border-gray-700"
		>
			<div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
				<HelpCircle class="h-3 w-3" />
				<span>Need help? Reopen this guide anytime from the header</span>
			</div>
			<Button onclick={() => (open = false)} class="ml-auto">
				<CheckCircle2 class="mr-2 h-4 w-4" />
				Got It!
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

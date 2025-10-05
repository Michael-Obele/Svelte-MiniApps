<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { Input } from '@/ui/input/index.js';
	import { Button } from '@/ui/button/index.js';
	import { toast } from 'svelte-sonner';
	import { onMount } from 'svelte';
	import { Loader2 } from '@lucide/svelte';
	import { navigating } from '$app/state';
	import HowToUseDialog from '@/ui/HowToUseDialog.svelte';
	import { githubContributionTrackerHowToUse } from './how-to-use-config';
	import { HelpCircle } from '@lucide/svelte';
	import { PersistedState } from 'runed';

	let username = $state('');
	let year = $state(new Date().getFullYear().toString());
	let isSubmitting = $state(false);
	let showHowToUse = $state(false);
	let hasSeenHowToUse = new PersistedState(
		'github-contribution-tracker-has-seen-how-to-use',
		false
	);

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		isSubmitting = true;

		try {
			// Navigate directly to the results page
			await goto(`/apps/github-contribution-tracker/${username}/${year}`);
		} catch (error) {
			toast.error('Navigation failed. Please try again.');
			isSubmitting = false;
		}
	}

	// Reset isSubmitting when navigation is complete
	$effect(() => {
		if (!navigating || !navigating.to) {
			isSubmitting = false;
		}
	});
</script>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8 flex items-center justify-center gap-4">
		<h1 class="text-3xl font-bold">GitHub Contribution Tracker</h1>
		<Button variant="outline" size="icon" onclick={() => (showHowToUse = true)} class="shrink-0">
			<HelpCircle class="h-4 w-4" />
		</Button>
	</div>

	<div class="mx-auto max-w-md">
		<form onsubmit={handleSubmit} class="space-y-6">
			<div class="space-y-2">
				<label for="username" class="text-sm font-medium">GitHub Username</label>
				<Input
					id="username"
					name="username"
					bind:value={username}
					placeholder="Enter GitHub username"
					required
				/>
			</div>

			<div class="space-y-2">
				<label for="year" class="text-sm font-medium">Year</label>
				<Input
					id="year"
					name="year"
					type="number"
					bind:value={year}
					min="2008"
					max={new Date().getFullYear()}
					required
				/>
			</div>

			<Button type="submit" disabled={isSubmitting} class="w-full">
				{#if isSubmitting}
					<Loader2 class="mr-2 size-4 animate-spin" />
					Loading...
				{:else}
					Track Contributions
				{/if}
			</Button>
		</form>
	</div>
</div>

<HowToUseDialog
	bind:open={showHowToUse}
	onClose={() => (hasSeenHowToUse.current = true)}
	title={githubContributionTrackerHowToUse.title}
	description={githubContributionTrackerHowToUse.description}
	tabs={githubContributionTrackerHowToUse.tabs}
	showFooterHelpText={githubContributionTrackerHowToUse.showFooterHelpText}
/>

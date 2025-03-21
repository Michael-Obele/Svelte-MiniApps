<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { Input } from '@/ui/input/index.js';
	import { Button } from '@/ui/button/index.js';
	import { toast } from 'svelte-sonner';
	import { onMount } from 'svelte';
	import { Loader2 } from 'lucide-svelte';
	import NavigationProgressIndicator from '$lib/components/NavigationProgressIndicator.svelte';
	import { navigating } from '$app/state';

	let username = $state('');
	let year = $state(new Date().getFullYear().toString());
	let isSubmitting = $state(false);

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
		// Note: We don't set isSubmitting to false here because we want the indicator
		// to continue showing during navigation and data loading on the next page
	}
	
	// Reset isSubmitting when navigation is complete
	$effect(() => {
		if (!navigating || !navigating.to) {
			isSubmitting = false;
		}
	});
</script>

<!-- The NavigationProgressIndicator will automatically show during navigation -->
<NavigationProgressIndicator active={isSubmitting} />

<div class="container mx-auto px-4 py-8">
	<h1 class="mb-8 text-center text-3xl font-bold">GitHub Contribution Tracker</h1>

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
					<Loader2 class="size-4 mr-2 animate-spin" />
					Loading...
				{:else}
					Track Contributions
				{/if}
			</Button>
		</form>
	</div>
</div>

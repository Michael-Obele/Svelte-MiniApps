<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';
	import UnderConstruction from '@/components/blocks/UnderConstruction.svelte';
	import FeatureFlag from '@/components/blocks/FeatureFlag.svelte';

	let username = $state('');
	let year = $state(new Date().getFullYear().toString());
	let isLoading = $state(false);

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		isLoading = true;

		const formData = new FormData(event.target as HTMLFormElement);

		try {
			const response = await fetch(`/apps/github-contribution-tracker/${username}/${year}`, {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				throw new Error('Failed to fetch data');
			}

			await goto(`/apps/github-contribution-tracker/${username}/${year}`);
		} catch (error) {
			toast.error('Failed to fetch GitHub data. Please try again.');
		} finally {
			isLoading = false;
		}
	}
</script>

<FeatureFlag>
	<!-- <UnderConstruction /> -->
</FeatureFlag>

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

			<Button type="submit" disabled={isLoading} class="w-full">
				{isLoading ? 'Loading...' : 'Track Contributions'}
			</Button>
		</form>
	</div>
</div>

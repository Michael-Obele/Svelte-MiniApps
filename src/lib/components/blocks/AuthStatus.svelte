<script>
	import { getCurrentUser } from '$lib/remote/auth.remote';

	// Reactive query - will automatically update when auth state changes
	let user = $state(getCurrentUser());
</script>

<div class="border-border bg-card text-card-foreground my-4 rounded-lg border p-4">
	<svelte:boundary>
		{@const result = await getCurrentUser()}
		{#if result}
			<div class="bg-accent text-accent-foreground rounded-md p-4">
				<p>Welcome back, {result.username}!</p>
				<p>Role: {result.role}</p>
				<p>Member since: {result.createdAt.toLocaleDateString()}</p>
			</div>
		{/if}
		{#snippet pending()}
			<p>Checking authentication...</p>
		{/snippet}
	</svelte:boundary>
</div>

<script>
	import { getCurrentUser } from '$lib/remote/auth.remote';

	// Reactive query - will automatically update when auth state changes
	let user = $state(getCurrentUser());
</script>

<div class="border-border bg-card text-card-foreground my-4 rounded-lg border p-4">
	{#await user}
		<p>Checking authentication...</p>
	{:then currentUser}
		{#if currentUser}
			<div class="bg-accent text-accent-foreground rounded-md p-4">
				<p>Welcome back, {currentUser.username}!</p>
				<p>Role: {currentUser.role}</p>
				<p>Member since: {currentUser.createdAt.toLocaleDateString()}</p>
			</div>
		{:else}
			<p>You are not logged in.</p>
		{/if}
	{:catch error}
		<p>Error checking authentication: {error.message}</p>
	{/await}
</div>

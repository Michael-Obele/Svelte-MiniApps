<script lang="ts">
	import { Card, CardHeader, CardContent, CardTitle } from '$lib/components/ui/card';
	import { page } from '$app/stores';
	import { Separator } from '$lib/components/ui/separator';
	import type { ActionData } from './$types.js';
	import { buttonVariants } from '$lib/components/ui/button';

	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';

	export let form: ActionData;

	import Button from '$lib/components/ui/button/button.svelte';
	import { enhance } from '$app/forms';
	import { formatDistance } from 'date-fns';

	let userData = $page.data.user?.userData;
	const userId = $page.data.user.userData.id;
</script>

<!--
@component
## Svelte Component: Saved Passwords Display
This component allows users to view and manage their saved passwords. It provides options to hide or view saved passwords and displays each password along with its creation date, title, and details. The component utilizes form handling and conditional rendering to display relevant information and actions based on the user's saved passwords.

## Key Features
- **View Saved Passwords**: Users can see all their saved passwords, including title, details, and creation date.
- **Hide Option**: Offers a way to hide saved passwords for security reasons.

## Form Handling
Utilizes enhanced form handling to submit requests for viewing or hiding passwords securely.
-->

<Card>
	<CardHeader>
		<CardTitle>Saved Passwords</CardTitle>
	</CardHeader>
	<CardContent class="grid gap-4">
		<form use:enhance action="?/viewPasswords" method="POST" class="space-y-4">
			<input type="hidden" name="id" value={userId} />
			{#if form?.displayPassword && form?.displayPassword.length > 0}
				<button formaction="?/hidePasswords" class={buttonVariants({ variant: 'secondary' })}
					>Hide Passwords</button
				>
			{:else}
				<Button type="submit">View Passwords</Button>
			{/if}
		</form>
		{#if form?.displayPassword}
			<ScrollArea class="h-64 rounded-md">
				{#each form?.displayPassword as password}
					<div class="my-2 flex items-center justify-between">
						<div class="space-y-6">
							<div class="rounded-md bg-slate-500 p-3 font-semibold">{password.password}</div>
							<div class="text-base">{password.title || ''}</div>
							<div class="text-sm text-muted-foreground">{password.details || ''}</div>
						</div>
						<div class="text-sm text-muted-foreground">
							{formatDistance(new Date(password.createdAt), Date.now())}
						</div>
					</div>
					<Separator />
				{/each}
			</ScrollArea>
		{/if}
	</CardContent>
</Card>

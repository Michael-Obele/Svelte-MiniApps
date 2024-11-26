<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import type { ActionData } from './$types.js';
	import { Card, CardHeader, CardContent, CardTitle } from '$lib/components/ui/card';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import { StarIcon } from 'lucide-svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	export let form: ActionData;

	let showPassword = false;
	$: password = showPassword ? 'text' : 'password';
	let userData = $page.data.user?.userData;
</script>

<!--
@component
## Svelte Component: Account Settings List
This component is intended to display a list of account settings that users can manage. Currently, it serves as a placeholder indicating that these features are under development and will be available soon.

## Key Features (Future)
- **Change Password**: Allow users to update their account password.
- **Update Email**: Enable users to modify their associated email address.
- **Manage Subscription**: Provide options for users to view or update their subscription plan (if applicable).
- **Edit Profile**: Allow users to update their profile information, such as their name and profile picture.

## Current State
As of now, the component displays a "Coming Soon" message, indicating that the account settings functionality is not yet implemented.
-->

<Card>
	<CardHeader>
		<CardTitle>Account Settings</CardTitle>
	</CardHeader>
	<CardContent class="grid gap-4">
		<div class="grid gap-2">
			<div class="flex items-center justify-between">
				<div>
					<div class="font-semibold">Change Password</div>
					<div class="text-sm text-muted-foreground">Update your password</div>
				</div>
				<Dialog.Root>
					<Dialog.Trigger>
						<Button size="sm">Change</Button>
					</Dialog.Trigger>
					<Dialog.Content>
						<form action="?/updatePassword" use:enhance method="POST">
							<Dialog.Header>
								<Dialog.Title>Are you sure absolutely sure?</Dialog.Title>
								<Dialog.Description>
									Changing your password is a permanent action. Make sure you remember your new
									password, as you won't be able to recover your old one.
								</Dialog.Description>
							</Dialog.Header>
							<input type="hidden" name="id" value={userData.id} />
							<Label for="currentPassword">Current Password:</Label>
							<Input type={password} id="currentPassword" name="currentPassword" required />

							<Label for="newPassword">New Password:</Label>
							<Input type={password} id="newPassword" name="newPassword" required />
							<span class="my-3 flex items-center">
								<input
									type="checkbox"
									bind:checked={showPassword}
									name="showPassword"
									id="showPassword"
									class="form-checkbox mx-2 h-5 w-5 text-indigo-600"
								/>
								<Label
									for="showPassword"
									class="ml-2 text-sm text-gray-700 hover:cursor-pointer dark:text-gray-200"
									>Show Passwords</Label
								>
							</span>

							<Dialog.Footer>
								<Button type="submit">Save changes</Button>
							</Dialog.Footer>
							{#if form?.error}
								<p class="mt-2 text-sm text-red-500 dark:text-red-400">{form?.error}</p>
							{:else if form?.message}
								<p class="mt-2 text-sm text-green-500 dark:text-green-400">{form?.message}</p>
							{/if}
						</form>
					</Dialog.Content>
				</Dialog.Root>
			</div>
			{#if form?.error}
				<p class="mt-2 text-sm text-red-500 dark:text-red-400">{form?.error}</p>
			{:else if form?.message}
				<p class="mt-2 text-sm text-green-500 dark:text-green-400">{form?.message}</p>
			{/if}
			<!-- <div class="flex items-center justify-between">
				<div>
					<div class="font-semibold">Update Email</div>
					<div class="text-sm text-muted-foreground">Change your email address</div>
				</div>
				<Button size="sm">Update</Button>
			</div>
			<div class="flex items-center justify-between">
				<div>
					<div class="font-semibold">Manage Subscription</div>
					<div class="text-sm text-muted-foreground">View or update your plan</div>
				</div>
				<Button size="sm">Manage</Button>
			</div>
			<div class="flex items-center justify-between">
				<div>
					<div class="font-semibold">Edit Profile</div>
					<div class="text-sm text-muted-foreground">Update your name and profile picture</div>
				</div>
				<Button size="sm">Edit</Button>
			</div> -->
		</div>
		<h3>More Coming Soon</h3>
	</CardContent>
</Card>

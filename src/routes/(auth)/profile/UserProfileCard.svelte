<script lang="ts">
	import { getContext } from 'svelte';
	import { Card, CardHeader, CardContent, CardTitle, CardFooter, CardDescription } from '@/ui/card';
	import { Avatar, AvatarFallback, AvatarImage } from '@/ui/avatar';
	import { Badge } from '@/ui/badge';
	import { Button } from '@/ui/button';
	import { Separator } from '@/ui/separator';
	import * as Dialog from '@/ui/dialog';
	import { Input } from '@/ui/input';
	import { Label } from '@/ui/label';
	import { Edit2, Github, Calendar, Shield } from '@lucide/svelte';
	import { updateProfile } from '$lib/remote';
	import { toast } from 'svelte-sonner';

	// Get profile query from context (no prop drilling!)
	const profileQuery = getContext<any>('profileQuery');
	const userData = $derived(profileQuery.current?.user);
	const userStats = $derived(profileQuery.current?.stats);

	// Format join date
	function formatJoinDate(dateString: string) {
		if (!dateString) return 'Unknown';
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	// Format account age
	function formatAccountAge(days: number) {
		if (days < 30) return `${days} days`;
		if (days < 365) return `${Math.floor(days / 30)} months`;
		return `${Math.floor(days / 365)} years`;
	}

	// Edit dialog state
	let showEditDialog = $state(false);
	let editUsername = $state('');
	let editAge = $state('');
	let isSubmitting = $state(false);

	// Update edit values when dialog opens
	$effect(() => {
		if (showEditDialog && userData) {
			editUsername = userData.username;
			editAge = userData.age?.toString() || '';
		}
	});

	// Handle form submission with toast notifications
	async function handleUpdateProfile(event: SubmitEvent) {
		event.preventDefault();
		isSubmitting = true;

		const toastId = toast.loading('Updating profile...');

		try {
			const formData = new FormData(event.target as HTMLFormElement);
			const response = await fetch(updateProfile.action, {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			if (response.ok && result.success) {
				toast.success('Profile updated successfully!', { id: toastId });
				profileQuery.refresh();
				showEditDialog = false;
			} else {
				toast.error(result.message || 'Failed to update profile', { id: toastId });
			}
		} catch (error) {
			toast.error('An error occurred while updating profile', { id: toastId });
		} finally {
			isSubmitting = false;
		}
	}
</script>

<!--
@component
## Svelte Component: User Profile Card
This component displays a user's profile information, including their avatar, username, email, and admin status. It also provides a message about password recovery if the user does not have an associated email address.

## Key Features
- **User Information**: Displays the user's avatar, username, and email address.
- **Admin Status**: Shows a badge indicating whether the user has admin privileges.
- **Password Recovery Message**: Informs users without an associated email about the inability to recover their password.

## Data Source
Utilizes the `userData` object from the `page.data.user` store to populate the profile information.
-->

{#if userData && userStats}
	<Card class="h-full">
		<CardHeader class="pb-2 text-center">
			<div class="mx-auto mb-4">
				<Avatar class="border-primary/10 h-24 w-24 border-4">
					<AvatarFallback class="text-2xl"
						>{userData.username[0]?.toUpperCase() || 'U'}</AvatarFallback
					>
				</Avatar>
			</div>
			<CardTitle class="text-xl">{userData.username}</CardTitle>
			<CardDescription class="text-muted-foreground text-sm">
				@{userData.username.toLowerCase()}
			</CardDescription>

			<div class="mt-2 flex justify-center gap-2">
				{#if userData.isAdmin}
					<Badge variant="default" class="gap-1 bg-gradient-to-r from-indigo-500 to-purple-500">
						<Shield class="h-3 w-3" />
						<span>Admin</span>
					</Badge>
				{/if}
				{#if userData.hasGithub}
					<Badge variant="outline" class="gap-1">
						<Github class="h-3 w-3" />
						<span>GitHub</span>
					</Badge>
				{/if}
				<Badge variant="secondary" class="gap-1">
					<Calendar class="h-3 w-3" />
					<span>Member</span>
				</Badge>
			</div>
		</CardHeader>

		<CardContent>
			<div class="grid grid-cols-2 gap-4 py-2 text-center">
				<div>
					<p class="text-muted-foreground text-sm">Account Age</p>
					<p class="text-lg font-bold">{formatAccountAge(userStats.accountAge)}</p>
				</div>
				<div>
					<p class="text-muted-foreground text-sm">Joined</p>
					<p class="text-xs font-medium">{formatJoinDate(userData.createdAt)}</p>
				</div>
				<div>
					<p class="text-muted-foreground text-sm">Budgets</p>
					<p class="text-lg font-bold">{userStats.totalBudgets}</p>
				</div>
				<div>
					<p class="text-muted-foreground text-sm">Mantras</p>
					<p class="text-lg font-bold">{userStats.totalMantras}</p>
				</div>
			</div>

			<Separator class="my-4" />

			<div class="space-y-2 text-sm">
				<div class="flex items-center justify-between">
					<span class="text-muted-foreground">Saved Passwords</span>
					<span class="font-medium">{userStats.totalPasswords}</span>
				</div>
				<div class="flex items-center justify-between">
					<span class="text-muted-foreground">Social Pages</span>
					<span class="font-medium">{userStats.totalSocialPages}</span>
				</div>
			</div>
		</CardContent>

		<CardFooter class="flex justify-between gap-2">
			<Button
				variant="outline"
				size="sm"
				class="w-full gap-1"
				onclick={() => (showEditDialog = true)}
			>
				<Edit2 class="h-4 w-4" />
				<span>Edit Profile</span>
			</Button>
		</CardFooter>
	</Card>

	<!-- Edit Profile Dialog -->
	<Dialog.Root bind:open={showEditDialog}>
		<Dialog.Content class="sm:max-w-[425px]">
			<Dialog.Header>
				<Dialog.Title>Edit Profile</Dialog.Title>
				<Dialog.Description>
					Make changes to your profile here. Click save when you're done.
				</Dialog.Description>
			</Dialog.Header>
			<form onsubmit={handleUpdateProfile}>
				<div class="grid gap-4 py-4">
					<div class="grid gap-2">
						<Label for="username">Username</Label>
						<Input
							type="text"
							name="username"
							id="username"
							bind:value={editUsername}
							placeholder="Enter username"
							required
						/>
					</div>
					<div class="grid gap-2">
						<Label for="age">Age (optional)</Label>
						<Input type="number" name="age" id="age" bind:value={editAge} placeholder="Enter age" />
					</div>
				</div>
				<Dialog.Footer>
					<Button type="button" variant="outline" onclick={() => (showEditDialog = false)}>
						Cancel
					</Button>
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? 'Saving...' : 'Save changes'}
					</Button>
				</Dialog.Footer>
			</form>
		</Dialog.Content>
	</Dialog.Root>
{:else}
	<Card class="h-full">
		<CardContent class="flex items-center justify-center p-8">
			<p class="text-muted-foreground">Loading profile...</p>
		</CardContent>
	</Card>
{/if}

<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Edit2, Github, Calendar, Shield } from 'lucide-svelte';
	import { updateProfile, getUserProfile } from '$lib/remote';
	import { toast } from 'svelte-sonner';

	// Get profile data directly from remote function (cached, same instance returned across components)
	const profileQuery = getUserProfile();
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

	// Sync edit values to form fields when dialog opens or userData changes
	$effect(() => {
		if (showEditDialog && userData) {
			updateProfile.fields.username.set(userData.username);
			updateProfile.fields.age.set(userData.age?.toString() || '');
		}
	});

	// Track pending state (convert to boolean with !!)
	let isSubmitting = $derived(!!updateProfile.pending);
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
	<Card.Root class="h-full">
		<Card.Header class="pb-2 text-center">
			<div class="mx-auto mb-4">
				<div class="relative">
					<Avatar.Root class="border-primary/20 relative size-24 border-4 shadow-lg">
						<Avatar.Fallback class="bg-primary/10 text-2xl"
							>{userData.username[0]?.toUpperCase() || 'U'}</Avatar.Fallback
						>
					</Avatar.Root>
				</div>
			</div>
			<Card.Title class="text-xl">{userData.username}</Card.Title>
			<Card.Description class="text-muted-foreground text-sm">
				@{userData.username.toLowerCase()}
			</Card.Description>

			<div class="mt-3 flex flex-wrap justify-center gap-2">
				{#if userData.isAdmin}
					<Badge variant="default" class="gap-1.5 bg-indigo-500 shadow-md hover:bg-indigo-600">
						<Shield class="size-3" />
						<span>Admin</span>
					</Badge>
				{/if}
				{#if userData.hasGithub}
					<Badge variant="outline" class="border-primary/20 gap-1.5 shadow-sm">
						<Github class="size-3" />
						<span>GitHub</span>
					</Badge>
				{/if}
				<Badge variant="secondary" class="gap-1.5 shadow-sm">
					<Calendar class="size-3" />
					<span>Member</span>
				</Badge>
			</div>
		</Card.Header>

		<Card.Content>
			<div class="grid grid-cols-2 gap-4 py-3">
				<div class="border-border/50 bg-muted/30 rounded-lg border p-3 text-center">
					<p class="text-muted-foreground mb-1 text-xs font-medium">Account Age</p>
					<p class="text-lg font-bold">{formatAccountAge(userStats.accountAge)}</p>
				</div>
				<div class="border-border/50 bg-muted/30 rounded-lg border p-3 text-center">
					<p class="text-muted-foreground mb-1 text-xs font-medium">Joined</p>
					<p class="text-xs font-medium">{formatJoinDate(userData.createdAt)}</p>
				</div>
				<div class="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 text-center">
					<p class="text-muted-foreground mb-1 text-xs font-medium">Budgets</p>
					<p class="text-lg font-bold">{userStats.totalBudgets}</p>
				</div>
				<div class="rounded-lg border border-purple-500/20 bg-purple-500/5 p-3 text-center">
					<p class="text-muted-foreground mb-1 text-xs font-medium">Mantras</p>
					<p class="text-lg font-bold">{userStats.totalMantras}</p>
				</div>
			</div>

			<Separator class="my-4" />

			<div class="space-y-3 text-sm">
				<div
					class="border-border/50 bg-muted/30 flex items-center justify-between rounded-lg border p-2.5"
				>
					<span class="text-muted-foreground flex items-center gap-2">
						<span class="bg-primary size-1.5 rounded-full"></span>
						Saved Passwords
					</span>
					<span class="font-semibold">{userStats.totalPasswords}</span>
				</div>
				<div
					class="border-border/50 bg-muted/30 flex items-center justify-between rounded-lg border p-2.5"
				>
					<span class="text-muted-foreground flex items-center gap-2">
						<span class="bg-primary size-1.5 rounded-full"></span>
						Social Pages
					</span>
					<span class="font-semibold">{userStats.totalSocialPages}</span>
				</div>
			</div>
		</Card.Content>

		<Card.Footer class="flex justify-between gap-2">
			<Button
				variant="outline"
				size="sm"
				class="w-full gap-1.5 shadow-sm transition-all hover:shadow-md"
				onclick={() => (showEditDialog = true)}
			>
				<Edit2 class="size-4" />
				<span>Edit Profile</span>
			</Button>
		</Card.Footer>
	</Card.Root>

	<!-- Edit Profile Dialog -->
	<Dialog.Root bind:open={showEditDialog}>
		<Dialog.Content class="sm:max-w-[425px]">
			<Dialog.Header>
				<Dialog.Title>Edit Profile</Dialog.Title>
				<Dialog.Description>
					Make changes to your profile here. Click save when you're done.
				</Dialog.Description>
			</Dialog.Header>
			<form
				{...updateProfile.enhance(async ({ form, submit }) => {
					const toastId = toast.loading('Updating profile...');
					try {
						await submit();
						toast.success('Profile updated successfully!', { id: toastId });
						showEditDialog = false;
						await getUserProfile().refresh();
					} catch (error) {
						toast.error('Failed to update profile', { id: toastId });
					}
				})}
			>
				<div class="grid gap-4 py-4">
					<div class="grid gap-2">
						<Label for="username">Username</Label>
						<Input
							type="text"
							name="username"
							id="username"
							value={updateProfile.fields.username.value()}
							oninput={(e) => updateProfile.fields.username.set(e.currentTarget.value)}
							placeholder="Enter username"
							required
						/>
					</div>
					<div class="grid gap-2">
						<Label for="age">Age (optional)</Label>
						<Input
							type="number"
							name="age"
							id="age"
							value={updateProfile.fields.age.value()}
							oninput={(e) => updateProfile.fields.age.set(e.currentTarget.value)}
							placeholder="Enter age"
						/>
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
	<Card.Root class="h-full">
		<Card.Content class="flex items-center justify-center p-8">
			<p class="text-muted-foreground">Loading profile...</p>
		</Card.Content>
	</Card.Root>
{/if}

<script lang="ts">
	import { getContext } from 'svelte';
	import { Button } from '@/ui/button';
	import { Separator } from '@/ui/separator';
	import * as Dialog from '@/ui/dialog';
	import { Label } from '@/ui/label';
	import { Input } from '@/ui/input';
	import { Switch } from '@/ui/switch';
	import {
		User,
		Shield,
		Trash2,
		AlertTriangle,
		Github,
		Chrome
	} from '@lucide/svelte';
	import { deleteAccount } from '$lib/remote';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';

	// Get profile query from context
	const profileQuery = getContext<any>('profileQuery');
	const userData = $derived(profileQuery.current?.user);

	// Dialog states
	let showDeleteDialog = $state(false);
	let confirmDeleteInput = $state('');

	// Account settings state
	let twoFactorEnabled = $state(false);
	let emailNotifications = $state(true);
	let marketingEmails = $state(false);

	// Derived state for delete button
	let canDelete = $derived(confirmDeleteInput === userData?.username);

	// Submitting state
	let isDeleting = $state(false);

	// Handle account deletion with toast notifications
	async function handleDeleteAccount(event: SubmitEvent) {
		event.preventDefault();
		isDeleting = true;

		const toastId = toast.loading('Deleting account...');

		try {
			const formData = new FormData(event.target as HTMLFormElement);
			const response = await fetch(deleteAccount.action, {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				toast.success('Account deleted successfully. Redirecting...', { id: toastId });
				setTimeout(() => {
					goto('/login');
				}, 1500);
			} else {
				const result = await response.json();
				toast.error(result.message || 'Failed to delete account', { id: toastId });
				isDeleting = false;
			}
		} catch (error) {
			toast.error('An error occurred while deleting account', { id: toastId });
			isDeleting = false;
		}
	}
</script>

{#if userData}
<div class="space-y-6">
	<!-- Account Information -->
	<div>
		<h3 class="mb-4 text-lg font-semibold">Account Information</h3>
		<div class="space-y-4">
			<div class="flex items-center justify-between rounded-lg border p-4">
				<div class="flex items-center gap-3">
					<div class="rounded-full bg-primary/10 p-2">
						<User class="h-4 w-4 text-primary" />
					</div>
					<div>
						<p class="font-medium">Username</p>
						<p class="text-sm text-muted-foreground">{userData.username}</p>
					</div>
				</div>
				<Button variant="ghost" size="sm">Change</Button>
			</div>

			<div class="flex items-center justify-between rounded-lg border p-4">
				<div class="flex items-center gap-3">
					<div class="rounded-full bg-primary/10 p-2">
						<Shield class="h-4 w-4 text-primary" />
					</div>
					<div>
						<p class="font-medium">Account Role</p>
						<p class="text-sm text-muted-foreground capitalize">{userData.role}</p>
					</div>
				</div>
				{#if userData.isAdmin}
					<span class="text-sm font-medium text-primary">Admin Access</span>
				{/if}
			</div>
		</div>
	</div>

	<Separator />

	<!-- Connected Accounts -->
	<div>
		<h3 class="mb-4 text-lg font-semibold">Connected Accounts</h3>
		<div class="space-y-3">
			<div class="flex items-center justify-between rounded-lg border p-4">
				<div class="flex items-center gap-3">
					<Github class="h-5 w-5" />
					<div>
						<p class="font-medium">GitHub</p>
						<p class="text-sm text-muted-foreground">
							{userData.hasGithub ? 'Connected' : 'Not connected'}
						</p>
					</div>
				</div>
				<Button variant={userData.hasGithub ? 'outline' : 'default'} size="sm">
					{userData.hasGithub ? 'Disconnect' : 'Connect'}
				</Button>
			</div>

			<div class="flex items-center justify-between rounded-lg border p-4">
				<div class="flex items-center gap-3">
					<Chrome class="h-5 w-5" />
					<div>
						<p class="font-medium">Google</p>
						<p class="text-sm text-muted-foreground">
							{userData.hasGoogle ? 'Connected' : 'Not connected'}
						</p>
					</div>
				</div>
				<Button variant={userData.hasGoogle ? 'outline' : 'default'} size="sm">
					{userData.hasGoogle ? 'Disconnect' : 'Connect'}
				</Button>
			</div>
		</div>
	</div>

	<Separator />

	<!-- Security Settings -->
	<div>
		<h3 class="mb-4 text-lg font-semibold">Security</h3>
		<div class="space-y-4">
			<div class="flex items-center justify-between rounded-lg border p-4">
				<div class="flex-1">
					<p class="font-medium">Two-Factor Authentication</p>
					<p class="text-sm text-muted-foreground">
						Add an extra layer of security to your account
					</p>
				</div>
				<Switch bind:checked={twoFactorEnabled} />
			</div>

			<div class="flex items-center justify-between rounded-lg border p-4">
				<div class="flex-1">
					<p class="font-medium">Email Notifications</p>
					<p class="text-sm text-muted-foreground">Receive security alerts via email</p>
				</div>
				<Switch bind:checked={emailNotifications} />
			</div>

			<div class="flex items-center justify-between rounded-lg border p-4">
				<div class="flex-1">
					<p class="font-medium">Marketing Emails</p>
					<p class="text-sm text-muted-foreground">Receive updates about new features</p>
				</div>
				<Switch bind:checked={marketingEmails} />
			</div>
		</div>
	</div>

	<Separator />

	<!-- Danger Zone -->
	<div>
		<h3 class="mb-4 text-lg font-semibold text-destructive">Danger Zone</h3>
		<div class="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
			<div class="flex items-start justify-between">
				<div class="flex items-start gap-3">
					<AlertTriangle class="h-5 w-5 text-destructive" />
					<div>
						<p class="font-medium text-destructive">Delete Account</p>
						<p class="text-sm text-muted-foreground">
							Permanently delete your account and all associated data. This action cannot be undone.
						</p>
					</div>
				</div>
				<Button
					variant="destructive"
					size="sm"
					onclick={() => (showDeleteDialog = true)}
					class="ml-4"
				>
					<Trash2 class="mr-2 h-4 w-4" />
					Delete
				</Button>
			</div>
		</div>
	</div>
</div>

<!-- Delete Account Dialog -->
<Dialog.Root bind:open={showDeleteDialog}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title class="text-destructive">Delete Account</Dialog.Title>
			<Dialog.Description>
				This action is permanent and cannot be undone. All your data will be permanently deleted.
			</Dialog.Description>
		</Dialog.Header>
		<form onsubmit={handleDeleteAccount}>
			<div class="grid gap-4 py-4">
				<div class="rounded-lg bg-destructive/10 p-4">
					<p class="text-sm font-medium text-destructive">Warning:</p>
					<ul class="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
						<li>All your budgets and expenses will be deleted</li>
						<li>All your saved passwords will be deleted</li>
						<li>All your mantras and social pages will be deleted</li>
						<li>This action cannot be reversed</li>
					</ul>
				</div>
				<div class="grid gap-2">
					<Label for="confirmUsername">
						Type <span class="font-mono font-bold">{userData.username}</span> to confirm
					</Label>
					<Input
						type="text"
						name="confirmUsername"
						id="confirmUsername"
						bind:value={confirmDeleteInput}
						placeholder="Enter your username"
						required
					/>
				</div>
			</div>
			<Dialog.Footer>
				<Button
					type="button"
					variant="outline"
					onclick={() => {
						showDeleteDialog = false;
						confirmDeleteInput = '';
					}}
				>
					Cancel
				</Button>
				<Button type="submit" variant="destructive" disabled={!canDelete || isDeleting}>
					{isDeleting ? 'Deleting...' : 'Delete Account'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
{:else}
	<div class="flex items-center justify-center p-8">
		<p class="text-muted-foreground">Loading account settings...</p>
	</div>
{/if}

<script lang="ts">
	import { Input } from '@/ui/input';
	import { Button } from '@/ui/button';
	import { Eye, EyeOff, Copy, Trash2, Check, Pencil } from '@lucide/svelte';
	import { copyToClipboard } from '$lib/utils';
	import { toast } from 'svelte-sonner';
	import * as Dialog from '@/ui/dialog';
	import { Label } from '@/ui/label';
	import { Textarea } from '@/ui/textarea';
	import { editPassword, deletePassword, getSavedPasswords } from '$lib/remote';

	let {
		password,
		showDelete = true,
		showEdit = true
	}: {
		password: {
			id: string;
			passwordHash: string;
			createdAt: Date | string;
			details: string | null;
		};
		showDelete?: boolean;
		showEdit?: boolean;
	} = $props();

	let showPassword = $state(false);
	let copySuccess = $state(false);
	let dialogOpen = $state(false);
	let isEditing = $state(false);
	let isDeleting = $state(false);

	// Edit form state
	let editedPassword = $state(password.passwordHash);
	let editedDetails = $state(password.details || '');

	// Create colored password display
	let coloredPassword = $derived.by(() => {
		const pwd = showPassword ? password.passwordHash : '•'.repeat(password.passwordHash.length);
		return pwd.split('').map((char) => {
			if (char === '•') return { char, colorClass: 'text-foreground' };

			let colorClass = '';
			if (/\d/.test(char)) {
				colorClass = 'text-orange-700 dark:text-orange-400'; // Numbers in orange
			} else if (/[^A-Za-z0-9]/.test(char)) {
				colorClass = 'text-purple-700 dark:text-purple-400'; // Special characters in purple
			} else {
				colorClass = 'text-foreground'; // Letters in default color
			}
			return { char, colorClass };
		});
	});

	async function copyPassword() {
		await copyToClipboard(
			password.passwordHash,
			'Password copied to clipboard',
			'Failed to copy password',
			() => {
				// Success callback - show check icon
				copySuccess = true;
				setTimeout(() => {
					copySuccess = false;
				}, 2000); // Hide check icon after 2 seconds
			}
		);
	}

	async function handleEdit() {
		if (isEditing) return;

		try {
			isEditing = true;
			await editPassword({
				passwordId: password.id,
				password: editedPassword,
				details: editedDetails || null
			});
			toast.success('Password updated successfully!');
			dialogOpen = false;
			// Refresh the query so all instances update
			await getSavedPasswords().refresh();
		} catch (error) {
			console.error('Error updating password:', error);
			toast.error('Failed to update password');
		} finally {
			isEditing = false;
		}
	}

	async function handleDelete() {
		if (isDeleting) return;

		try {
			isDeleting = true;
			await deletePassword(password.id);
			toast.success('Password deleted successfully!');
		} catch (error) {
			console.error('Error deleting password:', error);
			toast.error('Failed to delete password');
		} finally {
			// Refresh the query so all instances update
			await getSavedPasswords().refresh();
			isDeleting = false;
		}
	}

	function resetForm() {
		editedPassword = password.passwordHash;
		editedDetails = password.details || '';
	}
</script>

<div
	class="bg-card hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4 transition-colors"
>
	<div class="flex-1 space-y-2">
		<div class="flex flex-wrap items-center gap-2">
			<div
				class="flex h-auto min-h-[2.5rem] flex-1 items-center border-none bg-transparent p-0 font-mono text-lg focus-visible:ring-0 md:text-xl"
			>
				{#each coloredPassword as { char, colorClass }}
					<span class={colorClass}>{char}</span>
				{/each}
			</div>
			<div class="flex items-center gap-1">
				<Button
					onclick={() => (showPassword = !showPassword)}
					variant="ghost"
					size="sm"
					class="h-9 w-9 p-0"
					aria-label={showPassword ? 'Hide password' : 'Show password'}
				>
					{#if showPassword}
						<EyeOff class="h-4 w-4" />
					{:else}
						<Eye class="h-4 w-4" />
					{/if}
				</Button>
				<Button
					onclick={copyPassword}
					variant="ghost"
					size="sm"
					class="h-9 w-9 p-0 {copySuccess ? 'text-green-600' : ''}"
					aria-label="Copy password"
				>
					{#if copySuccess}
						<Check class="h-4 w-4" />
					{:else}
						<Copy class="h-4 w-4" />
					{/if}
				</Button>
				{#if showEdit}
					<Button
						onclick={() => {
							resetForm();
							dialogOpen = true;
						}}
						variant="ghost"
						size="sm"
						class="h-9 w-9 p-0"
						aria-label="Edit password"
					>
						<Pencil class="h-4 w-4" />
					</Button>
				{/if}
				{#if showDelete}
					<Button
						onclick={handleDelete}
						variant="ghost"
						size="sm"
						class="text-destructive hover:text-destructive h-9 w-9 p-0"
						disabled={isDeleting}
						aria-label="Delete password"
					>
						{#if isDeleting}
							<div
								class="size-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"
							></div>
						{:else}
							<Trash2 class="h-4 w-4" />
						{/if}
					</Button>
				{/if}
			</div>
		</div>
		<div class="space-y-1">
			{#if password.details}
				<p class="text-sm font-medium">{password.details}</p>
			{/if}
			<p class="text-muted-foreground text-xs">
				Saved on {new Date(password.createdAt).toLocaleDateString()} at {new Date(
					password.createdAt
				).toLocaleTimeString()}
			</p>
		</div>
	</div>
</div>

<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Content class="sm:max-w-[500px]">
		<Dialog.Header>
			<Dialog.Title>Edit Password</Dialog.Title>
			<Dialog.Description>
				Update your password and its details. Click save when you're done.
			</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="grid gap-2">
				<Label for="password">Password</Label>
				<Input
					id="password"
					type="text"
					bind:value={editedPassword}
					class="font-mono"
					placeholder="Enter password"
				/>
			</div>
			<div class="grid gap-2">
				<Label for="details">Details (optional)</Label>
				<Textarea
					id="details"
					bind:value={editedDetails}
					placeholder="Add details about this password..."
					class="min-h-[100px] resize-none"
					maxlength={200}
				/>
				<p class="text-muted-foreground text-xs">
					{editedDetails.length}/200 characters
				</p>
			</div>
		</div>
		<Dialog.Footer class="flex-col gap-2 sm:flex-row sm:justify-end">
			<Button
				variant="outline"
				onclick={() => {
					dialogOpen = false;
					resetForm();
				}}
				disabled={isEditing}
			>
				Cancel
			</Button>
			<Button onclick={handleEdit} disabled={isEditing || !editedPassword.trim()}>
				{#if isEditing}
					<div
						class="mr-2 size-4 animate-spin rounded-full border-2 border-white border-t-transparent"
					></div>
					Saving...
				{:else}
					Save changes
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

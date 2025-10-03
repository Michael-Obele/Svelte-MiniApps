<script lang="ts">
	import { Trash2, AlertTriangle } from '@lucide/svelte';
	import * as AlertDialog from '@/ui/alert-dialog';
	import { Button } from '@/ui/button';

	interface Props {
		open: boolean;
		title: string;
		description: string;
		itemName?: string;
		onConfirm: () => void | Promise<void>;
		onCancel: () => void;
		isDeleting?: boolean;
	}

	let {
		open = $bindable(false),
		title,
		description,
		itemName,
		onConfirm,
		onCancel,
		isDeleting = false
	}: Props = $props();

	async function handleConfirm() {
		await onConfirm();
	}
</script>

<AlertDialog.Root bind:open>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<div class="flex items-center gap-3">
				<div
					class="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/20"
				>
					<AlertTriangle class="h-5 w-5 text-red-600 dark:text-red-400" />
				</div>
				<div>
					<AlertDialog.Title class="text-xl font-semibold">{title}</AlertDialog.Title>
				</div>
			</div>
		</AlertDialog.Header>

		<div class="py-4">
			<AlertDialog.Description class="text-base">
				{description}
			</AlertDialog.Description>

			{#if itemName}
				<div class="mt-4 rounded-lg bg-red-50 p-3 dark:bg-red-900/10">
					<p class="text-sm font-medium text-red-900 dark:text-red-100">
						{itemName}
					</p>
				</div>
			{/if}

			<div class="mt-4 rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/10">
				<p class="text-sm text-yellow-900 dark:text-yellow-100">⚠️ This action cannot be undone.</p>
			</div>
		</div>

		<AlertDialog.Footer>
			<AlertDialog.Cancel onclick={onCancel} disabled={isDeleting}>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action onclick={handleConfirm} disabled={isDeleting}>
				{#if isDeleting}
					<span class="flex items-center gap-2">
						<span
							class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
						></span>
						Deleting...
					</span>
				{:else}
					<Trash2 class="mr-2 h-4 w-4" />
					Delete
				{/if}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

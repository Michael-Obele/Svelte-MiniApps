<script lang="ts">
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Trash2 } from 'lucide-svelte';

	let {
		open,
		title,
		description,
		confirmText = 'Delete',
		cancelText = 'Cancel',
		onConfirm,
		onCancel
	}: {
		open: boolean;
		title: string;
		description: string;
		confirmText?: string;
		cancelText?: string;
		onConfirm: () => void;
		onCancel: () => void;
	} = $props();
</script>

<Dialog.Root {open} onOpenChange={onCancel}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>{title}</Dialog.Title>
			<Dialog.Description>
				{description}
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="outline" onclick={onCancel}>
				{cancelText}
			</Button>
			<Button variant="destructive" onclick={onConfirm}>
				<Trash2 class="mr-2 size-4" />
				{confirmText}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

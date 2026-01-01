<script lang="ts">
	import {
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogFooter,
		DialogDescription
	} from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import type { Note } from '../states.svelte';

	let {
		open = $bindable(false),
		onOpenChange: onOpenChangeProp = () => {},
		note = null
	} = $props<{
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		note?: Note | null;
	}>();

	function onOpenChange(val: boolean) {
		open = val;
		onOpenChangeProp(val);
	}
</script>

<Dialog {open} onOpenChange={(v) => onOpenChange(v)}>
	<DialogContent class="sm:max-w-[600px]">
		<DialogHeader>
			<DialogTitle class="text-2xl">{note?.title || 'Note Details'}</DialogTitle>
			{#if note?.updatedAt}
				<DialogDescription>
					Last updated: {new Date(note.updatedAt).toLocaleString()}
				</DialogDescription>
			{/if}
		</DialogHeader>

		{#if note}
			<div class="py-4">
				<ScrollArea class="h-[60vh] rounded-md border p-4">
					<div class="text-base leading-relaxed whitespace-pre-wrap">
						{note.content}
					</div>
				</ScrollArea>
			</div>
		{/if}

		<DialogFooter>
			<Button variant="outline" onclick={() => onOpenChange(false)}>Close</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>

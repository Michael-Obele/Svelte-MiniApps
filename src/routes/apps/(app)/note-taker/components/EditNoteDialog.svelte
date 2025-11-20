<script lang="ts">
	import {
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogFooter
	} from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { RefreshCw } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let {
		open = false,
		onOpenChange: onOpenChangeProp = () => {},
		updateNoteForm,
		noteAdapter,
		note = null,
		onSaved = () => {},
		currentUser = null
	} = $props();
	let isSaving = $state(false);

	function onOpenChange(val: boolean) {
		open = val;
		onOpenChangeProp(val);
	}

	async function handleLocalUpdate(e: SubmitEvent) {
		e.preventDefault();
		if (!note) return;
		const formData = new FormData(e.currentTarget as HTMLFormElement);
		const title = formData.get('title') as string;
		const content = formData.get('content') as string;
		isSaving = true;
		try {
			await noteAdapter.saveItem({
				id: note.id,
				payload: { ...note, title, content },
				createdAt: note.createdAt,
				updatedAt: new Date().toISOString()
			});
			toast.success('Note updated locally');
			onSaved({ ...note, title, content, updatedAt: new Date().toISOString() });
			(e.target as HTMLFormElement).reset();
			onOpenChange(false);
		} catch (err) {
			toast.error('Failed to update note locally');
		} finally {
			isSaving = false;
		}
	}
</script>

<Dialog {open} onOpenChange={(v) => onOpenChange(v)}>
	<DialogContent class="sm:max-w-[550px]">
		<DialogHeader>
			<DialogTitle class="text-2xl">Edit Note</DialogTitle>
		</DialogHeader>
		{#if note}
			<form
				{...currentUser
					? updateNoteForm.enhance(async ({ form, submit }: { form: HTMLFormElement; submit: () => Promise<any> }) => {
							isSaving = true;
							try {
								const result = await submit();
								if (result?.success && result?.note) {
									// Update local persisted store with server note
									await noteAdapter.saveItem({
										id: result.note.id,
										payload: result.note,
										createdAt: result.note.createdAt,
										updatedAt: result.note.updatedAt
									});
									toast.success('Note updated');
									form.reset();
									onOpenChange(false);
								} else {
									toast.error('Failed to update note');
								}
							} catch (e) {
								toast.error('Failed to update note');
							} finally {
								isSaving = false;
							}
						})
					: {}}
				onsubmit={currentUser ? undefined : handleLocalUpdate}
				class="space-y-6 py-4"
			>
				<input type="hidden" name="id" value={note.id} />
				<div class="space-y-2">
					<Label for="edit-title" class="text-base">Title</Label>
					<Input
						id="edit-title"
						name="title"
						value={note.title}
						placeholder="Enter note title..."
						required
						class="text-base"
					/>
				</div>
				<div class="space-y-2">
					<Label for="edit-content" class="text-base">Content</Label>
					<Textarea
						id="edit-content"
						name="content"
						value={note.content}
						rows={8}
						placeholder="Write your thoughts..."
						class="resize-none"
					/>
				</div>
				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onclick={() => onOpenChange(false)}
						disabled={isSaving}
					>
						Cancel
					</Button>
					<Button type="submit" disabled={isSaving}>
						{#if isSaving}
							<RefreshCw class="mr-2 size-4 animate-spin" />
						{/if}
						Update Note
					</Button>
				</DialogFooter>
			</form>
		{/if}
	</DialogContent>
</Dialog>

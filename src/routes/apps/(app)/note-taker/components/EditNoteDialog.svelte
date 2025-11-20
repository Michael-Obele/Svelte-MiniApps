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
			await toast.promise(
				noteAdapter.saveItem({
					id: note.id,
					payload: { ...note, title, content },
					createdAt: note.createdAt,
					updatedAt: new Date().toISOString()
				}),
				{
					loading: 'Saving note locally...',
					success: 'Note updated locally',
					error: 'Failed to update note locally'
				}
			);
			onSaved({ ...note, title, content, updatedAt: new Date().toISOString() });
			onOpenChange(false);
		} catch (err) {
			// fallback
		} finally {
			isSaving = false;
		}
	}
</script>

<Dialog {open} onOpenChange={(v) => onOpenChange(v)}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Edit Note</DialogTitle>
		</DialogHeader>
		{#if note}
			<form
				{...currentUser
					? updateNoteForm.enhance(async ({ form, submit }: any) => {
							isSaving = true;
							try {
								await toast.promise(submit(), {
									loading: 'Saving note...',
									success: 'Note updated',
									error: 'Failed to update note'
								});
								const result = updateNoteForm.result as { success: boolean; note: any } | undefined;
								if (result?.note) {
									await noteAdapter.saveItem({
										id: result.note.id,
										payload: result.note,
										createdAt: result.note.createdAt,
										updatedAt: result.note.updatedAt
									});
									onSaved(result.note);
									form.reset();
									onOpenChange(false);
								}
							} catch (e) {
								// fallback
							} finally {
								isSaving = false;
							}
						})
					: {}}
				onsubmit={currentUser ? undefined : handleLocalUpdate}
				class="space-y-4"
			>
				<input type="hidden" name="id" value={note.id} />
				<div class="space-y-2">
					<Label for="edit-title">Title</Label>
					<Input id="edit-title" name="title" value={note.title} required />
				</div>
				<div class="space-y-2">
					<Label for="edit-content">Content</Label>
					<Textarea id="edit-content" name="content" value={note.content} rows={5} />
				</div>
				<DialogFooter>
					<Button type="submit" disabled={isSaving}>
						{#if isSaving}
							<RefreshCw class="mr-2 size-4 animate-spin" />
						{/if}
						Update
					</Button>
				</DialogFooter>
			</form>
		{/if}
	</DialogContent>
</Dialog>

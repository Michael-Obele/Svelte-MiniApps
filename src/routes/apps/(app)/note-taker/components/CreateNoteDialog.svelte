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
		createNoteForm,
		noteAdapter,
		onSaved = () => {},
		currentUser = null
	} = $props();

	// local state
	let isSaving = $state(false);

	async function handleLocalCreate(e: SubmitEvent) {
		e.preventDefault();
		const formData = new FormData(e.currentTarget as HTMLFormElement);
		const title = formData.get('title') as string;
		const content = formData.get('content') as string;
		isSaving = true;
		try {
			const id = crypto.randomUUID();
			const now = new Date().toISOString();
			const payload = { id, title, content, createdAt: now, updatedAt: now };
			const saved: any = await toast.promise(
				noteAdapter.saveItem({
					id,
					payload,
					createdAt: now,
					updatedAt: now
				}),
				{
					loading: 'Saving note locally...',
					success: 'Note saved locally',
					error: 'Failed to save note locally'
				}
			);
			onSaved(saved?.payload);
			onOpenChange(false);
		} catch (err) {
			// fallback
		} finally {
			isSaving = false;
		}
	}

	function onOpenChange(val: boolean) {
		open = val;
		onOpenChangeProp(val);
	}
</script>

<Dialog {open} onOpenChange={(v) => onOpenChange(v)}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Create Note</DialogTitle>
		</DialogHeader>
		<form
			{...currentUser
				? createNoteForm.enhance(async ({ form, submit }: any) => {
						isSaving = true;
						try {
							await toast.promise(submit(), {
								loading: 'Saving note...',
								success: 'Note saved',
								error: 'Failed to save note'
							});
							const result = createNoteForm.result as { success: boolean; note: any } | undefined;
							if (result?.note) {
								// update local persisted store with server note
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
			onsubmit={currentUser ? undefined : handleLocalCreate}
			class="space-y-4"
		>
			<div class="space-y-2">
				<Label for="title">Title</Label>
				<Input id="title" name="title" required />
			</div>
			<div class="space-y-2">
				<Label for="content">Content</Label>
				<Textarea id="content" name="content" rows={5} />
			</div>
			<DialogFooter>
				<Button type="submit" disabled={isSaving}>
					{#if isSaving}
						<RefreshCw class="mr-2 size-4 animate-spin" />
					{/if}
					Save
				</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>

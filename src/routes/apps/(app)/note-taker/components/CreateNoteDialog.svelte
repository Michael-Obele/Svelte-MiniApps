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
			const saved = await noteAdapter.saveItem({
				id,
				payload,
				createdAt: now,
				updatedAt: now
			});
			toast.success('Note saved locally');
			onSaved(saved.payload);
			(e.target as HTMLFormElement).reset();
			onOpenChange(false);
		} catch (err) {
			toast.error('Failed to save note locally');
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
	<DialogContent class="sm:max-w-[550px]">
		<DialogHeader>
			<DialogTitle class="text-2xl">Create Note</DialogTitle>
		</DialogHeader>
		<form
			{...currentUser
				? createNoteForm.enhance(async ({ form, submit }: { form: HTMLFormElement; submit: () => Promise<any> }) => {
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
								toast.success('Note saved');
								form.reset();
								onOpenChange(false);
							} else {
								toast.error('Failed to save note');
							}
						} catch (e) {
							toast.error('Failed to save note');
						} finally {
							isSaving = false;
						}
					})
				: {}}
			onsubmit={currentUser ? undefined : handleLocalCreate}
			class="space-y-6 py-4"
		>
			<div class="space-y-2">
				<Label for="title" class="text-base">Title</Label>
				<Input
					id="title"
					name="title"
					placeholder="Enter note title..."
					required
					class="text-base"
				/>
			</div>
			<div class="space-y-2">
				<Label for="content" class="text-base">Content</Label>
				<Textarea
					id="content"
					name="content"
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
					Create Note
				</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>

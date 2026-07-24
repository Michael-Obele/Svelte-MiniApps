<script lang="ts">
	/**
	 * Drag-and-drop + click-to-pick file uploader used by the flash-text app.
	 *
	 * Upload flow (saves Netlify function invocations by using presigned URLs):
	 *
	 *   1. POST metadata to `/api/flash-files/start-upload` (lightweight JSON,
	 *      no file body — just 1 tiny function invocation).
	 *   2. Server validates ownership, creates the DB record, returns a
	 *      presigned PUT URL for the R2 object.
	 *   3. Client PUTs the file body directly to R2 using the presigned URL
	 *      (zero function invocations — data goes straight from browser to R2).
	 *
	 * This replaces the old streaming-PUT approach that proxied every byte
	 * through a Netlify function (burning 1 invocation per upload + bandwidth).
	 */
	import { Button } from '$lib/components/ui/button';
	import { Progress } from '$lib/components/ui/progress';
	import { Badge } from '$lib/components/ui/badge';
	import * as Alert from '$lib/components/ui/alert';
	import {
		AlertCircle,
		CheckCircle2,
		File as FileIcon,
		FileImage,
		FileText,
		Film,
		LoaderCircle,
		Music,
		Archive,
		UploadCloud,
		X
	} from 'lucide-svelte';
	import { formatFileSize, getFileIconHint, MAX_FILE_SIZE } from '$lib/types/flash-file';
	import type { FlashFileItem } from '$lib/types/flash-file';

	type Props = {
		slug: string;
		onUploaded?: (files: FlashFileItem[]) => void;
	};

	let { slug, onUploaded }: Props = $props();

	interface QueueItem {
		id: string;
		file: File;
		progress: number;
		status: 'pending' | 'uploading' | 'done' | 'error';
		error?: string;
		uploaded?: FlashFileItem;
	}

	let queue = $state<QueueItem[]>([]);
	let isDragging = $state(false);
	let fileInput = $state<HTMLInputElement | null>(null);
	let isUploading = $derived(queue.some((q) => q.status === 'uploading'));

	function pickFileIcon(contentType: string) {
		switch (getFileIconHint(contentType)) {
			case 'image':
				return FileImage;
			case 'video':
				return Film;
			case 'audio':
				return Music;
			case 'archive':
				return Archive;
			case 'doc':
				return FileText;
			default:
				return FileIcon;
		}
	}

	/** Validate a file before adding it to the queue. */
	function validateFile(file: File): string | null {
		if (file.size === 0) return 'File is empty';
		if (file.size > MAX_FILE_SIZE) return `Exceeds ${formatFileSize(MAX_FILE_SIZE)} limit`;
		return null;
	}

	function addFiles(files: FileList | File[]) {
		const incoming = Array.from(files);
		const next: QueueItem[] = [];

		for (const file of incoming) {
			// Skip exact duplicates already in the queue (by name + size).
			if (queue.some((q) => q.file.name === file.name && q.file.size === file.size)) continue;

			const error = validateFile(file);
			next.push({
				id: crypto.randomUUID(),
				file,
				progress: 0,
				status: error ? 'error' : 'pending',
				error: error ?? undefined
			});
		}

		if (next.length === 0) return;
		queue = [...queue, ...next];

		// Kick off uploads sequentially so we don't hammer the server.
		void runQueue();
	}

	function onInputChange(event: Event) {
		const target = event.currentTarget as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			addFiles(target.files);
			// Reset so selecting the same file again still triggers change.
			target.value = '';
		}
	}

	function onDrop(event: DragEvent) {
		event.preventDefault();
		isDragging = false;
		if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
			addFiles(event.dataTransfer.files);
		}
	}

	function onDragOver(event: DragEvent) {
		event.preventDefault();
		isDragging = true;
	}

	function onDragLeave() {
		isDragging = false;
	}

	function removeItem(id: string) {
		queue = queue.filter((q) => q.id !== id);
	}

	/** Process the upload queue one item at a time using XHR for progress. */
	async function runQueue() {
		for (const item of queue) {
			if (item.status !== 'pending') continue;

			queue = queue.map((q) => (q.id === item.id ? { ...q, status: 'uploading', progress: 0 } : q));

			const result = await uploadWithProgress(item.file, (progress) => {
				queue = queue.map((q) => (q.id === item.id ? { ...q, progress } : q));
			});

			if (result.ok) {
				queue = queue.map((q) =>
					q.id === item.id ? { ...q, status: 'done', progress: 100, uploaded: result.file } : q
				);
			} else {
				queue = queue.map((q) =>
					q.id === item.id ? { ...q, status: 'error', error: result.error || 'Upload failed' } : q
				);
			}
		}

		// Notify parent with successful uploads, then prune done/error items.
		const uploaded = queue
			.filter((q) => q.status === 'done' && q.uploaded)
			.map((q) => q.uploaded!) as FlashFileItem[];
		if (uploaded.length > 0) onUploaded?.(uploaded);

		// Keep successful uploads visible for a beat, then clear them.
		setTimeout(() => {
			queue = queue.filter(
				(q) => q.status === 'uploading' || q.status === 'pending' || q.status === 'error'
			);
		}, 2000);
	}

	type UploadResult = { ok: true; file: FlashFileItem } | { ok: false; error: string };

	/**
	 * Two-step upload using a presigned URL:
	 *   1. POST metadata to `/api/flash-files/start-upload` — validates,
	 *      creates DB record, returns a presigned PUT URL (tiny request).
	 *   2. XHR PUT the file body directly to the presigned R2 URL — data
	 *      goes straight from browser to R2, no Netlify function invocations
	 *      for the actual bytes.
	 */
	async function uploadWithProgress(
		file: File,
		onProgress: (pct: number) => void
	): Promise<UploadResult> {
		// Step 1: Request a presigned URL from our lightweight endpoint.
		let presignedUrl: string;
		let fileSlug: string;
		let fileMeta: {
			fileName: string;
			fileSize: number;
			contentType: string;
			expiresAt: string;
		};

		try {
			const res = await fetch('/api/flash-files/start-upload', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					slug,
					fileName: file.name,
					contentType: file.type || 'application/octet-stream',
					contentLength: file.size
				})
			});

			if (!res.ok) {
				let msg = `Upload setup failed (${res.status})`;
				try {
					const body = (await res.json()) as { message?: string };
					if (body?.message) msg = body.message;
				} catch {
					// ignore parse errors
				}
				return { ok: false, error: msg };
			}

			const data = (await res.json()) as {
				presignedUrl: string;
				file: {
					slug: string;
					fileName: string;
					fileSize: number;
					contentType: string;
					expiresAt: string;
				};
			};

			presignedUrl = data.presignedUrl;
			fileSlug = data.file.slug;
			fileMeta = data.file;
		} catch (e) {
			return { ok: false, error: 'Network error during upload setup' };
		}

		// Step 2: Upload the file body directly to R2 using the presigned URL.
		const uploadResult = await uploadToPresignedUrl(
			presignedUrl,
			file,
			onProgress
		);

		if (!uploadResult.ok) return uploadResult;

		return {
			ok: true,
			file: {
				id: crypto.randomUUID(),
				slug: fileSlug,
				flashTextId: '',
				fileName: fileMeta.fileName,
				fileSize: fileMeta.fileSize,
				contentType: fileMeta.contentType,
				downloadCount: 0,
				expiresAt: fileMeta.expiresAt,
				createdAt: new Date().toISOString(),
				userId: null
			}
		};
	}

	/**
	 * PUT the raw file bytes directly to the presigned R2 URL via XHR
	 * (supports upload progress events).
	 */
	function uploadToPresignedUrl(
		url: string,
		file: File,
		onProgress: (pct: number) => void
	): Promise<{ ok: true } | { ok: false; error: string }> {
		return new Promise((resolve) => {
			const xhr = new XMLHttpRequest();
			xhr.open('PUT', url);
			// The presigned URL was signed with this content type, so it
			// must match exactly.
			xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

			xhr.upload.onprogress = (event) => {
				if (event.lengthComputable) {
					onProgress(Math.round((event.loaded / event.total) * 100));
				}
			};
			xhr.onload = () => {
				if (xhr.status >= 200 && xhr.status < 300) {
					resolve({ ok: true });
				} else {
					let msg = `Upload failed (${xhr.status})`;
					if (xhr.responseText) {
						msg = `${msg}: ${xhr.responseText.slice(0, 200)}`;
					}
					resolve({ ok: false, error: msg });
				}
			};
			xhr.onerror = () => resolve({ ok: false, error: 'Network error during upload' });
			xhr.onabort = () => resolve({ ok: false, error: 'Upload cancelled' });
			xhr.send(file);
		});
	}

	function openPicker() {
		fileInput?.click();
	}
</script>

<div class="space-y-3">
	<!-- Drop zone -->
	<button
		type="button"
		onclick={openPicker}
		ondrop={onDrop}
		ondragover={onDragOver}
		ondragleave={onDragLeave}
		class={[
			'flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-sm transition-colors',
			isDragging
				? 'border-primary bg-primary/5 text-primary'
				: 'border-muted-foreground/25 text-muted-foreground hover:border-primary/50 hover:bg-muted/40'
		]}
		aria-label="Click or drop files to upload"
	>
		<UploadCloud class="size-8" />
		<p class="font-medium">
			{isDragging ? 'Drop files to upload' : 'Click to choose files or drag & drop here'}
		</p>
		<p class="text-xs">
			Up to {formatFileSize(MAX_FILE_SIZE)} per file. Files expire with the flash text.
		</p>
		<input
			bind:this={fileInput}
			type="file"
			multiple
			class="hidden"
			onchange={onInputChange}
			aria-hidden="true"
		/>
	</button>

	<!-- Status / info -->
	{#if !slug}
		<Alert.Root>
			<AlertCircle />
			<Alert.Title>Create the flash text first</Alert.Title>
			<Alert.Description>Files can only be attached to an existing flash text.</Alert.Description>
		</Alert.Root>
	{/if}

	<!-- Queue -->
	{#if queue.length > 0}
		<ul class="space-y-2">
			{#each queue as item (item.id)}
				{@const Icon = pickFileIcon(item.file.type)}
				<li
					class="bg-muted/30 flex items-start gap-3 rounded-md border p-3"
					class:border-destructive={item.status === 'error'}
				>
					<div
						class="bg-background text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-md border"
					>
						<Icon class="size-4" />
					</div>
					<div class="min-w-0 flex-1 space-y-1">
						<div class="flex items-start justify-between gap-2">
							<p class="truncate text-sm font-medium" title={item.file.name}>
								{item.file.name}
							</p>
							<Button
								variant="ghost"
								size="icon"
								class="size-6 shrink-0"
								onclick={() => removeItem(item.id)}
								aria-label="Remove from queue"
							>
								<X class="size-3" />
							</Button>
						</div>
						<div class="text-muted-foreground flex items-center gap-2 text-xs">
							<Badge variant="secondary" class="px-1.5 py-0 text-[10px]">
								{formatFileSize(item.file.size)}
							</Badge>
							{#if item.status === 'uploading'}
								<span class="flex items-center gap-1">
									<LoaderCircle class="size-3 animate-spin" />
									{item.progress}%
								</span>
							{:else if item.status === 'done'}
								<span class="flex items-center gap-1 text-green-600 dark:text-green-400">
									<CheckCircle2 class="size-3" />
									Uploaded
								</span>
							{:else if item.status === 'error'}
								<span class="text-destructive flex items-center gap-1">
									<AlertCircle class="size-3" />
									{item.error}
								</span>
							{:else}
								<span>Pending</span>
							{/if}
						</div>
						{#if item.status === 'uploading'}
							<Progress value={item.progress} max={100} class="h-1" />
						{/if}
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</div>

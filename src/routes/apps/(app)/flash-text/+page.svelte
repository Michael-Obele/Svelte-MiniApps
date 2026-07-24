<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import {
		createFlashTextQuick,
		deleteFlashText,
		getCurrentUser,
		getUserFlashTexts,
		type FlashTextItem
	} from '$lib/remote';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Badge } from '$lib/components/ui/badge';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Progress } from '$lib/components/ui/progress';
	import * as Tabs from '$lib/components/ui/tabs';
	import * as Separator from '$lib/components/ui/separator';
	import {
		AlertCircle,
		Check,
		CheckCircle2,
		Clipboard,
		ClipboardPaste,
		Copy,
		FileText,
		History,
		Link,
		Loader2,
		LoaderCircle,
		QrCode,
		SquarePen,
		Timer,
		Trash,
		UploadCloud,
		X
	} from 'lucide-svelte';
	import { QRCodeImage } from 'svelte-qrcode-image';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { toast } from 'svelte-sonner';
	import { fly } from 'svelte/transition';
	import { formatFileSize, MAX_FILE_SIZE } from '$lib/types/flash-file';

	// ============================================================================
	// STATE
	// ============================================================================

	let activeTab = $state<'create' | 'lookup'>('create');
	let isCreating = $state(false);
	let copyConfirmed = $state(false);
	let currentUser = $state<{ id: string } | null>(null);
	let userFlashTexts = $state<FlashTextItem[]>([]);
	let isLoadingPastes = $state(false);
	let deletingId = $state<string | null>(null);
	let lookupInput = $state('');
	let textContent = $state('');
	let expiryHours = $state('6');

	// Created link state — $state initialized from URL on mount,
	// then set directly after creation (no $effect needed).
	let createdSlug = $state(page.url.searchParams.get('slug'));
	let createdExpiresAt = $state(page.url.searchParams.get('expiresAt'));
	let shareUrl = $derived(createdSlug ? `${page.url.origin}/f/${createdSlug}` : null);
	let timeRemaining = $state<string | null>(null);
	let isExpired = $state(false);

	// ============================================================================
	// FILE QUEUE — inline before link creation
	// ============================================================================

	interface QueuedFile {
		id: string;
		file: File;
		/** Upload progress 0–100; 100 = done */
		progress: number;
		status: 'queued' | 'uploading' | 'done' | 'error';
		error?: string;
		uploadedMeta?: { slug: string; fileName: string; fileSize: number };
	}

	let queuedFiles = $state<QueuedFile[]>([]);
	let isDragging = $state(false);

	function validateFile(file: File): string | null {
		if (file.size === 0) return 'File is empty';
		if (file.size > MAX_FILE_SIZE) return `Exceeds ${formatFileSize(MAX_FILE_SIZE)} limit`;
		return null;
	}

	function addFiles(fileList: FileList | File[]) {
		const incoming = Array.from(fileList);
		const next: QueuedFile[] = [];

		for (const file of incoming) {
			if (queuedFiles.some((q) => q.file.name === file.name && q.file.size === file.size)) continue;
			const error = validateFile(file);
			next.push({
				id: crypto.randomUUID(),
				file,
				progress: 0,
				status: error ? 'error' : 'queued',
				error: error ?? undefined
			});
		}

		if (next.length > 0) {
			queuedFiles = [...queuedFiles, ...next];
		}
	}

	function removeQueuedFile(id: string) {
		queuedFiles = queuedFiles.filter((q) => q.id !== id);
	}

	function onInputChange(event: Event) {
		const target = event.currentTarget as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			addFiles(target.files);
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

	// ============================================================================
	// USER LOAD
	// ============================================================================

	$effect(() => {
		getCurrentUser().then((user) => {
			currentUser = user || null;
			if (user) loadUserPastes();
		});
	});

	// ============================================================================
	// TIMER
	// ============================================================================

	$effect(() => {
		const expiresAt = createdExpiresAt;
		if (!expiresAt) {
			timeRemaining = null;
			isExpired = false;
			return;
		}

		const updateTimer = () => {
			const expires = new Date(expiresAt).getTime();
			const diff = expires - Date.now();

			if (diff <= 0) {
				timeRemaining = 'Expired';
				isExpired = true;
				return;
			}

			const hours = Math.floor(diff / 3600000);
			const minutes = Math.floor((diff % 3600000) / 60000);
			const seconds = Math.floor((diff % 60000) / 1000);
			timeRemaining = `${hours}h ${minutes}m ${seconds}s`;
			isExpired = false;
		};

		updateTimer();
		const interval = setInterval(updateTimer, 1000);
		return () => clearInterval(interval);
	});

	// ============================================================================
	// CREATE FLOW: create link + upload files
	// ============================================================================

	async function handleCreate() {
		if (isCreating) return;
		isCreating = true;

		try {
			// 1. Create the flash text (returns slug without redirecting)
			const result = await createFlashTextQuick({
				content: textContent,
				expiryHours
			});

			// 2. Set state directly — timer reacts immediately to local $state,
			//    no dependency on async goto.
			createdSlug = result.slug;
			createdExpiresAt = result.expiresAt;

			// 3. Update URL for shareability (fire-and-forget, not awaited)
			goto(
				`/apps/flash-text?slug=${encodeURIComponent(result.slug)}&expiresAt=${encodeURIComponent(result.expiresAt)}`,
				{ replaceState: true, noScroll: true }
			);

			// 4. Upload all queued files
			if (queuedFiles.length > 0) {
				await uploadQueuedFiles(result.slug);
			}

			// 5. Refresh user pastes if logged in
			if (currentUser) await loadUserPastes();

			// 6. Clear the form
			textContent = '';
			queuedFiles = [];
		} catch (err) {
			toast.error('Failed to create link. Please try again.');
		} finally {
			isCreating = false;
		}
	}

	async function uploadQueuedFiles(slug: string) {
		const pending = queuedFiles.filter((q) => q.status === 'queued' || q.status === 'error');
		if (pending.length === 0) return;

		for (const item of pending) {
			queuedFiles = queuedFiles.map((q) =>
				q.id === item.id ? { ...q, status: 'uploading', progress: 0 } : q
			);

			const ok = await uploadSingleFile(slug, item.file, (pct) => {
				queuedFiles = queuedFiles.map((q) => (q.id === item.id ? { ...q, progress: pct } : q));
			});

			if (ok) {
				queuedFiles = queuedFiles.map((q) =>
					q.id === item.id ? { ...q, status: 'done', progress: 100 } : q
				);
			} else {
				queuedFiles = queuedFiles.map((q) =>
					q.id === item.id ? { ...q, status: 'error', error: 'Upload failed' } : q
				);
			}
		}
	}

	type UploadResult = { ok: true } | { ok: false; error: string };

	async function uploadSingleFile(
		slug: string,
		file: File,
		onProgress: (pct: number) => void
	): Promise<boolean> {
		// Step 1: Get presigned URL
		let presignedUrl: string;
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
					/* ignore */
				}
				toast.error(msg);
				return false;
			}

			const data = (await res.json()) as { presignedUrl: string; file: { slug: string } };
			presignedUrl = data.presignedUrl;
		} catch {
			toast.error('Network error during upload setup');
			return false;
		}

		// Step 2: PUT file body to presigned URL
		const uploaded = await putFileToPresignedUrl(presignedUrl, file, onProgress);
		if (!uploaded.ok) {
			toast.error(uploaded.error);
			return false;
		}

		return true;
	}

	function putFileToPresignedUrl(
		url: string,
		file: File,
		onProgress: (pct: number) => void
	): Promise<{ ok: true } | { ok: false; error: string }> {
		return new Promise((resolve) => {
			const xhr = new XMLHttpRequest();
			xhr.open('PUT', url);
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
					resolve({ ok: false, error: `Upload failed (${xhr.status})` });
				}
			};
			xhr.onerror = () => resolve({ ok: false, error: 'Network error during upload' });
			xhr.onabort = () => resolve({ ok: false, error: 'Upload cancelled' });
			xhr.send(file);
		});
	}

	// ============================================================================
	// ACTIONS
	// ============================================================================

	async function loadUserPastes() {
		isLoadingPastes = true;
		try {
			userFlashTexts = await getUserFlashTexts();
		} catch {
			// The list is optional; ignore failures.
		} finally {
			isLoadingPastes = false;
		}
	}

	async function handleCopy() {
		if (!shareUrl) return;
		await navigator.clipboard.writeText(shareUrl);
		copyConfirmed = true;
		toast.success('Link copied!');
		setTimeout(() => (copyConfirmed = false), 2000);
	}

	async function handleDelete(id: string) {
		deletingId = id;
		try {
			await deleteFlashText({ id });
			await loadUserPastes();
			toast.success('Paste deleted');
		} catch {
			toast.error('Failed to delete');
		} finally {
			deletingId = null;
		}
	}

	function handleNew() {
		activeTab = 'create';
		goto('/apps/flash-text', { replaceState: true, noScroll: true });
	}

	function previewContent(text: string, maxLen = 120): string {
		return text.length > maxLen ? `${text.slice(0, maxLen)}...` : text;
	}

	function formatDate(iso: string): string {
		return new Date(iso).toLocaleString();
	}

	function extractFlashTextSlug(value: string): string | null {
		const trimmed = value.trim();
		if (!trimmed) return null;

		if (/^[A-Za-z0-9_-]+$/.test(trimmed)) {
			return trimmed;
		}

		try {
			const parsedUrl = new URL(trimmed, page.url.origin);
			const segments = parsedUrl.pathname.split('/').filter(Boolean);
			const slug = segments.at(-1);
			if (slug && /^[A-Za-z0-9_-]+$/.test(slug)) {
				return slug;
			}
		} catch {
			// Fall through to the regex fallback below.
		}

		const match = trimmed.match(/(?:^|\/f\/)([A-Za-z0-9_-]+)(?:[/?#].*)?$/);
		return match?.[1] ?? null;
	}

	async function handleLookup() {
		const slug = extractFlashTextSlug(lookupInput);
		if (!slug) {
			toast.error('Paste a valid FlashText code or share link.');
			return;
		}

		await goto(`/f/${slug}`);
	}
</script>

<svelte:head>
	<title>FlashText</title>
	<meta name="description" content="Create temporary text links and open them by code." />
</svelte:head>

<div class="mx-auto max-w-3xl space-y-8 p-4 sm:p-6">
	<div class="flex items-center gap-3">
		<div class="bg-primary/10 flex size-10 items-center justify-center rounded-lg">
			<Clipboard class="text-primary size-5" />
		</div>
		<div class="flex-1">
			<h1 class="text-2xl font-bold tracking-tight">FlashText</h1>
			<p class="text-muted-foreground text-sm">
				Share text temporarily with self-destructing links
			</p>
		</div>
		{#if currentUser}
			<Button variant="outline" size="sm" onclick={() => goto('/apps/flash-text/history')}>
				<History class="mr-1.5 size-4" />
				History
			</Button>
		{/if}
	</div>

	<Tabs.Root bind:value={activeTab} class="space-y-6">
		<Tabs.List aria-label="FlashText modes" class="grid w-full grid-cols-2">
			<Tabs.Trigger value="create" class="gap-2">
				<SquarePen class="size-4" />
				Create
			</Tabs.Trigger>
			<Tabs.Trigger value="lookup" class="gap-2">
				<ClipboardPaste class="size-4" />
				Open by Code
			</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="create" class="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Create a Share Link</CardTitle>
					<CardDescription>
						Paste your text below, drop files, or both. A temporary link will be generated with
						everything bundled together.
					</CardDescription>
				</CardHeader>
				<CardContent class="space-y-5">
					<!-- Text input -->
					<div class="space-y-2">
						<Label for="flash-content"
							>Your Text <span class="text-muted-foreground text-xs font-normal"
								>(optional — leave blank for file-only)</span
							></Label
						>
						<Textarea
							id="flash-content"
							bind:value={textContent}
							placeholder="Paste your text here, or leave blank to share files only..."
							class="min-h-[120px] font-mono text-sm"
						/>
					</div>

					<!-- Inline file drop zone -->
					<div class="space-y-2">
						<Label>Attach Files</Label>
						<div
							role="button"
							tabindex="0"
							onclick={() => document.getElementById('file-input')?.click()}
							ondrop={onDrop}
							ondragover={onDragOver}
							ondragleave={onDragLeave}
							onkeydown={(e) => e.key === 'Enter' && document.getElementById('file-input')?.click()}
							class="border-muted-foreground/25 hover:border-muted-foreground/50 focus-visible:ring-ring flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
							class:bg-primary={isDragging}
							class:border-primary={isDragging}
						>
							<UploadCloud class="text-muted-foreground size-8" />
							<div class="space-y-1">
								<p class="text-sm font-medium">
									{#if isDragging}
										Drop files here
									{:else}
										Drop files here or click to browse
									{/if}
								</p>
								<p class="text-muted-foreground text-xs">
									Up to {formatFileSize(MAX_FILE_SIZE)} per file
								</p>
							</div>
						</div>
						<input id="file-input" type="file" multiple class="hidden" onchange={onInputChange} />
					</div>

					<!-- Queued file list -->
					{#if queuedFiles.length > 0}
						<div class="space-y-2">
							<div class="flex items-center justify-between">
								<p class="text-muted-foreground text-xs font-medium">
									{queuedFiles.length}
									{queuedFiles.length === 1 ? 'file' : 'files'} queued
								</p>
							</div>
							<ul class="space-y-1.5">
								{#each queuedFiles as qfile (qfile.id)}
									<li
										class="bg-muted/30 flex items-center gap-3 rounded-md border p-2 text-sm"
										class:border-red-300={qfile.status === 'error'}
										class:border-green-300={qfile.status === 'done'}
									>
										<div class="text-muted-foreground size-8 shrink-0">
											{#if qfile.file.type.startsWith('image/')}
												<img
													src={URL.createObjectURL(qfile.file)}
													alt={qfile.file.name}
													class="h-8 w-8 rounded object-cover"
												/>
											{:else}
												<FileText class="size-8" />
											{/if}
										</div>
										<div class="min-w-0 flex-1 space-y-0.5">
											<p class="truncate font-medium" title={qfile.file.name}>
												{qfile.file.name}
											</p>
											<div class="text-muted-foreground flex items-center gap-2 text-xs">
												<span>{formatFileSize(qfile.file.size)}</span>
												{#if qfile.status === 'uploading'}
													<span class="tabular-nums">{qfile.progress}%</span>
												{:else if qfile.status === 'done'}
													<span class="text-green-600 dark:text-green-400">Uploaded</span>
												{:else if qfile.status === 'error' && qfile.error}
													<span class="text-destructive">{qfile.error}</span>
												{/if}
											</div>
											{#if qfile.status === 'uploading'}
												<Progress value={qfile.progress} class="h-1" />
											{/if}
										</div>
										{#if qfile.status === 'queued' || qfile.status === 'error'}
											<button
												onclick={() => removeQueuedFile(qfile.id)}
												class="text-muted-foreground hover:text-foreground shrink-0 rounded p-0.5 transition-colors"
												aria-label="Remove {qfile.file.name}"
											>
												<X class="size-4" />
											</button>
										{:else if qfile.status === 'uploading'}
											<LoaderCircle class="text-muted-foreground size-4 shrink-0 animate-spin" />
										{:else if qfile.status === 'done'}
											<CheckCircle2 class="size-4 shrink-0 text-green-500" />
										{/if}
									</li>
								{/each}
							</ul>
						</div>
					{/if}

					<!-- Expiry & submit -->
					<div class="space-y-2">
						<Label for="expiry">Expires After</Label>
						<select
							id="expiry"
							bind:value={expiryHours}
							class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
						>
							<option value="1">1 hour</option>
							<option value="3">3 hours</option>
							<option value="6">6 hours</option>
							<option value="12">12 hours</option>
							<option value="24">24 hours</option>
						</select>
					</div>

					<div class="flex flex-wrap gap-2">
						<Button onclick={handleCreate} disabled={isCreating} class="w-full sm:w-auto">
							{#if isCreating}
								<Loader2 class="mr-2 size-4 animate-spin" />
								Creating...
							{:else}
								<Link class="mr-2 size-4" />
								Generate Link
							{/if}
						</Button>
						{#if !textContent && queuedFiles.length === 0}
							<p class="text-muted-foreground self-center text-xs">
								Add text, files, or both — at least one is needed
							</p>
						{/if}
					</div>
				</CardContent>
			</Card>

			<!-- Result card shown after creation -->
			{#if createdSlug}
				<div transition:fly={{ y: 20, duration: 300 }}>
					<Card
						class={isExpired
							? 'border-destructive/50 bg-destructive/5'
							: 'border-green-500/50 bg-green-500/5'}
					>
						<CardHeader>
							<CardTitle class="flex items-center gap-2">
								{#if isExpired}
									<Timer class="text-destructive size-5" />
									<span class="text-destructive">Link Expired</span>
								{:else}
									<Link class="size-5 text-green-500" />
									<span class="text-green-600 dark:text-green-400">Link Ready</span>
								{/if}
							</CardTitle>
							<CardDescription>
								{#if isExpired}
									This link has expired and is no longer accessible.
								{:else}
									Share this link — it expires in <span class="font-semibold tabular-nums"
										>{timeRemaining}</span
									>
								{/if}
							</CardDescription>
						</CardHeader>
						<CardContent class="space-y-4">
							<div class="flex flex-wrap gap-2">
								<Badge variant="secondary" class="font-mono text-xs">{createdSlug}</Badge>
								<Badge variant="secondary" class="text-xs"
									>{createdExpiresAt ? formatDate(createdExpiresAt) : ''}</Badge
								>
							</div>
							<div
								class="bg-muted flex items-center gap-2 rounded-md p-3 font-mono text-sm break-all"
							>
								<span class="text-muted-foreground">{shareUrl}</span>
							</div>
							<div class="flex flex-wrap gap-2">
								<Button variant="outline" size="sm" onclick={handleCopy} disabled={isExpired}>
									{#if copyConfirmed}
										<Check class="mr-2 size-4 text-green-500" />
										Copied!
									{:else}
										<Copy class="mr-2 size-4" />
										Copy Link
									{/if}
								</Button>

								<AlertDialog.Root>
									<AlertDialog.Trigger>
										<Button variant="outline" size="sm" disabled={isExpired}>
											<QrCode class="mr-2 size-4" />
											QR Code
										</Button>
									</AlertDialog.Trigger>
									<AlertDialog.Content>
										<AlertDialog.Header>
											<AlertDialog.Title>QR Code</AlertDialog.Title>
											<AlertDialog.Description>
												Scan this QR code to open the FlashText link.
											</AlertDialog.Description>
										</AlertDialog.Header>
										<div class="flex justify-center py-4">
											<QRCodeImage text={shareUrl ?? ''} displayClass="h-64 w-64 rounded-md" />
										</div>
										<AlertDialog.Footer>
											<AlertDialog.Cancel>Close</AlertDialog.Cancel>
										</AlertDialog.Footer>
									</AlertDialog.Content>
								</AlertDialog.Root>

								<Button variant="ghost" size="sm" onclick={handleNew}>Create New</Button>
							</div>

							<!-- File upload status after creation -->
							{#if queuedFiles.some((q) => q.status !== 'queued')}
								<div class="pt-2">
									<Separator.Root class="mb-4" />
									<p class="text-muted-foreground mb-2 text-xs font-medium">
										Files {queuedFiles.some(
											(q) => q.status === 'uploading' || q.status === 'queued'
										)
											? 'uploading...'
											: queuedFiles.every((q) => q.status === 'done')
												? 'uploaded'
												: ''}
									</p>
									<ul class="space-y-1">
										{#each queuedFiles as qfile (qfile.id)}
											<li
												class="flex items-center gap-3 rounded-md border p-2 text-sm"
												class:border-green-200={qfile.status === 'done'}
												class:border-red-200={qfile.status === 'error'}
											>
												<FileText class="text-muted-foreground size-4 shrink-0" />
												<span class="min-w-0 flex-1 truncate" title={qfile.file.name}>
													{qfile.file.name}
												</span>
												<span class="text-muted-foreground shrink-0 text-xs"
													>{formatFileSize(qfile.file.size)}</span
												>
												{#if qfile.status === 'uploading'}
													<LoaderCircle class="size-4 animate-spin text-blue-500" />
												{:else if qfile.status === 'done'}
													<CheckCircle2 class="size-4 text-green-500" />
												{:else if qfile.status === 'error'}
													<AlertCircle class="text-destructive size-4" />
												{/if}
											</li>
										{/each}
									</ul>
								</div>
							{/if}
						</CardContent>
					</Card>
				</div>
			{/if}
		</Tabs.Content>

		<Tabs.Content value="lookup" class="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Open a FlashText</CardTitle>
					<CardDescription>
						Paste the short code or the full share link to open the public page.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						class="space-y-4"
						onsubmit={async (event) => {
							event.preventDefault();
							await handleLookup();
						}}
					>
						<div class="space-y-2">
							<Label for="lookup-input">FlashText link or code</Label>
							<Input
								id="lookup-input"
								value={lookupInput}
								oninput={(event) => (lookupInput = event.currentTarget.value)}
								placeholder="Paste /f/abc123 or just abc123"
								class="font-mono"
							/>
						</div>

						<div class="flex flex-wrap gap-2">
							<Button type="submit">
								<ClipboardPaste class="mr-2 size-4" />
								Open public page
							</Button>
							<Button type="button" variant="ghost" onclick={() => (lookupInput = '')}>Clear</Button
							>
						</div>
					</form>
				</CardContent>
			</Card>

			{#if currentUser}
				<Card>
					<CardHeader>
						<CardTitle>Recent FlashTexts</CardTitle>
						<CardDescription>Quick access to the latest links you created.</CardDescription>
					</CardHeader>
					<CardContent>
						{#if isLoadingPastes}
							<div class="space-y-3">
								{#each Array.from({ length: 3 }) as _, index (index)}
									<div
										class="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
									>
										<div class="space-y-2">
											<Skeleton class="h-4 w-32" />
											<Skeleton class="h-3 w-56" />
										</div>
										<Skeleton class="h-9 w-28" />
									</div>
								{/each}
							</div>
						{:else if userFlashTexts.length === 0}
							<p class="text-muted-foreground text-sm">
								Your recent FlashTexts will appear here after you create them.
							</p>
						{:else}
							<div class="space-y-3">
								{#each userFlashTexts as paste (paste.id)}
									<div
										class="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
									>
										<div class="space-y-2">
											<div class="flex flex-wrap items-center gap-2">
												<Badge variant="secondary" class="font-mono text-xs">{paste.slug}</Badge>
												<Badge variant="secondary" class="text-xs"
													>{formatDate(paste.createdAt)}</Badge
												>
											</div>
											<p class="text-muted-foreground font-mono text-sm leading-relaxed">
												{previewContent(paste.content)}
											</p>
										</div>
										<div class="flex flex-wrap gap-2">
											<Button
												variant="outline"
												size="sm"
												onclick={async () => {
													await navigator.clipboard.writeText(`${page.url.origin}/f/${paste.slug}`);
													toast.success('Link copied!');
												}}
											>
												<Copy class="mr-2 size-4" />
												Copy Link
											</Button>
											<Button
												variant="ghost"
												size="sm"
												disabled={deletingId === paste.id}
												onclick={() => handleDelete(paste.id)}
											>
												{#if deletingId === paste.id}
													<Loader2 class="mr-2 size-4 animate-spin" />
													Deleting...
												{:else}
													<Trash class="text-destructive mr-2 size-4" />
													Delete
												{/if}
											</Button>
										</div>
									</div>
								{/each}
							</div>
						{/if}
					</CardContent>
				</Card>
			{/if}
		</Tabs.Content>
	</Tabs.Root>
</div>

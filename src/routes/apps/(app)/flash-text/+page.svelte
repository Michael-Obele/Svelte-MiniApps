<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import {
		createFlashText,
		deleteFlashText,
		getCurrentUser,
		getUserFlashTexts,
		getFlashTextFiles,
		type FlashTextItem,
		type FlashFileItem
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
	import * as Tabs from '$lib/components/ui/tabs';
	import * as Separator from '$lib/components/ui/separator';
	import {
		Check,
		Clipboard,
		ClipboardPaste,
		Copy,
		FileText,
		Link,
		Loader2,
		Paperclip,
		QrCode,
		SquarePen,
		Timer,
		Trash
	} from 'lucide-svelte';
	import { QRCodeImage } from 'svelte-qrcode-image';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { toast } from 'svelte-sonner';
	import { fly } from 'svelte/transition';
	import { formatFileSize, MAX_FILE_SIZE } from '$lib/types/flash-file';
	import FileUploader from './FileUploader.svelte';

	let activeTab = $state<'create' | 'lookup'>('create');
	let isCreating = $state(false);
	let copyConfirmed = $state(false);
	let currentUser = $state<{ id: string } | null>(null);
	let userFlashTexts = $state<FlashTextItem[]>([]);
	let attachedFiles = $state<FlashFileItem[]>([]);
	let isLoadingFiles = $state(false);
	let isLoadingPastes = $state(false);
	let deletingId = $state<string | null>(null);
	let lookupInput = $state('');
	let createdSlug = $derived(page.url.searchParams.get('slug'));
	let createdExpiresAt = $derived(page.url.searchParams.get('expiresAt'));
	let shareUrl = $derived(createdSlug ? `${page.url.origin}/f/${createdSlug}` : null);
	let timeRemaining = $state<string | null>(null);
	let isExpired = $state(false);

	$effect(() => {
		getCurrentUser().then((user) => {
			currentUser = user || null;
			if (user) loadUserPastes();
		});
	});

	$effect(() => {
		if (!createdExpiresAt) {
			timeRemaining = null;
			isExpired = false;
			return;
		}

		const updateTimer = () => {
			const expires = new Date(createdExpiresAt).getTime();
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

	async function loadAttachedFiles(slug: string) {
		isLoadingFiles = true;
		try {
			attachedFiles = await getFlashTextFiles(slug);
		} catch {
			attachedFiles = [];
		} finally {
			isLoadingFiles = false;
		}
	}

	function handleFilesUploaded(uploaded: FlashFileItem[]) {
		attachedFiles = [...attachedFiles, ...uploaded];
		toast.success(`${uploaded.length} file${uploaded.length === 1 ? '' : 's'} uploaded`);
	}

	$effect(() => {
		if (createdSlug) {
			loadAttachedFiles(createdSlug);
		} else {
			attachedFiles = [];
		}
	});

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
		<div>
			<h1 class="text-2xl font-bold tracking-tight">FlashText</h1>
			<p class="text-muted-foreground text-sm">
				Share text temporarily with self-destructing links
			</p>
		</div>
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
						Paste your text below. A temporary link will be generated, and the short code can be
						opened in the second tab.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						{...createFlashText.enhance(async (form) => {
							isCreating = true;
							try {
								await form.submit();
								form.element.reset();
								if (currentUser) await loadUserPastes();
							} catch {
								toast.error('Failed to create link. Please try again.');
							} finally {
								isCreating = false;
							}
						})}
						class="space-y-4"
					>
						<div class="space-y-2">
							<Label for="flash-content">Your Text</Label>
							<Textarea
								id="flash-content"
								name="content"
								placeholder="Paste your text here... (whitespace & formatting preserved)"
								class="min-h-[200px] font-mono text-sm"
								required
							/>
						</div>

						<div class="space-y-2">
							<Label for="expiry">Expires After</Label>
							<select
								id="expiry"
								name="expiryHours"
								class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
							>
								<option value="1">1 hour</option>
								<option value="3">3 hours</option>
								<option value="6" selected>6 hours</option>
								<option value="12">12 hours</option>
								<option value="24">24 hours</option>
							</select>
						</div>

						<Button type="submit" disabled={isCreating} class="w-full sm:w-auto">
							{#if isCreating}
								<Loader2 class="mr-2 size-4 animate-spin" />
								Creating...
							{:else}
								<Link class="mr-2 size-4" />
								Generate Link
							{/if}
						</Button>
					</form>
				</CardContent>
			</Card>

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
									Share this link - it expires in <span class="font-semibold tabular-nums"
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
						</CardContent>
					</Card>
				</div>
			{/if}

			{#if createdSlug && !isExpired}
				<div transition:fly={{ y: 20, duration: 300 }}>
					<Card>
						<CardHeader>
							<CardTitle class="flex items-center gap-2">
								<Paperclip class="size-5" />
								<span>Attach Files</span>
								{#if attachedFiles.length > 0}
									<Badge variant="secondary" class="text-xs">
										{attachedFiles.length}
										{attachedFiles.length === 1 ? 'file' : 'files'}
									</Badge>
								{/if}
							</CardTitle>
							<CardDescription>
								Add up to {formatFileSize(MAX_FILE_SIZE)} per file. Files expire together with this flash
								text.
							</CardDescription>
						</CardHeader>
						<CardContent class="space-y-4">
							<FileUploader
								slug={createdSlug}
								onUploaded={(files: FlashFileItem[]) => handleFilesUploaded(files)}
							/>

							{#if isLoadingFiles}
								<div class="space-y-2 pt-2">
									<Skeleton class="h-12 w-full" />
								</div>
							{:else if attachedFiles.length > 0}
								<div class="space-y-2 pt-2">
									<Separator.Root />
									<p class="text-muted-foreground text-xs font-medium">
										Attached files ({attachedFiles.length})
									</p>
									<ul class="space-y-1">
										{#each attachedFiles as file (file.id)}
											<li class="bg-muted/30 flex items-center gap-3 rounded-md border p-2 text-sm">
												<FileText class="text-muted-foreground size-4 shrink-0" />
												<span class="min-w-0 flex-1 truncate" title={file.fileName}>
													{file.fileName}
												</span>
												<Badge variant="secondary" class="shrink-0 text-[10px]">
													{(file.fileSize / 1024).toFixed(0)} KB
												</Badge>
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

<script lang="ts">
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription
	} from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Separator } from '$lib/components/ui/separator';
	import {
		Clipboard,
		Timer,
		Copy,
		Check,
		AlertTriangle,
		ArrowLeft,
		Download,
		FileText,
		FileImage,
		Film,
		Music,
		Archive,
		File as FileIcon
	} from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { fade } from 'svelte/transition';
	import { formatFileSize, getFileIconHint } from '$lib/types/flash-file';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let currentFlashText = $derived(data.flashText);
	let currentFiles = $derived(data.files);

	/** Presigned download URLs keyed by file.id — generated in the load function. */
	function downloadUrl(file: { id: string; slug: string }): string {
		return data.fileDownloadUrls?.[file.id] ?? `/api/flash-files/${file.slug}`;
	}

	let copyConfirmed = $state(false);
	let timeRemaining = $state<string | null>(null);
	let isExpired = $state(false);
	let textareaEl = $state<HTMLTextAreaElement | null>(null);

	// Auto-grow the viewer: short pastes get a compact box, long ones scroll.
	// One line → 2 rows; 20+ lines → capped with overflow scrolling.
	let textRows = $derived(
		currentFlashText?.content
			? Math.min(20, Math.max(2, currentFlashText.content.split('\n').length))
			: 2
	);

	// View-only display: focus = select all, so one click + Ctrl/Cmd+C copies.
	function handleFocusSelect() {
		textareaEl?.select();
	}

	// Countdown timer
	$effect(() => {
		if (!currentFlashText) {
			timeRemaining = null;
			isExpired = false;
			return;
		}

		const updateTimer = () => {
			const now = Date.now();
			const expires = new Date(currentFlashText.expiresAt).getTime();
			const diff = expires - now;

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

	async function handleCopy() {
		if (!currentFlashText) return;
		await navigator.clipboard.writeText(currentFlashText.content);
		copyConfirmed = true;
		toast.success('Text copied!');
		setTimeout(() => (copyConfirmed = false), 2000);
	}

	let charCount = $derived(currentFlashText?.content?.length ?? 0);
	let lineCount = $derived(currentFlashText?.content?.split('\n').length ?? 0);

	/** Pick the right Lucide icon component for a content type. */
	function getFileIcon(contentType: string) {
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
</script>

<svelte:head>
	<title>{currentFlashText ? 'FlashText' : 'Expired — FlashText'}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
	<!-- Page header with inline meta (expiry + badges) — no separate meta card -->
	<div class="flex flex-wrap items-center gap-3">
		<div class="bg-primary/10 flex size-10 items-center justify-center rounded-lg">
			<Clipboard class="text-primary size-5" />
		</div>
		<div class="min-w-0 flex-1">
			<h1 class="text-2xl font-bold tracking-tight">FlashText</h1>
			<p class="text-muted-foreground text-sm">Temporary shared text — view-only</p>
		</div>
		{#if currentFlashText}
			<div class="text-muted-foreground flex flex-wrap items-center gap-3 text-sm">
				<div class="flex items-center gap-1.5">
					<Timer class="size-4" />
					{#if isExpired}
						<span class="text-destructive font-semibold">Expired</span>
					{:else}
						<span>Expires in <span class="font-semibold tabular-nums">{timeRemaining}</span></span>
					{/if}
				</div>
				{#if currentFlashText.content}
					<Badge variant="secondary" class="text-xs">{charCount} chars</Badge>
					<Badge variant="secondary" class="text-xs">{lineCount} lines</Badge>
				{:else}
					<Badge variant="secondary" class="text-xs">No text</Badge>
				{/if}
				{#if currentFiles.length > 0}
					<Badge variant="secondary" class="text-xs">
						{currentFiles.length}
						{currentFiles.length === 1 ? 'file' : 'files'}
					</Badge>
				{/if}
			</div>
		{/if}
	</div>

	{#if !currentFlashText}
		<!-- Expired / Not Found -->
		<div transition:fade>
			<Card class="border-destructive/50 bg-destructive/5">
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<AlertTriangle class="text-destructive size-5" />
						<span class="text-destructive">Link Expired or Not Found</span>
					</CardTitle>
					<CardDescription>
						This text has expired or the link is invalid — FlashText links are temporary (max 24
						hours) and are deleted after expiry.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<a
						href="/apps/flash-text"
						class="text-primary inline-flex items-center gap-2 text-sm hover:underline"
					>
						<ArrowLeft class="size-4" />
						Create your own FlashText
					</a>
				</CardContent>
			</Card>
		</div>
	{:else}
		<div transition:fade class="space-y-4">
			<!-- Content Card (or file-only placeholder) -->
			{#if currentFlashText.content}
				<Card>
					<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-3">
						<CardTitle class="flex items-center gap-2 text-sm font-medium">
							<FileText class="text-muted-foreground size-4" />
							Shared Text
						</CardTitle>
						<Button variant="outline" size="sm" onclick={handleCopy} disabled={isExpired}>
							{#if copyConfirmed}
								<Check class="mr-2 size-4 text-green-500" />
								Copied!
							{:else}
								<Copy class="mr-2 size-4" />
								Copy
							{/if}
						</Button>
					</CardHeader>
					<CardContent class="space-y-2">
						<Textarea
							readonly
							bind:ref={textareaEl}
							value={currentFlashText.content}
							rows={textRows}
							spellcheck="false"
							onfocus={handleFocusSelect}
							aria-label="Shared text content"
							class="bg-muted/50 max-h-[70vh] min-h-0 resize-none overflow-auto font-mono text-sm leading-relaxed"
						/>
						<p class="text-muted-foreground text-center text-xs">
							Click the text to select all — then press Ctrl/Cmd+C to copy.
						</p>
					</CardContent>
				</Card>
			{:else}
				<p class="text-muted-foreground text-center text-sm">
					This share contains only files.
					{#if currentFiles.length > 0}
						Files are listed below.
					{:else}
						No files are attached either.
					{/if}
				</p>
			{/if}

			<!-- Files Card -->
			{#if currentFiles.length > 0}
				<Card>
					<CardHeader class="pb-3">
						<CardTitle class="flex items-center gap-2 text-sm font-medium">
							<Download class="text-muted-foreground size-4" />
							<span>Attached Files ({currentFiles.length})</span>
						</CardTitle>
						<CardDescription>
							Files expire together with this flash text. Downloads are tracked.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<ul class="space-y-2">
							{#each currentFiles as file, index (file.id)}
								{@const IconComponent = getFileIcon(file.contentType)}
								<li>
									{#if index > 0}
										<Separator class="my-2" />
									{/if}
									<div
										class="hover:bg-muted/50 flex flex-col gap-3 rounded-md p-2 transition-colors sm:flex-row sm:items-center sm:justify-between"
									>
										<div class="flex min-w-0 items-start gap-3">
											<div
												class="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-md"
											>
												<IconComponent class="size-5" />
											</div>
											<div class="min-w-0 flex-1 space-y-1">
												<p class="truncate text-sm font-medium" title={file.fileName}>
													{file.fileName}
												</p>
												<div
													class="text-muted-foreground flex flex-wrap items-center gap-2 text-xs"
												>
													<span>{formatFileSize(file.fileSize)}</span>
													<Separator orientation="vertical" class="h-3" />
													<span class="truncate">{file.contentType}</span>
													{#if file.downloadCount > 0}
														<Separator orientation="vertical" class="h-3" />
														<span>{file.downloadCount} downloads</span>
													{/if}
												</div>
											</div>
										</div>
										<Button
											variant="outline"
											size="sm"
											href={downloadUrl(file)}
											target="_blank"
											rel="noopener noreferrer"
											disabled={isExpired}
											class="shrink-0"
										>
											<Download class="mr-2 size-4" />
											Download
										</Button>
									</div>
								</li>
							{/each}
						</ul>
					</CardContent>
				</Card>
			{/if}

			<!-- Footer -->
			<p class="text-muted-foreground text-center text-xs">
				Created {new Date(currentFlashText.createdAt).toLocaleString()} &middot;
				<a href="/apps/flash-text" class="text-primary hover:underline">Create your own</a>
			</p>
		</div>
	{/if}
</div>

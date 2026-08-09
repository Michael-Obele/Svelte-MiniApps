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
	import { decryptFlashText, FlashDecryptError } from '$lib/utility/flash-crypto';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let currentFlashText = $derived(data.flashText);
	let currentFiles = $derived(data.files);

	let decrypted = $state<string | null>(null);
	let decryptError = $state<string | null>(null);

	// Genuine async I/O against WebCrypto plus a window.location read, so it
	// cannot be a $derived. Assigns only to decrypted/decryptError, never to
	// anything it reads — no loop.
	$effect(() => {
		if (!currentFlashText?.isEncrypted) return;

		const key = window.location.hash.slice(1);
		if (!key) {
			decryptError = 'This link is incomplete — the decryption key is missing from the URL.';
			return;
		}

		let cancelled = false;

		decryptFlashText(currentFlashText.content, key)
			.then((text) => {
				if (cancelled) return;
				decrypted = text;
				decryptError = null;
			})
			.catch((err) => {
				if (cancelled) return;
				decryptError =
					err instanceof FlashDecryptError
						? 'Could not decrypt — the key in this link is wrong or the paste was altered.'
						: 'Something went wrong while decrypting.';
			});

		return () => {
			cancelled = true;
		};
	});

	/**
	 * Single source of truth for displayable text. Plaintext pastes created
	 * before encryption shipped fall through unchanged.
	 */
	let displayText = $derived(currentFlashText?.isEncrypted ? decrypted : currentFlashText?.content);

	/** Presigned download URLs keyed by file.id — generated in the load function. */
	function downloadUrl(file: { id: string; slug: string }): string {
		return data.fileDownloadUrls?.[file.id] ?? `/api/flash-files/${file.slug}`;
	}

	let copyConfirmed = $state(false);
	let timeRemaining = $state<string | null>(null);
	let isExpired = $state(false);

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
		await navigator.clipboard.writeText(displayText ?? '');
		copyConfirmed = true;
		toast.success('Text copied!');
		setTimeout(() => (copyConfirmed = false), 2000);
	}

	let charCount = $derived(displayText?.length ?? 0);
	let lineCount = $derived(displayText?.split('\n').length ?? 0);

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
	<!-- Header -->
	<div class="flex items-center gap-3">
		<div class="bg-primary/10 flex size-10 items-center justify-center rounded-lg">
			<Clipboard class="text-primary size-5" />
		</div>
		<div>
			<h1 class="text-2xl font-bold tracking-tight">FlashText</h1>
			<p class="text-muted-foreground text-sm">Temporary shared text — view-only</p>
		</div>
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
						This text has either expired or the link is invalid. FlashText links are temporary and
						automatically deleted after their expiry time (max 24 hours).
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
			<!-- Meta Card -->
			<Card>
				<CardContent class="flex flex-wrap items-center justify-between gap-4 p-4">
					<div class="text-muted-foreground flex flex-wrap items-center gap-3 text-sm">
						<div class="flex items-center gap-1.5">
							<Timer class="size-4" />
							{#if isExpired}
								<span class="text-destructive font-semibold">Expired</span>
							{:else}
								<span
									>Expires in <span class="font-semibold tabular-nums">{timeRemaining}</span></span
								>
							{/if}
						</div>
						{#if displayText}
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
					{#if displayText}
						<Button variant="outline" size="sm" onclick={handleCopy} disabled={isExpired || !displayText}>
							{#if copyConfirmed}
								<Check class="mr-2 size-4 text-green-500" />
								Copied!
							{:else}
								<Copy class="mr-2 size-4" />
								Copy Text
							{/if}
						</Button>
					{/if}
				</CardContent>
			</Card>

			<!-- Decrypt states: shown before the content card so a broken key or
			     missing fragment is visible instead of a raw-ciphertext render. -->
			{#if decryptError}
				<Card class="border-destructive/50 bg-destructive/5">
					<CardHeader>
						<CardTitle class="flex items-center gap-2">
							<AlertTriangle class="text-destructive size-5" />
							<span class="text-destructive">Cannot Decrypt</span>
						</CardTitle>
						<CardDescription>{decryptError}</CardDescription>
					</CardHeader>
				</Card>
			{:else if currentFlashText.isEncrypted && !decrypted}
				<Card>
					<CardContent class="text-muted-foreground p-8 text-center text-sm">Decrypting…</CardContent>
				</Card>
			{/if}

			<!-- Content Card (or file-only placeholder) -->
			{#if displayText}
				<Card>
					<CardHeader class="pb-3">
						<CardTitle class="text-muted-foreground text-sm font-medium">Shared Text</CardTitle>
					</CardHeader>
					<CardContent>
						<pre
							class="bg-muted/50 max-h-[70vh] overflow-auto rounded-md p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap">
							{displayText}</pre>
					</CardContent>
				</Card>
			{:else}
				<Card>
					<CardHeader class="pb-3">
						<CardTitle class="text-muted-foreground text-sm font-medium">No Text Content</CardTitle>
					</CardHeader>
					<CardContent>
						<p class="text-muted-foreground py-4 text-center text-sm">
							This share contains only files — no text was included.
							{#if currentFiles.length > 0}
								Files are listed below.
							{:else}
								No files are attached either.
							{/if}
						</p>
					</CardContent>
				</Card>
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

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
	import { Clipboard, Timer, Copy, Check, AlertTriangle, ArrowLeft } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { fade } from 'svelte/transition';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let currentFlashText = $derived(data.flashText);

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
		await navigator.clipboard.writeText(currentFlashText.content);
		copyConfirmed = true;
		toast.success('Text copied!');
		setTimeout(() => (copyConfirmed = false), 2000);
	}

	let charCount = $derived(currentFlashText?.content?.length ?? 0);
	let lineCount = $derived(currentFlashText?.content?.split('\n').length ?? 0);
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
		<!-- Active FlashText -->
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
						<Badge variant="secondary" class="text-xs">{charCount} chars</Badge>
						<Badge variant="secondary" class="text-xs">{lineCount} lines</Badge>
					</div>
					<Button variant="outline" size="sm" onclick={handleCopy} disabled={isExpired}>
						{#if copyConfirmed}
							<Check class="mr-2 size-4 text-green-500" />
							Copied!
						{:else}
							<Copy class="mr-2 size-4" />
							Copy Text
						{/if}
					</Button>
				</CardContent>
			</Card>

			<!-- Content Card -->
			<Card>
				<CardHeader class="pb-3">
					<CardTitle class="text-muted-foreground text-sm font-medium">Shared Text</CardTitle>
				</CardHeader>
				<CardContent>
					<pre
						class="bg-muted/50 max-h-[70vh] overflow-auto rounded-md p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap">
						{currentFlashText.content}</pre>
				</CardContent>
			</Card>

			<!-- Footer -->
			<p class="text-muted-foreground text-center text-xs">
				Created {new Date(currentFlashText.createdAt).toLocaleString()} &middot;
				<a href="/apps/flash-text" class="text-primary hover:underline">Create your own</a>
			</p>
		</div>
	{/if}
</div>

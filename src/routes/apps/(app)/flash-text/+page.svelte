<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { createFlashText, getUserFlashTexts, deleteFlashText, getCurrentUser } from '$lib/remote';
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription
	} from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { Clipboard, Link, Timer, Trash, Copy, Check, Loader2 } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { fade, fly } from 'svelte/transition';

	// --- State ---
	let isCreating = $state(false);
	let copyConfirmed = $state(false);
	let currentUser = $state<{ id: string } | null>(null);
	let userFlashTexts = $state<
		Array<{ id: string; slug: string; content: string; expiresAt: string; createdAt: string }>
	>([]);
	let isLoadingPastes = $state(false);
	let deletingId = $state<string | null>(null);
	let formRef = $state<HTMLFormElement | null>(null);

	// --- Derived ---
	let createdSlug = $derived(page.url.searchParams.get('slug'));
	let createdExpiresAt = $derived(page.url.searchParams.get('expiresAt'));
	let shareUrl = $derived(createdSlug ? `${page.url.origin}/f/${createdSlug}` : null);
	let timeRemaining = $state<string | null>(null);
	let isExpired = $state(false);

	// --- Init ---
	$effect(() => {
		getCurrentUser().then((u) => {
			currentUser = u || null;
			if (u) loadUserPastes();
		});
	});

	// --- Countdown timer for created paste ---
	$effect(() => {
		if (!createdExpiresAt) {
			timeRemaining = null;
			isExpired = false;
			return;
		}

		const updateTimer = () => {
			const now = Date.now();
			const expires = new Date(createdExpiresAt!).getTime();
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

	// --- Actions ---
	async function loadUserPastes() {
		isLoadingPastes = true;
		try {
			userFlashTexts = await getUserFlashTexts();
		} catch {
			// Silently fail
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
		goto('/apps/flash-text', { replaceState: true, noScroll: true });
	}

	function previewContent(text: string, maxLen = 120): string {
		return text.length > maxLen ? text.slice(0, maxLen) + '...' : text;
	}

	function formatDate(iso: string): string {
		return new Date(iso).toLocaleString();
	}
</script>

<div class="mx-auto max-w-3xl space-y-8 p-4 sm:p-6">
	<!-- Header -->
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

	<!-- Create Section -->
	<Card>
		<CardHeader>
			<CardTitle>Create a Share Link</CardTitle>
			<CardDescription>
				Paste your text below. A temporary link will be generated — anyone with the link can view it
				until it expires.
			</CardDescription>
		</CardHeader>
		<CardContent>
			<form
				{...createFlashText.enhance(async ({ form, submit }) => {
					isCreating = true;
					try {
						await submit();
						form.reset();
						if (currentUser) {
							await loadUserPastes();
						}
					} catch {
						toast.error('Failed to create link. Please try again.');
					} finally {
						isCreating = false;
					}
				})}
				bind:this={formRef}
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

	<!-- Result Card -->
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
					<div class="bg-muted flex items-center gap-2 rounded-md p-3 font-mono text-sm break-all">
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
						<Button variant="ghost" size="sm" onclick={handleNew}>Create New</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	{/if}

	<!-- User's Pastes (if logged in) -->
	{#if currentUser}
		<Separator />

		<div class="space-y-4">
			<h2 class="text-lg font-semibold">Your Recent Pastes</h2>

			{#if isLoadingPastes}
				<div class="space-y-3">
					{#each [1, 2, 3] as _}
						<Skeleton class="h-20 w-full rounded-lg" />
					{/each}
				</div>
			{:else if userFlashTexts.length === 0}
				<p class="text-muted-foreground text-sm">No active pastes. Create one above!</p>
			{:else}
				<div class="space-y-2">
					{#each userFlashTexts as paste (paste.id)}
						<div transition:fly={{ y: 10, duration: 200 }}>
							<Card class="group">
								<CardContent class="flex items-start justify-between gap-4 p-4">
									<div class="min-w-0 flex-1 space-y-1">
										<p class="text-muted-foreground truncate font-mono text-sm">
											{previewContent(paste.content)}
										</p>
										<div class="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
											<Badge variant="secondary" class="text-xs">
												/f/{paste.slug}
											</Badge>
											<span>Expires: {formatDate(paste.expiresAt)}</span>
										</div>
									</div>
									<div
										class="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100"
									>
										<Button
											variant="ghost"
											size="icon"
											onclick={() => {
												navigator.clipboard.writeText(`${page.url.origin}/f/${paste.slug}`);
												toast.success('Link copied!');
											}}
										>
											<Copy class="size-3.5" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											disabled={deletingId === paste.id}
											onclick={() => handleDelete(paste.id)}
										>
											{#if deletingId === paste.id}
												<Loader2 class="size-3.5 animate-spin" />
											{:else}
												<Trash class="text-destructive size-3.5" />
											{/if}
										</Button>
									</div>
								</CardContent>
							</Card>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>

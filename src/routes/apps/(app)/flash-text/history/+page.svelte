<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import {
		getCurrentUser,
		getUserHistory,
		deleteFlashText,
		deleteFlashFile,
		type HistoryEntry
	} from '$lib/remote';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import {
		ArrowLeft,
		Clipboard,
		Copy,
		FileText,
		File as FileIcon,
		FileImage,
		Film,
		Archive,
		Link,
		Loader2,
		Timer,
		Trash,
		History
	} from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { fly } from 'svelte/transition';

	let currentUser = $state<{ id: string } | null>(null);
	let history = $state<HistoryEntry[]>([]);
	let isLoading = $state(true);
	let deletingId = $state<string | null>(null);
	let copyConfirmed = $state<string | null>(null);

	$effect(() => {
		getCurrentUser().then(async (user) => {
			currentUser = user || null;
			if (user) {
				isLoading = true;
				try {
					history = await getUserHistory();
				} catch {
					toast.error('Failed to load history');
				} finally {
					isLoading = false;
				}
			} else {
				isLoading = false;
			}
		});
	});

	function isExpired(expiresAt: string): boolean {
		return new Date(expiresAt).getTime() <= Date.now();
	}

	function typeIcon(type: string) {
		return type === 'text' ? FileText : FileIcon;
	}

	async function handleCopy(text: string) {
		await navigator.clipboard.writeText(text);
		copyConfirmed = text;
		toast.success('Copied!');
		setTimeout(() => (copyConfirmed = null), 2000);
	}

	async function handleDelete(entry: HistoryEntry) {
		deletingId = entry.id;
		try {
			if (entry.type === 'text') {
				await deleteFlashText({ id: entry.id.replace('text-', '') });
			} else {
				await deleteFlashFile({ id: entry.id.replace('file-', '') });
			}
			history = history.filter((h) => h.id !== entry.id);
			toast.success('Deleted');
		} catch {
			toast.error('Failed to delete');
		} finally {
			deletingId = null;
		}
	}

	function formatDate(iso: string): string {
		return new Date(iso).toLocaleString();
	}
</script>

<svelte:head>
	<title>FlashText History</title>
	<meta name="description" content="Your FlashText history and shared links." />
</svelte:head>

<div class="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
	<!-- Header -->
	<div class="flex items-center gap-3">
		<div class="bg-primary/10 flex size-10 items-center justify-center rounded-lg">
			<History class="text-primary size-5" />
		</div>
		<div>
			<h1 class="text-2xl font-bold tracking-tight">FlashText History</h1>
			<p class="text-muted-foreground text-sm">All your shared texts and uploaded files</p>
		</div>
	</div>

	<!-- Back link -->
	<a
		href="/apps/flash-text"
		class="text-muted-foreground inline-flex items-center gap-1.5 text-sm hover:underline"
	>
		<ArrowLeft class="size-4" />
		Back to FlashText
	</a>

	{#if isLoading}
		<div class="space-y-3">
			{#each Array.from({ length: 5 }) as _, index (index)}
				<Skeleton class="h-20 w-full rounded-lg" />
			{/each}
		</div>
	{:else if !currentUser}
		<Card>
			<CardHeader>
				<CardTitle>Sign in required</CardTitle>
				<CardDescription>
					Please sign in to view your FlashText history. Your shared links and uploaded files will
					appear here.
				</CardDescription>
			</CardHeader>
		</Card>
	{:else if history.length === 0}
		<Card>
			<CardHeader>
				<CardTitle>No history yet</CardTitle>
				<CardDescription>
					Create your first FlashText or upload a file — your shared links and files will appear
					here.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Button onclick={() => goto('/apps/flash-text')}>
					<Link class="mr-2 size-4" />
					Create a FlashText
				</Button>
			</CardContent>
		</Card>
	{:else}
		<div class="space-y-2">
			<p class="text-muted-foreground text-sm">
				Showing {history.length}
				{history.length === 1 ? 'entry' : 'entries'}
			</p>

			<div class="space-y-2">
				{#each history as entry (entry.id)}
					{@const expired = isExpired(entry.expiresAt)}
					<div
						transition:fly={{ y: 10, duration: 200 }}
						class="hover:bg-muted/50 flex flex-col gap-3 rounded-lg border p-4 transition-colors sm:flex-row sm:items-center sm:justify-between"
						class:opacity-50={expired}
					>
						<div class="flex min-w-0 items-start gap-3">
							<div
								class="bg-primary/10 text-primary mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md"
							>
								{#if entry.type === 'text'}
									<FileText class="size-4" />
								{:else}
									<FileIcon class="size-4" />
								{/if}
							</div>
							<div class="min-w-0 flex-1 space-y-1">
								<p class="truncate text-sm font-medium" title={entry.label}>
									{entry.label}
								</p>
								<div class="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
									<Badge variant="secondary" class="text-[10px]"
										>{entry.type === 'text' ? 'Text' : 'File'}</Badge
									>
									<Badge variant="secondary" class="text-[10px]">{entry.detail}</Badge>
									{#if expired}
										<Badge variant="destructive" class="text-[10px]">Expired</Badge>
									{:else}
										<Badge variant="outline" class="text-[10px]">Active</Badge>
									{/if}
									<span>{formatDate(entry.createdAt)}</span>
								</div>
							</div>
						</div>

						<div class="flex shrink-0 flex-wrap gap-2">
							{#if entry.type === 'text'}
								<Button
									variant="outline"
									size="sm"
									onclick={() => handleCopy(`${page.url.origin}/f/${entry.slug}`)}
								>
									{#if copyConfirmed === `${page.url.origin}/f/${entry.slug}`}
										<Copy class="mr-1 size-3.5 text-green-500" />
									{:else}
										<Copy class="mr-1 size-3.5" />
									{/if}
									Copy Link
								</Button>
							{:else if entry.parentSlug}
								<Button variant="outline" size="sm" onclick={() => goto(`/f/${entry.parentSlug}`)}>
									<Link class="mr-1 size-3.5" />
									View
								</Button>
							{/if}
							<Button
								variant="ghost"
								size="sm"
								disabled={deletingId === entry.id}
								onclick={() => handleDelete(entry)}
							>
								{#if deletingId === entry.id}
									<Loader2 class="size-4 animate-spin" />
								{:else}
									<Trash class="text-destructive size-4" />
								{/if}
							</Button>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

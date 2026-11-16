<script lang="ts">
	import RouteHead from '#lib/components/blocks/RouteHead.svelte';
	import HowToUseDialog from '@/blocks/HowToUseDialog.svelte';
	import { wordCounterHowToUse } from './how-to-use-config';
	import { analyzeText, formatDuration } from '#lib/utility/word-counter.js';
	import { PersistedState } from '#lib/persisted-state/index.js';
	import { page } from '$app/state';
	import { Button } from '@/ui/button/index.js';
	import { Badge } from '@/ui/badge/index.js';
	import * as Card from '@/ui/card/index.js';
	import { Progress } from '@/ui/progress/index.js';
	import { Textarea } from '@/ui/textarea/index.js';
	import { Label } from '@/ui/label/index.js';
	import { toast } from 'svelte-sonner';
	import {
		ChartBar,
		Clock,
		Copy,
		Eraser,
		Hash,
		Info,
		Mic,
		Sparkles,
		WholeWord
	} from '@lucide/svelte';

	interface Limit {
		id: string;
		label: string;
		unit: 'characters' | 'words';
		max: number | null;
		hint: string;
	}

	const LIMITS: Limit[] = [
		{
			id: 'none',
			label: 'No limit',
			unit: 'characters',
			max: null,
			hint: 'Count without a target'
		},
		{ id: 'x', label: 'X post', unit: 'characters', max: 280, hint: '280 characters' },
		{ id: 'sms', label: 'SMS', unit: 'characters', max: 160, hint: '160 characters' },
		{ id: 'linkedin', label: 'LinkedIn', unit: 'characters', max: 3000, hint: '3,000 characters' },
		{ id: 'essay', label: 'Essay', unit: 'words', max: 1000, hint: '1,000 words' }
	];

	const SAMPLE_TEXT = `Writing is thinking made visible. Every draft, however rough, teaches you something the blank page never could: where the argument holds, where it wanders, and where it needs a sharper example.

A word counter is a quiet instrument. It will not tell you what to say, but it will tell you how much you have said — and whether that is the right amount.`;

	const numberFormat = new Intl.NumberFormat('en-US');

	const content = new PersistedState('word-counter-text', '');
	const limitId = new PersistedState('word-counter-limit', 'none');

	// Seed from the share-target ?text= param once IndexedDB hydration has
	// finished, so the shared text wins over a previously saved draft.
	const sharedText = page.url.searchParams.get('text');
	if (sharedText) {
		void content.reload().then(() => {
			content.current = sharedText;
		});
	}

	let showHowToUse = $state(false);

	const stats = $derived(analyzeText(content.current));
	const activeLimit = $derived(LIMITS.find((limit) => limit.id === limitId.current) ?? LIMITS[0]);
	const used = $derived(
		activeLimit.max === null ? 0 : activeLimit.unit === 'words' ? stats.words : stats.characters
	);
	const isOverLimit = $derived(activeLimit.max !== null && used > activeLimit.max);
	const remaining = $derived(activeLimit.max === null ? 0 : activeLimit.max - used);
	const progressValue = $derived(
		activeLimit.max === null ? 0 : Math.min(100, (used / activeLimit.max) * 100)
	);
	const topKeywordCount = $derived(stats.keywords[0]?.count ?? 1);

	function format(value: number): string {
		return numberFormat.format(value);
	}

	function unitLabel(unit: Limit['unit'], count: number): string {
		return count === 1 ? unit.slice(0, -1) : unit;
	}

	async function copyText() {
		try {
			await navigator.clipboard.writeText(content.current);
			toast.success('Text copied to clipboard');
		} catch {
			toast.error('Could not access the clipboard');
		}
	}
</script>

<RouteHead
	title="Word Counter - Live Word, Character & Reading Time Stats"
	description="Count words, characters, sentences, and paragraphs as you type. Get reading time, keyword density, and writing limits for X, SMS, LinkedIn, and essays — all in your browser."
	keywords="word counter, character counter, word count tool, reading time calculator, keyword density, character limit, svelte"
	route="/apps/word-counter"
/>

<div class="container mx-auto max-w-6xl px-4 py-8 md:py-10">
	<header
		class="border-primary/10 from-primary/10 via-primary/5 mb-6 rounded-2xl border bg-gradient-to-br to-transparent p-6 md:p-8"
	>
		<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div class="flex items-center gap-4">
				<div
					class="bg-primary/10 text-primary flex size-12 shrink-0 items-center justify-center rounded-xl"
				>
					<WholeWord class="size-6" />
				</div>
				<div>
					<h1 class="text-2xl font-bold tracking-tight md:text-3xl">Word Counter</h1>
					<p class="text-muted-foreground mt-1 text-sm">
						Words, characters, and reading time — updated as you type.
					</p>
				</div>
			</div>
			<Button variant="outline" onclick={() => (showHowToUse = true)} class="shrink-0">
				<Info class="size-4" />
				How to use
			</Button>
		</div>
	</header>

	<div class="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
		<div class="space-y-3">
			<Card.Root class="gap-0 overflow-hidden py-0">
				<div
					class="border-border/60 flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5"
				>
					<div class="flex items-center gap-2 pl-1">
						<span class="text-sm font-medium">Your text</span>
						{#if stats.words > 0}
							<Badge variant="secondary" class="font-mono text-[11px] tabular-nums">
								{format(stats.words)} words
							</Badge>
						{/if}
					</div>
					<div class="flex items-center gap-1">
						<Button variant="ghost" size="sm" onclick={copyText} disabled={stats.words === 0}>
							<Copy class="size-4" />
							Copy
						</Button>
						<Button variant="ghost" size="sm" onclick={() => (content.current = SAMPLE_TEXT)}>
							<Sparkles class="size-4" />
							Sample
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onclick={() => (content.current = '')}
							disabled={!content.current}
						>
							<Eraser class="size-4" />
							Clear
						</Button>
					</div>
				</div>

				<Label class="sr-only" for="word-counter-input">Text to analyze</Label>
				<Textarea
					id="word-counter-input"
					bind:value={content.current}
					placeholder="Paste or type your text here…"
					spellcheck
					class="min-h-[420px] resize-y rounded-none border-0 bg-transparent px-5 py-5 text-base leading-relaxed focus-visible:ring-0 md:text-[15px]"
				/>

				<div class="border-border/60 bg-muted/30 border-t px-4 py-3">
					<div class="flex flex-wrap items-center justify-between gap-2">
						<div class="flex flex-wrap items-center gap-1" role="group" aria-label="Writing limit">
							{#each LIMITS as limit (limit.id)}
								<Button
									variant={activeLimit.id === limit.id ? 'secondary' : 'ghost'}
									size="sm"
									class="h-7 px-2 text-xs"
									aria-pressed={activeLimit.id === limit.id}
									aria-label={`${limit.label} — ${limit.hint}`}
									onclick={() => (limitId.current = limit.id)}
								>
									{limit.label}
								</Button>
							{/each}
						</div>
						<p class="text-muted-foreground font-mono text-xs tabular-nums">
							{#if activeLimit.max === null}
								Counting without a limit
							{:else}
								{format(used)} / {format(activeLimit.max)}
								{unitLabel(activeLimit.unit, activeLimit.max)}
								<span class={isOverLimit ? 'text-destructive font-medium' : ''}>
									· {isOverLimit ? `${format(-remaining)} over` : `${format(remaining)} left`}
								</span>
							{/if}
						</p>
					</div>
					{#if activeLimit.max !== null}
						<Progress
							class="mt-2 h-1.5"
							classInner={isOverLimit ? 'bg-destructive' : 'bg-primary'}
							value={progressValue}
							aria-label="Progress toward the selected writing limit"
						/>
					{/if}
				</div>
			</Card.Root>

			<p class="text-muted-foreground px-1 text-xs">
				Counts update live. Your draft is saved in this browser only.
			</p>
		</div>

		<div class="space-y-6">
			<Card.Root class="gap-0 overflow-hidden py-0">
				<div class="border-border/60 flex items-center gap-2 border-b px-5 py-3.5">
					<ChartBar class="text-primary size-4" />
					<h2 class="text-sm font-medium">Live stats</h2>
				</div>

				<div class="bg-primary/5 border-border/60 border-b px-5 py-4">
					<p class="text-muted-foreground text-[11px] font-medium tracking-[0.16em] uppercase">
						Words
					</p>
					<p class="mt-1 font-mono text-5xl font-semibold tracking-tight tabular-nums">
						{format(stats.words)}
					</p>
				</div>

				<dl class="bg-border grid grid-cols-2 gap-px">
					<div class="bg-card px-5 py-3">
						<dt class="text-muted-foreground text-[11px] font-medium tracking-[0.12em] uppercase">
							Characters
						</dt>
						<dd class="mt-0.5 font-mono text-lg font-semibold tabular-nums">
							{format(stats.characters)}
						</dd>
					</div>
					<div class="bg-card px-5 py-3">
						<dt class="text-muted-foreground text-[11px] font-medium tracking-[0.12em] uppercase">
							No spaces
						</dt>
						<dd class="mt-0.5 font-mono text-lg font-semibold tabular-nums">
							{format(stats.charactersNoSpaces)}
						</dd>
					</div>
					<div class="bg-card px-5 py-3">
						<dt class="text-muted-foreground text-[11px] font-medium tracking-[0.12em] uppercase">
							Sentences
						</dt>
						<dd class="mt-0.5 font-mono text-lg font-semibold tabular-nums">
							{format(stats.sentences)}
						</dd>
					</div>
					<div class="bg-card px-5 py-3">
						<dt class="text-muted-foreground text-[11px] font-medium tracking-[0.12em] uppercase">
							Paragraphs
						</dt>
						<dd class="mt-0.5 font-mono text-lg font-semibold tabular-nums">
							{format(stats.paragraphs)}
						</dd>
					</div>
					<div class="bg-card px-5 py-3">
						<dt class="text-muted-foreground text-[11px] font-medium tracking-[0.12em] uppercase">
							Lines
						</dt>
						<dd class="mt-0.5 font-mono text-lg font-semibold tabular-nums">
							{format(stats.lines)}
						</dd>
					</div>
					<div class="bg-card px-5 py-3">
						<dt class="text-muted-foreground text-[11px] font-medium tracking-[0.12em] uppercase">
							Unique words
						</dt>
						<dd class="mt-0.5 font-mono text-lg font-semibold tabular-nums">
							{format(stats.uniqueWords)}
						</dd>
					</div>
					<div class="bg-card px-5 py-3">
						<dt
							class="text-muted-foreground flex items-center gap-1 text-[11px] font-medium tracking-[0.12em] uppercase"
						>
							<Clock class="size-3" />
							Reading
						</dt>
						<dd class="mt-0.5 font-mono text-lg font-semibold tabular-nums">
							{formatDuration(stats.readingMinutes)}
						</dd>
					</div>
					<div class="bg-card px-5 py-3">
						<dt
							class="text-muted-foreground flex items-center gap-1 text-[11px] font-medium tracking-[0.12em] uppercase"
						>
							<Mic class="size-3" />
							Speaking
						</dt>
						<dd class="mt-0.5 font-mono text-lg font-semibold tabular-nums">
							{formatDuration(stats.speakingMinutes)}
						</dd>
					</div>
				</dl>
			</Card.Root>

			<Card.Root>
				<Card.Header class="pb-2">
					<Card.Title class="flex items-center gap-2 text-sm font-medium">
						<Hash class="text-primary size-4" />
						Keyword density
					</Card.Title>
					<Card.Description>Most frequent words, with stop words excluded.</Card.Description>
				</Card.Header>
				<Card.Content>
					{#if stats.keywords.length > 0}
						<ul class="space-y-3">
							{#each stats.keywords as keyword (keyword.word)}
								<li>
									<div class="mb-1 flex items-baseline justify-between gap-3 text-xs">
										<span class="truncate font-medium">{keyword.word}</span>
										<span class="text-muted-foreground shrink-0 font-mono tabular-nums">
											{keyword.count}× · {keyword.density.toFixed(1)}%
										</span>
									</div>
									<div class="bg-secondary h-1.5 overflow-hidden rounded-full">
										<div
											class="bg-primary h-full rounded-full transition-[width] duration-300"
											style:width={`${(keyword.count / topKeywordCount) * 100}%`}
										></div>
									</div>
								</li>
							{/each}
						</ul>
					{:else}
						<p class="text-muted-foreground py-2 text-sm">
							Start typing to see which words carry the most weight.
						</p>
					{/if}
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</div>

<HowToUseDialog
	bind:open={showHowToUse}
	title={wordCounterHowToUse.title}
	description={wordCounterHowToUse.description}
	tabs={wordCounterHowToUse.tabs}
	showFooterHelpText={wordCounterHowToUse.showFooterHelpText}
/>

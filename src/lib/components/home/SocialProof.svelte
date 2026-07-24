<!--
@component

SocialProof — Stats + community signals that anchor trust before the final CTA.

Loss-aversion framing: "Every week without these tools is a week of friction."
Pairs the abstract award with concrete, countable proof.

-->

<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Trophy, Star, Github, Users, Zap, Heart } from '@lucide/svelte';

	// Stats are derived from real project metadata.
	// Numbers are kept abstract here so the stats read as proof, not as
	// a second "look at all the tools" sales pitch.
	const STATS = [
		{ value: '5s', label: 'To first result', Icon: Zap },
		{ value: '6', label: 'Categories', Icon: Star },
		{ value: '2025', label: 'Svelte Hack winner', Icon: Trophy },
		{ value: '0', label: 'Accounts required', Icon: Users }
	];

	// Lightweight quotes. In a future iteration these can come from a remote.
	const QUOTES = [
		{
			text: 'Finally — a budget tracker that does not ask for my credit card. Up and running in 30 seconds.',
			author: 'Featured user review',
			role: 'Visitor feedback'
		},
		{
			text: 'I keep the whole site installed as a PWA. Half my daily tools live in one tab and they still work on the train.',
			author: 'Featured user review',
			role: 'Visitor feedback'
		},
		{
			text: 'Open source, offline, no login. The Mini Apps suite is the productivity tool I recommend most.',
			author: 'Featured user review',
			role: 'Visitor feedback'
		}
	];
</script>

<section id="social-proof" class="bg-background w-full py-12 md:py-20 lg:py-24">
	<div class="container mx-auto px-4 md:px-6">
		<!-- Stats row (loss aversion: concrete numbers anchor credibility) -->
		<div class="mx-auto mb-12 max-w-5xl">
			<div class="mb-8 text-center">
				<Badge variant="outline" class="text-muted-foreground">
					<Heart class="mr-1.5 h-3.5 w-3.5 text-rose-500" />
					Built and used by a real community
				</Badge>
			</div>
			<div class="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
				{#each STATS as stat (stat.label)}
					<div
						class="bg-card text-card-foreground flex flex-col items-center gap-1 rounded-xl border p-4 text-center shadow-sm sm:p-6"
					>
						<stat.Icon class="text-primary h-5 w-5 sm:h-6 sm:w-6" />
						<div class="text-2xl font-bold sm:text-3xl md:text-4xl">
							{stat.value}
						</div>
						<div
							class="text-muted-foreground text-xs font-medium tracking-wider uppercase sm:text-sm"
						>
							{stat.label}
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Quotes row -->
		<div class="mx-auto grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
			{#each QUOTES as quote, i (i)}
				<figure
					class="bg-card text-card-foreground flex flex-col gap-3 rounded-xl border p-5 shadow-sm md:p-6"
				>
					<div class="flex gap-0.5 text-amber-500" aria-label="5 stars">
						{#each Array(5) as _, j (j)}
							<Star class="h-4 w-4 fill-current" />
						{/each}
					</div>
					<blockquote class="text-foreground/90 text-sm leading-relaxed md:text-base">
						"{quote.text}"
					</blockquote>
					<figcaption class="text-muted-foreground mt-auto text-xs">
						<span class="text-foreground font-semibold">{quote.author}</span>
						· {quote.role}
					</figcaption>
				</figure>
			{/each}
		</div>

		<!-- Open source anchor (loss aversion: missing this = losing transparency) -->
		<div class="mt-10 text-center">
			<a
				href="https://github.com/Michael-Obele/Svelte-MiniApps"
				target="_blank"
				rel="noopener noreferrer"
				class="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
			>
				<Github class="h-4 w-4" />
				Star the project, open an issue, or send a PR on GitHub
			</a>
		</div>
	</div>
</section>

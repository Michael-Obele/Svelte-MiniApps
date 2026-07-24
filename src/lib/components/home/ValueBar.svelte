<!--
@component

ValueBar — Contrast Effect anchor.

A high-priced anchor (single-tool competitor) makes the free 20-tool suite
feel like a steal. The data points are illustrative; the relative difference
is the actual message.

-->

<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Check, X, Sparkles, Wallet, Briefcase, Heart } from '@lucide/svelte';

	const COMPETITOR = {
		name: 'Typical single-tool app',
		price: 15,
		unit: '/mo',
		features: {
			oneTool: false,
			twenty: false,
			offline: true,
			noSignup: false,
			openSource: false,
			dataStaysLocal: false
		}
	} as const;

	const OURS = {
		name: 'Svelte Mini Apps',
		price: 0,
		unit: 'forever',
		features: {
			oneTool: false,
			twenty: true,
			offline: true,
			noSignup: true,
			openSource: true,
			dataStaysLocal: true
		}
	} as const;

	// Annualised competitor cost: 15 * 12 = 180
	let competitorAnnual = $derived(COMPETITOR.price * 12);
</script>

<section
	id="value"
	class="from-primary/[0.05] border-border/60 w-full border-y bg-gradient-to-b to-transparent py-12 md:py-20 lg:py-24"
>
	<div class="container mx-auto px-4 md:px-6">
		<div class="mx-auto mb-10 max-w-2xl text-center md:mb-14">
			<Badge variant="secondary" class="border-primary/30 bg-primary/10 text-primary">
				<Sparkles class="mr-1.5 h-3.5 w-3.5" />
				The math is simple
			</Badge>
			<h2 class="text-foreground mt-4 text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
				20 focused tools vs 1 tool for $15/month.
			</h2>
			<p class="text-muted-foreground mt-3 text-lg">
				Most productivity apps charge per tool, per month, per seat. We don't.
			</p>
		</div>

		<div class="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
			<!-- Competitor card (anchor) -->
			<div class="bg-card text-card-foreground relative rounded-2xl border p-6 opacity-90 md:p-8">
				<div
					class="bg-muted text-muted-foreground absolute -top-3 left-6 rounded-full px-3 py-1 text-xs font-semibold tracking-wider uppercase"
				>
					What you pay elsewhere
				</div>
				<div class="mb-1 flex items-baseline gap-2">
					<span class="text-4xl font-bold">${COMPETITOR.price}</span>
					<span class="text-muted-foreground text-sm">{COMPETITOR.unit}</span>
				</div>
				<p class="text-muted-foreground text-sm">
					${competitorAnnual}/year — for one tool.
				</p>
				<div class="text-muted-foreground mt-6 mb-2 text-xs font-semibold tracking-wide uppercase">
					{COMPETITOR.name}
				</div>
				<ul class="space-y-2 text-sm">
					<li class="text-muted-foreground flex items-center gap-2">
						<X class="h-4 w-4 text-red-500" />
						1 tool, no suite
					</li>
					<li class="text-muted-foreground flex items-center gap-2">
						<X class="h-4 w-4 text-red-500" />
						Account required
					</li>
					<li class="flex items-center gap-2">
						<Check class="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
						Offline support
					</li>
					<li class="text-muted-foreground flex items-center gap-2">
						<X class="h-4 w-4 text-red-500" />
						Closed source
					</li>
					<li class="text-muted-foreground flex items-center gap-2">
						<X class="h-4 w-4 text-red-500" />
						Your data on their servers
					</li>
				</ul>
			</div>

			<!-- Our card (target) -->
			<div
				class="bg-card text-card-foreground border-primary/40 ring-primary/10 relative rounded-2xl border-2 p-6 shadow-lg ring-2 md:p-8"
			>
				<div
					class="bg-primary text-primary-foreground absolute -top-3 left-6 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wider uppercase shadow-md"
				>
					<Heart class="h-3 w-3 fill-current" />
					What you get here
				</div>
				<div class="mb-1 flex items-baseline gap-2">
					<span class="text-primary text-4xl font-bold">$0</span>
					<span class="text-muted-foreground text-sm">{OURS.unit}</span>
				</div>
				<p class="text-muted-foreground text-sm">
					Saves the average user $180/year in subscriptions.
				</p>
				<div class="text-muted-foreground mt-6 mb-2 text-xs font-semibold tracking-wide uppercase">
					{OURS.name}
				</div>
				<ul class="space-y-2 text-sm">
					<li class="flex items-center gap-2 font-medium">
						<Check class="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
						{20}+ focused tools, growing
					</li>
					<li class="flex items-center gap-2 font-medium">
						<Check class="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
						No account needed
					</li>
					<li class="flex items-center gap-2 font-medium">
						<Check class="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
						Full offline support (PWA)
					</li>
					<li class="flex items-center gap-2 font-medium">
						<Check class="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
						Open source on GitHub
					</li>
					<li class="flex items-center gap-2 font-medium">
						<Check class="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
						Your data stays in your browser
					</li>
				</ul>
			</div>
		</div>

		<!-- Anchor number — drives the Contrast Effect -->
		<p class="text-muted-foreground mx-auto mt-10 max-w-2xl text-center text-sm md:text-base">
			<Wallet class="mr-1 inline h-4 w-4 align-text-bottom" />
			<span class="text-foreground font-semibold">$180 saved per year</span>
			vs the typical paid productivity suite. Reused 20 different ways.
		</p>

		<!-- Reassurance (Loss Aversion) -->
		<div class="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
			<span class="text-muted-foreground flex items-center gap-1.5">
				<Heart class="h-4 w-4 text-rose-500" />
				No paywall
			</span>
			<span class="text-muted-foreground flex items-center gap-1.5">
				<Heart class="h-4 w-4 text-rose-500" />
				No ads
			</span>
			<span class="text-muted-foreground flex items-center gap-1.5">
				<Heart class="h-4 w-4 text-rose-500" />
				No "Pro" tier
			</span>
			<span class="text-muted-foreground flex items-center gap-1.5">
				<Briefcase class="h-4 w-4 text-amber-500" />
				Hire me if you want a custom one
			</span>
		</div>
	</div>
</section>

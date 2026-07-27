<!--
@component

Hero — conversion-optimised above-the-fold section.

Applies 4 psychology principles:
  1. Smart Default     — Trust micro-bar pre-renders all 4 badges
  2. Outcome-led copy  — Headline tells users what they GET, not what we are
  3. Dual CTAs         — Primary (browse) + Secondary (try live) per Casey Hill
  4. Brand anchor      — Large, low-opacity Svelte logo as a background
                         watermark (preserves the Svelte Hack 2025 brand
                         signal without competing with the headline for
                         conversion real estate)

The right column used to be a 6-app mockup grid. Replaced with the Svelte
logo to honor your request to keep the brand mark visible while removing
the redundant "look at all the apps" messaging from above the fold.

-->

<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { ArrowRight, Play, Check, Zap, Lock, Github, Trophy } from '@lucide/svelte';
	import Svelte from '$lib/assets/svelte.svelte';
	import { onMount } from 'svelte';

	import { getTrustBadges } from './data.svelte';

	// Map icon name → component for the trust micro-bar.
	const ICON_MAP = { check: Check, zap: Zap, lock: Lock, github: Github } as const;

	let trustBadges = $derived(getTrustBadges());

	let { data } = $props();

	// 0 = waiting (pre-flicker pause), 1 = playing auto-flicker, 2 = hover-only
	let flickerPhase = $state(0);

	onMount(() => {
		const t1 = setTimeout(() => {
			flickerPhase = 1; // start flicker after 750ms
		}, 750);

		const t2 = setTimeout(() => {
			flickerPhase = 2; // switch to hover-only after flicker completes
		}, 1950); // 750ms delay + 1.2s animation

		return () => {
			clearTimeout(t1);
			clearTimeout(t2);
		};
	});
</script>

<section
	id="hero"
	class="from-background to-background relative w-full overflow-hidden bg-gradient-to-b via-red-50/30 py-12 md:py-20 lg:py-24 dark:via-red-950/10"
>
	<!-- Soft ambient glow — does not interfere with the CTA hierarchy. -->
	<div
		aria-hidden="true"
		class="bg-primary/10 pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl md:h-[640px] md:w-[640px]"
	></div>

	<div class="relative z-10 container mx-auto px-4 md:px-6">
		<div class="grid items-center gap-10 lg:grid-cols-5 lg:gap-12">
			<!-- ─────────────  COPY COLUMN  ───────────── -->
			<div class="flex flex-col justify-center space-y-6 lg:col-span-3">
				<!-- Eyebrow: Svelte Hack 2025 award (loss aversion) -->
				<Badge
					variant="secondary"
					class="w-fit border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
				>
					<Trophy class="mr-1.5 h-3.5 w-3.5" />
					Svelte Hack 2025 winner
				</Badge>

				<!-- Headline: outcome-led -->
				<h1
					class="text-foreground text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl"
				>
					Hand-picked tools for the
					<span class="text-primary">small jobs</span>
					that fill your day.
				</h1>

				<!-- Subheadline: clarifies the outcome (no number repetition) -->
				<p class="text-muted-foreground max-w-[640px] text-lg md:text-xl/relaxed">
					Budgets, passwords, QR codes, timers, notes — focused mini apps that work the moment you
					click them. Free, open source, and your data stays in your browser.
				</p>

				<!-- Smart Default: trust micro-bar (4 badges) -->
				<ul class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
					{#each trustBadges as badge (badge.label)}
						{@const Icon = ICON_MAP[badge.icon as keyof typeof ICON_MAP]}
						<li class="text-muted-foreground flex items-center gap-1.5">
							<Icon class="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
							<span>{badge.label}</span>
						</li>
					{/each}
				</ul>

				<!-- Dual CTAs: Primary (outcome) + Secondary (preview) -->
				<div class="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
					<Button
						href="/apps"
						size="lg"
						class="bg-primary hover:bg-primary/90 group text-white shadow-[0_0_24px_rgba(220,38,38,0.35)] dark:shadow-[0_0_24px_rgba(220,38,38,0.25)]"
					>
						Browse the toolkit
						<ArrowRight class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
					</Button>
					<a
						href="#live-preview"
						class={buttonVariants({
							variant: 'outline',
							size: 'lg',
							className: 'border-primary/30 hover:border-primary/60'
						})}
					>
						<Play class="mr-2 h-4 w-4 fill-current" />
						Try one right now
					</a>
				</div>

				<!-- Login-aware greeting for returning users (kept for personal touch). -->
				{#if data?.user?.username}
					<p class="text-muted-foreground text-sm">
						Welcome back,
						<span class="text-foreground font-medium capitalize">{data.user.username}</span>
						— your dashboard is waiting.
					</p>
				{/if}
			</div>

			<!--
			  ─────────────  BRAND WATERMARK COLUMN  ─────────────
			  The Svelte logo is rendered as a large, low-opacity background
			  mark so the Svelte Hack 2025 brand signal stays visible without
			  competing with the headline or repeating "20+ tools" above the fold.
			-->
			<div class=" relative hidden lg:col-span-2 lg:flex lg:items-center lg:justify-center">
				<!-- Soft tint behind the logo to give it presence without solid color. -->
				<div aria-hidden="true" class="bg-primary/5 absolute inset-0 rounded-full blur-2xl"></div>

				<!--
				  Wrapper div carries the opacity — the Svelte asset only
				  accepts `class` as a prop, so we apply opacity-15 to the
				  wrapper instead of via inline style.
				-->
				<div
					data-flicker-phase={flickerPhase}
					class="flicker-logo group relative drop-shadow-[0_0_40px_rgba(220,38,38,0.25)] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:drop-shadow-[0_0_80px_rgba(220,38,38,0.45)]"
				>
					<div
						class="flicker-inner relative opacity-15 transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-80"
					>
						<Svelte class="h-72 w-72 xl:h-96 xl:w-96" />
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	:global {
		/* Phase 1: auto-flicker — lift the wrapper opacity cap so paths shine at full brightness */
		.flicker-logo[data-flicker-phase='1'] .flicker-inner {
			opacity: 1;
		}

		.flicker-logo[data-flicker-phase='1'] svg g path:nth-of-type(1) {
			animation: flickerOn 0.9s ease-out both;
		}

		.flicker-logo[data-flicker-phase='1'] svg g path:nth-of-type(2) {
			animation: flickerOn 0.9s 0.25s ease-out both;
		}

		/* Phase 2: after auto-flicker — only on hover */
		.flicker-logo[data-flicker-phase='2']:hover svg g path:nth-of-type(1) {
			animation: flickerOn 0.9s ease-out both;
		}

		.flicker-logo[data-flicker-phase='2']:hover svg g path:nth-of-type(2) {
			animation: flickerOn 0.9s 0.25s ease-out both;
		}

		@keyframes flickerOn {
			0%,
			3%,
			9%,
			14%,
			18%,
			24% {
				opacity: 0.15;
			}
			2%,
			7%,
			11%,
			17%,
			22% {
				opacity: 1;
			}
			30% {
				opacity: 0.35;
			}
			45% {
				opacity: 1;
			}
			60% {
				opacity: 0.5;
			}
			75% {
				opacity: 1;
			}
			88% {
				opacity: 0.7;
			}
			100% {
				opacity: 1;
			}
		}
	}
</style>

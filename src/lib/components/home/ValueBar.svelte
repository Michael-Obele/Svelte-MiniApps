<!--
@component

ValueBar — Contrast Effect via animated bar chart.

Replaces two dense text cards with a single horizontal bar chart.
The high anchor ($180/yr competitor) makes the $0 target feel like a steal.
LayerChart spring animation makes the comparison hit instantly.

Psychology: Contrast Effect — price/value is perceived relative to
adjacent references, not in isolation.
-->

<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { BarChart } from 'layerchart';
	import { Sparkles, ArrowRight, Heart } from '@lucide/svelte';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	const OURS = { price: 0, unit: 'forever' } as const;
	const chartData = [
		{ name: 'Typical single-tool app', cost: 180 },
		{ name: 'Svelte Mini Apps', cost: 0 }
	];
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
				20 tools, $0. The competition charges that per tool.
			</h2>
		</div>

		<div class="mx-auto max-w-2xl">
			<!-- Animated bar chart: one bar at $180, one at $0 -->
			<div class="bg-card text-card-foreground rounded-2xl border p-6 shadow-sm md:p-8">
				<div class="h-[180px] w-full">
					<BarChart
						data={chartData}
						x="name"
						y="cost"
						axis="x"
						series={[{ key: 'cost', value: 'cost', color: 'var(--muted-foreground)' }]}
					>
						{#snippet tooltip()}{/snippet}
					</BarChart>
				</div>

				<div class="mt-4 flex items-center justify-between text-sm">
					<div class="flex items-center gap-2">
						<span class="bg-muted-foreground inline-block h-3 w-3 rounded-sm"></span>
						<span class="text-muted-foreground">Single-tool app</span>
						<span class="font-bold">$180/yr</span>
					</div>
					<div class="flex items-center gap-2">
						<span class="bg-primary inline-block h-3 w-3 rounded-sm"></span>
						<span class="text-primary font-bold">Free forever</span>
					</div>
				</div>
			</div>

			<p class="text-muted-foreground mt-6 text-center text-sm">
				Most productivity apps charge per tool, per month. We don't charge at all — the code is open
				source and always will be.
			</p>

			<div class="mt-6 text-center">
				<Button
					href="/apps"
					variant="outline"
					class={buttonVariants({
						variant: 'outline',
						className: 'group border-primary/30 hover:border-primary/60'
					})}
				>
					See all {20}+ free tools
					<ArrowRight class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
				</Button>
			</div>
		</div>

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
		</div>
	</div>
</section>

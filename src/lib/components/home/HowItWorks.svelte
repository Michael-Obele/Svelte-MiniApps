<!--
@component

HowItWorks — 3 animated stat cards that show the (Goal Gradient) in motion.

Instead of paragraphs of text, each card pairs a count-up number with
one line of copy. Motion.js scroll() + stagger handles the reveal.
The count-up animation itself communicates "fast" better than words.

Psychology: Goal Gradient — visible progress numbers make the path
feel short. IKEA Effect — reading the 3 animated cards commits the
user to the workflow mentally.
-->

<script lang="ts">
	import { Tween } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { onMount } from 'svelte';
	import { Zap, MousePointerClick, ShieldCheck } from '@lucide/svelte';

	// Animated counters with count-down target for "clicks"
	const toolCount = new Tween(0, { duration: 1800, easing: cubicOut });
	const clickCount = new Tween(12, { duration: 2000, easing: cubicOut }); // 12 → 3
	const offlineCount = new Tween(0, { duration: 1600, easing: cubicOut });

	async function triggerAnimations() {
		// Snap to starting values instantly (duration 0), then animate to targets
		await toolCount.set(0, { duration: 0 });
		toolCount.target = 20;

		await clickCount.set(12, { duration: 0 });
		clickCount.target = 3;

		await offlineCount.set(0, { duration: 0 });
		offlineCount.target = 100;
	}

	// Replay count-up on every scroll-into-view
	onMount(() => {
		// Initial trigger on first paint
		triggerAnimations();

		let isVisible = true;

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting && !isVisible) {
						isVisible = true;
						triggerAnimations();
					} else if (!entry.isIntersecting) {
						isVisible = false;
					}
				}
			},
			{ threshold: 0.4 }
		);

		const section = document.getElementById('how-it-works');
		if (section) observer.observe(section);

		return () => observer.disconnect();
	});

	const STEPS = [
		{
			number: 1,
			value: toolCount,
			suffix: '+',
			label: 'Tools ready to go',
			description: 'Budgets, passwords, QR codes, notes & more',
			Icon: Zap
		},
		{
			number: 2,
			value: clickCount,
			suffix: '',
			label: 'Clicks to your first result',
			description: 'No sign-up, no install, just click and work',
			Icon: MousePointerClick
		},
		{
			number: 3,
			value: offlineCount,
			suffix: '%',
			label: 'Works offline as a PWA',
			description: 'Install once, keep the full toolkit anywhere',
			Icon: ShieldCheck
		}
	];
</script>

<section
	id="how-it-works"
	class="from-primary/[0.05] border-border/60 w-full border-y bg-gradient-to-b to-transparent py-12 md:py-20 lg:py-24"
>
	<div class="container mx-auto px-4 md:px-6">
		<div class="mx-auto mb-10 max-w-2xl text-center md:mb-14">
			<p class="text-primary mb-2 text-xs font-semibold tracking-widest uppercase md:text-sm">
				How it works
			</p>
			<h2 class="text-foreground text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
				From "I need a tool" to "done" in three clicks.
			</h2>
		</div>

		<ol class="mx-auto grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
			{#each STEPS as step, i (step.number)}
				{@const { Icon } = step}
				<li
					class="step-card bg-card text-card-foreground flex flex-col items-center gap-4 rounded-2xl border p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md md:p-8"
					style:animation="fadeUp 0.6s cubic-bezier(0.25, 0.1, 0.25, 1) {i * 0.15}s both"
				>
					<div
						class="bg-primary/10 text-primary flex h-14 w-14 items-center justify-center rounded-xl"
					>
						<Icon class="h-7 w-7" />
					</div>

					<!-- Count-up number: the main visual -->
					<div class="text-primary text-4xl font-bold tracking-tighter md:text-5xl">
						{Math.round(step.value.current)}{step.suffix}
					</div>

					<div>
						<h3 class="text-foreground text-lg font-semibold">{step.label}</h3>
						<p class="text-muted-foreground mt-1 text-sm leading-relaxed">
							{step.description}
						</p>
					</div>
				</li>
			{/each}
		</ol>

		<!-- Goal Gradient callout -->
		<p class="text-muted-foreground mt-10 text-center text-sm md:text-base">
			Most visitors find a tool and finish their task in
			<span class="text-foreground font-semibold">under 60 seconds.</span>
		</p>
	</div>
</section>

<style>
	@keyframes fadeUp {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>

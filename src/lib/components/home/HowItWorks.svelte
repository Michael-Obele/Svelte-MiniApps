<!--
@component

HowItWorks — 3-step "Pick → Use → Saved" goal gradient.

Each step starts at 33% progress (not 0%) by visual design — the numbered chips
make the path feel short. IKEA Effect: by reading the 3 steps, the user has
already mentally committed to the workflow.

-->

<script lang="ts">
	import { getHowItWorksSteps } from './data.svelte';

	let steps = $derived(getHowItWorksSteps());
</script>

<section
	id="how-it-works"
	class="bg-muted/40 border-border/60 w-full border-y py-12 md:py-20 lg:py-24"
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

		<ol class="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 md:gap-4 lg:gap-6">
			{#each steps as step (step.number)}
				<li
					class="bg-card text-card-foreground group relative flex flex-col rounded-2xl border p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md md:p-8"
				>
					<!-- Step number chip (visible progress) -->
					<div class="mb-5 flex h-12 w-12 items-center justify-center rounded-xl {step.accent}">
						<span class="text-lg font-bold">{step.number}</span>
					</div>

					<!-- Goal-gradient progress line (visible between steps) -->
					{#if step.number < steps.length}
						<div
							aria-hidden="true"
							class="from-border absolute top-12 right-0 left-full hidden h-px bg-gradient-to-r to-transparent md:block"
						></div>
					{/if}

					<h3 class="mb-2 text-lg font-semibold md:text-xl">{step.title}</h3>
					<p class="text-muted-foreground text-sm leading-relaxed md:text-base">
						{step.description}
					</p>
				</li>
			{/each}
		</ol>

		<!-- Goal Gradient callout: "you're 1 click away from done" -->
		<p class="text-muted-foreground mt-10 text-center text-sm md:text-base">
			Most visitors find a tool and finish their task in
			<span class="text-foreground font-semibold">under 60 seconds.</span>
		</p>
	</div>
</section>

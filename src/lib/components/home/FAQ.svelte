<!--
@component

FAQ — objection handling via Accordion.

Pre-empts the questions that would otherwise block the final CTA. Smart Default:
the first item opens automatically so the user sees the format and engages
with at least one answer.

-->

<script lang="ts">
	import * as Accordion from '$lib/components/ui/accordion';
	import { getFaqItems } from './data.svelte';

	let items = $derived(getFaqItems());
	// "faq-1" is the first question — Smart Default keeps momentum.
	let defaultValue = $derived(items[0] ? `faq-${items[0].question.slice(0, 12)}` : '');
</script>

<section
	id="faq"
	class="from-primary/[0.05] border-border/60 w-full border-y bg-gradient-to-b to-transparent py-12 md:py-20 lg:py-24"
>
	<div class="container mx-auto px-4 md:px-6">
		<div class="mx-auto mb-10 max-w-2xl text-center md:mb-14">
			<p class="text-primary mb-2 text-xs font-semibold tracking-widest uppercase md:text-sm">
				Frequently asked
			</p>
			<h2 class="text-foreground text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
				Questions that come up before the first click.
			</h2>
		</div>

		<Accordion.Root type="single" value={defaultValue} class="mx-auto max-w-3xl">
			{#each items as item, i (i)}
				<Accordion.Item
					value={`faq-${item.question.slice(0, 12)}`}
					class="bg-card border-border/60 rounded-lg border px-4 md:px-6"
				>
					<Accordion.Trigger
						class="text-foreground text-left text-base font-medium hover:no-underline md:text-lg"
					>
						{item.question}
					</Accordion.Trigger>
					<Accordion.Content class="text-muted-foreground text-sm leading-relaxed md:text-base">
						{item.answer}
					</Accordion.Content>
				</Accordion.Item>
			{/each}
		</Accordion.Root>

		<p class="text-muted-foreground mt-8 text-center text-sm">
			Still wondering something?
			<a href="mailto:support@svelte-apps.me" class="text-primary hover:underline"
				>support@svelte-apps.me</a
			>
		</p>
	</div>
</section>

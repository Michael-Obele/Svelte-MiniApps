<!--
@component

FinalCTA — outcome-led closing section.

Replaces the vague "Join the Journey" call with a specific, dual-action prompt.
"Get the full toolkit free" anchors the value (20+ tools) + the cost ($0).
The secondary CTA is reciprocity (try one without committing).

-->

<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { ArrowRight, Play, Heart } from '@lucide/svelte';
</script>

<section
	id="final-cta"
	class="bg-background relative w-full overflow-hidden py-12 md:py-20 lg:py-24"
>
	<!-- Ambient glow to draw the eye to the close. -->
	<div
		aria-hidden="true"
		class="bg-primary/10 pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl md:h-[520px] md:w-[520px]"
	></div>

	<div class="container mx-auto px-4 md:px-6">
		<div
			class="bg-card text-card-foreground border-primary/20 mx-auto flex max-w-3xl flex-col items-center gap-5 rounded-3xl border-2 px-6 py-12 text-center shadow-xl md:gap-6 md:px-10 md:py-16"
		>
			<Badge variant="secondary" class="border-primary/30 bg-primary/10 text-primary">
				<Heart class="mr-1.5 h-3.5 w-3.5 fill-current" />
				Free · Forever · No card
			</Badge>

			<h2 class="text-foreground text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
				Pick a tool. Get the small job done in under a minute.
			</h2>

			<p class="text-muted-foreground max-w-xl text-lg">
				Free, offline, and open source. You can also
				<a
					href="https://github.com/Michael-Obele/Svelte-MiniApps"
					target="_blank"
					rel="noopener noreferrer"
					class="text-primary hover:underline">read the code on GitHub</a
				>
				or
				<a href="/hire" class="text-primary hover:underline">hire me</a> to build the next one.
			</p>

			<div class="flex flex-col gap-3 pt-2 sm:flex-row">
				<Button
					href="/apps"
					size="lg"
					class="bg-primary hover:bg-primary/90 group text-white shadow-[0_0_24px_rgba(220,38,38,0.35)] dark:shadow-[0_0_24px_rgba(220,38,38,0.25)]"
				>
					Open the full toolkit
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
					Try one without leaving
				</a>
			</div>
		</div>
	</div>
</section>

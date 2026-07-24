<!--
@component

LivePreview — interactive password generator on the homepage.

Reciprocity principle: deliver real value before asking for commitment. The
visitor uses the full, unmodified password generator with one click, no
sign-up, no modal. Then "Use the full app" leads to the full app page where
they can sign in to save + manage their history.

The actual generation UI is shared with the full app via <PasswordGenerator />.
This component is a thin marketing wrapper around it.

-->

<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { Sparkles, ShieldCheck, ArrowRight } from '@lucide/svelte';
	import PasswordGenerator from '$lib/components/password/PasswordGenerator.svelte';
</script>

<section id="live-preview" class="bg-background w-full py-12 md:py-20 lg:py-24">
	<div class="container mx-auto px-4 md:px-6">
		<div class="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
			<!-- Copy column -->
			<div class="space-y-5">
				<h2 class="text-foreground text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
					Generate a strong password right here.
				</h2>
				<p class="text-muted-foreground max-w-md text-lg leading-relaxed">
					No sign-up, no modal, no waiting. The same tool that powers the app — full strength meter,
					full controls, full color-coded display.
				</p>
				<ul class="text-muted-foreground space-y-2 text-sm">
					<li class="flex items-center gap-2">
						<ShieldCheck class="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
						<span>Uses your browser's secure random generator</span>
					</li>
					<li class="flex items-center gap-2">
						<ShieldCheck class="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
						<span>Nothing is sent to a server</span>
					</li>
					<li class="flex items-center gap-2">
						<ShieldCheck class="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
						<span>Same generator that powers the full app</span>
					</li>
				</ul>
				<Button
					href="/apps/random-password-generator"
					variant="outline"
					class={buttonVariants({
						variant: 'outline',
						className: 'group border-primary/30 hover:border-primary/60 mt-2 w-fit'
					})}
				>
					Open the full app
					<ArrowRight class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
				</Button>
			</div>

			<!--
			  Interactive preview: the full app UI, unmodified. The save button
			  in the PasswordGenerator will be disabled (no signed-in user) and
			  the title attribute says "Sign in to save" — that's the right
			  affordance for an unauthenticated visitor.
			-->
			<div class="bg-card text-card-foreground rounded-2xl border p-6 shadow-lg md:p-8">
				<PasswordGenerator />
			</div>
		</div>
	</div>
</section>

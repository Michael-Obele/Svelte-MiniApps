<script lang="ts">
	import ThemeSwitch from '@/blocks/ThemeSwitch.svelte';
	import NukeButton from '@/blocks/NukeButton.svelte';
	import Svelte from '$lib/assets/svelte.svelte';

	import { scrollToTop } from '$lib/utils';
	import {
		Heart,
		ArrowUp,
		Github,
		Twitter,
		Linkedin,
		Globe,
		Copyright,
		Sparkles,
		Download,
		Briefcase
	} from '@lucide/svelte';

	import Bluesky from '$lib/assets/bluesky-outline-light.svelte';
	const logoX = '/lottie/logo-x.json';
	const logoLinkendin = '/lottie/logo-linkedin.json';

	const currentYear = new Date().getFullYear();
</script>

<footer
	class="bg-background text-foreground w-full border-t border-slate-600 py-6 shadow-lg md:py-8"
>
	<div class="container mx-auto px-4 md:px-6">
		<div class="grid gap-8 md:grid-cols-2">
			<!-- Left Column -->
			<div class="flex flex-col items-center justify-center space-y-4 md:items-start">
				<div class="flex items-center space-x-2">
					<span class="m-1 size-6 self-center whitespace-nowrap">
						<Svelte />
					</span>
					<span class="text-xl font-bold">MiniApps</span>
				</div>
				<p class="text-muted-foreground text-center text-sm md:text-left">
					<Sparkles class="text-primary me-1 inline-block size-4" strokeWidth={1.5} />
					A collection of useful mini applications built with Svelte and love.
				</p>
				<div class="flex space-x-4">
					<a
						href="/hire"
						class="text-muted-foreground hover:text-primary transition-colors"
						aria-label="Hire the Developer"
					>
						<Briefcase class="size-5" strokeWidth={1.5} />
					</a>
					<a
						href="https://twitter.com/Dev_Obele"
						target="_blank"
						rel="noopener noreferrer"
						class="text-muted-foreground hover:text-primary transition-colors"
						aria-label="Twitter"
					>
						<lord-icon
							src={logoX}
							trigger="loop"
							stroke="thick"
							state="hover-draw"
							class="text-muted-foreground hover:text-primary hidden size-5 transition-colors dark:inline-block"
							colors="primary:white,secondary:green"
							aria-label="Twitter"
						></lord-icon>
						<lord-icon
							src={logoX}
							trigger="loop"
							stroke="thick"
							state="hover-draw"
							class="hover:text-primary size-5 text-white transition-colors dark:hidden"
							colors="primary:black,secondary:green"
							aria-label="Twitter"
						></lord-icon>
					</a>
					<a
						href="https://github.com/Michael-Obele"
						target="_blank"
						rel="noopener noreferrer"
						class="text-muted-foreground hover:text-primary transition-colors"
						aria-label="GitHub"
					>
						<Github class="size-5 text-white" strokeWidth={1.5} />
					</a>
					<a
						href="https://bsky.app/profile/svelte-apps.me"
						target="_blank"
						rel="noopener noreferrer"
						class="text-muted-foreground hover:text-primary transition-colors"
						aria-label="GitHub"
					>
						<Bluesky class="size-5" fill="white" />
					</a>
					<a
						href="https://www.linkedin.com/in/michael-amachree-263841325/"
						target="_blank"
						rel="noopener noreferrer"
						class="text-muted-foreground hover:text-primary transition-colors"
						aria-label="LinkedIn"
					>
						<lord-icon
							src={logoLinkendin}
							trigger="loop"
							stroke="thick"
							state="pinch"
							class="text-muted-foreground hover:text-primary hidden size-5 transition-colors dark:inline-block"
							colors="primary:white,secondary:green"
							aria-label="LinkedIn"
						></lord-icon>
						<lord-icon
							src={logoLinkendin}
							trigger="loop"
							stroke="thick"
							state="pinch"
							class="text-muted-foreground hover:text-primary size-5 transition-colors dark:hidden"
							colors="primary:black,secondary:green"
							aria-label="LinkedIn"
						></lord-icon>
					</a>
				</div>
			</div>

			<!-- Right Column -->
			<div class="flex flex-col items-center justify-center space-y-4 md:items-end">
				<div class="flex items-center space-x-3">
					<button
						class="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors"
						onclick={scrollToTop}
					>
						Back to top
						<ArrowUp class="ml-2 size-4" strokeWidth={1.5} />
					</button>
					<ThemeSwitch />
					<NukeButton class="opacity-70 transition-opacity hover:opacity-100" />
				</div>
				<div class="flex items-center space-x-2">
					<span class="text-muted-foreground flex items-center text-sm">
						Made with <Heart
							class="mx-1 size-4 text-red-500"
							fill="currentColor"
							strokeWidth={1.5}
						/> by
					</span>
					<a
						href="https://github.com/Michael-Obele"
						target="_blank"
						rel="noopener noreferrer"
						class="text-primary font-medium hover:underline"
					>
						Michael
					</a>
				</div>
				<iframe
					src="https://github.com/sponsors/Michael-Obele/button"
					title="Sponsor Michael-Obele"
					height="32"
					width="114"
					style="border: 0; border-radius: 6px;"
				></iframe>
			</div>
		</div>

		<div
			class="mt-8 flex flex-col items-center justify-between space-y-4 border-t pt-8 md:flex-row md:space-y-0"
		>
			<p class="text-muted-foreground flex items-center text-center text-sm md:text-left">
				<Copyright class="me-1 size-4" strokeWidth={1.5} /> 2024-
				{currentYear} Svelte Apps. All rights reserved.
			</p>
			<p class="text-muted-foreground flex items-center text-center text-sm md:text-right">
				<Download class="text-primary me-1 size-4" strokeWidth={1.5} />
				<span class="text-primary font-semibold">Pro Tip:</span> This app is installable!
			</p>
		</div>
	</div>
</footer>

<script lang="ts">
	import ThemeSwitch from '@/blocks/ThemeSwitch.svelte';
	import LanguageSwitcher from '@/blocks/LanguageSwitcher.svelte';
	import NukeButton from '@/blocks/NukeButton.svelte';
	import Svelte from '$lib/assets/svelte.svelte';

	import { scrollToTop } from '$lib/utils';
	import {
		ArrowUp,
		Github,
		Copyright,
		Sparkles,
		Download,
		Briefcase,
		Snowflake
	} from '@lucide/svelte';

	import { bluesky } from './Icons.svelte';
	import { Button } from '@/ui/button';
	import { christmasState } from '$lib/stores/christmas.svelte';
	import { onMount } from 'svelte';
	import { mode } from 'mode-watcher';
	const logoX = '/lottie/logo-x.json';
	const logoLinkendin = '/lottie/logo-linkedin.json';

	const currentYear = new Date().getFullYear();

	onMount(() => {
		christmasState.triggerSnow();
		setTimeout(() => {
			christmasState.stopSnow();
		}, 30000); // Stop snow after 30 seconds
	});

	const toggleSnow = () => {
		if (christmasState.isSnowing) {
			christmasState.stopSnow();
		} else {
			christmasState.triggerSnow();
			setTimeout(() => {
				christmasState.stopSnow();
			}, 60000); // Stop snow after 1 minute
		}
	};

	let colors = $derived(mode.current === 'dark' ? 'primary:white,secondary:green' : 'primary:black,secondary:green');
</script>

<footer
	class="bg-background text-foreground w-full border-t border-slate-600 py-6 shadow-lg md:py-8"
>
	<div class="mx-auto px-4 md:px-6">
		<!-- Sitemap Section -->
		<div class="grid grid-cols-2 gap-8 border-b border-slate-600/50 pb-8 md:grid-cols-3">
			<!-- Explore -->
			<div class="flex flex-col space-y-3">
				<h3 class="text-sm font-semibold">Explore</h3>
				<nav class="flex flex-col space-y-2">
					<a
						href="/apps"
						class="text-muted-foreground hover:text-primary text-sm transition-colors"
					>
						All Apps
					</a>
					<a href="/" class="text-muted-foreground hover:text-primary text-sm transition-colors">
						Home
					</a>
					<a
						href="https://github.com/Michael-Obele/Svelte-MiniApps"
						target="_blank"
						rel="noopener noreferrer"
						class="text-muted-foreground hover:text-primary text-sm transition-colors"
					>
						View Source
					</a>
				</nav>
			</div>

			<!-- Company -->
			<div class="flex flex-col space-y-3">
				<h3 class="text-sm font-semibold">Company</h3>
				<nav class="flex flex-col space-y-2">
					<a
						href="/about"
						class="text-muted-foreground hover:text-primary text-sm transition-colors"
					>
						About Us
					</a>
					<a
						href="/changelog"
						class="text-muted-foreground hover:text-primary text-sm transition-colors"
					>
						Changelog
					</a>
					<a
						href="/hire"
						class="text-muted-foreground hover:text-primary text-sm transition-colors"
					>
						Work with Us
					</a>
				</nav>
			</div>

			<!-- Support -->
			<div class="col-span-2 flex flex-col space-y-3 md:col-span-1">
				<h3 class="text-sm font-semibold">Support</h3>
				<nav class="flex flex-col space-y-2">
					<a
						href="mailto:support@svelte-apps.me"
						class="text-muted-foreground hover:text-primary text-sm transition-colors"
					>
						Get Support
					</a>
					<a
						href="mailto:feedback@svelte-apps.me"
						class="text-muted-foreground hover:text-primary text-sm transition-colors"
					>
						Send Feedback
					</a>
					<a
						href="mailto:info@svelte-apps.me"
						class="text-muted-foreground hover:text-primary text-sm transition-colors"
					>
						Contact Us
					</a>
				</nav>
			</div>
		</div>

		<div class="grid gap-8 pt-8 md:grid-cols-2">
			<!-- Left Column -->
			<div class="flex flex-col items-center justify-center space-y-4 md:items-start">
				<div class="relative flex items-center space-x-2">
					<!-- Christmas Hat -->
					<div class="absolute -top-3 -left-2 rotate-[-35deg] transform text-2xl">🎩</div>
					<span class="m-1 size-6 self-center whitespace-nowrap">
						<Svelte />
					</span>
					<span class="text-xl font-bold">Mini Apps</span>
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
							class="hover:text-primary size-5 transition-colors"
							colors={colors}
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
						<Github class="size-5" strokeWidth={1.5} />
					</a>
					<a
						href="https://bsky.app/profile/svelte-apps.me"
						target="_blank"
						rel="noopener noreferrer"
						class="text-muted-foreground hover:text-primary transition-colors"
						aria-label="Bluesky"
					>
						{@render bluesky('size-5')}
					</a>
					<a
						href="https://discord.com/users/michael_obele"
						target="_blank"
						rel="noopener noreferrer"
						class="text-muted-foreground hover:text-primary transition-colors"
						aria-label="Discord"
						title="Discord: michael_obele"
					>
						<span class="icon-[ic--baseline-discord] size-6"></span>
					</a>
					<a
						href="https://www.linkedin.com/in/dev-obele"
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
							class="text-muted-foreground hover:text-primary size-5 transition-colors"
							colors={colors}
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
					<LanguageSwitcher />
					<ThemeSwitch />
					<!-- Snow Toggle -->
					<Button
						variant="ghost"
						size="icon"
						class="size-9 xl:size-10 {christmasState.isSnowing ? 'text-blue-500' : ''}"
						onclick={() => toggleSnow()}
						title="Let it snow!"
					>
						<Snowflake class="size-4 xl:size-5" />
					</Button>
					<NukeButton class="opacity-70 transition-opacity hover:opacity-100" />
				</div>
				<div class="flex flex-col items-center space-y-2 md:items-end">
					<div class="flex items-center space-x-2">
						<a href="/hire" class="text-primary font-medium hover:underline"> Work with Michael </a>
					</div>
					<div
						class="text-muted-foreground flex flex-wrap items-center justify-center gap-3 text-sm md:justify-end"
					>
						<a href="mailto:support@svelte-apps.me" class="hover:text-primary transition-colors">
							Support
						</a>
						<span>•</span>
						<a href="mailto:feedback@svelte-apps.me" class="hover:text-primary transition-colors">
							Feedback
						</a>
						<span>•</span>
						<a href="mailto:info@svelte-apps.me" class="hover:text-primary transition-colors">
							Contact
						</a>
					</div>
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

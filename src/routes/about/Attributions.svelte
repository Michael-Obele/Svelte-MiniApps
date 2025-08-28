<script lang="ts">
	import {
		Heart,
		ExternalLink,
		Code,
		Package,
		Palette,
		Accessibility,
		Sun,
		Film,
		type Icon as IconType
	} from '@lucide/svelte';
	import Header from './Header.svelte';
	import { fade, fly, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	let { id } = $props();

	// Theme configuration for consistent styling
	const theme = {
		red: {
			text: 'text-red-600 dark:text-red-500',
			bg: 'bg-red-100/30 dark:bg-red-900/30',
			accent: 'text-red-500 dark:text-red-400'
		},
		green: {
			text: 'text-green-600 dark:text-green-500',
			bg: 'bg-green-100/30 dark:bg-green-900/30',
			accent: 'text-green-500 dark:text-green-400'
		}
	};

	// Attribution data structure
	interface Attribution {
		name: string;
		description: string;
		url: string;
		theme: 'red' | 'green';
		icon: typeof IconType;
	}

	// Attribution data
	const attributions: Attribution[] = [
		{
			name: 'SvelteKit',
			description:
				'The framework powering this application, providing routing, server-side rendering, and more.',
			url: 'https://kit.svelte.dev/',
			theme: 'red',
			icon: Package
		},
		{
			name: 'Shadcn UI',
			description: 'Beautiful, accessible, and customizable UI components for Svelte applications.',
			url: 'https://www.shadcn-svelte.com/',
			theme: 'green',
			icon: Code
		},
		{
			name: 'Lordicon',
			description: `Powerful animated icons library that brings life to the user interface. <span class="${theme.red.accent}">Note:</span> Lordicon is <span class="font-semibold ${theme.green.accent}">not open source</span>, but offers <span class="${theme.green.text}">free usage with attribution</span>.`,
			url: 'https://lordicon.com/',
			theme: 'red',
			icon: Film
		},
		{
			name: 'Lucide Icons',
			description: 'Beautiful & consistent icon toolkit made for designers and developers.',
			url: 'https://lucide.dev/',
			theme: 'red',
			icon: ExternalLink
		},
		{
			name: 'Tailwind CSS',
			description: 'A utility-first CSS framework for rapidly building custom user interfaces.',
			url: 'https://tailwindcss.com/',
			theme: 'green',
			icon: Palette
		},
		{
			name: 'Bits UI',
			description: 'Accessible, unstyled components for building high-quality Svelte applications.',
			url: 'https://www.bits-ui.com/',
			theme: 'green',
			icon: Accessibility
		},
		{
			name: 'Carta',
			description:
				'A lightweight Markdown editor and viewer for Svelte with syntax highlighting and rich features. Provides textarea functionality without a full code editor.',
			url: 'https://beartocode.github.io/carta/introduction',
			theme: 'red',
			icon: Palette
		},
		{
			name: 'Lottie Web',
			description: 'Render After Effects animations natively on the web.',
			url: 'https://github.com/airbnb/lottie-web',
			theme: 'red',
			icon: Film
		}
	];
</script>

<section {id} class="mx-auto mt-16 flex w-full flex-col justify-center p-8 transition-all">
	<Header {id}>Attributions</Header>
	<div class="mb-8 text-center" in:fade={{ duration: 400, delay: 200 }}>
		<p class="mx-auto max-w-2xl text-gray-700 dark:text-gray-300">
			Svelte MiniApps is built with the help of these amazing open-source projects:
		</p>
	</div>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each attributions as { name, description, url, theme: themeKey, icon }, i}
			{@const Icon = icon}
			{@const currentTheme = theme[themeKey]}

			<div
				in:fly={{ y: 20, duration: 300, delay: 150 * i, easing: quintOut }}
				class="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
			>
				<div class="flex items-start gap-3">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-lg transition-transform duration-300 ease-in-out hover:scale-110 group-hover:scale-110 {currentTheme.bg}"
					>
						<Icon class="{currentTheme.accent} h-5 w-5" />
					</div>

					<div class="flex-1">
						<h3 class="{currentTheme.text} mb-2 text-lg font-semibold">{name}</h3>
						<p class="mb-3 text-sm text-gray-700 dark:text-gray-300">
							{@html description}
						</p>
						<a
							href={url}
							target="_blank"
							rel="noopener noreferrer"
							class="group inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition-all duration-300 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
						>
							<span
								class="relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-current after:transition-all after:duration-300 after:ease-in-out group-hover:after:w-full"
								>Visit Website</span
							>
							<div
								in:scale={{ duration: 200, delay: 300 + 150 * i, easing: quintOut }}
								class="transition-transform duration-300 ease-in-out group-hover:translate-x-0.5"
							>
								<ExternalLink class="h-3.5 w-3.5" />
							</div>
						</a>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<div
		class="mt-8 flex items-center justify-center gap-2 text-center"
		in:fade={{ duration: 400, delay: 800 }}
	>
		<Heart class="h-4 w-4 text-red-500 dark:text-red-700" />
		<p class="text-sm text-gray-600 dark:text-gray-400">
			We are grateful to all the open-source contributors who make these tools available to the
			community.
		</p>
	</div>
</section>

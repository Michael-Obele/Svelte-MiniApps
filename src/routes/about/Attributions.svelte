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
	} from 'lucide-svelte';
	import Header from './Header.svelte';

	let { id } = $props();

	// Attribution data structure
	interface Attribution {
		name: string;
		description: string;
		url: string;
		color: string;
		icon: typeof IconType;
	}

	// Attribution data
	const attributions: Attribution[] = [
		{
			name: 'SvelteKit',
			description:
				'The framework powering this application, providing routing, server-side rendering, and more.',
			url: 'https://kit.svelte.dev/',
			color: 'text-red-500 dark:text-red-700',
			icon: Package
		},
		{
			name: 'Shadcn UI',
			description: 'Beautiful, accessible, and customizable UI components for Svelte applications.',
			url: 'https://www.shadcn-svelte.com/',
			color: 'text-green-500 dark:text-green-400',
			icon: Code
		},
		{
			name: 'Lordicon',
			description: `Powerful animated icons library that brings life to the user interface. <span class="text-red-500 dark:text-red-700">Note:</span> Lordicon is <span class="font-semibold text-green-500 dark:text-green-400">not open source</span>, but offers <span class="text-green-800 dark:text-green-400">free usage with attribution</span>.`,
			url: 'https://lordicon.com/',
			color: 'text-red-500 dark:text-red-700',
			icon: Film
		},
		{
			name: 'Lucide Icons',
			description: 'Beautiful & consistent icon toolkit made for designers and developers.',
			url: 'https://lucide.dev/',
			color: 'text-red-500 dark:text-red-700',
			icon: ExternalLink
		},
		{
			name: 'Tailwind CSS',
			description: 'A utility-first CSS framework for rapidly building custom user interfaces.',
			url: 'https://tailwindcss.com/',
			color: 'text-green-500 dark:text-green-400',
			icon: Palette
		},
		{
			name: 'Bits UI',
			description: 'Accessible, unstyled components for building high-quality Svelte applications.',
			url: 'https://www.bits-ui.com/',
			color: 'text-green-500 dark:text-green-400',
			icon: Accessibility
		},
		{
			name: 'Carta',
			description:
				'Carta is a lightweight, fast and extensible Svelte Markdown editor and viewer. It is powered by unified, remark and rehype. Check out the examples to see it in action. Differently from most editors, Carta does not include a code editor, but it is just a textarea with syntax highlighting, shortcuts and more.',
			url: 'https://beartocode.github.io/carta/introduction',
			color: 'text-red-500 dark:text-red-700',
			icon: Palette
		},
		{
			name: 'Lottie Web',
			description: 'Render After Effects animations natively on the web.',
			url: 'https://github.com/airbnb/lottie-web',
			color: 'text-red-500 dark:text-red-700',
			icon: Film
		}
	];
</script>

<section {id} class="mx-auto mt-16 flex w-full flex-col justify-center p-8 transition-all">
	<Header {id}>Attributions</Header>
	<div class="mb-8 text-center">
		<p class="mx-auto max-w-2xl text-gray-700 dark:text-gray-300">
			Svelte MiniApps is built with the help of these amazing open-source projects:
		</p>
	</div>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each attributions as { name, description, url, color, icon }}
			{@const Icon = icon}
			{@const iconBg = color.includes('red')
				? 'bg-red-100/30 dark:bg-red-900/30'
				: 'bg-green-100/30 dark:bg-green-900/30'}
			{@const headingColor = color.includes('red') ? 'text-red-600' : 'text-green-600'}
			<div
				class="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
			>
				<div
					class="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-gray-100 opacity-20 transition-transform group-hover:scale-150 dark:bg-gray-800"
				></div>

				<div class="flex items-start gap-3">
					<div class={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}>
						<Icon class="{color} h-5 w-5" />
					</div>

					<div class="flex-1">
						<h3 class={`mb-2 text-lg font-semibold ${headingColor}`}>{name}</h3>
						<p class="mb-3 text-sm text-gray-700 dark:text-gray-300">
							{@html description}
						</p>
						<a
							href={url}
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
						>
							Visit Website
							<ExternalLink class="h-3.5 w-3.5" />
						</a>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<div class="mt-8 flex items-center justify-center gap-2 text-center">
		<Heart class="h-4 w-4 text-red-500 dark:text-red-700" />
		<p class="text-sm text-gray-600 dark:text-gray-400">
			We are grateful to all the open-source contributors who make these tools available to the
			community.
		</p>
	</div>
</section>

<!-- 
  Suggested icon options:
  - SvelteKit: Package, Box, Code2
  - Shadcn UI: Layout, Components, Layers
  - Lordicon: Animation, Sparkles, Wand2
  - Lucide Icons: Icons, Shapes, Palette
  - Tailwind CSS: Wind, Brush, CSSIcon
  - Bits UI: Puzzle, Component, Blocks
  - Carta: Palette, Pencil, Book
  - Lottie Web: Film, Video, Play
  
  You can import more icons from lucide-svelte as needed.
-->

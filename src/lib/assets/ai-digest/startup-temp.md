# .gitignore

```
node_modules

# Output
.output
.vercel
/.svelte-kit
/build

# OS
.DS_Store
Thumbs.db

# Env
.env
.env.*
!.env.example
!.env.test

# Vite
vite.config.js.timestamp-*
vite.config.ts.timestamp-*

```

# .npmrc

```
engine-strict=true

```

# .prettierignore

```
# Package Managers
package-lock.json
pnpm-lock.yaml
yarn.lock

```

# .prettierrc

```
{
	"useTabs": true,
	"singleQuote": true,
	"trailingComma": "none",
	"printWidth": 100,
	"plugins": ["prettier-plugin-svelte", "prettier-plugin-tailwindcss"],
	"overrides": [
		{
			"files": "*.svelte",
			"options": {
				"parser": "svelte"
			}
		}
	]
}

```

# components.json

```json
{
	"$schema": "https://shadcn-svelte.com/schema.json",
	"style": "default",
	"tailwind": {
		"config": "tailwind.config.ts",
		"css": "src\\app.css",
		"baseColor": "slate"
	},
	"aliases": {
		"components": "$lib/components",
		"utils": "$lib/utils"
	},
	"typescript": true
}
```

# eslint.config.js

```js
import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

/** @type {import('eslint').Linter.Config[]} */
export default [
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs['flat/recommended'],
	prettier,
	...svelte.configs['flat/prettier'],
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		}
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parserOptions: {
				parser: ts.parser
			}
		}
	},
	{
		ignores: ['build/', '.svelte-kit/', 'dist/']
	}
];

```

# package.json

```json
{
	"name": "startup-template",
	"version": "0.0.1",
	"private": true,
	"scripts": {
		"dev": "vite dev",
		"build": "vite build",
		"preview": "vite preview",
		"check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
		"check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
		"lint": "prettier --check . && eslint .",
		"format": "prettier --write ."
	},
	"devDependencies": {
		"@sveltejs/adapter-auto": "^3.0.0",
		"@sveltejs/kit": "^2.0.0",
		"@sveltejs/vite-plugin-svelte": "^3.0.0",
		"@types/eslint": "^9.6.0",
		"autoprefixer": "^10.4.19",
		"eslint": "^9.0.0",
		"eslint-config-prettier": "^9.1.0",
		"eslint-plugin-svelte": "^2.36.0",
		"globals": "^15.0.0",
		"postcss": "^8.4.38",
		"prettier": "^3.1.1",
		"prettier-plugin-svelte": "^3.1.2",
		"prettier-plugin-tailwindcss": "^0.6.4",
		"svelte": "^4.2.7",
		"svelte-check": "^3.6.0",
		"tailwindcss": "^3.4.4",
		"typescript": "^5.0.0",
		"typescript-eslint": "^8.0.0-alpha.20",
		"vite": "^5.0.3"
	},
	"type": "module",
	"dependencies": {
		"ai-digest": "^1.0.7",
		"bits-ui": "^0.21.13",
		"clsx": "^2.1.1",
		"formsnap": "^1.0.1",
		"lucide-svelte": "^0.416.0",
		"mode-watcher": "^0.4.0",
		"svelte-inview": "^4.0.2",
		"svelte-motion": "^0.12.2",
		"svelte-sonner": "^0.3.27",
		"sveltekit-superforms": "^2.16.1",
		"tailwind-merge": "^2.4.0",
		"tailwind-variants": "^0.2.1",
		"tailwindcss-animate": "^1.0.7",
		"zod": "^3.23.8"
	}
}

```

# postcss.config.js

```js
export default {
	plugins: {
		tailwindcss: {},
		autoprefixer: {}
	}
};

```

# README.md

```md
# Startup Template 

- Build using Svelte and Svelte Animations 
- Inspired from Magic UI 

```

# src/app.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
   :root {
      --background: 0 0% 100%;
      --foreground: 0 0% 3.9%;

      --card: 0 0% 100%;
      --card-foreground: 0 0% 3.9%;

      --popover: 0 0% 100%;
      --popover-foreground: 0 0% 3.9%;

      --primary: 0 0% 9%;
      --primary-foreground: 0 0% 98%;

      --secondary: 0 0% 96.1%;
      --secondary-foreground: 0 0% 9%;

      --muted: 0 0% 96.1%;
      --muted-foreground: 0 0% 45.1%;

      --accent: 0 0% 96.1%;
      --accent-foreground: 0 0% 9%;

      --destructive: 0 84.2% 60.2%;
      --destructive-foreground: 0 0% 98%;

      --border: 0 0% 89.8%;
      --input: 0 0% 89.8%;
      --ring: 0 0% 3.9%;

      --radius: 0.5rem;

      /* Custom properties */
      --navigation-height: 3.5rem;
      --color-one: #ffbd7a;
      --color-two: #fe8bbb;
      --color-three: #9e7aff;

      /*
    --color-one: #37ecba;
    --color-two: #72afd3;
    --color-three: #ff2e63;
     */
   }

   .dark {
      --background: 0 0% 0%;
      --foreground: 0 0% 98%;

      --card: 0 0% 3.9%;
      --card-foreground: 0 0% 98%;

      --popover: 0 0% 3.9%;
      --popover-foreground: 0 0% 98%;

      --primary: 0 0% 98%;
      --primary-foreground: 0 0% 9%;

      --secondary: 0 0% 14.9%;
      --secondary-foreground: 0 0% 98%;

      --muted: 0 0% 14.9%;
      --muted-foreground: 0 0% 63.9%;

      --accent: 0 0% 14.9%;
      --accent-foreground: 0 0% 98%;

      --destructive: 0 62.8% 30.6%;
      --destructive-foreground: 0 0% 98%;

      --border: 0 0% 14.9%;
      --input: 0 0% 14.9%;
      --ring: 0 0% 83.1%;

         /* Custom properties */
         --navigation-height: 3.5rem;
         --color-one: #ffbd7a;
         --color-two: #fe8bbb;
         --color-three: #9e7aff;
   }
}

@layer base {
   * {
      @apply border-border;
   }
   body {
      @apply bg-background text-foreground;
   }
}

```

# src/app.d.ts

```ts
// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};

```

# src/app.html

```html
<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<link rel="icon" href="%sveltekit.assets%/favicon.png" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<link rel="stylesheet" href="https://rsms.me/inter/inter.css">
		%sveltekit.head%
	</head>
	<body data-sveltekit-preload-data="hover">
		<div style="display: contents">%sveltekit.body%</div>
	</body>
</html>

```

# src/lib/components/landing/ClientSection.svelte

```svelte
<script>
	import GoogleSvg from '$lib/imgs/Google.svg';
	import GitHubSvg from '$lib/imgs/GitHub.svg';
	import UberSvg from '$lib/imgs/Uber.svg';
	import MicrosoftSvg from '$lib/imgs/Microsoft.svg';
	import NotionSvg from '$lib/imgs/Notion.svg';
</script>

<section id="clients" class="mx-auto max-w-7xl px-6 text-center md:px-8">
	<div class="py-14">
		<div class="mx-auto max-w-(--breakpoint-xl) px-4 md:px-8">
			<h2 class="text-center text-sm font-semibold text-gray-600">
				TRUSTED BY TEAMS FROM AROUND THE WORLD
			</h2>
			<div class="mt-6">
				<ul
					class="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 md:gap-x-16 [&_path]:fill-white"
				>
					<li>
						<img
							alt="Google"
							src={GoogleSvg}
							class="h-8 w-28 px-2 dark:brightness-0 dark:invert"
							width={28}
							height={8}
						/>
					</li>
					<li>
						<img
							alt="Microsoft"
							src={MicrosoftSvg}
							class="h-8 w-28 px-2 dark:brightness-0 dark:invert"
							width={28}
							height={8}
						/>
					</li>
					<li>
						<img
							alt="GitHub"
							src={GitHubSvg}
							class="h-8 w-28 px-2 dark:brightness-0 dark:invert"
							width={28}
							height={8}
						/>
					</li>

					<li>
						<img
							alt="Uber"
							src={UberSvg}
							class="h-8 w-28 px-2 dark:brightness-0 dark:invert"
							width={28}
							height={8}
						/>
					</li>
					<li>
						<img
							alt="Notion"
							src={NotionSvg}
							class="h-8 w-28 px-2 dark:brightness-0 dark:invert"
							width={28}
							height={8}
						/>
					</li>
				</ul>
			</div>
		</div>
	</div>
</section>

```

# src/lib/components/landing/CtaCard.svelte

```svelte
<script lang="ts">
	import { useAnimation, Motion } from 'svelte-motion';
	import { inview } from 'svelte-inview';
	import type { ObserverEventDetails, ScrollDirection, Options } from 'svelte-inview';
	import { cn } from '$lib/utils';
	import { onMount } from 'svelte';
	export let id: string = crypto.randomUUID().slice(0, 6);
	let controls = useAnimation();
	// let ref;
	let inView = false;
	// we want to make animation based on when it come in view we want to make like fade animation from opacity - 0 to opacity 1
	const handleChange = ({ detail }: CustomEvent<ObserverEventDetails>) => {
		// console.log(detail);
		inView = detail.inView;
	};
	$: {
		if (inView) {
			controls.start({
				opacity: 1,
				transition: { delay: Math.random() * 2, ease: 'easeOut', duration: 1 }
			});
		}
	}
</script>

<Motion initial={{ opacity: 0 }} animate={controls} let:motion>
	<div
		{id}
		use:inview={{
			rootMargin: '-50px',
			unobserveOnEnter: true
		}}
		on:inview_change={handleChange}
		use:motion
		class={cn(
			'relative size-20 cursor-pointer overflow-hidden rounded-2xl border p-4',
			// light styles
			'bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]',
			// dark styles
			'transform-gpu dark:bg-transparent dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]'
		)}
	>
		<slot></slot>
	</div>
</Motion>

```

# src/lib/components/landing/CtaSection.svelte

```svelte
<script lang="ts">
	import { BarChart, ChevronRight, File, Globe, HeartHandshake, Rss, Shield } from 'lucide-svelte';
	import Marquee from '../magic/marquee/Marquee.svelte';
	import CtaCard from './CtaCard.svelte';
	import Button from '../ui/button/button.svelte';
	let tiles: { icon: any; bg: string }[] = [
		{
			icon: HeartHandshake,
			bg: 'pointer-events-none absolute left-1/2 top-1/2 size-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible rounded-full bg-linear-to-r from-orange-600 via-rose-600 to-violet-600 opacity-70 blur-[20px]'
		},
		{
			icon: Globe,
			bg: 'pointer-events-none absolute left-1/2 top-1/2 size-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible rounded-full bg-linear-to-r from-cyan-500 via-blue-500 to-indigo-500 opacity-70 blur-[20px]'
		},
		{
			icon: File,
			bg: 'pointer-events-none absolute left-1/2 top-1/2 size-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible rounded-full bg-linear-to-r from-green-500 via-teal-500 to-emerald-600 opacity-70 blur-[20px]'
		},
		{
			icon: Shield,
			bg: 'pointer-events-none absolute left-1/2 top-1/2 size-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible rounded-full bg-linear-to-r from-yellow-400 via-orange-500 to-yellow-600 opacity-70 blur-[20px]'
		},
		{
			icon: Rss,
			bg: 'pointer-events-none absolute left-1/2 top-1/2 size-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible rounded-full bg-linear-to-r from-orange-600 via-rose-600 to-violet-600 opacity-70 blur-[20px]'
		},
		{
			icon: BarChart,
			bg: 'pointer-events-none absolute left-1/2 top-1/2 size-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible rounded-full bg-linear-to-r from-gray-600 via-gray-500 to-gray-400 opacity-70 blur-[20px]'
		}
	];
	function shuffleArray(array: any[]) {
		let currentIndex = array.length;
		let randomIndex;
		// While there remain elements to shuffle.
		while (currentIndex !== 0) {
			// Pick a remaining element.
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex--;
			// And swap it with the current element.
			[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
		}
		return array;
	}
	let randomTiles1 = shuffleArray(tiles);
	let randomTiles2 = shuffleArray(tiles);
	let randomTiles3 = shuffleArray(tiles);
	let randomTiles4 = shuffleArray(tiles);
</script>

<section id="cta">
	<div class="py-14">
		<div class="flex w-full flex-col items-center justify-center">
			<div class="relative flex w-full flex-col items-center justify-center overflow-hidden">
				<Marquee reverse class="-delay-[200ms] [--duration:10s]" repeat={5}>
					{#each randomTiles1 as { icon, bg }, id}
						<CtaCard>
							<svelte:component this={icon} class="size-full" />
							<div class={bg}></div>
						</CtaCard>
					{/each}
				</Marquee>
				<Marquee reverse class="[--duration:25s]" repeat={5}>
					{#each randomTiles2 as { icon, bg }, id}
						<CtaCard>
							<svelte:component this={icon} class="size-full" />
							<div class={bg}></div>
						</CtaCard>
					{/each}
				</Marquee>
				<Marquee reverse class="-delay-[200ms] [--duration:20s]" repeat={5}>
					{#each randomTiles1 as { icon, bg }, id}
						<CtaCard>
							<svelte:component this={icon} class="size-full" />
							<div class={bg}></div>
						</CtaCard>
					{/each}
				</Marquee>
				<Marquee reverse class="[--duration:30s]" repeat={5}>
					{#each randomTiles2 as { icon, bg }, id}
						<CtaCard>
							<svelte:component this={icon} class="size-full" />
							<div class={bg}></div>
						</CtaCard>
					{/each}
				</Marquee>
				<Marquee reverse class="-delay-[200ms] [--duration:20s]" repeat={5}>
					{#each randomTiles3 as { icon, bg }, id}
						<CtaCard>
							<svelte:component this={icon} class="size-full" />
							<div class={bg}></div>
						</CtaCard>
					{/each}
				</Marquee>
				<Marquee reverse class="[--duration:30s]" repeat={5}>
					{#each randomTiles4 as { icon, bg }, id}
						<CtaCard>
							<svelte:component this={icon} class="size-full" />
							<div class={bg}></div>
						</CtaCard>
					{/each}
				</Marquee>
				<div class="absolute z-10">
					<div
						class="mx-auto size-24 rounded-4xl border bg-white/10 p-3 shadow-2xl backdrop-blur-md dark:bg-black/10 lg:size-32"
					>
						<HeartHandshake class="mx-auto size-16 text-black dark:text-white lg:size-24" />
					</div>
					<div class="z-10 mt-4 flex flex-col items-center text-center text-primary">
						<h1 class="text-3xl font-bold lg:text-4xl">Stop wasting time on design.</h1>
						<p class="mt-2">Start your 7-day free trial. No credit card required.</p>
						<Button size="lg" variant="outline" href="#" class="group mt-4 rounded-4xl px-6">
							Get Started
							<ChevronRight
								class="ml-1 size-4 transition-all duration-300 ease-out group-hover:translate-x-1"
							/>
						</Button>
					</div>
					<div
						class="bg-backtround absolute inset-0 -z-10 rounded-full opacity-40 blur-xl dark:bg-background"
					/>
				</div>
				<div
					class="to-backtround absolute inset-x-0 bottom-0 h-full bg-linear-to-b from-transparent to-70% dark:to-background"
				/>
			</div>
		</div>
	</div>
</section>

```

# src/lib/components/landing/HeroSection.svelte

```svelte
<script lang="ts">
	import { ArrowRightIcon } from 'lucide-svelte';
	import AnimatedShinyText from '$lib/components/magic/AnimatedShinyText/AnimatedShinyText.svelte';
	import BorderBeam from '$lib/components/magic/borderbeam/BorderBeam.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import type { ObserverEventDetails } from 'svelte-inview';
	import { inview } from 'svelte-inview';

	// Images
	import HeroDarkImg from '$lib/imgs/hero-dark.png';
	import HeroLightImg from '$lib/imgs/hero-light.png';
	let inView = false;
	const handleChange = ({ detail }: CustomEvent<ObserverEventDetails>) => {
		// console.log(detail);
		inView = detail.inView;
	};
</script>

<section id="hero" class="relative mx-auto mt-32 max-w-7xl px-6 text-center md:px-8">
	<div
		class="backdrop-filter-[12px] group inline-flex h-7 -translate-y-4 animate-fade-in items-center justify-between gap-1 rounded-full border border-white/5 bg-white/10 px-3 text-xs text-white opacity-0 transition-all ease-in hover:cursor-pointer hover:bg-white/20 dark:text-black"
	>
		<AnimatedShinyText class="inline-flex items-center justify-center">
			<span>✨ Introducing Svee UI Template</span>
			{' '}
			<ArrowRightIcon
				class="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5"
			/>
		</AnimatedShinyText>
	</div>
	<h1
		class="-translate-y-4 animate-fade-in text-balance bg-linear-to-br from-black from-30% to-black/40 bg-clip-text py-6 text-5xl font-medium leading-none tracking-tighter text-transparent opacity-0 [--animation-delay:200ms] dark:from-white dark:to-white/40 sm:text-6xl md:text-7xl lg:text-8xl"
	>
		Svee UI is the new way
		<br class="hidden md:block" />
		{' '}
		to build landing pages.
	</h1>
	<p
		class="mb-12 -translate-y-4 animate-fade-in text-balance text-lg tracking-tight text-gray-400 opacity-0 [--animation-delay:400ms] md:text-xl"
	>
		Beautifully designed, animated components and templates built with
		<br class="hidden md:block" />
		{' '}
		Tailwind CSS, <a href="https://svelte.dev" class="underline underline-offset-2">Svelte</a>, and
		<a href="https://animation-svelte.vercel.app" class="underline underline-offset-2">Svelte Animations</a>.
	</p>
	<Button
		class="-translate-y-4 animate-fade-in gap-1 rounded-lg text-white opacity-0 ease-in-out [--animation-delay:600ms] dark:text-black"
	>
		<span>Get Started for free </span>
		<ArrowRightIcon
			class="ml-1 size-4 transition-transform duration-300 ease-in-out group-hover:translate-x-1"
		/>
	</Button>
	<div
		use:inview={{
			unobserveOnEnter: true,
			rootMargin: '-100px'
		}}
		on:inview_change={handleChange}
		class="relative mt-32 animate-fade-up opacity-0 [--animation-delay:400ms] perspective-[2000px] after:absolute after:inset-0 after:z-50 after:[background:linear-gradient(to_top,hsl(var(--background))_30%,transparent)]"
	>
		<div
			class="rounded-xl border border-white/10 bg-white bg-opacity-[0.01] before:absolute before:bottom-1/2 before:left-0 before:top-0 before:size-full before:opacity-0 before:bg-[linear-gradient(to_bottom,var(--color-one),var(--color-one),transparent_40%)] before:filter-[blur(180px)] {inView
				? 'before:animate-image-glow'
				: ''}"
		>
			<BorderBeam
				size={200}
				duration={12}
				delay={0}
				colorFrom="var(--color-one)"
				colorTo="var(--color-two)"
			/>

			<img
				src={HeroDarkImg}
				alt="HeroDarkImage"
				class="relative hidden size-full rounded-[inherit] border object-contain dark:block"
			/>
			<img
				src={HeroLightImg}
				alt="HeroLightImage"
				class="relative block size-full rounded-[inherit] border object-contain dark:hidden"
			/>
		</div>
	</div>
</section>

```

# src/lib/components/landing/PricingSection.svelte

```svelte
<script lang="ts">
	import { LoaderIcon, CheckIcon } from 'lucide-svelte';
	import Switch from '$lib/components/ui/switch/switch.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { cn } from '$lib/utils';
	import { fly } from 'svelte/transition';

	type Interval = 'month' | 'year';

	export function toHumanPrice(price: number, decimals: number = 2) {
		return Number(price / 100).toFixed(decimals);
	}
	let productPrices = [
		{
			id: 'price_1',
			name: 'Basic',
			description: 'A basic plan for startups and individual users',
			features: [
				'AI-powered analytics',
				'Basic support',
				'5 projects limit',
				'Access to basic AI tools'
			],
			monthlyPrice: 1000,
			yearlyPrice: 10000,
			isMostPopular: false
		},
		{
			id: 'price_2',
			name: 'Premium',
			description: 'A premium plan for growing businesses',
			features: [
				'Advanced AI insights',
				'Priority support',
				'Unlimited projects',
				'Access to all AI tools',
				'Custom integrations'
			],
			monthlyPrice: 2000,
			yearlyPrice: 20000,
			isMostPopular: true
		},
		{
			id: 'price_5',
			name: 'Enterprise',
			description: 'An enterprise plan with advanced features for large organizations',
			features: [
				'Custom AI solutions',
				'24/7 dedicated support',
				'Unlimited projects',
				'Access to all AI tools',
				'Custom integrations',
				'Data security and compliance'
			],
			monthlyPrice: 5000,
			yearlyPrice: 50000,
			isMostPopular: false
		},
		{
			id: 'price_6',
			name: 'Ultimate',
			description: 'The ultimate plan with all features for industry leaders',
			features: [
				'Bespoke AI development',
				'White-glove support',
				'Unlimited projects',
				'Priority access to new AI tools',
				'Custom integrations',
				'Highest data security and compliance'
			],
			monthlyPrice: 8000,
			yearlyPrice: 80000,
			isMostPopular: false
		}
	];
	let interval: Interval = 'month';
	let isLoading = false;
	let index = '';
	let onSubscribeClick = async (priceId: string) => {
		index = priceId;
		isLoading = true;
		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1000));
		isLoading = false;
	};
	/*
    onCheckedChange={(checked) => {
                setInterval(checked ? 'year' : 'month')
             }}
     */
</script>

<section id="pricing">
	<div class="mx-auto flex max-w-(--breakpoint-xl) flex-col gap-8 px-4 py-14 md:px-8">
		<div class="mx-auto max-w-5xl text-center">
			<h4 class="text-xl font-bold tracking-tight text-black dark:text-white">Pricing</h4>

			<h2 class="text-5xl font-bold tracking-tight text-black dark:text-white sm:text-6xl">
				Simple pricing for everyone.
			</h2>

			<p class="mt-6 text-xl leading-8 text-black/80 dark:text-white">
				Choose an
				{' '}
				<strong>affordable plan</strong>
				{' '}
				that&apos;s packed with the best features for engaging your audience, creating customer loyalty,
				and driving sales.
			</p>
		</div>

		<div class="flex w-full items-center justify-center space-x-2">
			<Switch
				on:click={() => {
					interval = interval === 'month' ? 'year' : 'month';
				}}
				id="interval"
			/>
			<span>Annual</span>
			<span
				class="inline-block whitespace-nowrap rounded-full bg-black px-2.5 py-1 text-[11px] font-semibold uppercase leading-5 tracking-wide text-white dark:bg-white dark:text-black"
			>
				2 MONTHS FREE ✨
			</span>
		</div>

		<div class="mx-auto grid w-full flex-col justify-center gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{#each productPrices as price, id}
				<div
					class={cn(
						'relative flex max-w-[400px] flex-col gap-8 overflow-hidden rounded-2xl border p-4 text-black dark:text-white',
						{
							'border-2 border-(--color-one) dark:border-(--color-one)':
								price.isMostPopular
						}
					)}
				>
					<div class="flex items-center">
						<div class="ml-4">
							<h2 class="text-base font-semibold leading-7">
								{price.name}
							</h2>
							<p class="h-12 text-sm leading-5 text-black/70 dark:text-white">
								{price.description}
							</p>
						</div>
					</div>
					{#key interval}
						<div in:fly={{ y: 20, duration: 300, delay: id * 40 }} class="flex flex-row gap-1">
							<span class="text-4xl font-bold text-black dark:text-white">
								{#if interval === 'month'}
									${toHumanPrice(price.monthlyPrice, 0)}
								{:else}
									${toHumanPrice(price.yearlyPrice, 0)}
								{/if}
								<span class="text-xs">
									/ {interval}
								</span>
							</span>
						</div>
					{/key}
					<Button
						class={cn(
							'group relative w-full gap-2 overflow-hidden text-lg font-semibold tracking-tighter',
							'transform-gpu ring-offset-current transition-all duration-300 ease-out hover:ring-2 hover:ring-primary hover:ring-offset-2'
						)}
						disabled={isLoading}
						on:click={() => onSubscribeClick(price.id)}
					>
						<span
							class="absolute right-0 -mt-12 h-32 w-8 translate-x-12 rotate-12 transform-gpu bg-white opacity-10 transition-all duration-1000 ease-out group-hover:-translate-x-96 dark:bg-black"
						/>
						{#if isLoading && index === price.id}
							<LoaderIcon class="mr-2 size-4 animate-spin" />
							Subscribing
						{:else if !isLoading || (isLoading && index !== price.id)}
							Subscribe
						{/if}
					</Button>

					<hr
						class="m-0 h-px w-full border-none bg-linear-to-r from-neutral-200/0 via-neutral-500/30 to-neutral-200/0"
					/>
					{#if price.features && price.features.length > 0}
						<ul class="flex flex-col gap-2 font-normal">
							{#each price.features as feature, idx}
								<li class="flex items-center gap-3 text-xs font-medium text-black dark:text-white">
									<CheckIcon
										class="size-5 shrink-0  rounded-full bg-green-400 p-[2px] text-black dark:text-white"
									/>
									<span class="flex">{feature}</span>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</section>

```

# src/lib/components/magic/AnimatedShinyText/AnimatedShinyText.svelte

```svelte
<script lang="ts">
	import { cn } from '$lib/utils';

	export let shimmerWidth = 100;
	let className: any = '';
	export { className as class };
</script>

<p
	style:--shimmer-width="{shimmerWidth}px"
	class={cn(
		'mx-auto max-w-md text-neutral-600/50 dark:text-neutral-400/50 ',

		// Shimmer effect
		'animate-shimmer bg-clip-text bg-no-repeat bg-position-[0_0] bg-size-[var(--shimmer-width)_100%] [transition:background-position_1s_cubic-bezier(.6,.6,0,1)_infinite]',

		// Shimmer gradient
		'bg-linear-to-r from-transparent via-black/80 via-50% to-transparent  dark:via-white/80',

		className
	)}
>
	<slot>Shimmer Animation</slot>
</p>

```

# src/lib/components/magic/borderbeam/BorderBeam.svelte

```svelte
<script lang="ts">
    import { cn } from "$lib/utils";
  
    export let size = 200;
    export let duration = 15;
    export let anchor = 90;
    export let borderWidth = 1.5;
    export let colorFrom = "#ffaa40";
    export let colorTo = "#9c40ff";
    export let delay = 0;
    let delaySec = delay + "s";
  
    let className: any = "";
    export { className as class };
  </script>
  
  <div
    style:--border-width={borderWidth}
    style:--size={size}
    style:--color-from={colorFrom}
    style:--color-to={colorTo}
    style:--delay={delaySec}
    style:--anchor={anchor}
    style:--duration={duration}
    class={cn(
      "pointer-events-none absolute inset-[0] rounded-[inherit] [border:calc(var(--border-width)*1px)_solid_transparent]",
  
      // mask styles
      "[mask-clip:padding-box,border-box]! mask-intersect! [mask:linear-gradient(transparent,transparent),linear-gradient(white,white)]",
  
      // pseudo styles
      "after:absolute after:aspect-square after:w-[calc(var(--size)*1px)] after:animate-border-beam after:[animation-delay:var(--delay)] after:[background:linear-gradient(to_left,var(--color-from),var(--color-to),transparent)] after:[offset-anchor:calc(var(--anchor)*1%)_50%] after:[offset-path:rect(0_auto_auto_0_round_calc(var(--size)*1px))]",
      className
    )}
  ></div>
  
```

# src/lib/components/magic/marquee/Marquee.svelte

```svelte
<script lang="ts">
    import { cn } from "$lib/utils";
    export let pauseOnHover: boolean = false;
    export let vertical: boolean = false;
    export let repeat: number = 4;
    export let reverse: boolean = false;
  
    let className: any = "";
    export { className as class };
  </script>
  
  <div
    class={cn(
      "group flex overflow-hidden p-2 [--duration:2s] [--gap:1rem] gap-(--gap)",
      {
        "flex-row": !vertical,
        "flex-col": vertical,
      },
      className
    )}
  >
    {#each { length: repeat } as _, i (i)}
      <div
        class={cn("flex shrink-0 justify-around gap-(--gap)", {
          "animate-marquee flex-row": !vertical,
          "animate-marquee-vertical flex-col": vertical,
          "group-hover:[animation-play-state:paused]": pauseOnHover,
          "[animation-direction:reverse]": reverse,
        })}
      >
        <slot>Default</slot>
      </div>
    {/each}
  </div>
  
```

# src/lib/components/magic/SphereMask/SphereMask.svelte

```svelte
<script lang="ts">
	import { cn } from '$lib/utils';
	export let reverse: boolean = false;
</script>

<div
	class={cn(
		// color
		'[--color:var(--color-one)]',
		'pointer-events-none relative  mx-auto h-200 overflow-hidden',

		// sphere mask
		'mask-[radial-gradient(ellipse_at_center_center,#000,transparent_50%)]',

		// reverse
		reverse ? '-my-88 rotate-180 md:-mt-120' : 'my-[-18.8rem]',

		// before
		'before:absolute before:inset-0 before:size-full before:opacity-40 before:bg-[radial-gradient(circle_at_bottom_center,var(--color),transparent_70%)]',

		// after
		'after:absolute after:-left-1/2 after:top-1/2 after:aspect-[1/0.7] after:w-[200%] after:rounded-[50%] after:border-t after:border-[hsl(var(--border))] after:bg-background'
	)}
></div>

```

# src/lib/components/ui/button/button.svelte

```svelte
<script lang="ts">
	import { Button as ButtonPrimitive } from "bits-ui";
	import { type Events, type Props, buttonVariants } from "./index.js";
	import { cn } from "$lib/utils.js";

	type $$Props = Props;
	type $$Events = Events;

	let className: $$Props["class"] = undefined;
	export let variant: $$Props["variant"] = "default";
	export let size: $$Props["size"] = "default";
	export let builders: $$Props["builders"] = [];
	export { className as class };
</script>

<ButtonPrimitive.Root
	{builders}
	class={cn(buttonVariants({ variant, size, className }))}
	type="button"
	{...$$restProps}
	on:click
	on:keydown
>
	<slot />
</ButtonPrimitive.Root>

```

# src/lib/components/ui/button/index.ts

```ts
import { type VariantProps, tv } from "tailwind-variants";
import type { Button as ButtonPrimitive } from "bits-ui";
import Root from "./button.svelte";

const buttonVariants = tv({
	base: "ring-offset-background focus-visible:ring-ring inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:bg-primary/90",
			destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
			outline:
				"border-input bg-background hover:bg-accent hover:text-accent-foreground border",
			secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
			ghost: "hover:bg-accent hover:text-accent-foreground",
			link: "text-primary underline-offset-4 hover:underline",
		},
		size: {
			default: "h-10 px-4 py-2",
			sm: "h-9 rounded-md px-3",
			lg: "h-11 rounded-md px-8",
			icon: "h-10 w-10",
		},
	},
	defaultVariants: {
		variant: "default",
		size: "default",
	},
});

type Variant = VariantProps<typeof buttonVariants>["variant"];
type Size = VariantProps<typeof buttonVariants>["size"];

type Props = ButtonPrimitive.Props & {
	variant?: Variant;
	size?: Size;
};

type Events = ButtonPrimitive.Events;

export {
	Root,
	type Props,
	type Events,
	//
	Root as Button,
	type Props as ButtonProps,
	type Events as ButtonEvents,
	buttonVariants,
};

```

# src/lib/components/ui/form/form-button.svelte

```svelte
<script lang="ts">
	import * as Button from "$lib/components/ui/button/index.js";

	type $$Props = Button.Props;
	type $$Events = Button.Events;
</script>

<Button.Root type="submit" on:click on:keydown {...$$restProps}>
	<slot />
</Button.Root>

```

# src/lib/components/ui/form/form-description.svelte

```svelte
<script lang="ts">
	import * as FormPrimitive from "formsnap";
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "$lib/utils.js";

	type $$Props = HTMLAttributes<HTMLSpanElement>;
	let className: string | undefined | null = undefined;
	export { className as class };
</script>

<FormPrimitive.Description
	class={cn("text-muted-foreground text-sm", className)}
	{...$$restProps}
	let:descriptionAttrs
>
	<slot {descriptionAttrs} />
</FormPrimitive.Description>

```

# src/lib/components/ui/form/form-element-field.svelte

```svelte
<script lang="ts" context="module">
	import type { FormPathLeaves, SuperForm } from "sveltekit-superforms";
	type T = Record<string, unknown>;
	type U = FormPathLeaves<T>;
</script>

<script lang="ts" generics="T extends Record<string, unknown>, U extends FormPathLeaves<T>">
	import type { HTMLAttributes } from "svelte/elements";
	import * as FormPrimitive from "formsnap";
	import { cn } from "$lib/utils.js";

	type $$Props = FormPrimitive.ElementFieldProps<T, U> & HTMLAttributes<HTMLElement>;

	export let form: SuperForm<T>;
	export let name: U;

	let className: $$Props["class"] = undefined;
	export { className as class };
</script>

<FormPrimitive.ElementField {form} {name} let:constraints let:errors let:tainted let:value>
	<div class={cn("space-y-2", className)}>
		<slot {constraints} {errors} {tainted} {value} />
	</div>
</FormPrimitive.ElementField>

```

# src/lib/components/ui/form/form-field-errors.svelte

```svelte
<script lang="ts">
	import * as FormPrimitive from "formsnap";
	import { cn } from "$lib/utils.js";

	type $$Props = FormPrimitive.FieldErrorsProps & {
		errorClasses?: string | undefined | null;
	};

	let className: $$Props["class"] = undefined;
	export { className as class };
	export let errorClasses: $$Props["class"] = undefined;
</script>

<FormPrimitive.FieldErrors
	class={cn("text-destructive text-sm font-medium", className)}
	{...$$restProps}
	let:errors
	let:fieldErrorsAttrs
	let:errorAttrs
>
	<slot {errors} {fieldErrorsAttrs} {errorAttrs}>
		{#each errors as error}
			<div {...errorAttrs} class={cn(errorClasses)}>{error}</div>
		{/each}
	</slot>
</FormPrimitive.FieldErrors>

```

# src/lib/components/ui/form/form-field.svelte

```svelte
<script lang="ts" context="module">
	import type { FormPath, SuperForm } from "sveltekit-superforms";
	type T = Record<string, unknown>;
	type U = FormPath<T>;
</script>

<script lang="ts" generics="T extends Record<string, unknown>, U extends FormPath<T>">
	import type { HTMLAttributes } from "svelte/elements";
	import * as FormPrimitive from "formsnap";
	import { cn } from "$lib/utils.js";

	type $$Props = FormPrimitive.FieldProps<T, U> & HTMLAttributes<HTMLElement>;

	export let form: SuperForm<T>;
	export let name: U;

	let className: $$Props["class"] = undefined;
	export { className as class };
</script>

<FormPrimitive.Field {form} {name} let:constraints let:errors let:tainted let:value>
	<div class={cn("space-y-2", className)}>
		<slot {constraints} {errors} {tainted} {value} />
	</div>
</FormPrimitive.Field>

```

# src/lib/components/ui/form/form-fieldset.svelte

```svelte
<script lang="ts" context="module">
	import type { FormPath, SuperForm } from "sveltekit-superforms";
	type T = Record<string, unknown>;
	type U = FormPath<T>;
</script>

<script lang="ts" generics="T extends Record<string, unknown>, U extends FormPath<T>">
	import * as FormPrimitive from "formsnap";
	import { cn } from "$lib/utils.js";

	type $$Props = FormPrimitive.FieldsetProps<T, U>;

	export let form: SuperForm<T>;
	export let name: U;

	let className: $$Props["class"] = undefined;
	export { className as class };
</script>

<FormPrimitive.Fieldset
	{form}
	{name}
	let:constraints
	let:errors
	let:tainted
	let:value
	class={cn("space-y-2", className)}
>
	<slot {constraints} {errors} {tainted} {value} />
</FormPrimitive.Fieldset>

```

# src/lib/components/ui/form/form-label.svelte

```svelte
<script lang="ts">
	import type { Label as LabelPrimitive } from "bits-ui";
	import { getFormControl } from "formsnap";
	import { cn } from "$lib/utils.js";
	import { Label } from "$lib/components/ui/label/index.js";

	type $$Props = LabelPrimitive.Props;

	let className: $$Props["class"] = undefined;
	export { className as class };

	const { labelAttrs } = getFormControl();
</script>

<Label {...$labelAttrs} class={cn("data-[fs-error]:text-destructive", className)} {...$$restProps}>
	<slot {labelAttrs} />
</Label>

```

# src/lib/components/ui/form/form-legend.svelte

```svelte
<script lang="ts">
	import * as FormPrimitive from "formsnap";
	import { cn } from "$lib/utils.js";

	type $$Props = FormPrimitive.LegendProps;

	let className: $$Props["class"] = undefined;
	export { className as class };
</script>

<FormPrimitive.Legend
	{...$$restProps}
	class={cn("data-[fs-error]:text-destructive text-sm font-medium leading-none", className)}
	let:legendAttrs
>
	<slot {legendAttrs} />
</FormPrimitive.Legend>

```

# src/lib/components/ui/form/index.ts

```ts
import * as FormPrimitive from "formsnap";
import Description from "./form-description.svelte";
import Label from "./form-label.svelte";
import FieldErrors from "./form-field-errors.svelte";
import Field from "./form-field.svelte";
import Fieldset from "./form-fieldset.svelte";
import Legend from "./form-legend.svelte";
import ElementField from "./form-element-field.svelte";
import Button from "./form-button.svelte";

const Control = FormPrimitive.Control;

export {
	Field,
	Control,
	Label,
	Button,
	FieldErrors,
	Description,
	Fieldset,
	Legend,
	ElementField,
	//
	Field as FormField,
	Control as FormControl,
	Description as FormDescription,
	Label as FormLabel,
	FieldErrors as FormFieldErrors,
	Fieldset as FormFieldset,
	Legend as FormLegend,
	ElementField as FormElementField,
	Button as FormButton,
};

```

# src/lib/components/ui/input/index.ts

```ts
import Root from "./input.svelte";

export type FormInputEvent<T extends Event = Event> = T & {
	currentTarget: EventTarget & HTMLInputElement;
};
export type InputEvents = {
	blur: FormInputEvent<FocusEvent>;
	change: FormInputEvent<Event>;
	click: FormInputEvent<MouseEvent>;
	focus: FormInputEvent<FocusEvent>;
	focusin: FormInputEvent<FocusEvent>;
	focusout: FormInputEvent<FocusEvent>;
	keydown: FormInputEvent<KeyboardEvent>;
	keypress: FormInputEvent<KeyboardEvent>;
	keyup: FormInputEvent<KeyboardEvent>;
	mouseover: FormInputEvent<MouseEvent>;
	mouseenter: FormInputEvent<MouseEvent>;
	mouseleave: FormInputEvent<MouseEvent>;
	mousemove: FormInputEvent<MouseEvent>;
	paste: FormInputEvent<ClipboardEvent>;
	input: FormInputEvent<InputEvent>;
	wheel: FormInputEvent<WheelEvent>;
};

export {
	Root,
	//
	Root as Input,
};

```

# src/lib/components/ui/input/input.svelte

```svelte
<script lang="ts">
	import type { HTMLInputAttributes } from "svelte/elements";
	import type { InputEvents } from "./index.js";
	import { cn } from "$lib/utils.js";

	type $$Props = HTMLInputAttributes;
	type $$Events = InputEvents;

	let className: $$Props["class"] = undefined;
	export let value: $$Props["value"] = undefined;
	export { className as class };

	// Workaround for https://github.com/sveltejs/svelte/issues/9305
	// Fixed in Svelte 5, but not backported to 4.x.
	export let readonly: $$Props["readonly"] = undefined;
</script>

<input
	class={cn(
		"border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
		className
	)}
	bind:value
	{readonly}
	on:blur
	on:change
	on:click
	on:focus
	on:focusin
	on:focusout
	on:keydown
	on:keypress
	on:keyup
	on:mouseover
	on:mouseenter
	on:mouseleave
	on:mousemove
	on:paste
	on:input
	on:wheel|passive
	{...$$restProps}
/>

```

# src/lib/components/ui/label/index.ts

```ts
import Root from "./label.svelte";

export {
	Root,
	//
	Root as Label,
};

```

# src/lib/components/ui/label/label.svelte

```svelte
<script lang="ts">
	import { Label as LabelPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	type $$Props = LabelPrimitive.Props;
	type $$Events = LabelPrimitive.Events;

	let className: $$Props["class"] = undefined;
	export { className as class };
</script>

<LabelPrimitive.Root
	class={cn(
		"text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
		className
	)}
	{...$$restProps}
	on:mousedown
>
	<slot />
</LabelPrimitive.Root>

```

# src/lib/components/ui/sonner/index.ts

```ts
export { default as Toaster } from "./sonner.svelte";

```

# src/lib/components/ui/sonner/sonner.svelte

```svelte
<script lang="ts">
	import { Toaster as Sonner, type ToasterProps as SonnerProps } from "svelte-sonner";
	import { mode } from "mode-watcher";

	type $$Props = SonnerProps;
</script>

<Sonner
	theme={$mode}
	class="toaster group"
	toastOptions={{
		classes: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
		},
	}}
	{...$$restProps}
/>

```

# src/lib/components/ui/switch/index.ts

```ts
import Root from "./switch.svelte";

export {
	Root,
	//
	Root as Switch,
};

```

# src/lib/components/ui/switch/switch.svelte

```svelte
<script lang="ts">
	import { Switch as SwitchPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	type $$Props = SwitchPrimitive.Props;
	type $$Events = SwitchPrimitive.Events;

	let className: $$Props["class"] = undefined;
	export let checked: $$Props["checked"] = undefined;
	export { className as class };
</script>

<SwitchPrimitive.Root
	bind:checked
	class={cn(
		"focus-visible:ring-ring focus-visible:ring-offset-background data-[state=checked]:bg-primary data-[state=unchecked]:bg-input peer inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
		className
	)}
	{...$$restProps}
	on:click
	on:keydown
>
	<SwitchPrimitive.Thumb
		class={cn(
			"bg-background pointer-events-none block h-5 w-5 rounded-full shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
		)}
	/>
</SwitchPrimitive.Root>

```

# src/lib/imgs/discord.svg

This is a file of the type: SVG Image

# src/lib/imgs/github-dark.svg

This is a file of the type: SVG Image

# src/lib/imgs/GitHub.svg

This is a file of the type: SVG Image

# src/lib/imgs/Google.svg

This is a file of the type: SVG Image

# src/lib/imgs/hero-dark.png

This is a binary file of the type: Image

# src/lib/imgs/hero-light.png

This is a binary file of the type: Image

# src/lib/imgs/Microsoft.svg

This is a file of the type: SVG Image

# src/lib/imgs/Notion.svg

This is a file of the type: SVG Image

# src/lib/imgs/Uber.svg

This is a file of the type: SVG Image

# src/lib/imgs/x.svg

This is a file of the type: SVG Image

# src/lib/index.ts

```ts
// place files you want to import through the `$lib` alias in this folder.

export let seo = {
	title: 'Svelte Startup Template',
	description:
		'Svelte Startup Template is a template for building Startup Applications. It is built with SvelteKit, TailwindCSS, and Svelte Animations',
	image: 'https://i.pinimg.com/736x/85/9a/92/859a92a2629f912010a0a72270aefedc.jpg',
	twitter: 'SEO twitter',
	url: 'https://startup-sve.vercel.app',
	keywords: 'svelte, sveltekit, tailwindcss, svelte animations, startup, template'
};


```

# src/lib/layout/Footer.svelte

```svelte
<script>
	import DiscordSvg from '$lib/imgs/discord.svg';
	import TwitterSvg from '$lib/imgs/x.svg';

	const footerNavs = [
		{
			label: 'Product',
			items: [
				{
					href: '/',
					name: 'Email Collection'
				},
				{
					href: '/pricing',
					name: 'Pricing'
				},
				{
					href: '/faq',
					name: 'FAQ'
				}
			]
		},

		{
			label: 'Community',
			items: [
				{
					href: '/',
					name: 'Discord'
				},
				{
					href: '/',
					name: 'Twitter'
				},
				{
					href: 'mailto:hello@chatcollect.com',
					name: 'Email'
				}
			]
		},
		{
			label: 'Legal',
			items: [
				{
					href: '/terms',
					name: 'Terms'
				},

				{
					href: '/privacy',
					name: 'Privacy'
				}
			]
		}
	];

	const footerSocials = [
		{
			href: '',
			name: 'Discord',
			icon: DiscordSvg
		},
		{
			href: '',
			name: 'Twitter',
			icon: TwitterSvg
		}
	];
</script>

<footer>
	<div class="mx-auto w-full max-w-(--breakpoint-xl) xl:pb-2">
		<div class="gap-4 p-4 px-8 py-16 sm:pb-16 md:flex md:justify-between">
			<div class="mb-12 flex flex-col gap-4">
				<a href="https://animation-svelte.vercel.app" class="flex items-center gap-2">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="lucide lucide-floor-plan size-8"
						><path
							d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5"
						/><path d="M9 3v7" /><path d="M21 10h-7" /><path d="M3 15h9" /></svg
					>
					<span class="self-center whitespace-nowrap text-2xl font-semibold dark:text-white">
						Svee UI
					</span>
				</a>
				<p class="max-w-xs">UI Library for Design Engineers</p>
			</div>
			<div class="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-10">
				{#each footerNavs as nav}
					<div>
						<h2
							class="mb-6 text-sm font-medium uppercase tracking-tighter text-gray-900 dark:text-white"
						>
							{nav.label}
						</h2>
						<ul class="grid gap-2">
							{#each nav.items as item}
								<li>
									<a
										href={item.href}
										class="cursor-pointer text-sm font-[450] text-gray-400 duration-200 hover:text-gray-200"
									>
										{item.name}
									</a>
								</li>
							{/each}
						</ul>
					</div>
				{/each}
			</div>
		</div>

		<div
			class="flex flex-col gap-2 rounded-md border-neutral-700/20 px-8 py-4 sm:flex sm:flex-row sm:items-center sm:justify-between"
		>
			<div class="flex items-center space-x-5 sm:mt-0 sm:justify-center">
				{#each footerSocials as social}
					<a
						href={social.href}
						class="fill-gray-500 text-gray-500 hover:fill-gray-900 hover:text-gray-900 dark:hover:fill-gray-600 dark:hover:text-gray-600"
					>
						<img src={social.icon} class="size-4" alt={social.name} />
						<span class="sr-only">{social.name}</span>
					</a>
				{/each}
			</div>
			<span class="text-sm text-gray-500 dark:text-gray-400 sm:text-center">
				Copyright ©
				{' '}
				{new Date().getFullYear()}
				{' '}
				<a href="/" class="cursor-pointer">Svee UI</a>
				. All Rights Reserved.
			</span>
		</div>
	</div>
	<!-- Site Banner -->
</footer>

```

# src/lib/layout/Header.svelte

```svelte
<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { cn } from '$lib/utils';
	import { AlignJustify, XIcon } from 'lucide-svelte';
	import { fly } from 'svelte/transition';

	const menuItem = [
		{
			id: 1,
			label: 'Features',
			href: '#'
		},
		{
			id: 2,
			label: 'Pricing',
			href: '#'
		},
		{
			id: 3,
			label: 'Careers',
			href: '#'
		},
		{
			id: 4,
			label: 'Contact Us',
			href: '#'
		}
	];

	let hamburgerMenuIsOpen = false;

	function toggleOverflowHidden(node: HTMLElement) {
		node.addEventListener('click', () => {
			hamburgerMenuIsOpen = !hamburgerMenuIsOpen;
			const html = document.querySelector('html');
			if (html) {
				if (hamburgerMenuIsOpen) {
					html.classList.add('overflow-hidden');
				} else {
					html.classList.remove('overflow-hidden');
				}
			}
		});
	}
	let innerWidth = 0;
</script>

<svelte:window bind:innerWidth />
<header
	class="fixed left-0 top-0 z-50 w-full -translate-y-4 animate-fade-in border-b opacity-0 backdrop-blur-md"
>
	<!-- {#if innerWidth < 768} -->
		<div class="container flex h-14 items-center justify-between">
			<a class="text-md flex items-center" href="/"> Svee UI </a>

			<div class="ml-auto flex h-full items-center">
				<a class="mr-6 text-sm" href="/signin"> Log in </a>
				<Button variant="secondary" class="mr-6 text-sm" href="/signup">Sign up</Button>
			</div>
			<button class="ml-6 md:hidden" use:toggleOverflowHidden>
				<span class="sr-only">Toggle menu</span>
				{#if hamburgerMenuIsOpen}
					<XIcon  strokeWidth={1.4} class='text-gray-300'/>
				{:else}
					<AlignJustify strokeWidth={1.4} class='text-gray-300' />
				{/if}
			</button>
		</div>
	<!-- {/if} -->
</header>

<nav
	class={cn(
		`fixed left-0 top-0 z-50 h-screen w-full overflow-auto `,
		{
			'pointer-events-none': !hamburgerMenuIsOpen
		},
		{
			'bg-background/70 backdrop-blur-md': hamburgerMenuIsOpen
		}
	)}
>
	{#if hamburgerMenuIsOpen === true}
		<div class="container flex h-14 items-center justify-between">
			<a class="text-md flex items-center" href="/"> Svee UI </a>

			<button class="md:hidden" use:toggleOverflowHidden>
				<span class="sr-only">Toggle menu</span>
				{#if hamburgerMenuIsOpen}
					<XIcon strokeWidth={1.4} class='text-gray-300'/>
				{:else}
					<AlignJustify strokeWidth={1.4} class='text-gray-300'/>
				{/if}
			</button>
		</div>
		<ul
			in:fly={{ y: -30, duration: 400 }}
			class="flex flex-col uppercase ease-in md:flex-row md:items-center md:normal-case"
		>
			{#each menuItem as item, i}
				<li class="border-grey-dark border-b py-0.5 pl-6 md:border-none">
					<a
						class="hover:text-grey flex h-(--navigation-height) w-full items-center text-xl transition-[color,transform] duration-300 md:translate-y-0 md:text-sm md:transition-colors {hamburgerMenuIsOpen
							? '[&_a]:translate-y-0'
							: ''}"
						href={item.href}
					>
						{item.label}
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</nav>

```

# src/lib/schema/schema.ts

```ts
import { z } from 'zod';

export const formSchema = z.object({
	email: z.string().email(),
});

export type FormSchema = typeof formSchema;

```

# src/lib/utils.ts

```ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { cubicOut } from "svelte/easing";
import type { TransitionConfig } from "svelte/transition";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

type FlyAndScaleParams = {
	y?: number;
	x?: number;
	start?: number;
	duration?: number;
};

export const flyAndScale = (
	node: Element,
	params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }
): TransitionConfig => {
	const style = getComputedStyle(node);
	const transform = style.transform === "none" ? "" : style.transform;

	const scaleConversion = (
		valueA: number,
		scaleA: [number, number],
		scaleB: [number, number]
	) => {
		const [minA, maxA] = scaleA;
		const [minB, maxB] = scaleB;

		const percentage = (valueA - minA) / (maxA - minA);
		const valueB = percentage * (maxB - minB) + minB;

		return valueB;
	};

	const styleToString = (
		style: Record<string, number | string | undefined>
	): string => {
		return Object.keys(style).reduce((str, key) => {
			if (style[key] === undefined) return str;
			return str + `${key}:${style[key]};`;
		}, "");
	};

	return {
		duration: params.duration ?? 200,
		delay: 0,
		css: (t) => {
			const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
			const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
			const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

			return styleToString({
				transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
				opacity: t
			});
		},
		easing: cubicOut
	};
};
```

# src/routes/(app)/(auth)/+layout@.svelte

```svelte
<script>
	import { toast, Toaster } from 'svelte-sonner';
</script>

<Toaster theme='dark' />
<slot></slot>

```

# src/routes/(app)/(auth)/signin/+page.server.ts

```ts
import { formSchema } from '$lib/schema/schema';
import type { Actions } from '@sveltejs/kit';
import { fail, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async () => {
	return {
		form: await superValidate(zod(formSchema))
	};
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(formSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}
		await new Promise((resolve) => setTimeout(resolve, 800));
		return {
			form
		};
	}
};

```

# src/routes/(app)/(auth)/signin/+page.svelte

```svelte
<script lang="ts">
	import GitHubSvg from '$lib/imgs/github-dark.svg';
	import Button from '$lib/components/ui/button/button.svelte';
	import { ChevronLeftIcon } from 'lucide-svelte';

	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { formSchema, type FormSchema } from '$lib/schema/schema';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { Loader } from 'lucide-svelte';
	// import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';

	export let data;
	let dataForm: SuperValidated<Infer<FormSchema>> = data.form;
	let form = superForm(dataForm, {
		validators: zodClient(formSchema),
		onSubmit: () => {
			isFormLoading = true;
		},
		onUpdate: ({ result }) => {
			isFormLoading = false;
			if (result.status === 200) {
				toast.success('Check your email', {
					description: 'We have sent you a login link. Be sure to check your spam too.'
				});
			} else {
				toast.error('Something went wrong', {
					description: 'Your sign in request failed. Please try again.'
				});
			}
		}
	});

	const { form: formData, enhance } = form;

	let loading = false;
	let isFormLoading = false;
	let githubSignIn = async () => {
		loading = true;
		await new Promise((resolve) => setTimeout(resolve, 1000));
		loading = false;
	};
</script>

<svelte:head>
	<title>Sign In | Svee UI</title>
	<meta name="description" content="Sign In for Svee UI" />
</svelte:head>

<div class="container flex h-screen w-screen flex-col items-center justify-center">
	<Button variant="ghost" href="/" class="absolute left-4 top-4 md:left-8 md:top-8">
		<ChevronLeftIcon class="mr-2 size-4" />
		Back
	</Button>
	<div class="mx-auto flex w-full flex-col justify-center gap-6 sm:w-[350px]">
		<div class="flex flex-col gap-2 text-center">
			<!-- {/* <Icons.logo class="mx-auto h-6 w-6" /> */} -->
			<h1 class="text-2xl font-semibold tracking-tight">Welcome back</h1>
			<p class="text-sm text-muted-foreground">Login to your account</p>
		</div>
		<!-- Form -->
		<form method="POST" use:enhance>
			<Form.Field {form} name="email" class="mb-4">
				<Form.Control let:attrs>
					<Input placeholder="name@example.com" {...attrs} bind:value={$formData.email} />
				</Form.Control>
				<!-- <Form.Description>This is your email address.</Form.Description> -->
				<Form.FieldErrors />
			</Form.Field>
			<Form.Button size="sm" class="w-full" disabled={isFormLoading}>
				{#if isFormLoading}
					<Loader class="mr-2 size-4 animate-spin" />
				{/if}
				Sign In with Email</Form.Button
			>
		</form>
		<!-- Separator -->
		<div class="relative">
			<div class="absolute inset-0 flex items-center">
				<span class="w-full border-t" />
			</div>
			<div class="relative flex justify-center text-xs uppercase">
				<span class="bg-background px-2 text-muted-foreground"> Or continue with </span>
			</div>
		</div>
		<Button on:click={githubSignIn} variant="outline" disabled={loading}>
			{#if loading}
				<Loader class="mr-2 size-4 animate-spin" />
			{:else}
				<img src={GitHubSvg} alt="github" class="mr-2 size-4" />
			{/if}
			Github</Button
		>
		<p class="px-8 text-center text-sm text-muted-foreground">
			<a href="/signup" class="hover:text-brand underline underline-offset-4">
				Don&apos;t have an account? Sign Up
			</a>
		</p>
	</div>
</div>

```

# src/routes/(app)/(auth)/signup/+page.server.ts

```ts
import { formSchema } from '$lib/schema/schema';
import type { Actions } from '@sveltejs/kit';
import { fail, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async () => {
	return {
		form: await superValidate(zod(formSchema))
	};
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(formSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}
		await new Promise((resolve) => setTimeout(resolve, 800));
		return {
			form
		};
	}
};

```

# src/routes/(app)/(auth)/signup/+page.svelte

```svelte
<script lang="ts">
	import GitHubSvg from '$lib/imgs/github-dark.svg';
	import Button from '$lib/components/ui/button/button.svelte';
	import { ChevronLeftIcon } from 'lucide-svelte';

	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { formSchema, type FormSchema } from '$lib/schema/schema';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { Loader } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	export let data;
	let dataForm: SuperValidated<Infer<FormSchema>> = data.form;
	let form = superForm(dataForm, {
		validators: zodClient(formSchema),
		onSubmit: () => {
			isFormLoading = true;
		},
		onUpdate: ({ result }) => {
			isFormLoading = false;
			if (result.status === 200) {
				toast.success('Check your email', {
					description: 'We have sent you a login link. Be sure to check your spam too.'
				});
			} else {
				toast.error('Something went wrong', {
					description: 'Your sign in request failed. Please try again.'
				});
			}
		},
	});

	const { form: formData, enhance } = form;

	let loading = false;
	let isFormLoading = false;
	let githubSignIn = async () => {
		loading = true;
		await new Promise((resolve) => setTimeout(resolve, 1000));
		loading = false;
	};
</script>

<svelte:head>
	<title>Sign Up | Svee UI</title>
	<meta name="description" content="Sign Up for Svee UI" />
</svelte:head>

<div class="container flex h-screen w-screen flex-col items-center justify-center">
	<Button variant="ghost" href="/" class="absolute left-4 top-4 md:left-8 md:top-8">
		<ChevronLeftIcon class="mr-2 size-4" />
		Back
	</Button>
	<div class="mx-auto flex w-full flex-col justify-center gap-6 sm:w-[350px]">
		<div class="flex flex-col gap-2 text-center">
			<!-- {/* <Icons.logo class="mx-auto h-6 w-6" /> */} -->
			<h1 class="text-2xl font-semibold tracking-tight">Welcome to Svee UI</h1>
			<p class="text-sm text-muted-foreground">Sign up for an account</p>
		</div>
		<!-- Form -->
		<form method="POST" use:enhance>
			<Form.Field {form} name="email" class="mb-4">
				<Form.Control let:attrs>
					<Input placeholder="name@example.com" {...attrs} bind:value={$formData.email} />
				</Form.Control>
				<!-- <Form.Description>This is your email address.</Form.Description> -->
				<Form.FieldErrors />
			</Form.Field>
			<Form.Button size="sm" class="w-full" disabled={isFormLoading}>
				{#if isFormLoading}
					<Loader class="mr-2 size-4 animate-spin" />
				{/if}
				Sign Up with Email</Form.Button
			>
		</form>
		<!-- Separator -->
		<div class="relative">
			<div class="absolute inset-0 flex items-center">
				<span class="w-full border-t" />
			</div>
			<div class="relative flex justify-center text-xs uppercase">
				<span class="bg-background px-2 text-muted-foreground"> Or continue with </span>
			</div>
		</div>
		<Button on:click={githubSignIn} variant="outline" disabled={loading}>
			{#if loading}
				<Loader class="mr-2 size-4 animate-spin" />
			{:else}
				<img src={GitHubSvg} alt="github" class="mr-2 size-4" />
			{/if}
			Github</Button
		>

		<p class="px-8 text-center text-sm text-muted-foreground">
			<a href="/signin" class="hover:text-brand underline underline-offset-4">
				Already have an account? Sign In
			</a>
		</p>
	</div>
</div>

```

# src/routes/(app)/+layout.svelte

```svelte
<script>
	import Footer from '$lib/layout/Footer.svelte';
	import Header from '$lib/layout/Header.svelte';
	
</script>


<div class="min-h-screen bg-background font-sans antialiased">
	<Header />
	<div class="mx-auto flex-1 overflow-hidden">
		<slot></slot>
	</div>
	<Footer />
</div>

```

# src/routes/(app)/+page.svelte

```svelte
<script>
	import { seo } from '$lib';
	import ClientSection from '$lib/components/landing/ClientSection.svelte';
	import CtaSection from '$lib/components/landing/CtaSection.svelte';
	import HeroSection from '$lib/components/landing/HeroSection.svelte';
	import PricingSection from '$lib/components/landing/PricingSection.svelte';
	import SphereMask from '$lib/components/magic/SphereMask/SphereMask.svelte';
</script>

<svelte:head>
	<title>{seo.title}</title>
	<meta name="description" content={seo.description} />
	<meta name="keywords" content={seo.keywords} />

	<meta property="og:title" content={seo.title} />
	<meta property="og:description" content={seo.description} />
	<meta property="og:image" content={seo.image} />
	<meta property="og:site_name" content={seo.title} />
	<meta property="og:url" content={seo.url} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={seo.title} />
	<meta name="twitter:description" content={seo.description} />
	<meta name="twitter:image" content={seo.image} />
	<meta name="twitter:site" content="@Sikandar_Bhide" />
</svelte:head>
<HeroSection />
<ClientSection />
<SphereMask />
<PricingSection />
<CtaSection />

```

# src/routes/+layout.svelte

```svelte
<script>
	import '../app.css';
    import { ModeWatcher } from 'mode-watcher';
</script>
<ModeWatcher />

<slot></slot>

```

# static/favicon.png

This is a binary file of the type: Image

# svelte.config.js

```js
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter()
	}
};

export default config;

```

# tailwind.config.ts

```ts
import { fontFamily } from 'tailwindcss/defaultTheme';
import type { Config } from 'tailwindcss';

const config: Config = {
	darkMode: ['class'],
	content: ['./src/**/*.{html,js,svelte,ts}'],
	safelist: ['dark'],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border) / <alpha-value>)',
				input: 'hsl(var(--input) / <alpha-value>)',
				ring: 'hsl(var(--ring) / <alpha-value>)',
				background: 'hsl(var(--background) / <alpha-value>)',
				foreground: 'hsl(var(--foreground) / <alpha-value>)',
				primary: {
					DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
					foreground: 'hsl(var(--primary-foreground) / <alpha-value>)'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
					foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
					foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
					foreground: 'hsl(var(--muted-foreground) / <alpha-value>)'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
					foreground: 'hsl(var(--accent-foreground) / <alpha-value>)'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover) / <alpha-value>)',
					foreground: 'hsl(var(--popover-foreground) / <alpha-value>)'
				},
				card: {
					DEFAULT: 'hsl(var(--card) / <alpha-value>)',
					foreground: 'hsl(var(--card-foreground) / <alpha-value>)'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			fontFamily: {
				sans: ['Inter var', ...fontFamily.sans]
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'border-beam': 'border-beam calc(var(--duration)*1s) infinite linear',
				'image-glow': 'image-glow 4100ms 600ms ease-out forwards',
				'fade-in': 'fade-in 1000ms var(--animation-delay, 0ms) ease forwards',
				'fade-up': 'fade-up 1000ms var(--animation-delay, 0ms) ease forwards',
				shimmer: 'shimmer 8s infinite',
				marquee: 'marquee var(--duration) infinite linear',
				'marquee-vertical': 'marquee-vertical var(--duration) linear infinite'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'border-beam': {
					'100%': {
						'offset-distance': '100%'
					}
				},
				'image-glow': {
					'0%': {
						opacity: '0',
						'animation-timing-function': 'cubic-bezier(0.74, 0.25, 0.76, 1)'
					},
					'10%': {
						opacity: '0.7',
						'animation-timing-function': 'cubic-bezier(0.12, 0.01, 0.08, 0.99)'
					},
					'100%': {
						opacity: '0.4'
					}
				},
				'fade-in': {
					from: { opacity: '0', transform: 'translateY(-10px)' },
					to: { opacity: '1', transform: 'none' }
				},
				'fade-up': {
					from: { opacity: '0', transform: 'translateY(20px)' },
					to: { opacity: '1', transform: 'none' }
				},
				shimmer: {
					'0%, 90%, 100%': {
						'background-position': 'calc(-100% - var(--shimmer-width)) 0'
					},
					'30%, 60%': {
						'background-position': 'calc(100% + var(--shimmer-width)) 0'
					}
				},
				marquee: {
					from: { transform: 'translateX(0)' },
					to: { transform: 'translateX(calc(-100% - var(--gap)))' }
				},
				'marquee-vertical': {
					from: { transform: 'translateY(0)' },
					to: { transform: 'translateY(calc(-100% - var(--gap)))' }
				}
			}
		}
	},
	plugins:[require('tailwindcss-animate')]
};

export default config;

```

# tsconfig.json

```json
{
	"extends": "./.svelte-kit/tsconfig.json",
	"compilerOptions": {
		"allowJs": true,
		"checkJs": true,
		"esModuleInterop": true,
		"forceConsistentCasingInFileNames": true,
		"resolveJsonModule": true,
		"skipLibCheck": true,
		"sourceMap": true,
		"strict": true,
		"moduleResolution": "bundler"
	}
	// Path aliases are handled by https://kit.svelte.dev/docs/configuration#alias
	// except $lib which is handled by https://kit.svelte.dev/docs/configuration#files
	//
	// If you want to overwrite includes/excludes, make sure to copy over the relevant includes/excludes
	// from the referenced tsconfig.json - TypeScript does not merge them in
}

```

# vite.config.ts

```ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()]
});

```


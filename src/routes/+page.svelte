<script lang="ts">
	import { page } from '$app/stores';
	import { projects, done, websiteUrl, websiteImage } from '$lib/index';
	import Svelte from '$lib/logo/svelte.svelte';
	import { ArrowRight, CheckCircle2, Cookie } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { seenCookie } from '$lib/utils';
	import LordIcon from './LordIcon.svelte';
	//
	import Footer from '../lib/components/footer.svelte';
	import InfoBlock from './InfoBlock.svelte';
	import ContentBlock from './ContentBlock.svelte';
	//
	let websiteTitle = 'Svelte MiniApps';
	let websiteDescription = 'A collection of useful and engaging tools built with Svelte.';
	let twitterTitle = `${websiteTitle} - Simplify Tasks with Mini Applications`;
	let twitterDescription = `Svelte MiniApps - The go-to collection of interactive tools built with Svelte. Explore and enhance your workflow!`;
	//
	if ($seenCookie == false) {
		toast("Session cookies at work here. Chill, it's all cool!", {
			action: {
				label: 'OK',
				onClick: () => seenCookie.set(true)
			},
			duration: Number.POSITIVE_INFINITY,
			icon: Cookie
		});
	}
	let userData = '';
	//
	export let data;
	let { contentBlocksData, infoBlocksData } = data;
</script>

<svelte:head>
	<title>{websiteTitle}</title>
	<meta name="description" content={websiteDescription} />
	<meta property="og:title" content={websiteTitle} />
	<meta property="og:description" content={websiteDescription} />
	<meta property="og:url" content={websiteUrl} />
	<meta property="og:image" content={websiteImage} />
	<meta name="twitter:title" content={twitterTitle} />
	<meta name="twitter:description" content={twitterDescription} />
	<meta name="google-site-verification" content="10ATAx6uImjU99YXvI91DB-E9h-MAgI6jsUkLfJlRwY" />
	<meta name="twitter:image" content={websiteImage} />
	<meta name="robots" content="index, follow" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<link rel="canonical" href={websiteUrl} />
</svelte:head>

<div class="pb-5 xl:px-10">
	<section class="w-full py-8 md:py-14 lg:py-24">
		<div class="px-4 xl:container md:px-6">
			<div class="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
				<div class="flex flex-col justify-center space-y-4">
					<header class="space-y-2">
						<h1
							class="my-3 text-3xl font-bold tracking-tighter text-red-700 dark:text-white sm:text-5xl xl:text-6xl/none"
						>
							Welcome
							{#if userData}
								Back,
								<span class="capitalize text-green-700 dark:text-green-300">
									{userData.username}!
								</span>
							{/if}
							to...
							<br />
							<span
								class="text-3xl font-bold tracking-tighter text-red-700 dark:text-white sm:text-5xl xl:text-6xl/none"
							>
								Svelte Mini Apps
							</span>
						</h1>
						<p class="max-w-[600px] text-gray-500 dark:text-gray-400 md:text-xl">
							Discover a collection of small, but powerful Svelte-based web applications that
							showcase the versatility and simplicity of this modern JavaScript framework.
						</p>
					</header>
					<a
						class="inline-flex h-10 items-center justify-center rounded-md bg-red-700 px-5 py-2.5 text-center text-base font-medium text-white shadow transition-colors hover:bg-red-800 focus:ring-4 focus:ring-red-300 focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 dark:focus:ring-red-900"
						href="/Apps"
					>
						Explore Apps
						<ArrowRight class="ml-2 hidden h-5 w-5 md:grid" />
					</a>
				</div>
				<div
					class="justify-cente mx-auto hidden h-[60%] w-[60%] flex-row items-center md:flex md:w-full lg:h-full"
				>
					<Svelte />
				</div>
			</div>
		</div>
	</section>

	<main class="w-full py-5 md:py-8 lg:py-10">
		<div class="px-4 xl:container md:px-6">
			<section
				class="mx-auto max-w-screen-xl justify-center bg-white px-4 py-8 dark:bg-gray-900 lg:py-16 xl:rounded-lg"
			>
				<div class="flex flex-col items-center justify-center space-y-4 text-center">
					<div class="space-y-2">
						<h2 class="mb-2 text-3xl font-extrabold text-gray-900 dark:text-white md:text-5xl">
							<strong class="text-[#F03E3E]"> Svelte </strong> Mini Apps Gallery
						</h2>
						<p
							class="mb-6 max-w-[900px] text-lg font-normal text-gray-500 dark:text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
						>
							Explore a collection of small, but powerful <strong class="text-[#F03E3E]"
								>Svelte-based</strong
							> web applications that showcase the versatility and simplicity of this modern JavaScript
							framework.
						</p>
						<a
							href="/Apps"
							class="inline-flex items-center justify-center rounded-lg bg-red-700 px-5 py-2.5 text-center text-base font-medium text-white hover:bg-red-800 focus:ring-4 focus:ring-red-300 dark:focus:ring-red-900"
						>
							Explore Apps
							<ArrowRight class="ml-2 h-5 w-5" />
						</a>
					</div>
				</div>

				<section
					id="apps"
					class="mx-auto mt-10 max-w-screen-xl bg-white px-4 py-12 dark:bg-gray-900 lg:py-16"
				>
					<h2 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
						Projects Include:
					</h2>
					<ul
						class="mt-10 grid w-full list-inside grid-cols-1 gap-6 space-y-1 text-gray-900 dark:text-gray-400 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
					>
						{#each projects as project}
							{#if done.includes(project.title)}
								<li class="flex items-center">
									<CheckCircle2 class="mr-2 h-5 w-5 text-green-700" />
									{project.title}
								</li>
							{:else}
								<li class="flex items-center">
									<CheckCircle2 class="mr-2 h-5 w-5" />
									{project.title}
								</li>
							{/if}
						{/each}
					</ul>
				</section>
			</section>
		</div>
	</main>

	<section class="w-full md:py-24 lg:py-32">
		<div class="px-4 xl:container md:px-6">
			<div class="flex flex-col items-center justify-center space-y-4 text-center">
				{#each contentBlocksData as block}
					<ContentBlock iconId={block.iconId}>
						<div slot="header" class="flex items-center justify-center space-x-2">
							{#each block.header.text as segment}
								<span
									class={segment.type === 'strong' ? 'font-bold text-[#F03E3E]' : 'font-semibold'}
								>
									{segment.content}
								</span>
							{/each}
						</div>

						<span slot="paragraph">
							{block.paragraph}
						</span>
					</ContentBlock>
				{/each}
			</div>
		</div>
	</section>

	<section class="w-full px-4 py-5 xl:container md:px-6 md:py-8 lg:py-10">
		<div
			class="mx-auto max-w-screen-xl justify-center bg-white px-4 py-8 dark:bg-gray-900 lg:py-16 xl:rounded-lg"
		>
			<div class="flex flex-col items-center justify-center space-y-4 text-center">
				<ContentBlock iconId={'xyboiuok'}>
					<div slot="header">
						<strong class="text-[#F03E3E]"> Love </strong> this app?
					</div>

					<span slot="paragraph">
						We're thrilled you're enjoying your Svelte MiniApp experience! Here are some ways to
						stay connected and help us grow:
					</span>
				</ContentBlock>
			</div>

			<div class="mx-auto space-y-10 px-4 py-8 text-center xl:container">
				<div class="mx-auto grid min-h-[80vh] max-w-[1024px] space-y-3 text-lg lg:text-2xl">
					{#each infoBlocksData as block}
						<InfoBlock dir={block.dir}>
							<LordIcon
								slot="icon"
								dir={block.iconDir === 'left' || block.iconDir === 'right'
									? block.iconDir
									: undefined}
								src={block.iconId}
							/>
							<span slot="header">{block.header}</span>
							<span slot="paragraph">{@html block.paragraph}</span>
						</InfoBlock>
					{/each}

					<p class="mt-4 text-lg text-gray-800 dark:text-gray-200">
						Your contribution to our app's growth and development is invaluable. By sharing the app
						and reporting any bugs you encounter, you're actively helping us improve. For more
						information about our mission and how you can get involved, visit our
						<a class="text-[#F03E3E] underline" href="/About"> About page! </a>
					</p>
				</div>
			</div>
		</div>
	</section>
</div>

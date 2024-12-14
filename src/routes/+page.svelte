<script lang="ts">
	import type { PageServerData } from './$types';
	import { projects, done, siteimage, siteurl, sitename } from '@/index';
	import Svelte from '$lib/assets/svelte.svelte';
	import { CheckCircle2 } from 'lucide-svelte';
	import LordIcon from './LordIcon.svelte';
	//
	import { getGreeting, getMillisecondsUntilNextPeriod, mantras } from '@/utility/greetings';
	import { RefreshCw, Star, StarOff } from 'lucide-svelte';
	//
	import InfoBlock from './InfoBlock.svelte';
	import ContentBlock from './ContentBlock.svelte';
	//
	import { contentBlocksData, infoBlocksData } from './data';
	import BlurInText from '@/components/blocks/BlurInText.svelte';
	import BlurFade from '@/components/blocks/BlurFade.svelte';
	import { enhance } from '$app/forms';
	import { Skeleton } from '@/components/ui/skeleton';
	import { userContext } from '@/utils';
	//
	let websiteTitle = 'Svelte MiniApps';
	let websiteDescription =
		'Your everyday digital companion - a collection of beautifully crafted tools to simplify your life.';
	let twitterTitle = `${websiteTitle} - Smart Tools for Modern Life`;
	let twitterDescription = `Discover your new favorite productivity toolkit! Beautifully designed, lightning-fast mini-apps that make everyday tasks a breeze.`;
	//
	import { invalidate, invalidateAll } from '$app/navigation';

	//
	const arrow = '/lottie/trending-flat.json';

	let greeting = $state(getGreeting());

	// Update greeting when time period changes
	$effect(() => {
		const timeoutId = setTimeout(() => {
			greeting = getGreeting();
			// Recursively set the next timeout
			timeoutId.refresh();
		}, getMillisecondsUntilNextPeriod());

		return () => clearTimeout(timeoutId);
	});

	interface Props {
		data: PageServerData;
	}

	let { data }: Props = $props();

	let isLoading = $state(false);

	function handleSubmit() {
		isLoading = true;
		return async ({ update }: { update: () => Promise<void> }) => {
			await update();
			isLoading = false;
		};
	}

	$effect(() => {
		userContext.set(data.user?.username);
		invalidate('user');
		console.log('userContext.set', userContext);
	});

	let selectedOption = $state('like');

	const handleLike = () => {
		isLoading = true;
		return async ({ update }: any) => {
			await update({ reset: false });
			isLoading = false;
			console.log('Feedback submitted:', selectedOption);
		};
	};
</script>

<div
	class="w-full border-b border-red-100 bg-red-50/80 p-1 py-2 dark:border-red-800/30 dark:bg-red-900/20"
>
	<p class="text-center text-sm font-medium text-red-700/90 dark:text-red-200/90">
		🚧 Welcome to our new platform! Please check the changelog as we migrate features.
	</p>
</div>

<svelte:head>
	<title>{websiteTitle} - Smart Tools for Modern Life</title>
	<meta name="description" content={websiteDescription} />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content={websiteTitle} />
	<meta property="og:description" content={websiteDescription} />
	<meta property="og:image" content={siteimage} />
	<meta property="og:url" content={siteurl} />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={twitterTitle} />
	<meta name="twitter:description" content={twitterDescription} />
	<meta name="twitter:image" content={siteimage} />

	<!-- Additional Meta Tags -->
	<meta
		name="keywords"
		content="svelte apps, web tools, productivity tools, mini applications, svelte toolkit"
	/>
	<meta name="author" content={sitename} />
	<link rel="canonical" href={siteurl} />
</svelte:head>

<!-- Welcome Section -->
<header class="mx-auto my-12 flex flex-col justify-center space-y-2">
	<BlurFade delay={0.25}>
		<BlurInText
			as="h1"
			class="text-center text-3xl font-bold tracking-tighter text-red-700 dark:text-white sm:text-5xl xl:text-6xl/none"
		>
			<span class="capitalize text-green-700 dark:text-green-300">
				{`${greeting}${data.user?.username ? ` ${data.user.username}` : ''}!`}
			</span>
		</BlurInText>
	</BlurFade>
	<BlurFade class="px-1" delay={0.25 * 2}>
		{#if !isLoading && data.mantra}
			<h3 class="my-2 flex items-center justify-center gap-2 text-center">
				<!-- Use a modal and this form to submit feedback -->
				<form
					action="?/likeMantra"
					class="items-center"
					use:enhance={handleLike}
					method="POST"
				>
					<div class="flex items-center space-x-4">
						<label class="flex items-center">
							<input
								type="radio"
								name="feedback"
								value="like"
								bind:group={selectedOption}
								class="peer absolute h-0 w-0 opacity-0"
							/>
							<Star class="h-4 w-4 peer-checked:text-primary peer-hover:text-gray-600" />
							<span class="sr-only ml-1">Like</span>
						</label>
						<label class="flex cursor-pointer items-center">
							<input
								type="radio"
								name="feedback"
								value="dislike"
								bind:group={selectedOption}
								class="peer absolute h-0 w-0 opacity-0"
							/>
							<StarOff class="h-4 w-4 peer-checked:text-primary peer-hover:text-gray-600" />
							<span class="sr-only ml-1">Dislike</span>
						</label>
						<button type="submit" class="sr-only">Submit feedback</button>
					</div>
				</form>
				<span class="text-2xl font-medium text-muted-foreground sm:text-3xl xl:text-4xl/none">
					{data.mantra}
				</span>
				<form
					action="?/generatemantra"
					class="items-center"
					use:enhance={handleSubmit}
					method="POST"
				>
					<button
						class="mt-1 inline-flex size-3 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-50 sm:mt-2 sm:size-8"
						type="submit"
						title="Get a new mantra"
					>
						<RefreshCw class="h-4 w-4" />
					</button>
				</form>
			</h3>
		{:else}
			<Skeleton class="mx-auto h-10 w-[35vw] rounded-md text-center" />
		{/if}
	</BlurFade>
</header>

<!-- Hero -->
<div id="hero" class="pb-5 xl:px-10">
	<section class="w-full py-8 md:py-14 lg:py-24">
		<div class="px-4 xl:container md:px-6">
			<div class="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
				<div class="flex flex-col justify-center space-y-4">
					<div class="flex flex-col">
						<BlurInText
							as="h2"
							class="text-2xl font-bold text-red-700 dark:text-white sm:text-4xl xl:text-5xl/none"
						>
							Welcome
							{#if data?.user?.username}
								{@const username = data.user.username}
								Back,
								<span class="capitalize text-green-700 dark:text-green-300">
									{username}!
								</span>
							{/if}
							to...
						</BlurInText>
						<BlurInText
							as="h2"
							word="Svelte Mini Apps"
							class="text-2xl font-bold text-red-700 dark:text-white sm:text-4xl xl:text-5xl/none"
						/>
						<BlurInText
							as="p"
							word="Explore our curated collection of elegant Svelte applications, thoughtfully designed to enhance your digital workflow with modern, efficient solutions."
							class="max-w-[600px] text-gray-500 dark:text-gray-400 md:text-xl"
						/>
					</div>
					<BlurInText
						as="span"
						class="inline-flex h-10 items-center justify-center rounded-md bg-red-700 px-5 py-2.5 text-center text-base font-medium text-white shadow transition-colors hover:bg-red-800 focus:ring-4 focus:ring-red-300 focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 dark:focus:ring-red-900"
					>
						<a href="/apps" class="flex items-center">
							Start Exploring
							<lord-icon
								target="#hero"
								src={arrow}
								colors="primary:white,secondary:green"
								trigger="loop-on-hover"
								class="ml-2 hidden h-5 w-5 md:grid"
								state="hover-pinch"
							>
							</lord-icon>
						</a>
					</BlurInText>
				</div>
				<BlurInText
					as="div"
					word={Svelte}
					class="justify-cente mx-auto hidden h-[60%] w-[60%] flex-row items-center md:flex md:w-full lg:h-full"
				/>
			</div>
		</div>
	</section>

	<!-- Apps Section -->
	<main class="w-full py-5 md:py-8 lg:py-10">
		<div class="px-4 xl:container md:px-6">
			<section
				class="mx-auto max-w-screen-xl justify-center bg-white px-4 py-8 dark:bg-gray-900 lg:py-16 xl:rounded-lg"
			>
				<div class="flex flex-col items-center justify-center space-y-4 text-center">
					<div class="space-y-2">
						<h2 class="mb-2 text-3xl font-extrabold text-gray-900 dark:text-white md:text-5xl">
							Tools That Make a Difference
						</h2>
						<p
							class="mb-6 max-w-[900px] text-lg font-normal text-gray-500 dark:text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
						>
							From managing your budget to boosting productivity, each app here is designed with one
							goal: to help you get things done. Built with <strong class="text-[#F03E3E]"
								>Svelte</strong
							>, these tools are fast, responsive, and a joy to use.
						</p>
					</div>
				</div>

				<section
					id="apps"
					class="mx-auto mt-10 max-w-screen-xl bg-white px-4 py-12 dark:bg-gray-900 lg:py-16"
				>
					<h2 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
						What's in the Toolbox:
					</h2>
					<ul
						class="mt-10 grid w-full list-inside grid-cols-1 gap-6 space-y-1 text-gray-900 dark:text-gray-400 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
					>
						{#each projects as project}
							{#if done.includes(project.title)}
								<li class="flex items-center">
									<CheckCircle2 class="mr-2 h-5 w-5 text-green-700 dark:text-green-300" />
									<a
										class="text-green-700 after:content-['_↗'] dark:text-green-300"
										href={'/apps/' + project.title.replace(/\s+/g, '-').toLowerCase()}
										>{project.title}</a
									>
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

	<!-- Info Blocks Section -->
	<section class="w-full md:py-24 lg:py-32">
		<div class="px-4 xl:container md:px-6">
			<div class="flex flex-col items-center justify-center space-y-4 text-center">
				{#each contentBlocksData as block}
					<ContentBlock iconId={block.iconId}>
						{#snippet header()}
							<div class="flex items-center justify-center space-x-2">
								{#each block.header.text as segment}
									<span
										class={segment.type === 'strong' ? 'font-bold text-[#F03E3E]' : 'font-semibold'}
									>
										{segment.content}
									</span>
								{/each}
							</div>
						{/snippet}
						{#snippet paragraph()}
							<span>
								{block.paragraph}
							</span>
						{/snippet}
					</ContentBlock>
				{/each}
			</div>
		</div>
	</section>

	<!-- Content Section -->
	<section class="w-full px-4 py-5 xl:container md:px-6 md:py-8 lg:py-10">
		<div
			class="mx-auto max-w-screen-xl justify-center bg-white px-4 py-8 dark:bg-gray-900 lg:py-16 xl:rounded-lg"
		>
			<div class="flex flex-col items-center justify-center space-y-4 text-center">
				<ContentBlock iconId={'xyboiuok'}>
					{#snippet header()}
						<div>
							<strong class="text-[#F03E3E]">Join</strong> the Journey
						</div>
					{/snippet}

					{#snippet paragraph()}
						<span>
							Every great tool starts with feedback from people like you. Here's how you can be part
							of making these apps even better:
						</span>
					{/snippet}
				</ContentBlock>
			</div>

			<div class="mx-auto space-y-10 px-4 py-8 text-center xl:container">
				<div class="mx-auto grid min-h-[80vh] max-w-[1024px] space-y-3 text-lg lg:text-2xl">
					{#each infoBlocksData as block}
						<InfoBlock dir={block.dir}>
							{#snippet icon()}
								<LordIcon
									dir={block.iconDir === 'left' || block.iconDir === 'right'
										? block.iconDir
										: undefined}
									src={block.iconId}
								/>
							{/snippet}
							{#snippet header()}
								<span>{block.header}</span>
							{/snippet}
							{#snippet paragraph()}
								<span>{@html block.paragraph}</span>
							{/snippet}
						</InfoBlock>
					{/each}

					<p class="mt-4 text-lg text-gray-800 dark:text-gray-200">
						Your insights and experiences help shape these tools into something truly useful.
						Whether it's sharing ideas, reporting issues, or just letting me know how you use the
						apps, every bit of feedback counts. Want to learn more about the project? Check out our
						<a class="text-[#F03E3E] hover:underline" href="/about">story</a>.
					</p>
				</div>
			</div>
		</div>
	</section>
</div>

<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { projects, done, siteimage, siteurl, sitename } from '$lib';
	import Svelte from '$lib/logo/svelte.svelte';
	import { ArrowRight, BadgeDollarSign, CheckCircle2, Cookie } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	// import { seenCookie, seenNewAppAlert } from '$lib/utils';
	import LordIcon from './LordIcon.svelte';
	//
	import InfoBlock from './InfoBlock.svelte';
	import ContentBlock from './ContentBlock.svelte';
	//
	import { contentBlocksData, infoBlocksData } from './data';
	//
	// import { requestNotificationPermission } from '$lib/notifications';
	//
	let websiteTitle = 'Svelte MiniApps';
	let websiteDescription = 'A collection of useful and engaging tools built with Svelte.';
	let twitterTitle = `${websiteTitle} - Simplify Tasks with Mini Applications`;
	let twitterDescription = `Svelte MiniApps - The go-to collection of interactive tools built with Svelte. Explore and enhance your workflow!`;
	//

	// let userData = $page.data.user.userData;

	interface Props {
		//
		data: any;
	}

	onMount(() => {
		// Optionally request permission on component mount
		// ADD: notification feature to the app
		// requestNotificationPermission();
		// console.log('username:', username);
	});

	let { data }: Props = $props();

	console.log('data', data);
</script>

<!-- Welcome Section -->
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
							{#if data?.user?.username}
								{@const username = data.user.username}
								Back,
								<span class="capitalize text-green-700 dark:text-green-300">
									{username}!
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

	<!-- Apps Section -->
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
							<strong class="text-[#F03E3E]"> Love </strong> this app?
						</div>
					{/snippet}

					{#snippet paragraph()}
						<span>
							We're thrilled you're enjoying your Svelte MiniApp experience! Here are some ways to
							stay connected and help us grow:
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

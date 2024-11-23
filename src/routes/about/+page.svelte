<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	import { ChevronsRight } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	interface Feature {
		title: string;
		description: string;
	}

	import { features, future, next, reasons, splitDescription } from './data';
	import { onMount } from 'svelte';

	const h3Ids = [
		'Overview',
		'Features',
		'Journey',
		'Philosophy',
		'Motivation',
		'Technology',
		'Vision',
		'Roadmap'
	];
	let activeId: string[] = $state([]);
	let visibleSections = $state(new Set<string>());

	$effect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						// Add this section to visible sections
						visibleSections.add(entry.target.id);
					} else {
						// Remove this section from visible sections
						visibleSections.delete(entry.target.id);
					}

					// Update activeId based on all currently visible sections
					const visibleIndices = Array.from(visibleSections).map((id) => h3Ids.indexOf(id));
					if (visibleIndices.length > 0) {
						// Get the highest visible index
						const maxVisibleIndex = Math.max(...visibleIndices);
						// Activate all sections up to and including the highest visible one
						activeId = h3Ids.slice(0, maxVisibleIndex + 1);
					} else {
						// If nothing is visible, clear active sections
						activeId = [];
					}
				});
			},
			{
				rootMargin: '-20% 0px -20% 0px', // Add margins to make activation more precise
				threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] // Multiple thresholds for smoother transitions
			}
		);

		h3Ids.forEach((id) => {
			const el = document.getElementById(id);
			if (el) {
				observer.observe(el);
			}
		});

		return () => {
			h3Ids.forEach((id) => {
				const el = document.getElementById(id);
				if (el) {
					observer.unobserve(el);
				}
			});
		};
	});

	let iconObserver: IntersectionObserver;
	let gitIconTrigger = $state('in');
	let gitIconState = $state('in-reveal');

	$effect(() => {
		const options = {
			root: null,
			rootMargin: '0px',
			threshold: 1
		};

		iconObserver = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					setTimeout(() => {
						gitIconState = '';
						gitIconTrigger = 'loop';
					}, 3500);
					// entry.target.setAttribute('trigger', 'morph'); // Uncomment if you have a way to dynamically update the attribute
				} else {
					setTimeout(() => {
						gitIconState = 'in-reveal';
						gitIconTrigger = 'in';
					}, 3500);
				}
			});
		}, options);

		// Observe the lord-icon component
		const icon = document.getElementById('giticon');
		if (icon) {
			iconObserver.observe(icon);
		}
	});
</script>

<svelte:head>
	<title>About Page | Svelte MiniApps</title>
	<meta
		name="description"
		content="Discover more about Svelte MiniApps on our About page. Learn about our innovative tools, unique Svelte applications, and how we're revolutionizing the Svelte ecosystem."
	/>
	<meta
		name="keywords"
		content="Svelte, MiniApps, About, Tools, Applications, Ecosystem, Innovative, Unique"
	/>
	<meta property="og:title" content="About Page | Svelte MiniApps" />
	<meta
		property="og:description"
		content="Discover more about Svelte MiniApps on our About page. Learn about our innovative tools, unique Svelte applications, and how we're revolutionizing the Svelte ecosystem."
	/>
	<meta property="og:image" content="https://i.ibb.co/ZhhhnCz/svelte-badge.png" />
	<meta property="og:url" content="https://svelte-apps.me/about" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="About Page | Svelte MiniApps" />
	<meta
		name="twitter:description"
		content="Discover more about Svelte MiniApps on our About page. Learn about our innovative tools, unique Svelte applications, and how we're revolutionizing the Svelte ecosystem."
	/>
	<meta name="twitter:image" content="https://i.ibb.co/ZhhhnCz/svelte-badge.png" />
	<link rel="canonical" href="https://svelte-apps.me/about" />
</svelte:head>

<section class="m-2 px-2 py-3 lg:px-10">
	<h3
		id="Overview"
		class="mb-10 mt-5 cursor-pointer text-center text-3xl font-medium leading-loose text-gray-900 underline decoration-green-400 decoration-wavy decoration-4 underline-offset-8 transition-all dark:text-white dark:decoration-green-600"
	>
		Svelte MiniApps: Powerful Tiny Tools Built with
		<span class="text-nowrap text-red-500 dark:text-red-700">
			SvelteKit

			<lord-icon
				target="#Overview"
				colors="primary:red,secondary:green"
				src="https://cdn.lordicon.com/gqjpawbc.json"
				trigger="loop-on-hover"
				class="h-12 w-12"
			>
			</lord-icon>
		</span>
	</h3>

	<!-- Stepper -->

	<ol
		id="stepper"
		class="sticky top-1 z-50 mx-auto flex w-full max-w-fit flex-row flex-wrap content-center items-center justify-center space-x-2 self-center justify-self-center rounded-lg border border-gray-200 bg-white p-3 text-center text-sm font-medium text-gray-500 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 sm:space-x-4 sm:space-y-0 sm:p-4 sm:text-base lg:p-3 rtl:space-x-reverse"
	>
		{#each h3Ids as id, i}
			<a
				href="#{id}"
				class={`my-1 flex cursor-pointer items-center capitalize ${activeId.includes(id) ? 'text-green-600 dark:text-green-500' : ''}`}
				onclick={(event) => {
					event.preventDefault(); // Prevent the default jump behavior
					const targetElement = document.getElementById(id);
					if (targetElement) {
						const stepperHeight = document.getElementById('stepper')?.offsetHeight ?? 0;
						const scrollOffset = targetElement.offsetTop - stepperHeight;
						window.scrollTo({ top: scrollOffset, behavior: 'smooth' });
					}
				}}
			>
				<span
					class={`me-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs ${activeId.includes(id) ? 'border-green-600 dark:border-green-500' : 'border-gray-500 dark:border-gray-400'}`}
				>
					{i + 1}
				</span>
				<span class="hidden xl:block">
					{id}
				</span>
				<ChevronsRight />
			</a>
		{/each}
	</ol>

	<!-- End of Stepper -->

	<div class="mx-auto grid min-h-[80vh] max-w-[1024px] space-y-3 text-lg lg:text-2xl">
		<div class="block max-w-md rounded-lg p-6">
			<p class="justify-start text-left text-gray-900 dark:text-white">
				<span class="bold text-xl text-green-800 dark:text-green-400 lg:text-3xl"
					>Supercharge your workflow!
				</span>
				Svelte MiniApps are tiny, focused tools built with
				<strong class="text-xl text-red-500 dark:text-red-700 lg:text-3xl"> SvelteKit</strong> for lightning
				speed. Conquer everyday tasks with ease.
			</p>
		</div>

		<div class="block max-w-md justify-self-end rounded-lg p-6">
			<p class="text-right text-gray-900 dark:text-white">
				<span class="bold text-xl text-green-800 dark:text-green-400 lg:text-3xl"
					>Work anytime, anywhere!</span
				>
				These tiny web apps, built with
				<strong class="text-xl text-red-500 dark:text-red-700 lg:text-3xl">SvelteKit</strong>, let
				you install them for seamless offline access. Conquer your daily challenges, even without an
				internet connection.
			</p>
		</div>
	</div>
	<div class="px-16">
		<h3 id="Features" class="bold mx-auto my-5 w-fit cursor-pointer text-2xl">
			Why Choose Svelte MiniApps?
		</h3>
		<div id="Features-list" class="mx-auto my-5 w-fit max-w-[80%]">
			<ul class="space-y-4 text-left">
				{#each features as feature, i}
					<li
						id={feature.title.split(' ').join('-')}
						class="flex flex-col items-center md:flex-row"
					>
						<lord-icon
							target="li"
							src="https://cdn.lordicon.com/cgzlioyf.json"
							trigger="morph"
							colors="primary:#c71f16,secondary:#109173"
							class="mr-5 h-10 w-10 text-green-500 dark:text-green-400"
						>
						</lord-icon>
						<span class="felx flex-col font-semibold">
							{feature.title}:
							<span class="ml-10 font-normal md:-indent-2">
								{#each splitDescription(feature.description, 10) as line, j}
									<p class="indent-{j}">{line}</p>
								{/each}
							</span>
						</span>
					</li>
				{/each}
			</ul>
		</div>
		<div class="">
			<h3 id="Journey" class="bold mx-auto mb-12 mt-16 w-fit cursor-pointer text-2xl">
				Explore a Range of Tools:
			</h3>
			<p class="mx-auto my-8 text-center leading-8 tracking-wide md:w-[50vw]">
				Our collection covers a wide variety of use cases, from basic tools like unit converters to
				more complex ones like persistent to-do lists.
			</p>
			<ul class="mx-auto w-fit space-y-4 text-center">
				<li
					id="Browse"
					class="flex flex-col items-center space-x-3 md:flex-row rtl:space-x-reverse"
				>
					<lord-icon
						src="https://cdn.lordicon.com/unukghxb.json"
						target="li"
						trigger="morph"
						colors="primary:#c71f16,secondary:#109173"
						class="mr-5 h-8 w-8 text-green-500 dark:text-green-400"
					>
					</lord-icon>
					<span class="">
						Browse the available apps and discover ones that can enhance your workflow.
					</span>
				</li>

				<li id="Dive" class="flex flex-col items-center space-x-3 md:flex-row rtl:space-x-reverse">
					<lord-icon
						src="https://cdn.lordicon.com/uvqdhrsk.json"
						target="li"
						trigger="morph"
						colors="primary:#c71f16,secondary:#109173"
						class="mr-5 h-10 w-10 text-green-500 dark:text-green-400"
					>
					</lord-icon>
					<span class="">
						Dive into the code and learn from the examples to build your own mini-apps
					</span>
				</li>
			</ul>
		</div>
		<h3 id="Philosophy" class="bold mx-auto mb-12 mt-16 w-fit cursor-pointer text-2xl">
			The <span class="font-semibold text-green-500 dark:text-green-400"> "Aha Moment" </span>
			Behind Svelte MiniApps:
		</h3>

		<p class="mx-auto my-8 text-center text-lg leading-8 tracking-wide md:w-[50vw] lg:text-2xl">
			We've all been there
			<span class="text-xl font-semibold text-green-500 dark:text-green-400 lg:text-3xl">
				- wrestling with a complex framework for a simple task.
			</span> <br />
			Svelte MiniApps were born from the frustration of heavyweight solutions for lightweight problems.
			<br />
			We wanted something
			<span class="text-xl font-semibold text-green-500 dark:text-green-400 lg:text-3xl">
				modular, efficient, and focused
			</span>
			on getting the job done, just like that trusty screwdriver you use all the time.
		</p>
		<h3 id="Motivation" class="bold mx-auto mb-12 mt-16 w-fit cursor-pointer text-2xl">
			Here's what sparked this project:
		</h3>

		<div class="mx-auto my-5 w-fit max-w-[80%]">
			<ul class="space-y-4 text-left">
				{#each reasons as reason, i}
					<li class="flex flex-col items-center md:flex-row">
						<lord-icon
							src="https://cdn.lordicon.com/mjyxajfq.json"
							trigger="loop"
							colors="primary:#c71f16,secondary:#109173"
							class="mr-5 h-16 w-16 text-green-500 dark:text-green-400"
						>
						</lord-icon>
						<span class="felx flex-col font-semibold">
							{reason.title}:
							<span class="ml-10 font-normal md:-indent-2">
								{#each splitDescription(reason.description, 10) as line, j}
									<p class="indent-{j}">{line}</p>
								{/each}
							</span>
						</span>
					</li>
				{/each}
				<!-- (Consider showcasing some mini-apps in action with before/after GIFs or screenshots! [Add Mini-App Examples]) -->
			</ul>
		</div>
		<h3 id="Technology" class="bold mx-auto mb-12 mt-16 w-fit cursor-pointer text-2xl">
			Svelte MiniApps: Your Pocket-Sized Toolkit
		</h3>
		<p class="mx-auto my-8 text-center text-lg leading-8 tracking-wide md:w-[50vw] lg:text-2xl">
			Imagine your development workflow as a cluttered toolbox. Svelte MiniApps are the <span
				class="bold text-xl text-green-800 dark:text-green-400 lg:text-3xl"
			>
				handy, bite-sized tools
				<span class="text-lg text-black dark:text-white lg:text-2xl">
					you grab for specific tasks.
				</span>
				No bulky all-in-ones
				<span class="text-lg text-black dark:text-white lg:text-2xl"> or</span>
				dusty
				<span class="text-lg text-black dark:text-white lg:text-2xl"> specialty tools here. </span>
			</span>
		</p>
		<h3 id="Vision" class="bold mx-auto mb-12 mt-16 w-fit cursor-pointer text-center text-2xl">
			The Future of Svelte MiniApps: Your Development Playground
		</h3>
		<p class="mx-auto my-8 text-center text-lg leading-8 tracking-wide md:w-[50vw] lg:text-2xl">
			Svelte MiniApps is an <span
				class="bold text-xl text-green-800 dark:text-green-400 lg:text-3xl"
			>
				ever-evolving project,
				<span class="text-lg text-white lg:text-2xl">
					and
					<span class="bold text-xl text-green-800 dark:text-green-400 lg:text-3xl"> you </span>

					hold the reins!
				</span>
			</span>
		</p>
		<div class="mx-auto my-5 w-fit max-w-[90%]">
			<ul class="space-y-4 text-left">
				{#each future as item, i}
					<li id={item.title.split(' ').join('-')} class="flex flex-col items-center md:flex-row">
						<lord-icon
							target="#{item.title.split(' ').join('-')}"
							src={`https://cdn.lordicon.com/${i == 0 ? 'jdalicnn' : 'wzrwaorf'}.json`}
							trigger="morph"
							colors="primary:#c71f16,secondary:#109173"
							class="mr-5 h-16 w-16 text-green-500 dark:text-green-400"
						>
						</lord-icon>

						<span class="felx flex-col font-semibold">
							{item.title}:

							<span class="ml-10 font-normal md:-indent-2">
								{#each splitDescription(item.description, 10) as line, j}
									<p class="indent-{j}">{line}</p>
								{/each}
							</span>
						</span>
					</li>
				{/each}
			</ul>
		</div>
		<h3 id="Roadmap" class="bold mx-auto mb-12 mt-16 w-fit cursor-pointer text-center text-2xl">
			What's Next?
		</h3>
		<div class="mx-auto my-5 w-fit max-w-[90%]">
			<ul class="space-y-4 text-left">
				{#each next as item, i}
					<li id={item.title.split(' ').join('-')} class="flex flex-col items-center md:flex-row">
						<lord-icon
							target="#{item.title.split(' ').join('-')}"
							src={`https://cdn.lordicon.com/${i == 0 ? 'xpuzvjaf' : 'kndkiwmf'}.json`}
							trigger="morph"
							colors="primary:#c71f16,secondary:#109173"
							class="mr-5 h-16 w-16 text-green-500 dark:text-green-400"
						>
						</lord-icon>
						<span class="felx flex-col font-semibold">
							{item.title}

							<span class="ml-10 font-normal md:-indent-2">
								{#each splitDescription(item.description, 10) as line, j}
									<p class="indent-{j}">{line}</p>
								{/each}
							</span>
						</span>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</section>

<!-- Footer -->
<footer
	class="flex flex-col items-center justify-between bg-gray-800 px-4 py-8 text-white md:flex-row"
>
	<a
		href="https://github.com/Michael-Obele/Svelte-MiniApps"
		target="_blank"
		class="group mb-4 flex flex-col items-center justify-center rounded-md px-4 py-2 font-bold text-green-500 hover:text-green-700 dark:text-green-300 dark:hover:text-green-500 md:mb-0 md:flex-row"
		aria-label="Support us on GitHub"
	>
		Support Us on GitHub
		<lord-icon
			id="giticon"
			target="a"
			src="https://cdn.lordicon.com/yedgackm.json"
			trigger={gitIconTrigger}
			delay="1500"
			state={gitIconState}
			class="h-20 w-20"
			colors="primary:#000000,secondary:#22c55e,tertiary:#ffffff"
		>
		</lord-icon>
	</a>

	<form
		action="https://submit-form.com/CeUldzMcN"
		method="POST"
		target="_blank"
		class="mx-auto mb-4 flex w-full items-center justify-center sm:max-w-4xl md:mb-0"
	>
		<input
			type="text"
			name="message"
			class="mr-2 w-3/4 rounded-md border border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
			placeholder="Share your thoughts..."
			aria-label="Share your thoughts"
		/>
		<Button
			type="submit"
			class="rounded-md bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-800"
			aria-label="Submit your thoughts"
		>
			Submit
		</Button>
	</form>
</footer>

<!-- End of Footer -->

<style>
	h3 {
		padding-top: 3rem;
	}
	/* * {
		border: 1px red solid;
	} */
</style>

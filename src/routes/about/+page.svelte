<script lang="ts">
	import RouteHead from '$lib/components/blocks/RouteHead.svelte';
	import Vision from './Vision.svelte';
	import Philosophy from './Philosophy.svelte';
	import Tools from './Tools.svelte';
	import DataManagement from './DataManagement.svelte';
	import Features from './Features.svelte';
	import Attributions from './Attributions.svelte';

	import { ChevronsRight } from '@lucide/svelte';

	import BlurInText from '@/blocks/BlurInText.svelte';

	const Ids = ['Features', 'DataManagement', 'Tools', 'Philosophy', 'Vision', 'Attributions'];
	let activeId: string[] = $state([]);
	let visibleSections = $state(new Set<string>());

	$effect(() => {
		let lastActiveIndex = -1; // Keep track of the last active section

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					const currentIndex = Ids.indexOf(entry.target.id);

					if (entry.isIntersecting) {
						// Update last active index if this section is further down
						lastActiveIndex = Math.max(lastActiveIndex, currentIndex);
						visibleSections.add(entry.target.id);
					} else {
						visibleSections.delete(entry.target.id);
						//Only update lastActiveIndex if we're scrolling up past it
						if (currentIndex === lastActiveIndex) {
							// Find the highest visible section
							const visibleIndices = Array.from(visibleSections).map((id) => Ids.indexOf(id));
							lastActiveIndex =
								visibleIndices.length > 0 ? Math.max(...visibleIndices) : currentIndex - 1;
						}
					}

					// Always keep all sections up to lastActiveIndex active
					activeId = lastActiveIndex >= 0 ? Ids.slice(0, lastActiveIndex + 1) : [];
					// Ensure the last active section stays active even if scrolled past
					if (lastActiveIndex === Ids.length - 1 && !entry.isIntersecting) {
						// Only push if the last section was previously active
						if (activeId.includes(Ids[lastActiveIndex])) {
							activeId.push(Ids[lastActiveIndex]);
						}
					}
				});
			},
			{
				rootMargin: '-20% 0px -20% 0px',
				threshold: [0, 0.2, 0.4, 0.6, 0.8, 1]
			}
		);

		Ids.forEach((id) => {
			const el = document.getElementById(id);
			if (el) {
				observer.observe(el);
			}
		});

		return () => {
			Ids.forEach((id) => {
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
						gitIconState = 'pinch';
						gitIconTrigger = 'loop';
					}, 3500);
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

<RouteHead
	title="About Page | Svelte MiniApps"
	description="Discover more about Svelte MiniApps on our About page. Learn about our innovative tools, unique Svelte applications, and how we're revolutionizing the Svelte ecosystem."
	keywords="Svelte, MiniApps, About, Tools, Applications, Ecosystem, Innovative, Unique"
	route="/about"
	image="https://i.ibb.co/ZhhhnCz/svelte-badge.png"
/>

<div class="m-2 px-2 py-3 lg:px-10">
	<BlurInText>
		<h1
			class="mb-10 mt-5 cursor-pointer text-center text-3xl font-medium leading-loose text-gray-900 underline decoration-green-400 decoration-wavy decoration-4 underline-offset-8 transition-all dark:text-white dark:decoration-green-600"
		>
			Svelte MiniApps: Powerful Tiny Tools Built with
			<span class="text-nowrap text-red-500 dark:text-red-700">
				SvelteKit

				<lord-icon
					target="h1"
					colors="primary:red,secondary:green"
					src="https://cdn.lordicon.com/gqjpawbc.json"
					trigger="loop-on-hover"
					class="h-12 w-12"
				>
				</lord-icon>
			</span>
		</h1>
	</BlurInText>

	<!-- Stepper -->

	<ol
		id="stepper"
		class="sticky top-1 z-50 mx-auto flex w-full max-w-fit flex-row flex-wrap content-center items-center justify-center space-x-2 self-center justify-self-center rounded-lg border border-gray-200 bg-white p-3 text-center text-sm font-medium text-gray-500 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 sm:space-x-4 sm:space-y-0 sm:p-4 sm:text-base lg:p-3 rtl:space-x-reverse"
	>
		{#each Ids as id, i}
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
				{#if i !== Ids.length - 1}
					<ChevronsRight />
				{/if}
			</a>
		{/each}
	</ol>

	<!-- End of Stepper -->
	<div class="mx-auto grid min-h-[80vh] max-w-[1024px] space-y-3">
		<div class="block max-w-md rounded-lg p-6">
			<p class="justify-start text-left text-base text-gray-900 dark:text-white md:text-xl">
				<span class="font-bold text-green-800 dark:text-green-400">Supercharge your workflow!</span>
				Svelte MiniApps are tiny, focused tools built with
				<strong class="text-red-500 dark:text-red-700">SvelteKit</strong> for lightning speed. Conquer
				everyday tasks with ease.
			</p>
		</div>

		<div class="block max-w-md justify-self-end rounded-lg p-6">
			<p class="text-right text-base text-gray-900 dark:text-white md:text-xl">
				<span class="font-bold text-green-800 dark:text-green-400">Work anytime, anywhere!</span>
				These tiny web apps, built with
				<strong class="text-red-500 dark:text-red-700">SvelteKit</strong>, let you install them for
				seamless offline access. Conquer your daily challenges, even without an internet connection.
			</p>
		</div>
	</div>

	<main class="space-x-6 px-1 md:px-16">
		<Features id="Features" />
		<DataManagement id="DataManagement" />
		<Tools id="Tools" />
		<Philosophy id="Philosophy" />
		<Vision id="Vision" />
		<!-- Attributions Section -->
		<Attributions id="Attributions" />
	</main>
</div>

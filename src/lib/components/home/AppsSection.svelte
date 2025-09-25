<!--
@component

AppsSection — lists available apps from projects, marking completed ones and linking to /apps/{link}.

Usage:
```svelte
<AppsSection />
```

-->
<script lang="ts">
	import { projects, done, site } from '$lib/index';
	import { CheckCircle2, CircleX } from '@lucide/svelte';

	let sortedProjects: any[] = [];
	let doneProjects: any[] = [];
	let comingSoon: any[] = [];

	// Sort projects alphabetically by title and split into done vs coming soon
	sortedProjects = projects.sort((a, b) => a.title.localeCompare(b.title));
	doneProjects = sortedProjects.filter((p) => done.includes(p.link));
	comingSoon = sortedProjects.filter((p) => !done.includes(p.link));
</script>

<main class="w-full py-5 md:py-8 lg:py-10">
	<div class="px-4 xl:container md:px-6">
		<section
			class="mx-auto max-w-(--breakpoint-xl) justify-center bg-white px-4 py-8 dark:bg-gray-900 lg:py-16 xl:rounded-lg"
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
				class="mx-auto mt-10 max-w-(--breakpoint-xl) bg-white px-4 py-12 dark:bg-gray-900 lg:py-16"
			>
				<h2 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
					What's in the Toolbox:
				</h2>
				<ul
					class="mt-10 grid w-full list-inside grid-cols-1 gap-6 space-y-1 text-gray-900 dark:text-gray-400 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
				>
					{#each doneProjects as project}
						<li class="flex items-center">
							<CheckCircle2 class="mr-2 h-5 w-5 text-green-700 dark:text-green-300" />

							<a
								class="text-green-700 after:content-['_↗'] dark:text-green-300"
								href={'/apps/' + project.link}>{project.title}</a
							>
						</li>
					{/each}
				</ul>

				<!-- Collapsible list for upcoming apps (coming soon) - not a section tag -->
				{#if comingSoon.length}
					<details
						class="mt-6 rounded-md border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900"
					>
						<summary class="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300"
							>Coming soon</summary
						>
						<ul
							class="mt-3 flex flex-row flex-wrap gap-6 space-y-2 text-gray-700 dark:text-gray-400"
						>
							{#each comingSoon as project}
								<li class="flex items-center">
									<CircleX class="mr-2 h-5 w-5 opacity-40" />
									<span class="opacity-80">{project.title}</span>
								</li>
							{/each}
						</ul>
					</details>
				{/if}
			</section>
		</section>
	</div>
</main>

<!--
@component

AppsSection — lists available apps from projects, marking completed ones and linking to /apps/{link}.

Usage:
```svelte
<AppsSection />
```

-->
<script lang="ts">
	import { projects, done, site, isNewApp } from '$lib/index';
	import { CheckCircle2, CircleHelp, CircleX } from '@lucide/svelte';

	let sortedProjects: any[] = [];
	let doneProjects: any[] = [];
	let comingSoon: any[] = [];

	// Sort projects alphabetically by title and split into done vs coming soon
	sortedProjects = projects.sort((a, b) => a.title.localeCompare(b.title));
	doneProjects = sortedProjects.filter((p) => done.some((d) => d.name === p.link));
	comingSoon = sortedProjects.filter((p) => !done.some((d) => d.name === p.link));
</script>

<main class="w-full py-5 md:py-8 lg:py-10">
	<div class="px-4 md:px-6 xl:container">
		<section
			class="mx-auto max-w-(--breakpoint-xl) justify-center bg-white px-4 py-8 lg:py-16 xl:rounded-lg dark:bg-gray-900"
		>
			<div class="flex flex-col items-center justify-center space-y-4 text-center">
				<div class="space-y-2">
					<h2 class="mb-2 text-3xl font-extrabold text-gray-900 md:text-5xl dark:text-white">
						Tools That Make a Difference
					</h2>
					<p
						class="mb-6 max-w-[900px] text-lg font-normal text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400"
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
				class="mx-auto mt-10 max-w-(--breakpoint-xl) bg-white px-4 py-12 lg:py-16 dark:bg-gray-900"
			>
				<h2 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
					What's in the Toolbox:
				</h2>
				<ul
					class="mt-10 grid w-full list-inside grid-cols-1 gap-6 space-y-1 text-gray-900 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 dark:text-gray-400"
				>
					{#each doneProjects as project}
						<li class="flex items-center">
							<CheckCircle2 class="mr-2 h-5 w-5 text-green-700 dark:text-green-300" />

							<a
								class="text-green-700 after:content-['_↗'] dark:text-green-300"
								href={'/apps/' + project.link}>{project.title}</a
							>
							{#if isNewApp(project.link)}
								<span
									class="ml-2 inline-flex items-center rounded-md bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300"
								>
									NEW
								</span>
							{/if}
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
							<li class="flex items-center">
								<CircleHelp class="mr-2 h-5 w-5 opacity-40" />
								<span class="opacity-80">And many more</span>
							</li>
						</ul>
					</details>
				{/if}
			</section>
		</section>
	</div>
</main>

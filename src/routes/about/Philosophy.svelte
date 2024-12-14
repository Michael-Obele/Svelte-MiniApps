<script lang="ts">
	import { reasons, splitDescription } from './data';
	import Aha from '$lib/assets/Problem Solving 4.png?enhanced';
	import Group from './Group.svelte';
	import Illustration from './Illustration.svelte';
</script>

<section id="Philosophy">
	<header>
		<h2
			class="bold mx-auto mb-12 mt-16 w-fit cursor-pointer text-3xl font-bold tracking-tight text-gray-900 dark:text-white"
		>
			The <span class="text-green-500 dark:text-green-400">"Aha Moment"</span> Behind Svelte MiniApps:
		</h2>
	</header>

	<Group dir="right">
		{#snippet image()}
			<Illustration image={Aha} alt="The reason behind Svelte MiniApps" />
		{/snippet}

		{#snippet content()}
			<p class="mx-auto my-8 space-y-5 text-base leading-relaxed">
				We've all been there -
				<span class="font-semibold text-green-500 dark:text-green-400">
					wrestling with a complex framework for a simple task.
				</span>
				<span>
					Svelte MiniApps were born from the frustration of heavyweight solutions for lightweight
					problems.
				</span>
			</p>
			<p class="mx-auto my-8 space-y-5 text-base leading-relaxed">
				We wanted something

				<span class="font-semibold text-green-500 dark:text-green-400">
					modular, efficient, and focused
				</span>
				on getting the job done, just like that trusty screwdriver you use all the time.
			</p>
		{/snippet}
	</Group>

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
</section>

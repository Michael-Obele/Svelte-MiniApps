<script lang="ts">
	import { future, next, splitDescription } from './data';
	import Vision from '$lib/assets/Rocket Boy.png?enhanced';
	import Group from './Group.svelte';
	import Illustration from './Illustration.svelte';
	import Header from './Header.svelte';
	let { id } = $props();
</script>

<section {id}>
	<Header {id}>The Future of Svelte MiniApps: What's Next?</Header>
	<Group dir="left">
		{#snippet image()}
			<Illustration image={Vision} alt="The Future of Svelte MiniApps" />
		{/snippet}
		{#snippet content()}
			<p class="my-8 text-center text-base leading-relaxed">
				Svelte MiniApps is an
				<span class="font-bold text-green-800 dark:text-green-400">
					ever-evolving project,
					<span class="font-normal text-white">
						and
						<span class="font-bold text-green-800 dark:text-green-400">you</span>
						hold the reins!
					</span>
				</span>
			</p>
		{/snippet}
	</Group>
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
</section>

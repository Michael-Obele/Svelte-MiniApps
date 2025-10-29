<script lang="ts">
	import Illustration from './Illustration.svelte';
	import Tools from '$lib/assets/Solving Problem 1.png?enhanced';
	import Group from './Group.svelte';
	import Header from './Header.svelte';
	let { id } = $props();
</script>

<section {id}>
	<Header {id}>Explore a Range of Tools:</Header>

	<Group dir="left">
		{#snippet image()}
			<Illustration image={Tools} alt=" Tools for Svelte Mini Apps" />
		{/snippet}

		{#snippet content()}
			<p class="mx-auto my-8 text-center text-base leading-relaxed">
				Our collection covers a wide variety of use cases, from basic tools like unit converters to
				more complex ones like persistent to-do lists.
			</p>
		{/snippet}
	</Group>
	<ul class="mx-auto w-fit space-y-4 text-center">
		<li id="Browse" class="flex flex-col items-center space-x-3 md:flex-row">
			<lord-icon
				src="https://cdn.lordicon.com/unukghxb.json"
				target="li"
				trigger="morph"
				colors="primary:#c71f16,secondary:#109173"
				class="mr-5 h-8 w-8 text-green-500 dark:text-green-400"
			></lord-icon>
			<span class="">
				Browse the available apps and discover ones that can enhance your workflow.
			</span>
		</li>

		<li id="Dive" class="flex flex-col items-center space-x-3 md:flex-row">
			<lord-icon
				src="https://cdn.lordicon.com/uvqdhrsk.json"
				target="li"
				trigger="morph"
				colors="primary:#c71f16,secondary:#109173"
				class="mr-5 h-10 w-10 text-green-500 dark:text-green-400"
			></lord-icon>
			<span class="">
				Dive into the code and learn from the examples to build your own mini-apps
			</span>
		</li>
	</ul>
</section>

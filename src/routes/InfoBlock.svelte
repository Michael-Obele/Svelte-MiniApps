<script lang="ts">
	interface Props {
		dir?: string;
		icon?: import('svelte').Snippet;
		header?: import('svelte').Snippet;
		paragraph?: import('svelte').Snippet;
	}

	let {
		dir = 'left',
		icon,
		header,
		paragraph
	}: Props = $props();
</script>

<div class="block max-w-md rounded-lg p-6 {dir === 'right' ? 'justify-self-end' : ''}">
	{@render icon?.()}
	<h2 class="mb-4 text-2xl font-bold dark:text-gray-300">
		{@render header?.()}
	</h2>
	<p class="mb-4 justify-start text-{dir == 'left' ? 'left' : 'right'} text-lg dark:text-gray-400">
		{@render paragraph?.()}
	</p>
</div>

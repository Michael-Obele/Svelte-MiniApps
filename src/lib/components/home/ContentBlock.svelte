<script lang="ts">
	interface Props {
		iconId?: string;
		header?: import('svelte').Snippet;
		paragraph?: import('svelte').Snippet;
	}

	let { iconId = '', header, paragraph }: Props = $props();
</script>

<div class="mx-auto max-w-3xl space-y-4">
	<h2
		class="flex flex-col items-center justify-center gap-4 text-3xl font-bold tracking-tight sm:flex-row sm:gap-3 sm:text-5xl"
		class:cursor-pointer={iconId !== ''}
	>
		{@render header?.()}
		{#if iconId}
			<lord-icon
				target="div"
				src="https://cdn.lordicon.com/{iconId}.json"
				colors="primary:red,secondary:green"
				trigger="loop-on-hover"
				state="morph-heart"
				class="size-14 transition-transform hover:scale-110 sm:size-16"
			>
			</lord-icon>
		{/if}
	</h2>
	<p class="mx-auto max-w-[700px] text-base text-gray-600 dark:text-gray-400 md:text-lg lg:text-xl">
		{@render paragraph?.()}
	</p>
</div>

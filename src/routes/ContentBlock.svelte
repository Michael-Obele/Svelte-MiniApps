<script lang="ts">
	interface Props {
		iconId?: string;
		header?: import('svelte').Snippet;
		paragraph?: import('svelte').Snippet;
	}

	let { iconId = '', header, paragraph }: Props = $props();
</script>

<div class="space-y-2">
	<h2
		class:cursor-pointer={iconId !== ''}
		class="Tspace-x-2 flex items-center justify-center text-3xl font-bold tracking-tighter sm:text-5xl"
	>
		{@render header?.()}
		<lord-icon
			target="div"
			src="https://cdn.lordicon.com/{iconId}.json"
			colors="primary:red,secondary:green"
			trigger="loop-on-hover"
			state="morph-heart"
			class="h-16 w-16"
		>
		</lord-icon>
	</h2>
	<p
		class="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400"
	>
		{@render paragraph?.()}
	</p>
</div>

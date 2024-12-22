<script lang="ts">
	interface Props {
		children?: import('svelte').Snippet;
		visible?: boolean;
	}

	let { children, visible }: Props = $props();

	let show = visible ?? import.meta.env.VITE_FEATURE_FLAG;
	if (show) {
		console.log('Feature flag is enabled');
	}
</script>

{#if show}
	<div class="container mx-auto my-8 px-4 py-8">
		{@render children?.()}
	</div>
{/if}

<script lang="ts">
	import { cn } from '@/utils/cn';

	interface Props {
		children?: import('svelte').Snippet;
		visible?: boolean;
		class?: string;
	}

	let { children, visible, class: className = '' }: Props = $props();

	let show = visible ?? import.meta.env.VITE_FEATURE_FLAG;
	if (show) {
		console.log('Feature flag is enabled');
	}
</script>

{#if show}
	<div class={cn('py-8" container mx-auto my-8 px-4', className)}>
		{@render children?.()}
	</div>
{/if}

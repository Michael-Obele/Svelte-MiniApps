<script lang="ts">
	import { cn } from '@/utils/cn';
	import { PUBLIC_FEATURE_FLAG } from '$env/static/public';

	interface Props {
		children?: import('svelte').Snippet;
		visible?: boolean;
		class?: string;
	}

	let { children, visible, class: className = '' }: Props = $props();

	// Convert the string value to a boolean
	const isFeatureFlagEnabled: boolean = JSON.parse(PUBLIC_FEATURE_FLAG || 'false');
</script>

{#if isFeatureFlagEnabled}
	<div class={cn('container mx-auto my-8 px-4 py-8', className)}>
		{@render children?.()}
	</div>
{/if}

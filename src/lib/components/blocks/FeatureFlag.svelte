<script lang="ts">
	import { cn } from '@/utils/cn';
	import { PUBLIC_FEATURE_FLAG } from '$env/static/public';
	import { userContext } from '@/utils';

	interface Props {
		children?: import('svelte').Snippet;
		visible?: boolean;
		class?: string;
	}

	let { children, visible, class: className = '' }: Props = $props();

	// Convert the string value to a boolean
	const isFeatureFlagEnabled: boolean = JSON.parse(PUBLIC_FEATURE_FLAG || 'false');

	// Check if the user is an admin or tester
	const isPrivilegedUser: boolean = ['admin', 'tester'].includes($userContext?.role ?? '');

	// Combine the conditions
	const shouldRender: boolean = isFeatureFlagEnabled || isPrivilegedUser;
</script>

{#if shouldRender}
	<div class={cn('container mx-auto my-8 px-4 py-8', className)}>
		{@render children?.()}
	</div>
{/if}

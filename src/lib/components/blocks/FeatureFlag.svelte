<script lang="ts">
	import { PUBLIC_FEATURE_FLAG } from '$env/static/public';
	import { cn } from '$lib/utils';
	import { getCurrentUser } from '$lib/remote/auth.remote';

	interface Props {
		children?: import('svelte').Snippet;
		visible?: boolean;
		class?: string;
	}

	let { children, visible, class: className = '' }: Props = $props();

	// Convert the string value to a boolean
	const isFeatureFlagEnabled: boolean = JSON.parse(PUBLIC_FEATURE_FLAG || 'false');
</script>

<svelte:boundary>
	{@const user = await getCurrentUser()}
	{@const isPrivilegedUser = user ? ['admin', 'tester'].includes(user.role) : false}
	{@const shouldRender = isFeatureFlagEnabled || isPrivilegedUser}

	{#if shouldRender}
		<div class={cn('container mx-auto my-8 px-4 py-8', className)}>
			{@render children?.()}
		</div>
	{/if}
	{#snippet pending()}
		<!-- Loading state - could show nothing or a loading indicator -->
	{/snippet}
</svelte:boundary>

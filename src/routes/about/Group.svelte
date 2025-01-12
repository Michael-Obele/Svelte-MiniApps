<script lang="ts">
	import { cn } from '@/utils';

	interface Props {
		image?: import('svelte').Snippet;
		content?: import('svelte').Snippet;
		dir?: 'left' | 'right';
		class?: string;
	}

	let { image, content, dir = 'left', class: className }: Props = $props();
</script>

{#snippet left()}
	<div
		class="mx-auto flex flex-col items-center justify-around py-8 sm:container md:px-14 lg:flex-row"
	>
		{@render image?.()}
		<span class={cn('my-3 w-full md:max-w-md', className)}>
			{@render content?.()}
		</span>
	</div>
{/snippet}

{#snippet right()}
	<div
		class="mx-auto flex flex-col items-center justify-around py-8 sm:container md:px-14 lg:flex-row"
	>
		<span class={cn('order-1 my-3 w-full md:order-none md:max-w-md', className)}>
			{@render content?.()}
		</span>
		{@render image?.()}
	</div>
{/snippet}

{#if dir === 'left'}
	{@render left?.()}
{:else}
	{@render right?.()}
{/if}

<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Component } from 'svelte';
	import type { Snippet } from 'svelte';
	import { Motion } from 'svelte-motion';

	interface Props {
		word?: string | Component;
		variant?: {
			hidden: { filter: string; opacity: number };
			visible: { filter: string; opacity: number };
		};
		duration?: number;
		as?: string;
		class?: string;
		children?: Snippet;
	}

	let {
		children,
		word = 'Blur In',
		variant = {
			hidden: { filter: 'blur(10px)', opacity: 0 },
			visible: { filter: 'blur(0px)', opacity: 1 }
		},
		as = 'h2',
		duration = 1,
		class: className = ''
	}: Props = $props();

	let defaultVariants = {
		hidden: { filter: 'blur(10px)', opacity: 0 },
		visible: { filter: 'blur(0px)', opacity: 1 }
	};
	let combinedVariants = variant || defaultVariants;

	if (children){
		as = 'div'
	}
</script>

<Motion
	initial="hidden"
	animate="visible"
	transition={{ duration }}
	variants={combinedVariants}
	let:motion
>
	<svelte:element
		this={as}
		class={cn(' tracking-[-0.02em] drop-shadow-sm md:leading-[5rem]', className)}
		use:motion
	>
		{#if children}
			{@render children?.()}
		{:else if typeof word === 'string'}
			{word}
		{:else}
			{@const Component = word}
			<Component />
		{/if}
	</svelte:element>
</Motion>

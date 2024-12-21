<script lang="ts">
	import { ArrowUp } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	let { isSticky } = $props();
	import { fade } from 'svelte/transition';
	import { scrollToTop } from '@/utils';
</script>

{#if isSticky}
	<span class="md:hidden" transition:fade={{ duration: 300 }}>
		<Button
			variant="outline"
			size="icon"
			class="fixed bottom-4 right-4 z-50"
			onclick={() => scrollToTop()}
		>
			<ArrowUp class="h-4 w-4" />
		</Button>
	</span>
{/if}

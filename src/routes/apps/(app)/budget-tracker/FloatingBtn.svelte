<script lang="ts">
	import { ArrowUp } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { fade } from 'svelte/transition';
	import { scrollToTop } from '@/utils';
</script>

<span class="md:hidden" transition:fade={{ duration: 300 }}>
	<Button
		variant="outline"
		size="icon"
		class="sticky bottom-4 left-8 z-50 mb-5 mt-8"
		onclick={() => scrollToTop()}
	>
		<ArrowUp class="h-4 w-4" />
	</Button>
</span>

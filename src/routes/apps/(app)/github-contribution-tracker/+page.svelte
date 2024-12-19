<script lang="ts">
	import UnderConstruction from '@/components/blocks/UnderConstruction.svelte';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>

<UnderConstruction/>
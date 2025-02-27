<script lang="ts">
  import { onMount } from 'svelte';
  import { incrementAppUsage } from '$lib/utils';
  
  // The app link/identifier to track
  export let appLink: string;
  
  onMount(() => {
    // Increment usage count when component is mounted
    incrementAppUsage(appLink);
  });
</script>

<!-- This is an invisible component that just tracks app usage -->

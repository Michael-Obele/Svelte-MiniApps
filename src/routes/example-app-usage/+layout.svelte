<script lang="ts">
  import AppTracker from '@/blocks/AppTracker.svelte';
  
  // The current app link/identifier
  const appLink = 'example-app-usage';
</script>

<!-- Include the AppTracker component to track usage -->
<AppTracker appLink={appLink} />

<!-- The actual app layout content -->
<div class="container mx-auto p-4">
  <slot />
</div>

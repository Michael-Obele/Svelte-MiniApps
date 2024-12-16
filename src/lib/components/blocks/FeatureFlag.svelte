<script lang="ts">
    interface Props {
        children?: import('svelte').Snippet;
    }

    let { children }: Props = $props();
    if (import.meta.env.VITE_FEATURE_FLAG) {
        console.log('Feature flag is enabled');
    }
    </script>

{#if import.meta.env.VITE_FEATURE_FLAG}
{@render children?.()}
{/if}
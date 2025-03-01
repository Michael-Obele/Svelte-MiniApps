<script lang="ts">
  import { site } from '$lib/index';

  export let title: string;
  export let description: string;
  export let keywords: string;
  export let route: string;
  export let image: string | undefined = site.image;
  export let author: string | undefined = 'Michael Obele';

  $: ogTitle = title;
  $: ogDescription = description;
  $: ogUrl = `${site.url}${route}`;
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta name="keywords" content={keywords} />
  <meta name="author" content={author} />

  <!-- Open Graph / Facebook -->
  <meta property="og:title" content={ogTitle} />
  <meta property="og:description" content={ogDescription} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={ogUrl} />
  {#if image}
    <meta property="og:image" content={image} />
  {/if}

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={ogTitle} />
  <meta name="twitter:description" content={ogDescription} />
  {#if image}
    <meta name="twitter:image" content={image} />
  {/if}
</svelte:head>
<!--
@component

InfoBlocks — displays promotional content about Svelte Mini Apps features and benefits.

Usage:
```svelte
<InfoBlocks />
```

-->
<script lang="ts">
	import { ContentBlock } from './index';
	import { getContentBlocksData } from './data.svelte';

	// ✅ Call the function to get reactive translated data
	let contentBlocksData = $derived(getContentBlocksData());
</script>

<section class="bg-background text-foreground w-full overflow-hidden py-16 md:py-24 lg:py-32">
	<div class="px-4 md:px-6 xl:container">
		<div class="flex flex-col space-y-8 sm:space-y-12">
			{#each contentBlocksData as block, index (index)}
				<!-- Staircase layout: straight on mobile, progressively indented on larger screens -->
				<section
					class="group w-full transition-all duration-300 md:mr-auto md:max-w-3xl lg:max-w-4xl"
					class:md:ml-[0%]={index === 0}
					class:md:ml-[8%]={index === 1}
					class:md:ml-[16%]={index === 2}
					class:md:ml-[24%]={index === 3}
				>
					<ContentBlock>
						{#snippet header()}
							<div class="w-full cursor-pointer">
								{#each block.header.text as segment, i (segment.content)}
									<span
										class="{segment.type === 'strong'
											? 'font-bold text-red-600 transition-colors group-hover:text-red-700 dark:text-red-500'
											: 'font-semibold'} {i > 0 ? 'ml-3' : ''}"
									>
										{segment.content}
									</span>
								{/each}
								<lord-icon
									target="section"
									src="https://cdn.lordicon.com/{block.iconId}.json"
									colors="primary:red,secondary:green"
									trigger="loop-on-hover"
									state="morph-heart"
									class="ml-3 inline-block size-14 align-middle transition-transform hover:scale-110 sm:size-16"
								>
								</lord-icon>
							</div>
						{/snippet}
						{#snippet paragraph()}
							<span class="text-muted-foreground leading-relaxed text-wrap">
								{block.paragraph}
							</span>
						{/snippet}
					</ContentBlock>
				</section>

				<!-- Connector line showing the staircase progression (hidden on mobile) -->
				{#if index < contentBlocksData.length - 1}
					<div
						class="hidden h-px bg-gradient-to-r from-red-200 to-transparent md:block dark:from-red-800/50"
						class:md:ml-[4%]={index === 0}
						class:md:ml-[12%]={index === 1}
						class:md:ml-[20%]={index === 2}
						class:md:w-[8%]={true}
					></div>
				{/if}
			{/each}
		</div>
	</div>
</section>

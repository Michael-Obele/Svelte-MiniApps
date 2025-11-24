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

<section class="w-full overflow-hidden bg-background py-16 text-foreground md:py-24 lg:py-32">
	<div class="px-4 xl:container md:px-6">
		<div class="flex flex-col space-y-8 sm:space-y-12">
			{#each contentBlocksData as block, index (index)}
				<!-- Staircase layout: straight on mobile, progressively indented on larger screens -->
				<div
					class="group w-full transition-all duration-300 md:mr-auto md:max-w-3xl lg:max-w-4xl"
					class:md:ml-[0%]={index === 0}
					class:md:ml-[8%]={index === 1}
					class:md:ml-[16%]={index === 2}
					class:md:ml-[24%]={index === 3}
				>
					<ContentBlock iconId={block.iconId}>
						{#snippet header()}
							<div class="flex items-center space-x-3">
								{#each block.header.text as segment (segment.content)}
									<span
										class={segment.type === 'strong'
											? 'font-bold text-red-600 transition-colors group-hover:text-red-700 dark:text-red-500'
											: 'font-semibold'}
									>
										{segment.content}
									</span>
								{/each}
							</div>
						{/snippet}
						{#snippet paragraph()}
							<span class="leading-relaxed text-muted-foreground">
								{block.paragraph}
							</span>
						{/snippet}
					</ContentBlock>
				</div>

				<!-- Connector line showing the staircase progression (hidden on mobile) -->
				{#if index < contentBlocksData.length - 1}
					<div
						class="hidden h-px bg-gradient-to-r from-red-200 to-transparent dark:from-red-800/50 md:block"
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

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

<section class="w-full bg-background py-16 text-foreground md:py-24 lg:py-32">
	<div class="px-4 md:px-6 xl:container">
		<div class="flex flex-col items-center justify-center space-y-12 text-center sm:space-y-16">
			{#each contentBlocksData as block, index (index)}
				<div class="group transition-all duration-300 hover:scale-[1.02]">
					<ContentBlock iconId={block.iconId}>
						{#snippet header()}
							<div class="flex items-center justify-center space-x-2">
								{#each block.header.text as segment (segment.content)}
									<span
										class={segment.type === 'strong'
											? 'font-bold text-red-600 transition-colors dark:text-red-500 group-hover:text-red-700 dark:group-hover:text-red-400'
											: 'font-semibold'}
									>
										{segment.content}
									</span>
								{/each}
							</div>
						{/snippet}
						{#snippet paragraph()}
							<span class="text-muted-foreground leading-relaxed">
								{block.paragraph}
							</span>
						{/snippet}
					</ContentBlock>
				</div>

				<!-- Add subtle separator between blocks (except last one) -->
				{#if index < contentBlocksData.length - 1}
					<div
						class="h-px w-24 bg-gradient-to-r from-transparent via-red-200 to-transparent dark:via-red-800/50"
					></div>
				{/if}
			{/each}
		</div>
	</div>
</section>

<!--
@component

InfoBlocks — displays promotional content about Svelte MiniApps features and benefits.

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
</script><section class="w-full md:py-24 lg:py-32">
	<div class="px-4 md:px-6 xl:container">
		<div class="flex flex-col items-center justify-center space-y-4 text-center">
			{#each contentBlocksData as block}
				<ContentBlock iconId={block.iconId}>
					{#snippet header()}
						<div class="flex items-center justify-center space-x-2">
							{#each block.header.text as segment}
								<span
									class={segment.type === 'strong' ? 'font-bold text-[#F03E3E]' : 'font-semibold'}
								>
									{segment.content}
								</span>
							{/each}
						</div>
					{/snippet}
					{#snippet paragraph()}
						<span>
							{block.paragraph}
						</span>
					{/snippet}
				</ContentBlock>
			{/each}
		</div>
	</div>
</section>

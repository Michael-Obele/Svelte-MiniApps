<!--
@component

Content — displays community engagement section with feedback info blocks and call-to-action.

Usage:
```svelte
<Content />
```

-->
<script lang="ts">
	import { LordIcon, InfoBlock, ContentBlock } from './index';
	import { infoBlocksData } from './data';
</script>

<section class="w-full px-4 py-5 md:px-6 md:py-8 lg:py-10 xl:container">
	<div
		class="mx-auto max-w-(--breakpoint-xl) justify-center bg-white px-4 py-8 lg:py-16 xl:rounded-lg dark:bg-gray-900"
	>
		<div class="flex flex-col items-center justify-center space-y-4 text-center">
			<ContentBlock iconId={'xyboiuok'}>
				{#snippet header()}
					<div>
						<strong class="text-[#F03E3E]">Join</strong> the Journey
					</div>
				{/snippet}

				{#snippet paragraph()}
					<span>
						Every great tool starts with feedback from people like you. Here's how you can be part
						of making these apps even better:
					</span>
				{/snippet}
			</ContentBlock>
		</div>

		<div class="mx-auto space-y-10 px-4 py-8 text-center xl:container">
			<div class="mx-auto grid min-h-[80vh] max-w-[1024px] space-y-3 text-lg lg:text-2xl">
				{#each infoBlocksData as block}
					<InfoBlock dir={block.dir}>
						{#snippet icon()}
							<LordIcon
								dir={block.iconDir === 'left' || block.iconDir === 'right'
									? block.iconDir
									: undefined}
								src={block.iconId}
							/>
						{/snippet}
						{#snippet header()}
							<span>{block.header}</span>
						{/snippet}
						{#snippet paragraph()}
							<!-- eslint-disable-next-line svelte/no-at-html-tags -->
							<span>{@html block.paragraph}</span>
						{/snippet}
					</InfoBlock>
				{/each}

				<p class="mt-4 text-lg text-gray-800 dark:text-gray-200">
					Your insights and experiences help shape these tools into something truly useful. Whether
					it's sharing ideas, reporting issues, or just letting me know how you use the apps, every
					bit of feedback counts. Want to learn more about the project? Check out our
					<a class="text-[#F03E3E] hover:underline" href="/about">story</a>.
				</p>
			</div>
		</div>
	</div>
</section>

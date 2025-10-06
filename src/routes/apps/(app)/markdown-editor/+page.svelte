<script lang="ts">
	import RouteHead from '$lib/components/blocks/RouteHead.svelte';
	import DOMPurify from 'isomorphic-dompurify';
	import { Carta, MarkdownEditor, Markdown } from 'carta-md';
	import { code } from '@cartamd/plugin-code';
	import { slash } from '@cartamd/plugin-slash';
	import 'carta-md/default.css';
	import 'github-markdown-css';
	import '@cartamd/plugin-code/default.css';
	import '@cartamd/plugin-slash/default.css';
	import { browser } from '$app/environment';
	import { site } from '$lib/index';
	import { markdownDemo } from './data.svelte';
	import { PersistedState } from 'runed';
	import HowToUseDialog from '@/ui/HowToUseDialog.svelte';
	import { markdownEditorHowToUse } from './how-to-use-config';
	import { Button } from '@/ui/button';
	import { HelpCircle } from '@lucide/svelte';

	const carta = new Carta({
		sanitizer: false, // Use a sanitizer in production to prevent XSS
		extensions: [code({ theme: 'github-light' }), slash()],
		shikiOptions: {
			themes: ['github-light', 'github-dark']
		}
	});
	// Create Carta only in the browser and preload Shiki themes so code backgrounds
	// can switch between light/dark without showing a fixed black background.

	let value = new PersistedState('markdownContent', markdownDemo);

	let markdown = $state(value.current);
	let showHowToUseDialog = $state(false);

	if (value.current == null || value.current == '') {
		markdown = markdownDemo;
	}
</script>

<RouteHead
	title="Markdown Editor - Write and Preview Markdown with Ease"
	description="Experience a seamless Markdown editing with our Svelte and Carta-MD powered editor. Write, preview, and save your markdown content effortlessly."
	keywords="markdown editor, svelte, carta-md, markdown preview, markdown writing, text editor"
	route="/apps/markdown-editor"
/>

<div class="container mx-auto min-h-screen bg-gray-100 px-4 py-6 dark:bg-black">
	<div class="mx-auto max-w-4xl space-y-6">
		<div class="container mx-auto min-h-screen px-4 py-12">
			<div class="mx-auto flex max-w-4xl flex-col items-center space-y-8">
				<h1
					class="text-center text-5xl font-extrabold tracking-tight text-black sm:text-6xl dark:text-gray-100"
				>
					Markdown Editor
				</h1>
				<div
					class="max-w-3xl space-y-3 text-center text-lg leading-relaxed text-gray-600 sm:text-xl dark:text-gray-400"
				>
					<p>
						Write, preview, and edit Markdown with a lightweight, browser-based editor. Your content
						is automatically saved to localStorage so you won't lose changes.
					</p>
					<p>
						New to Markdown? See the <a
							href="https://www.markdownguide.org/basic-syntax/"
							target="_blank"
							rel="noopener noreferrer"
							class="text-blue-600 hover:underline dark:text-blue-400">Markdown guide</a
						> for quick syntax tips.
					</p>
				</div>
				<Button variant="outline" onclick={() => (showHowToUseDialog = true)}>
					<HelpCircle class="mr-2 size-4" />
					How to Use
				</Button>
			</div>
			<section class="mt-6">
				{#if browser}
					{#key value.current}
						<MarkdownEditor {carta} mode="tabs" bind:value={markdown} />
					{/key}
				{:else}
					<div class="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
						Loading editor…
					</div>
				{/if}
			</section>
		</div>
	</div>
</div>

<HowToUseDialog
	bind:open={showHowToUseDialog}
	title={markdownEditorHowToUse.title}
	description={markdownEditorHowToUse.description}
	tabs={markdownEditorHowToUse.tabs}
	showFooterHelpText={markdownEditorHowToUse.showFooterHelpText}
/>

<style global>
	/* Editor dark mode */
	/* Only if you are using the default theme */
	:global(.dark .carta-theme__default) {
		--border-color: var(--border-color-dark);
		--selection-color: var(--selection-color-dark);
		--focus-outline: var(--focus-outline-dark);
		--hover-color: var(--hover-color-dark);
		--caret-color: var(--caret-color-dark);
		--text-color: var(--text-color-dark);
	}

	/* Code dark mode */
	/* Only if you didn't specify a custom code theme */
	/* Shiki / Carta can include highly-specific CSS; provide a fallback so pre/code
	   and shiki elements follow the app theme variables (background/text). */
	:global(.shiki),
	:global(.shiki span),
	:global(pre[class*='language-']),
	:global(code[class*='language-']),
	:global(.carta-renderer pre),
	:global(.carta-renderer code) {
		background-color: var(--color-background) !important;
		color: var(--text-color) !important;
	}

	/* Ensure tables inside the renderer use the theme colors */
	:global(.carta-renderer table),
	:global(.markdown-body table) {
		background-color: var(--color-background) !important;
		color: var(--color-foreground) !important;
	}

	:global(.markdown-body) {
		box-sizing: border-box;
		min-width: 100px;
		max-width: 980px;
		margin: 0 auto;
		padding: 45px;
		background-color: var(--color-background);

		@media (max-width: 767px) {
			padding: 15px;
		}
	}

	:global {
		.carta-input,
		.carta-renderer {
			min-height: 120px;
			max-height: 60vh;
			overflow: auto;
		}
		.carta-renderer {
			background-color: var(--color-background);
			color: var(--text-color);
		}
	}

	/* Strong overrides to prevent vendor @media(prefers-color-scheme: dark) styles
   from forcing a dark palette inside the preview. We map common GitHub/Shiki
   variables to our app variables and force background/color so the preview
   follows the site theme (html .dark) rather than OS media queries. */
	:global(.markdown-body),
	:global(.carta-renderer) {
		/* Force the app theme colors for the preview */
		background-color: var(--color-background) !important;
		color: var(--color-foreground) !important;

		/* Map commonly-used vendor variables to our app vars so token CSS resolves
	   to the correct colors regardless of media queries. */
		--fgColor-default: var(--color-foreground) !important;
		--fgColor-muted: var(--color-foreground) !important;
		--shiki-dark: var(--color-foreground) !important;
		--shiki-dark-bg: var(--color-background) !important;
		--shiki-light: var(--color-foreground) !important;
		--shiki-light-bg: var(--color-background) !important;
		--bgColor-default: var(--color-background) !important;
		--bgColor-muted: var(--color-background) !important;
		--borderColor-default: var(--border-color, rgba(0, 0, 0, 0.12)) !important;
	}

	/* Respect site-driven theme switch (html.dark). These selectors ensure the
   preview's color-scheme hint and variables follow the site class, not OS. */
	html.dark :global(.markdown-body),
	html.dark :global(.carta-renderer),
	[data-theme='dark'] :global(.markdown-body),
	[data-theme='dark'] :global(.carta-renderer) {
		color-scheme: dark !important;
		background-color: var(--color-background) !important;
		color: var(--color-foreground) !important;
	}

	html:not(.dark) :global(.markdown-body),
	html:not(.dark) :global(.carta-renderer),
	:not([data-theme='dark']) :global(.markdown-body),
	:not([data-theme='dark']) :global(.carta-renderer) {
		color-scheme: light !important;
		background-color: var(--color-background) !important;
		color: var(--color-foreground) !important;
	}
</style>

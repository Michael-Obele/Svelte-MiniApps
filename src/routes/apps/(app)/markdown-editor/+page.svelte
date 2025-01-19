<script lang="ts">
	import DOMPurify from 'isomorphic-dompurify';
	import { Carta, MarkdownEditor, Markdown } from 'carta-md';
	import { code } from '@cartamd/plugin-code';
	import { slash } from '@cartamd/plugin-slash';
	import 'carta-md/default.css';
	import 'github-markdown-css';
	import '@cartamd/plugin-code/default.css';
	import '@cartamd/plugin-slash/default.css';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { site } from '$lib/index';

	const carta = new Carta({
		sanitizer: false, // Use a sanitizer in production to prevent XSS
		extensions: [code(), slash()]
	});

	let value: string = $state('');
	if (browser) value = localStorage.getItem('markdownContent') || '';

	$effect(() => {
		if (browser) localStorage.setItem('markdownContent', value || '');
	});
</script>

<svelte:head>
	<title>Markdown Editor - Write and Preview Markdown with Ease</title>
	<meta
		name="description"
		content="Experience a seamless Markdown editing with our Svelte and Carta-MD powered editor. Write, preview, and save your markdown content effortlessly."
	/>
	<meta
		name="keywords"
		content="markdown editor, svelte, carta-md, markdown preview, markdown writing, text editor"
	/>
	<meta name="author" content="Michael Obele" />
	<meta property="og:title" content="Markdown Editor - Svelte & Carta-MD" />
	<meta
		property="og:description"
		content="A user-friendly Markdown Editor for writing and previewing markdown text."
	/>
	<meta property="og:type" content="website" />
	<meta property="og:url" content="{site.url}/apps/markdown-editor" />
	<meta property="og:image" content={site.image} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Markdown Editor - Svelte & Carta-MD" />
	<meta
		name="twitter:description"
		content="A user-friendly Markdown Editor for writing and previewing markdown text."
	/>
	<meta name="twitter:image" content={site.image} />
</svelte:head>

<div class="container mx-auto min-h-screen bg-gray-100 px-4 py-6 dark:bg-black">
	<div class="mx-auto max-w-4xl space-y-6">
		<div class="container mx-auto min-h-screen px-4 py-12">
			<div class="mx-auto flex max-w-4xl flex-col items-center space-y-8">
				<h1
					class="bg-gradient-to-r from-red-500 via-black to-green-500 bg-clip-text text-center text-5xl font-extrabold tracking-tight text-gray-900 text-transparent dark:text-gray-100 sm:text-6xl"
				>
					Markdown Editor
				</h1>
				<div
					class="max-w-3xl space-y-3 text-center text-lg leading-relaxed text-gray-600 dark:text-gray-400 sm:text-xl"
				>
					<p>
						Welcome to my <strong class="text-red-600 dark:text-green-400">Markdown Editor</strong>!
						Here, you can easily write, see, and tweak your markdown. Best of all, everything you
						write is automatically saved to your browser's localStorage, so you won't lose your
						work.
					</p>
					<p>
						Whether you're jotting down notes, blogging, or organizing ideas, this tool is designed
						to make your writing life simpler and more productive. Enjoy the blend of simplicity and
						power in this little project of mine!
					</p>
				</div>
			</div>
			<section class="mt-6">
				<MarkdownEditor {carta} mode="tabs" bind:value />
			</section>
		</div>
	</div>
</div>

<style>
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
	:global(html.dark .shiki, html.dark .shiki span) {
		color: var(--shiki-dark) !important;
	}

	:global(.markdown-body) {
		box-sizing: border-box;
		min-width: 200px;
		max-width: 980px;
		margin: 0 auto;
		padding: 45px;

		@media (max-width: 767px) {
			padding: 15px;
		}
	}
</style>

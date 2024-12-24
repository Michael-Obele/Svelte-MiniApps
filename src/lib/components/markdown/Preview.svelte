<script lang="ts">
	import DOMPurify from 'dompurify';
	interface Props {
		html: string | Promise<string>;
	}

	let { html }: Props = $props();

	let sanitizedHTML = $state('');

	// Reactive statement to handle both string and Promise<string>
	$effect(() => {
		if (html instanceof Promise) {
			html.then((resolvedHtml) => {
				sanitizedHTML = DOMPurify.sanitize(resolvedHtml);
			});
		} else {
			sanitizedHTML = DOMPurify.sanitize(html);
		}
	});
</script>

<div class="prose prose-sm prose-a:text-primary min-h-40 w-full min-w-max max-w-none bg-muted p-4">
	{@html sanitizedHTML}
</div>

<!-- <div class="preview-container">
	{@html sanitizedHTML}
</div>

<style>
	.preview-container {
		min-height: 10rem; /* Adjust as needed */
		max-width: none; /* Adjust as needed */
		background-color: var(--bg-muted); /* Use your defined CSS variable */
		padding: 1rem; /* Adjust padding as needed */
		border-radius: 0.5rem; /* Rounded corners */
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); /* Light shadow */
	}

	.preview-container h1,
	.preview-container h2,
	.preview-container h3,
	.preview-container h4 {
		color: var(--text-primary); /* Heading colors */
	}

	.preview-container p {
		color: var(--text-secondary); /* Paragraph colors */
	}

	.preview-container ul,
	.preview-container ol {
		padding-left: 1.5rem; /* Indentation for lists */
	}

	.preview-container li {
		margin-bottom: 0.5rem; /* Spacing between list items */
	}

	.preview-container blockquote {
		border-left: 4px solid var(--border-color); /* Blockquote styles */
		padding-left: 1rem;
		font-style: italic;
		color: var(--text-secondary);
	}

	.preview-container code {
		background-color: var(--bg-muted); /* Inline code styles */
		padding: 0.2rem 0.4rem;
		border-radius: 0.25rem;
	}

	.preview-container pre {
		background-color: var(--bg-muted);
		padding: 1rem;
		border-radius: 0.5rem; /* Preformatted text styles */
		overflow-x: auto; /* Allow horizontal scrolling */
	}

	.preview-container img {
		max-width: 100%; /* Responsive images */
		height: auto;
		border-radius: 0.25rem; /* Rounded corners for images */
	}

	.preview-container a {
		color: var(--text-primary); /* Link styles */
		text-decoration: underline;
	}
</style> -->

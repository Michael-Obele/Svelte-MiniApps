<script lang="ts">
	import { run } from 'svelte/legacy';

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

<div class="prose prose-sm prose-a:text-primary min-h-40 max-w-none bg-muted p-4">
	{@html sanitizedHTML}
</div>

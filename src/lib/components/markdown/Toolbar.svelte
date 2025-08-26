<script lang="ts">
	import {
		Bold,
		Italic,
		Strikethrough,
		Code,
		Heading,
		List,
		ListOrdered,
		TextQuote,
		SeparatorHorizontal,
		Link,
		Image
	} from '@lucide/svelte';

	import { Button } from '@/ui/button';

	interface Props {
		value: string; // Make value a prop
		onChange: (newValue: string) => void; // Callback to update the value
	}

	let { value = $bindable(''), onChange }: Props = $props();

	const insertMarkdown = (prefix: string, suffix: string = '') => {
		const textarea = document.querySelector('textarea');
		if (!textarea) return; // Handle the case where no textarea is found

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const selected = textarea.value.substring(start, end);

		// Update the value with the new pattern
		const newValue = value.substring(0, start) + prefix + selected + suffix + value.substring(end);

		// Update the textarea value and selection
		textarea.value = newValue;
		textarea.selectionStart = start + prefix.length;
		textarea.selectionEnd = start + prefix.length;

		// Call the onChange callback to update the value in the parent component
		onChange(newValue);
	};
</script>

<div class="flex gap-2 bg-muted p-2">
	<Button variant="ghost" size="sm" onclick={() => insertMarkdown('**', '**')}>
		<Bold class="size-4" />
	</Button>
	<Button variant="ghost" size="sm" onclick={() => insertMarkdown('_', '_')}>
		<Italic class="size-4" />
	</Button>
	<Button variant="ghost" size="sm" onclick={() => insertMarkdown('~~', '~~')}>
		<Strikethrough class="size-4" />
	</Button>
	<Button variant="ghost" size="sm" onclick={() => insertMarkdown('```\n', '\n```')}>
		<Code class="size-4" />
	</Button>
	<Button variant="ghost" size="sm" onclick={() => insertMarkdown('# ', '')}>
		<Heading class="size-4" />
	</Button>
	<Button variant="ghost" size="sm" onclick={() => insertMarkdown('- ', '')}>
		<List class="size-4" />
	</Button>
	<Button variant="ghost" size="sm" onclick={() => insertMarkdown('1. ', '')}>
		<ListOrdered class="size-4" />
	</Button>
	<Button variant="ghost" size="sm" onclick={() => insertMarkdown('> ', '')}>
		<TextQuote class="size-4" />
	</Button>
	<Button variant="ghost" size="sm" onclick={() => insertMarkdown('\n---\n', '')}>
		<SeparatorHorizontal class="size-4" />
	</Button>
	<Button variant="ghost" size="sm" onclick={() => insertMarkdown('[](http://)', `[', ']`)}>
		<Link class="size-4" />
	</Button>
	<Button variant="ghost" size="sm" onclick={() => insertMarkdown('![](http://)', `![', ']`)}>
		<Image class="size-4" />
	</Button>
</div>

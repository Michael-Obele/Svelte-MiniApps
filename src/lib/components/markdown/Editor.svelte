<script lang="ts">
	export let value: string; // Make value a prop
	export let onInput: (newValue: string) => void; // Define onInput as a prop

	const handleInput = (event: InputEvent) => {
		const target = event.target as HTMLTextAreaElement;
		onInput(target.value); // Call onInput with the string value
	};
</script>

<textarea
	bind:value
	oninput={() => handleInput}
	class="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
	placeholder="Write your markdown here..."
></textarea>

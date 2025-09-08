<script lang="ts">
	let { class: className = '' }: { class?: string } = $props();
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	width="24"
	height="24"
	viewBox="0 0 24 24"
	class={className}
	fill="none"
>
	<path
		fill="none"
		stroke="currentColor"
		stroke-linejoin="round"
		stroke-width="1.5"
		d="M12 11.496C11.894 11.296 7.455 3 3.504 3c-2.168 0-1.5 5-1 7.5c.203 1.01 1 4 5.499 3.5c0 0-3.999.5-3.999 3c0 1.5 2.5 4 4.499 4c1.958 0 3.436-4.314 3.497-4.494c.06.18 1.54 4.494 3.497 4.494c2 0 4.499-2.5 4.499-4c0-2.5-3.999-3-3.999-3c4.499.5 5.297-2.49 5.499-3.5c.5-2.5 1.168-7.5-1-7.5c-3.95 0-8.39 8.296-8.496 8.496Z"
	/>
</svg>

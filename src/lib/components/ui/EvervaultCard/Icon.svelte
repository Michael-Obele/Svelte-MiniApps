<script lang="ts">
	export let className: string | undefined = undefined;
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	fill="none"
	viewBox="0 0 24 24"
	stroke-width="1.5"
	stroke="currentColor"
	class={className}
	{...$$props}
>
	<path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m6-6H6" />
</svg>

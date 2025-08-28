<script lang="ts">
	let { image, alt, class: className = '' } = $props();
	import { cn } from '$lib/utils';
</script>

<div
	class={cn(
		'm-2 mx-5 flex size-52 max-h-[75vw] max-w-[75vw] items-center justify-center rounded-lg bg-linear-to-r from-primary/30 to-primary/80 text-center md:size-96',
		className
	)}
>
	<enhanced:img src={image} {alt} />
</div>

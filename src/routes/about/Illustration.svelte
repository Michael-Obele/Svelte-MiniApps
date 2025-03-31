<script lang="ts">
	let { image, alt, class: className = '' } = $props();
</script>

<div
	class={[
		'm-2 mx-5 flex size-52 max-h-[75vw] max-w-[75vw] items-center justify-center rounded-lg bg-gradient-to-r from-primary/30 to-primary/80 text-center md:size-96',
		className
	]}
>
	<enhanced:img src={image} {alt} />
</div>

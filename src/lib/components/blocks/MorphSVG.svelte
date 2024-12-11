<script>
	// @ts-nocheck

	import { Motion, M } from 'svelte-motion';
</script>

<svg
	width={200}
	height={200}
	class="rounded-3xl bg-white"
	stroke="#70f"
	stroke-width={20}
	stroke-linecap="round"
	fill="transparent"
>
	<M.path />
	<Motion
		isSVG={true}
		animate={{
			d: [
				'M 40,40 Q 160,40 160,160',
				'M 160,40 Q 100,100 40,160',
				'M 160,160 Q 100,160 40,160',
				'M 160,40 Q 100,160 40,40',
				'M 160,40 Q 100,40 40,40',
				'M 40,40 Q 160,40 160,160'
			]
		}}
		transition={{
			repeat: Infinity,
			ease: 'easeInOut',
			duration: 6,
			times: [0, 0.16, 0.33, 0.5, 0.66, 0.83]
		}}
		let:motion
	>
		<path d="M 40,40 Q 160,40 160,160" use:motion />
	</Motion>
</svg>

<svg
	width={100}
	height={100}
	viewBox="0 0 24 24"
	class="rounded-3xl bg-white"
	fill="none"
	stroke="#121331"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
>
	<Motion
		isSVG={true}
		animate={{
			d: [
				'M15 6H21V12', // Initial Path 1
				'M15 12H21V6', // Reverse Path 1
				'M15 12L3 6', // Diagonal movement
				'M3 17L21 6' // Final Path 2
			]
		}}
		transition={{
			repeat: Infinity,
			ease: 'easeInOut',
			duration: 4, // 4 seconds per loop
			times: [0, 0.33, 0.66, 1] // Timing points for each segment
		}}
		let:motion
	>
		<path d="M15 6H21V12" use:motion />
	</Motion>
</svg>

<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { christmasState } from '$lib/stores/christmas.svelte';

	interface Snowflake {
		x: number;
		y: number;
		radius: number;
		speed: number;
		wind: number;
	}

	let { duration = 10000 } = $props();

	let canvas = $state<HTMLCanvasElement>();
	let ctx: CanvasRenderingContext2D | null = null;
	let width: number = 0;
	let height: number = 0;
	let snowflakes: Snowflake[] = [];
	let animationFrameId: number;
	let timer: ReturnType<typeof setTimeout>;

	const maxSnowflakes = 30;

	timer = setTimeout(() => {
		christmasState.stopSnow();
	}, duration);

	function createSnowflake(): Snowflake {
		return {
			x: Math.random() * width,
			y: Math.random() * height,
			radius: Math.random() * 3 + 1,
			speed: Math.random() * 1 + 0.5,
			wind: Math.random() * 0.5 - 0.25
		};
	}

	function update() {
		if (!ctx || !canvas) return;
		ctx.clearRect(0, 0, width, height);
		ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
		ctx.beginPath();

		for (let i = 0; i < snowflakes.length; i++) {
			let f = snowflakes[i];
			ctx.moveTo(f.x, f.y);
			ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2, true);

			f.y += f.speed;
			f.x += f.wind;

			if (f.y > height) {
				snowflakes[i] = createSnowflake();
				snowflakes[i].y = 0;
			}
		}

		ctx.fill();
		animationFrameId = requestAnimationFrame(update);
	}

	$effect(() => {
		width = window.innerWidth;
		height = window.innerHeight;

		if (canvas) {
			canvas.width = width;
			canvas.height = height;
			ctx = canvas.getContext('2d');
		}

		// Initialize snowflakes
		snowflakes = [];
		for (let i = 0; i < maxSnowflakes; i++) {
			snowflakes.push(createSnowflake());
		}

		update();

		const handleResize = () => {
			width = window.innerWidth;
			height = window.innerHeight;
			if (canvas) {
				canvas.width = width;
				canvas.height = height;
			}
		};

		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
			cancelAnimationFrame(animationFrameId);
			clearTimeout(timer);
		};
	});
</script>

{#if christmasState.isSnowing}
	<canvas
		bind:this={canvas}
		transition:fade={{ duration: 2000 }}
		class="pointer-events-none fixed top-0 left-0 z-50 h-full w-full"
		style="pointer-events: none;"
	></canvas>
{/if}

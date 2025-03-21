<script lang="ts">
	import { navigating } from '$app/state';
	import { Progress } from '@/ui/progress/index.js';
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';

	// Progress configuration
	const initialValue = 10; // Initial progress percentage
	const incrementInterval = 350; // ms between progress increments
	const randomIncrement = 15; // Max random increment per step
	
	// Custom prop to manually trigger the progress bar
	let { active = false } = $props<{ active?: boolean }>();

	let progressValue = $state(0);
	let visible = $state(false);
	let incrementTimer: ReturnType<typeof setInterval> | null = null;
	
	// Handle both navigation and manual trigger
	$effect(() => {
		if (navigating || active) {
			// Navigation started or manually triggered
			startProgress();
		} else if (!navigating && !active && visible) {
			// Navigation completed and not manually active
			completeProgress();
		}
	});

	function startProgress() {
		// Reset progress
		progressValue = 0;
		visible = true;
		progressValue = initialValue;
		
		// Start incrementing progress
		if (incrementTimer) clearInterval(incrementTimer);
		
		incrementTimer = setInterval(() => {
			// Add a random increment but keep progress under 90%
			const increment = Math.random() * randomIncrement;
			progressValue = Math.min(90, progressValue + increment);
		}, incrementInterval);
	}

	function completeProgress() {
		// Clear the increment timer
		if (incrementTimer) {
			clearInterval(incrementTimer);
			incrementTimer = null;
		}
		
		// Complete the progress and hide after animation
		progressValue = 100;
		setTimeout(() => {
			visible = false;
		}, 500); // Delay hiding to show the completion
	}

	// Clean up on component unmount
	onMount(() => {
		return () => {
			if (incrementTimer) {
				clearInterval(incrementTimer);
			}
		};
	});
</script>

{#if visible}
	<div 
		class="fixed top-0 left-0 z-50 w-full" 
		transition:fade={{ duration: 200 }}
	>
		<Progress value={progressValue} class="h-1 rounded-none" classInner="bg-primary" />
	</div>
{/if}

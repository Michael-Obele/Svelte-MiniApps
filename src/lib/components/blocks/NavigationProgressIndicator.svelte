<script lang="ts">
	import { navigating } from '$app/state';
	import { Progress } from '@/ui/progress/index.js';
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';

	// Progress configuration
	const initialValue = 10; // Initial progress percentage
	const incrementInterval = 300; // ms between progress increments
	const randomIncrement = 10; // Max random increment per step
	const minProgressTime = 800; // Minimum time to show progress (ms)
	const minimumVisibleDelay = 200; // Minimum load time before showing bar (ms)
	
	// Optional prop to manually trigger the progress bar (for non-navigation loading)
	let { active = false } = $props<{ active?: boolean }>();

	let progressValue = $state(0);
	let visible = $state(false);
	let incrementTimer: ReturnType<typeof setInterval> | null = null;
	let completeTimer: ReturnType<typeof setTimeout> | null = null;
	let showDelayTimer: ReturnType<typeof setTimeout> | null = null;
	let startTime = 0;
	
	// Handle both navigation and manual trigger
	$effect(() => {
		// Check if we're navigating to a new page or if manually activated
		if ((navigating && navigating.to) || active) {
			// Navigation started or manually triggered
			startProgress();
		} else if ((!navigating || !navigating.to) && !active && (visible || showDelayTimer)) {
			// Navigation completed and not manually active
			completeProgress();
		}
	});

	function startProgress() {
		// Reset timers if they exist
		if (incrementTimer) clearInterval(incrementTimer);
		if (completeTimer) clearTimeout(completeTimer);
		if (showDelayTimer) clearTimeout(showDelayTimer);
		
		// Record start time
		startTime = Date.now();
		
		// Reset progress
		progressValue = 0;
		visible = false;
		
		// Only show the bar if loading lasts longer than minimumVisibleDelay
		showDelayTimer = setTimeout(() => {
			visible = true;
			progressValue = initialValue;
			// Start incrementing progress
			incrementTimer = setInterval(() => {
				// Add a random increment but keep progress under 90%
				const increment = Math.random() * randomIncrement;
				progressValue = Math.min(90, progressValue + increment);
			}, incrementInterval);
		}, minimumVisibleDelay);
	}

	function completeProgress() {
		// Clear the increment timer
		if (incrementTimer) {
			clearInterval(incrementTimer);
			incrementTimer = null;
		}
		if (showDelayTimer) {
			clearTimeout(showDelayTimer);
			showDelayTimer = null;
		}
		
		// Calculate elapsed time
		const elapsedTime = Date.now() - startTime;
		const remainingTime = Math.max(0, minProgressTime - elapsedTime);
		
		// If the bar was never shown (very fast load), skip animation
		if (!visible) {
			progressValue = 0;
			return;
		}
		
		// Complete the progress after ensuring minimum display time
		completeTimer = setTimeout(() => {
			// Complete the progress
			progressValue = 100;
			
			// Hide after completion animation
			setTimeout(() => {
				visible = false;
			}, 300);
		}, remainingTime);
	}

	// Clean up on component unmount
	onMount(() => {
		return () => {
			if (incrementTimer) clearInterval(incrementTimer);
			if (completeTimer) clearTimeout(completeTimer);
			if (showDelayTimer) clearTimeout(showDelayTimer);
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

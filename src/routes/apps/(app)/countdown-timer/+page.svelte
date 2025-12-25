<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { Plus } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import TimerCard from '$lib/components/countdown/TimerCard.svelte';
	import AddTimerModal from '$lib/components/countdown/AddTimerModal.svelte';
	import { browser } from '$app/environment';
	import { flip } from 'svelte/animate';

	// State
	let timers = $state<
		{
			id: string;
			title: string;
			targetDate: string; // ISO string
			color: string;
		}[]
	>([]);

	let isModalOpen = $state(false);
	let editingTimer = $state<{
		id: string;
		title: string;
		targetDate: string;
		color: string;
	} | null>(null);

	// Load from local storage
	onMount(() => {
		if (browser) {
			const saved = localStorage.getItem('countdown-timers');
			if (saved) {
				timers = JSON.parse(saved);
			} else {
				// Default "New Year" timer
				const currentYear = new Date().getFullYear();
				timers = [
					{
						id: crypto.randomUUID(),
						title: `New Year ${currentYear + 1}`,
						targetDate: `${currentYear + 1}-01-01T00:00:00`,
						color: 'text-slate-900 dark:text-slate-100'
					}
				];
			}
		}
	});

	// Save to local storage effect
	$effect(() => {
		if (browser) {
			localStorage.setItem('countdown-timers', JSON.stringify(timers));
		}
	});

	function handleSaveTimer(timerData: { title: string; targetDate: string; color: string }) {
		if (editingTimer) {
			// Update existing
			timers = timers.map((t) => (t.id === editingTimer!.id ? { ...t, ...timerData } : t));
			editingTimer = null;
		} else {
			// Create new
			timers = [...timers, { id: crypto.randomUUID(), ...timerData }];
		}
		isModalOpen = false;
	}

	function removeTimer(id: string) {
		timers = timers.filter((t) => t.id !== id);
	}

	function startEdit(timer: (typeof timers)[0]) {
		editingTimer = timer;
		isModalOpen = true;
	}

	function startNew() {
		editingTimer = null;
		isModalOpen = true;
	}
</script>

<div class="container mx-auto max-w-5xl px-4 py-12 md:py-20">
	<!-- Minimalist Header -->
	<header class="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
		<div>
			<h1 class="text-foreground text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
				Countdown
			</h1>
			<p class="text-muted-foreground mt-2">Focus on the moments that matter.</p>
		</div>

		<div class="flex-shrink-0">
			<Button
				variant="default"
				size="lg"
				onclick={startNew}
				class="rounded-full px-6 shadow-sm transition-all hover:shadow"
			>
				<Plus class="mr-2 h-4 w-4" />
				New Timer
			</Button>
		</div>
	</header>

	{#if timers.length === 0}
		<div
			in:fade
			class="border-muted bg-muted/10 flex flex-col items-center justify-center rounded-2xl border border-dashed py-32 text-center"
		>
			<p class="text-foreground text-xl font-medium">No active timers.</p>
			<p class="text-muted-foreground mt-2">Time is ticking. What are you waiting for?</p>
			<Button variant="link" onclick={startNew} class="mt-4">Create one now</Button>
		</div>
	{:else}
		<div class="grid gap-6 lg:grid-cols-2">
			{#each timers as timer (timer.id)}
				<div animate:flip={{ duration: 300 }} in:fly={{ y: 20, duration: 300 }}>
					<TimerCard
						{timer}
						onDelete={() => removeTimer(timer.id)}
						onEdit={() => startEdit(timer)}
					/>
				</div>
			{/each}
		</div>
	{/if}

	<AddTimerModal bind:open={isModalOpen} bind:editingTimer onSave={handleSaveTimer} />
</div>

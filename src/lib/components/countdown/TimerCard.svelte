<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Trash2, Clock, CalendarDays, MoreHorizontal, Pencil } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import confetti from 'canvas-confetti';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';

	let { timer, onDelete, onEdit } = $props<{
		timer: { id: string; title: string; targetDate: string; color: string };
		onDelete: () => void;
		onEdit: () => void;
	}>();

	let timeLeft = $state({ days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 });
	let isFinished = $state(false);
	let showedConfetti = $state(false);

	let interval: ReturnType<typeof setInterval>;

	function calculateTime() {
		const target = new Date(timer.targetDate).getTime();
		const now = new Date().getTime();
		const difference = target - now;

		// If target changed (e.g. edited), minimal visual reset might be needed,
		// but reactive state handles most.
		// We do need to reset confetti if we moved the date forward.
		if (difference > 0 && isFinished) {
			isFinished = false;
			showedConfetti = false;
		}

		if (difference <= 0) {
			timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
			if (!isFinished) {
				isFinished = true;
				if (!showedConfetti) {
					fireConfetti();
					showedConfetti = true;
				}
			}
			return;
		}

		const days = Math.floor(difference / (1000 * 60 * 60 * 24));
		const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((difference % (1000 * 60)) / 1000);

		timeLeft = { days, hours, minutes, seconds, totalSeconds: difference / 1000 };
	}

	function fireConfetti() {
		const duration = 3000;
		const animationEnd = Date.now() + duration;
		const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
		const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

		const interval: any = setInterval(function () {
			const timeLeft = animationEnd - Date.now();
			if (timeLeft <= 0) return clearInterval(interval);
			const particleCount = 50 * (timeLeft / duration);
			confetti(
				Object.assign({}, defaults, {
					particleCount,
					origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
				})
			);
			confetti(
				Object.assign({}, defaults, {
					particleCount,
					origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
				})
			);
		}, 250);
	}

	onMount(() => {
		calculateTime();
		interval = setInterval(calculateTime, 1000);
	});

	onDestroy(() => {
		if (interval) clearInterval(interval);
	});

	// Format helper for 0-padding
	const fmt = (n: number) => n.toString().padStart(2, '0');
</script>

<div class="group relative overflow-visible">
	<!-- Main Card -->
	<div
		class={cn(
			'bg-card text-card-foreground relative flex flex-col justify-between overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 hover:shadow-md',
			isFinished ? 'ring-primary/20 ring-2' : ''
		)}
	>
		<!-- Header -->
		<div class="flex items-start justify-between p-6 pb-2">
			<h3
				class={cn(
					'line-clamp-2 text-lg font-bold tracking-tight',
					timer.color // Text color accent
				)}
			>
				{timer.title}
			</h3>

			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					<Button
						variant="ghost"
						size="icon"
						class="text-muted-foreground hover:text-foreground h-8 w-8"
					>
						<MoreHorizontal class="h-4 w-4" />
						<span class="sr-only">Actions</span>
					</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end">
					<DropdownMenu.Item onclick={onEdit}>
						<Pencil class="mr-2 h-4 w-4" />
						Edit
					</DropdownMenu.Item>
					<DropdownMenu.Item class="text-destructive focus:text-destructive" onclick={onDelete}>
						<Trash2 class="mr-2 h-4 w-4" />
						Delete
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>

		<!-- Timer Display -->
		<div class="px-6 py-8">
			{#if isFinished}
				<div class="flex flex-col items-center justify-center py-2 text-center">
					<span class="animate-bounce text-4xl">🎉</span>
					<span class="text-foreground mt-4 text-xl font-bold">Complete</span>
					<span class="text-muted-foreground text-sm">
						{new Date(timer.targetDate).toLocaleDateString()}
					</span>
				</div>
			{:else}
				<div class="flex items-baseline justify-center gap-1 font-mono sm:gap-3">
					<div class="flex flex-col items-center">
						<span class="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl"
							>{timeLeft.days}</span
						>
						<span
							class="text-muted-foreground mt-1 text-[10px] font-medium tracking-widest uppercase"
							>Days</span
						>
					</div>
					<span class="text-muted-foreground/30 mt-1 self-start text-2xl font-light sm:text-4xl"
						>:</span
					>
					<div class="flex flex-col items-center">
						<span class="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl"
							>{fmt(timeLeft.hours)}</span
						>
						<span
							class="text-muted-foreground mt-1 text-[10px] font-medium tracking-widest uppercase"
							>Hr</span
						>
					</div>
					<span class="text-muted-foreground/30 mt-1 self-start text-2xl font-light sm:text-4xl"
						>:</span
					>
					<div class="flex flex-col items-center">
						<span class="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl"
							>{fmt(timeLeft.minutes)}</span
						>
						<span
							class="text-muted-foreground mt-1 text-[10px] font-medium tracking-widest uppercase"
							>Min</span
						>
					</div>
					<span class="text-muted-foreground/30 mt-1 self-start text-2xl font-light sm:text-4xl"
						>:</span
					>
					<div class="flex flex-col items-center">
						<span
							class={cn('text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl', timer.color)}
							>{fmt(timeLeft.seconds)}</span
						>
						<span class={cn('mt-1 text-[10px] font-medium tracking-widest uppercase', timer.color)}
							>Sec</span
						>
					</div>
				</div>
			{/if}
		</div>

		<!-- Footer Info -->
		<div
			class="bg-muted/30 text-muted-foreground flex items-center justify-between border-t px-6 py-3 text-xs"
		>
			<span class="flex items-center gap-1.5">
				<CalendarDays class="h-3 w-3" />
				{new Date(timer.targetDate).toLocaleDateString(undefined, {
					weekday: 'short',
					month: 'short',
					day: 'numeric'
				})}
			</span>
			<span class="flex items-center gap-1.5">
				<Clock class="h-3 w-3" />
				{new Date(timer.targetDate).toLocaleTimeString(undefined, { timeStyle: 'short' })}
			</span>
		</div>
	</div>
</div>

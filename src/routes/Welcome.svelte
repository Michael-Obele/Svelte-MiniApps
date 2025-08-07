<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import { generateMantra, getGreetingAndNextPeriod } from '$lib/utility/greetings';
	import { RefreshCw, Star, StarOff } from 'lucide-svelte';
	import BlurInText from '@/blocks/BlurInText.svelte';
	import BlurFade from '@/blocks/BlurFade.svelte';
	import { enhance } from '$app/forms';
	import { Skeleton } from '@/ui/skeleton';
	import { invalidate } from '$app/navigation';
	import { Button } from '@/ui/button';

	let greeting = $state(getGreetingAndNextPeriod().greeting);

	let mantra = $state(generateMantra());

	function handleGenerate() {
		mantra = generateMantra();
	}

	// Update greeting when time period changes
	$effect(() => {
		const timeoutId = setTimeout(() => {
			greeting = getGreetingAndNextPeriod().greeting;
			// Recursively set the next timeout
			timeoutId.refresh();
		}, getGreetingAndNextPeriod().millisecondsUntilNext);

		return () => clearTimeout(timeoutId);
	});

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let isLoading = $state(false);
	let isLiked = $state(false);

	function handleSubmit() {
		isLoading = true;
		return async ({ update }: { update: () => Promise<void> }) => {
			await update();
			isLoading = false;
		};
	}

	$effect(() => {
		invalidate('mantra');
	});

	const handleLike = () => {
		isLiked = true;
		return async ({ update }: any) => {
			await update();
			isLiked = false;
		};
	};

	let likeState = $state(''); // Initialize a reactive variable for like state

	// Assuming `data` contains the response from the server
	$effect(() => {
		$inspect('Form', form?.like);
		$inspect('Data', data.like);
		$inspect('Like State', likeState);
		likeState = (form?.like ?? data.like) ? 'unlike' : 'like';
	});
</script>

<header class="mx-auto my-12 flex flex-col justify-center space-y-2">
	<BlurFade delay={0.25}>
		<BlurInText
			as="h1"
			class="text-center text-3xl font-bold tracking-tighter text-red-700 dark:text-white sm:text-5xl xl:text-6xl/none"
		>
			<span class="capitalize text-green-700 dark:text-green-300">
				{`${greeting}${data.user?.username ? ` ${data.user.username}` : ''}!`}
			</span>
		</BlurInText>
	</BlurFade>
	<BlurFade class="px-1" delay={0.25 * 2}>
		{#if !isLoading && data.mantra}
			<h3 class="my-2 flex items-center justify-center gap-2 text-center">
				<!-- Use a modal and this form to submit feedback -->
				<form action="?/likeMantra" use:enhance={handleLike} method="POST">
					<input type="hidden" name="mantra" value={data.mantra} />
					<input type="hidden" name="like" value={form?.like ?? 'like'} />
					{#if !isLiked && data.user?.username}
						<div class="flex items-center">
							<button type="submit">
								<Star
									class="h-4 w-4 peer-hover:text-gray-600 {likeState === 'unlike' ? 'hidden' : ''}"
								/>
								<StarOff
									class="h-4 w-4 peer-hover:text-gray-600 {likeState === 'like' ? 'hidden' : ''}"
								/>
							</button>
						</div>
					{:else if isLiked}
						<Skeleton class="mx-auto h-5 w-[1.3rem] rounded-md text-center" />
					{/if}
				</form>
				<Button
					variant="link"
					onclick={handleGenerate}
					class="text-2xl font-medium text-muted-foreground sm:text-3xl xl:text-4xl/none"
				>
					<!-- {data.mantra} -->
					{mantra}
				</Button>
				<button
					class="inline-flex size-3 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-50 sm:size-8"
					onclick={() => handleGenerate()}
					title="Get a new mantra"
				>
					<RefreshCw class="h-4 w-4" />
				</button>
				<!-- <form action="?/generatemantra" use:enhance={handleSubmit} method="POST">
					<div class="flex items-center">
						<button
							class="inline-flex size-3 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-50 sm:size-8"
							type="submit"
							title="Get a new mantra"
						>
							<RefreshCw class="h-4 w-4" />
						</button>
					</div>
				</form> -->
			</h3>
		{:else}
			<Skeleton class="mx-auto h-10 w-[35vw] rounded-md text-center" />
		{/if}
	</BlurFade>
</header>

<script lang="ts">
	import { Alert, AlertTitle, AlertDescription } from '@/ui/alert';
	import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/ui/card';
	import { ArrowRightIcon, CircleCheckBigIcon, CircleXIcon } from 'lucide-svelte';

	type HighlightItem = {
		title: string;
		description: string;
		examples: { before: string; after: string }[];
	};

	const highlights: HighlightItem[] = [
		{
			title: 'State Management',
			description: 'Moving from writable stores to $state rune',
			examples: [
				{
					before: 'let count = writable(0)',
					after: 'let count = $state(0)'
				}
			]
		},
		{
			title: 'Props Declaration',
			description: 'New props system using $props() rune',
			examples: [
				{
					before: 'export let name: string',
					after: 'let { name }: Props = $props()'
				}
			]
		},
		{
			title: 'Svelte Hack 2024 Winner',
			description: '4th place in the Migration Magician category',
			examples: [
				{
					before: 'Svelte 4 codebase',
					after: 'Award-winning Svelte 5 migration'
				}
			]
		}
	];
</script>

<section id="highlights" class="py-10 lg:max-w-6xl">
	<h2 class="mb-10 text-center text-3xl font-bold lg:text-4xl">Key Changes</h2>
	<div class="flex flex-col gap-6 md:flex-row md:flex-wrap md:justify-between md:gap-8">
		{#each highlights as item, index}
			<Card
				class={index === 2
					? 'md:min-w-[calc(50%-1rem)] md:flex-1 lg:min-w-0'
					: 'md:min-w-[calc(50%-1rem)] md:flex-1 lg:min-w-0'}
			>
				<CardHeader>
					<CardTitle class="lg:text-xl">{item.title}</CardTitle>
					<CardDescription class="lg:text-base">{item.description}</CardDescription>
				</CardHeader>
				<CardContent>
					{#each item.examples as example}
						<div class="space-y-4 lg:space-y-6">
							<Alert variant="destructive">
								<CircleXIcon class="h-4 w-4 lg:h-5 lg:w-5" />
								<AlertTitle class="lg:text-lg">Before (Svelte 4)</AlertTitle>
								<AlertDescription>
									<code class="rounded bg-destructive/10 px-1 lg:text-base">{example.before}</code>
								</AlertDescription>
							</Alert>
							<Alert>
								<CircleCheckBigIcon class="h-4 w-4 lg:h-5 lg:w-5" />
								<AlertTitle class="lg:text-lg">After (Svelte 5)</AlertTitle>
								<AlertDescription>
									<code class="rounded bg-primary/10 px-1 lg:text-base">{example.after}</code>
								</AlertDescription>
							</Alert>
						</div>
					{/each}
				</CardContent>
			</Card>
		{/each}
	</div>
</section>

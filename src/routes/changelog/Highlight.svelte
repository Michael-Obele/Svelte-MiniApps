<script lang="ts">
	import { Alert, AlertTitle, AlertDescription } from '$lib/components/ui/alert';
	import {
		Card,
		CardHeader,
		CardTitle,
		CardDescription,
		CardContent
	} from '$lib/components/ui/card';
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
		}
	];
</script>

<section id="highlights" class="container max-w-4xl py-10">
	<h2 class="mb-10 text-center text-3xl font-bold">Key Changes</h2>
	<div class="grid gap-6 md:grid-cols-2">
		{#each highlights as item}
			<Card>
				<CardHeader>
					<CardTitle>{item.title}</CardTitle>
					<CardDescription>{item.description}</CardDescription>
				</CardHeader>
				<CardContent>
					{#each item.examples as example}
						<div class="space-y-4">
							<Alert variant="destructive">
								<CircleXIcon class="h-4 w-4" />
								<AlertTitle>Before (Svelte 4)</AlertTitle>
								<AlertDescription>
									<code class="rounded bg-destructive/10 px-1">{example.before}</code>
								</AlertDescription>
							</Alert>
							<Alert>
								<CircleCheckBigIcon class="h-4 w-4" />
								<AlertTitle>After (Svelte 5)</AlertTitle>
								<AlertDescription>
									<code class="rounded bg-primary/10 px-1">{example.after}</code>
								</AlertDescription>
							</Alert>
						</div>
					{/each}
				</CardContent>
			</Card>
		{/each}
	</div>
</section>

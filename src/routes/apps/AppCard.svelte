<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import {
		AppWindow,
		CircleDashed,
		Box,
		Gamepad2,
		Diff,
		PartyPopper,
		Lock,
		Pen,
		CheckSquare,
		Book,
		PiggyBank,
		Heart,
		Speaker,
		Code,
		Sparkles,
		Zap
	} from 'lucide-svelte';
	import { isNewApp, isRecentlyUpdated, done, type Project } from '$lib/index.svelte';

	let { project }: { project: Project } = $props();

	let isCompleted = $derived(done().some((d) => d.name === project.link));
	let Icon = $derived(project.icon || AppWindow);

	// Map of tag classes to their corresponding icons
	const tagIcons = {
		utility: Box,
		game: Gamepad2,
		math: Diff,
		fun: PartyPopper,
		security: Lock,
		design: Pen,
		productivity: CheckSquare,
		education: Book,
		finance: PiggyBank,
		health: Heart,
		multimedia: Speaker,
		'developer-tools': Code
	} as const;

	type TagClass = keyof typeof tagIcons;

	let TagIcon = $derived(
		project.tagClass && project.tagClass in tagIcons
			? tagIcons[project.tagClass as TagClass]
			: null
	);

	function getDifficultyColor(difficulty: string) {
		switch (difficulty) {
			case 'easy':
				return 'text-green-500';
			case 'medium':
				return 'text-yellow-500';
			case 'hard':
				return 'text-red-500';
			default:
				return 'text-muted-foreground';
		}
	}

	function getDifficultyBg(difficulty: string) {
		switch (difficulty) {
			case 'easy':
				return 'bg-green-500/10';
			case 'medium':
				return 'bg-yellow-500/10';
			case 'hard':
				return 'bg-red-500/10';
			default:
				return 'bg-muted';
		}
	}
</script>

{#if isCompleted}
	<a href={'/apps/' + project.link} class="group block h-full">
		<Card.Root
			class="group relative flex h-full flex-col overflow-hidden border-2 border-muted-foreground/10 transition-all duration-300 hover:scale-[1.02] hover:border-red-500/50 hover:shadow-xl"
		>
		<!-- Category icon overlay -->
		{#if TagIcon}
			<div
				class="absolute top-3 right-3 rounded-lg bg-gradient-to-br from-background to-muted/50 p-2 shadow-sm ring-1 ring-border/50"
			>
				<TagIcon class="h-4 w-4 text-muted-foreground/70 transition-colors group-hover:text-red-500" />
			</div>
		{/if}			<Card.Header class="pb-3">
				<div class="flex items-start gap-3">
					<!-- Main icon with enhanced styling -->
					<div
						class="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500/10 to-red-600/5 ring-1 ring-red-500/20 transition-all duration-300 group-hover:scale-110 group-hover:from-red-500/20 group-hover:to-red-600/10 group-hover:ring-red-500/40"
					>
						<Icon class="h-7 w-7 text-red-600 dark:text-red-500" />
					</div>

					<!-- Badges -->
					<div class="flex flex-wrap gap-1.5">
						{#if isNewApp(project.link)}
							<Badge
								variant="secondary"
								class="gap-1 bg-green-500/15 text-green-700 hover:bg-green-500/25 dark:text-green-400"
							>
								<Sparkles class="h-3 w-3" />
								New
							</Badge>
						{/if}
						{#if isRecentlyUpdated(project.link)}
							<Badge
								variant="secondary"
								class="gap-1 bg-blue-500/15 text-blue-700 hover:bg-blue-500/25 dark:text-blue-400"
							>
								<Zap class="h-3 w-3" />
								Updated
							</Badge>
						{/if}
					</div>
				</div>

				<Card.Title
					class="mt-3 text-xl font-bold leading-tight transition-colors group-hover:text-red-600 dark:group-hover:text-red-500"
				>
					{project.title}
				</Card.Title>
			</Card.Header>

			<Card.Content class="flex-grow pb-4">
				<p class="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
					{project.details}
				</p>
			</Card.Content>

			<Card.Footer class="mt-auto flex items-center justify-between border-t pt-4">
			<!-- Tag with icon -->
			<Badge variant="outline" class={`gap-1.5 font-medium ${project.tagClass || ''}`}>
				{#if TagIcon}
					<TagIcon class="h-3.5 w-3.5" />
				{/if}
				{project.tag.split('-').join(' ')}
			</Badge>				<!-- Difficulty badge -->
				<div
					class={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ${getDifficultyBg(project.difficulty)} ${getDifficultyColor(project.difficulty)}`}
				>
					<span class="h-1.5 w-1.5 rounded-full bg-current"></span>
					{project.difficulty}
				</div>
			</Card.Footer>
		</Card.Root>
	</a>
{:else}
	<!-- Coming Soon Item -->
	<Card.Root
		class="relative flex h-full flex-col border-2 border-dashed border-muted-foreground/20 bg-muted/5 opacity-70 transition-all duration-300 hover:opacity-80"
	>
	<!-- Category icon overlay -->
	{#if TagIcon}
		<div class="absolute top-3 right-3 rounded-lg bg-background/80 p-2 ring-1 ring-border/30">
			<TagIcon class="h-4 w-4 text-muted-foreground/50" />
		</div>
	{/if}		<Card.Header class="pb-3">
			<div class="flex items-start gap-3">
				<!-- Placeholder icon -->
				<div
					class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-muted/50 ring-1 ring-border/30"
				>
					<CircleDashed class="h-7 w-7 text-muted-foreground/50" />
				</div>
			</div>

			<Card.Title class="text-muted-foreground mt-3 text-xl font-bold leading-tight">
				{project.title}
			</Card.Title>
		</Card.Header>

		<Card.Content class="flex-grow pb-4">
			<p class="text-muted-foreground/70 line-clamp-3 text-sm leading-relaxed">
				{project.details}
			</p>
		</Card.Content>

		<Card.Footer class="mt-auto flex items-center justify-between border-t pt-4">
		<!-- Tag with icon -->
		<Badge variant="outline" class={`gap-1.5 bg-muted/50 font-medium ${project.tagClass || ''}`}>
			{#if TagIcon}
				<TagIcon class="h-3.5 w-3.5 opacity-50" />
			{/if}
			{project.tag.split('-').join(' ')}
		</Badge>			<!-- Difficulty badge -->
			<div
				class="text-muted-foreground/70 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider"
			>
				<span class="h-1.5 w-1.5 rounded-full bg-current opacity-50"></span>
				{project.difficulty}
			</div>
		</Card.Footer>
	</Card.Root>
{/if}

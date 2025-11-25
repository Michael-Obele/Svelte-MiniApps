<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Progress } from '$lib/components/ui/progress';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import {
		User,
		Shield,
		Calendar,
		Activity,
		Star,
		Settings,
		Edit,
		Github,
		ChevronRight
	} from 'lucide-svelte';
	import { getUserProfile } from '$lib/remote';

	// Get profile data directly from remote function (cached, same instance returned across components)
	const profileQuery = getUserProfile();

	// Reactive derivations
	let profile = $derived(profileQuery.current);
	let isLoading = $derived(!profile);

	// Profile completion percentage - access from user object
	let completionPercentage = $derived(profile?.user.profileCompletion ?? 0);
	let completionColor = $derived(
		completionPercentage >= 80
			? 'bg-green-500'
			: completionPercentage >= 50
				? 'bg-amber-500'
				: 'bg-red-500'
	);

	// Member since formatted - access from user object
	let memberSince = $derived(
		profile?.user.createdAt
			? new Date(profile.user.createdAt).toLocaleDateString('en-US', {
					month: 'long',
					year: 'numeric'
				})
			: null
	);

	// Quick stats - use actual stats from profile
	let quickStats = $derived([
		{
			label: 'Notes',
			value: profile?.stats.totalNotes ?? 0,
			icon: Activity
		},
		{
			label: 'Budgets',
			value: profile?.stats.totalBudgets ?? 0,
			icon: Star
		},
		{
			label: 'Items',
			value: profile?.stats.totalItems ?? 0,
			icon: User
		}
	]);
</script>

<div
	class="from-primary/10 via-background to-secondary/10 relative overflow-hidden rounded-xl border bg-gradient-to-br"
>
	<!-- Background decoration -->
	<div
		class="bg-grid-white/5 absolute inset-0 [mask-image:radial-gradient(white,transparent_70%)]"
	></div>

	<div class="relative p-6 sm:p-8">
		{#if isLoading}
			<!-- Loading state -->
			<div class="flex flex-col gap-6 sm:flex-row sm:items-start">
				<Skeleton class="size-24 rounded-full sm:size-32" />
				<div class="flex-1 space-y-4">
					<Skeleton class="h-8 w-48" />
					<Skeleton class="h-4 w-32" />
					<div class="flex gap-2">
						<Skeleton class="h-6 w-16" />
						<Skeleton class="h-6 w-20" />
					</div>
				</div>
			</div>
		{:else if profile}
			<div class="flex flex-col gap-6 sm:flex-row sm:items-start">
				<!-- Avatar section -->
				<div class="relative">
					<Avatar.Root class="border-background size-24 border-4 shadow-xl sm:size-32">
						<Avatar.Image src="" alt={profile.user.username} />
						<Avatar.Fallback class="bg-primary text-primary-foreground text-2xl sm:text-4xl">
							{profile.user.username?.charAt(0).toUpperCase() ?? 'U'}
						</Avatar.Fallback>
					</Avatar.Root>

					<!-- Online indicator -->
					<div
						class="border-background absolute right-1 bottom-1 size-4 rounded-full border-2 bg-green-500 sm:size-5"
					></div>
				</div>

				<!-- User info -->
				<div class="flex-1 space-y-4">
					<div class="flex flex-wrap items-center gap-3">
						<h1 class="text-2xl font-bold tracking-tight sm:text-3xl">
							{profile.user.username}
						</h1>

						<!-- Badges -->
						<div class="flex flex-wrap gap-2">
							{#if profile.user.isAdmin}
								<Badge variant="default" class="gap-1">
									<Shield class="size-3" />
									Admin
								</Badge>
							{/if}

							{#if profile.user.hasGithub}
								<Badge variant="secondary" class="gap-1">
									<Github class="size-3" />
									GitHub
								</Badge>
							{/if}

							<Badge variant="outline" class="gap-1">
								<Calendar class="size-3" />
								Member since {memberSince}
							</Badge>
						</div>
					</div>

					<!-- Profile completion -->
					<div class="max-w-sm space-y-2">
						<div class="flex items-center justify-between text-sm">
							<span class="text-muted-foreground">Profile completion</span>
							<span class="font-medium">{completionPercentage}%</span>
						</div>
						<Progress value={completionPercentage} class="h-2" classInner={completionColor} />
						{#if completionPercentage < 100}
							<p class="text-muted-foreground text-xs">
								Complete your profile to unlock all features
							</p>
						{/if}
					</div>

					<!-- Quick actions -->
					<div class="flex flex-wrap gap-2 pt-2">
						<Button variant="outline" size="sm" class="gap-2" href="/profile/settings">
							<Edit class="size-4" />
							Edit Profile
						</Button>
						<Button variant="ghost" size="sm" class="gap-2" href="/profile/settings">
							<Settings class="size-4" />
							Settings
							<ChevronRight class="size-4" />
						</Button>
					</div>
				</div>
			</div>

			<!-- Quick stats -->
			<div class="mt-8 grid grid-cols-3 gap-4 border-t pt-6">
				{#each quickStats as stat (stat.label)}
					<div class="text-center">
						<div
							class="bg-muted/50 mx-auto mb-2 flex size-10 items-center justify-center rounded-lg"
						>
							<stat.icon class="text-primary size-5" />
						</div>
						<p class="text-2xl font-bold">{stat.value}</p>
						<p class="text-muted-foreground text-xs">{stat.label}</p>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

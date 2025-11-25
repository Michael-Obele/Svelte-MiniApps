<script lang="ts">
	import { page } from '$app/state';
	import { getUserProfile } from '$lib/remote';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import { cn } from '$lib/utils';
	import {
		LayoutDashboard,
		Settings,
		Shield,
		Monitor,
		ChevronLeft,
		RefreshCw,
		Activity,
		Sliders
	} from 'lucide-svelte';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	// Fetch user profile data using remote function (cached, same instance returned across components)
	const profileQuery = getUserProfile();

	// Reactive derivations
	let profile = $derived(profileQuery.current);
	let isLoading = $derived(!profile);

	// Loading state for refresh
	let isRefreshing = $state(false);

	// Refresh profile data
	async function refreshProfile() {
		isRefreshing = true;
		try {
			await getUserProfile().refresh();
		} finally {
			setTimeout(() => {
				isRefreshing = false;
			}, 500);
		}
	}

	// Navigation items
	const navItems = [
		{ href: '/profile', label: 'Overview', icon: LayoutDashboard, exact: true },
		{ href: '/profile/activity', label: 'Activity', icon: Activity },
		{ href: '/profile/settings', label: 'Settings', icon: Settings },
		{ href: '/profile/sessions', label: 'Sessions', icon: Monitor },
		{ href: '/profile/security', label: 'Security', icon: Shield },
		{ href: '/profile/preferences', label: 'Preferences', icon: Sliders }
	];

	// Check if a nav item is active
	function isActive(href: string, exact: boolean = false) {
		if (exact) {
			return page.url.pathname === href;
		}
		return page.url.pathname.startsWith(href);
	}
</script>

<div class="from-background to-muted/20 min-h-screen bg-gradient-to-b">
	<div class="container max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
		<!-- Header -->
		<div class="mb-6 flex items-center justify-between">
			<div class="flex items-center gap-4">
				<Button variant="ghost" size="icon" href="/" class="shrink-0">
					<ChevronLeft class="size-5" />
				</Button>
				<div>
					<h1 class="text-2xl font-bold tracking-tight md:text-3xl">My Profile</h1>
					<p class="text-muted-foreground mt-1 text-sm">Manage your account and preferences</p>
				</div>
			</div>
			<Button
				variant="outline"
				size="sm"
				class="gap-2"
				onclick={refreshProfile}
				disabled={isRefreshing}
			>
				<RefreshCw class="size-4 {isRefreshing ? 'animate-spin' : ''}" />
				<span class="hidden sm:inline">Refresh</span>
			</Button>
		</div>

		<div class="flex flex-col gap-6 lg:flex-row">
			<!-- Sidebar -->
			<aside class="w-full shrink-0 lg:w-64">
				<!-- User summary card -->
				<div class="bg-card mb-4 rounded-lg border p-4">
					{#if isLoading}
						<div class="flex items-center gap-3">
							<div class="bg-muted size-12 animate-pulse rounded-full"></div>
							<div class="space-y-2">
								<div class="bg-muted h-4 w-24 animate-pulse rounded"></div>
								<div class="bg-muted h-3 w-16 animate-pulse rounded"></div>
							</div>
						</div>
					{:else if profile}
						<div class="flex items-center gap-3">
							<Avatar.Root class="border-background size-12 border-2 shadow-md">
								<Avatar.Image src="" alt={profile.user.username} />
								<Avatar.Fallback class="bg-primary text-primary-foreground">
									{profile.user.username?.charAt(0).toUpperCase() ?? 'U'}
								</Avatar.Fallback>
							</Avatar.Root>
							<div class="min-w-0 flex-1">
								<p class="truncate font-semibold">{profile.user.username}</p>
								<p class="text-muted-foreground text-sm">
									{profile.user.isAdmin ? 'Administrator' : 'Member'}
								</p>
							</div>
						</div>
					{/if}
				</div>

				<!-- Navigation -->
				<nav class="bg-card space-y-1 rounded-lg border p-2">
					{#each navItems as item (item.href)}
						{@const active = isActive(item.href, item.exact)}
						<a
							href={item.href}
							class={cn(
								'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
								active
									? 'bg-primary text-primary-foreground'
									: 'text-muted-foreground hover:bg-muted hover:text-foreground'
							)}
						>
							<item.icon class="size-4" />
							{item.label}
						</a>
					{/each}
				</nav>

				<!-- Quick stats (visible on larger screens) -->
				{#if profile && !isLoading}
					<div class="bg-card mt-4 hidden rounded-lg border p-4 lg:block">
						<h3 class="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
							Quick Stats
						</h3>
						<div class="space-y-2 text-sm">
							<div class="flex justify-between">
								<span class="text-muted-foreground">Account Age</span>
								<span class="font-medium">{profile.stats.accountAge} days</span>
							</div>
							<Separator />
							<div class="flex justify-between">
								<span class="text-muted-foreground">Total Items</span>
								<span class="font-medium">{profile.stats.totalItems}</span>
							</div>
							<Separator />
							<div class="flex justify-between">
								<span class="text-muted-foreground">Total Notes</span>
								<span class="font-medium">{profile.stats.totalNotes}</span>
							</div>
						</div>
					</div>
				{/if}
			</aside>

			<!-- Main content -->
			<main class="min-w-0 flex-1">
				{@render children()}
			</main>
		</div>
	</div>
</div>

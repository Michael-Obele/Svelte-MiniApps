<script lang="ts">
	import ThemeSwitch from './ThemeSwitch.svelte';
	import LanguageSwitcher from '@/blocks/LanguageSwitcher.svelte';
	import { page } from '$app/state';
	import * as Avatar from '@/ui/avatar';
	import Svelte from '#lib/assets/svelte.svelte';
	import { Button, buttonVariants } from '@/ui/button';
	import * as DropdownMenu from '@/ui/dropdown-menu/index.js';
	import * as Sheet from '@/ui/sheet/index.js';
	import { Separator } from '@/ui/separator/index.js';
	import {
		Github,
		LogIn,
		LogOut,
		User,
		Settings,
		LifeBuoy,
		MoreHorizontal,
		Menu
	} from '@lucide/svelte';
	import { bluesky } from '#lib/components/blocks/Icons.svelte';
	import { beforeNavigate } from '$app/navigation';
	import NavigationProgressIndicator from '@/blocks/NavigationProgressIndicator.svelte';
	import { getCurrentUser } from '#lib/remote/auth.remote.js';

	const menuItems = [
		{ name: 'Home', href: '/' },
		{ name: 'Apps', href: '/apps' },
		{ name: 'About', href: '/about' },
		{ name: 'Hire', href: '/hire' },
		{ name: 'Changelog', href: '/changelog' }
	];

	const GITHUB_URL = 'https://github.com/Michael-Obele/Svelte-MiniApps';
	const BLUESKY_URL = 'https://bsky.app/profile/svelte-apps.me';

	// Controls the mobile slide-over navigation
	let mobileMenuOpen = $state(false);

	let loginUrl = $derived(
		`/login?redirect=${encodeURIComponent(page.url.pathname + page.url.search)}`
	);

	// Reset the mobile menu when navigating
	beforeNavigate(({ shallow }) => {
		if (shallow) return;

		mobileMenuOpen = false;
	});

	// Determine if the current route matches the item
	let isActive = (item: { name: string; href: string }) => {
		const routeId = page.url.pathname;

		// For home page, exact match
		if (item.href === '/') {
			return routeId === '/';
		}

		// For other routes, check if the current path matches or starts with the item's href
		// This ensures sub-routes are also highlighted (e.g., /apps/unit-converter highlights "Apps")
		return routeId === item.href || routeId.startsWith(item.href + '/');
	};

	// Desktop links read as plain text; the current page simply sits in full
	// foreground rather than getting a pill or a color block.
	const navLinkClass = (active: boolean) =>
		`${buttonVariants({ variant: 'ghost', size: 'sm' })} ${
			active ? 'text-foreground' : 'text-muted-foreground'
		}`;

	// Roomier targets for the slide-over menu.
	const sheetLinkClass = (active: boolean) =>
		`focus-visible:ring-ring flex h-11 items-center rounded-md px-3 text-base font-medium outline-none transition-colors focus-visible:ring-2 ${
			active ? 'text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
		}`;

	// Ghost icon button shared by the overflow menu and the mobile trigger.
	const iconButtonClass = buttonVariants({ variant: 'ghost', size: 'icon' });
</script>

<!-- Global navigation progress indicator -->
<NavigationProgressIndicator />

<header class="bg-background w-full border-b">
	<div class="mx-auto flex h-14 max-w-7xl items-center gap-1 px-4 md:h-16 md:gap-2 md:px-6">
		<!-- Brand -->
		<a
			href="/"
			class="focus-visible:ring-ring -ml-2 flex shrink-0 items-center gap-2 rounded-md px-2 py-1.5 transition-opacity outline-none hover:opacity-80 focus-visible:ring-2"
		>
			<span class="size-5 shrink-0 md:size-6"><Svelte /></span>
			<span
				class="hidden text-sm font-semibold tracking-tight whitespace-nowrap sm:inline md:text-base"
			>
				Mini Apps
			</span>
		</a>

		<!-- Desktop navigation -->
		<nav class="ml-1 hidden items-center gap-0.5 md:flex" aria-label="Main">
			{#each menuItems as item}
				<a
					href={item.href}
					class={navLinkClass(isActive(item))}
					aria-current={isActive(item) ? 'page' : undefined}>{item.name}</a
				>
			{/each}
		</nav>

		<!-- Right-hand controls -->
		<div class="text-muted-foreground ml-auto flex items-center gap-0.5 md:gap-1">
			<LanguageSwitcher variant="ghost" />
			<ThemeSwitch variant="ghost" />

			<!-- Social links — inline from large screens up -->
			<div class="hidden items-center gap-0.5 lg:flex">
				<Button
					variant="ghost"
					size="icon"
					href={GITHUB_URL}
					target="_blank"
					rel="noopener noreferrer"
					aria-label="GitHub repository"
				>
					<Github />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					href={BLUESKY_URL}
					target="_blank"
					rel="noopener noreferrer"
					aria-label="Bluesky"
				>
					{@render bluesky('size-4')}
				</Button>
			</div>

			<!-- Compact overflow menu for tablet widths -->
			<div class="hidden md:block lg:hidden">
				<DropdownMenu.Root>
					<DropdownMenu.Trigger class={iconButtonClass}>
						<MoreHorizontal />
						<span class="sr-only">More options</span>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="end">
						<DropdownMenu.Item>
							<a
								href={GITHUB_URL}
								target="_blank"
								rel="noopener noreferrer"
								class="flex w-full items-center"
							>
								<Github class="mr-2 size-4" />
								<span>GitHub</span>
							</a>
						</DropdownMenu.Item>
						<DropdownMenu.Item>
							<a
								href={BLUESKY_URL}
								target="_blank"
								rel="noopener noreferrer"
								class="flex w-full items-center"
							>
								{@render bluesky('mr-2 size-4')}
								<span>Bluesky</span>
							</a>
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>

			<!-- User Account / Login -->
			<svelte:boundary>
				{@const user = await getCurrentUser()}
				{#if user?.username}
					<DropdownMenu.Root>
						<DropdownMenu.Trigger
							class="{buttonVariants({ variant: 'ghost', size: 'icon' })} rounded-full"
						>
							<Avatar.Root class="size-7">
								<Avatar.Fallback class="text-sm capitalize">
									{user.username.charAt(0)}
								</Avatar.Fallback>
							</Avatar.Root>
							<span class="sr-only">Account menu</span>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content class="w-56" align="end">
							<DropdownMenu.Group>
								<DropdownMenu.GroupHeading>My Account</DropdownMenu.GroupHeading>
								<DropdownMenu.Separator />
								<a href="/profile">
									<DropdownMenu.Item>
										<User class="mr-2 size-4" />
										<span class="capitalize">{user.username}</span>
									</DropdownMenu.Item>
								</a>
								<DropdownMenu.Item class="cursor-not-allowed">
									<Settings class="mr-2 size-4" />
									<span>Settings</span>
								</DropdownMenu.Item>
								<DropdownMenu.Separator />
								<DropdownMenu.Item class="cursor-not-allowed">
									<LifeBuoy class="mr-2 size-4" />
									<span>Support</span>
								</DropdownMenu.Item>
								<DropdownMenu.Separator />
								<DropdownMenu.Item>
									<a href="/logout" class="flex w-full items-center">
										<LogOut class="mr-2 size-4" />
										<span>Log out</span>
									</a>
								</DropdownMenu.Item>
							</DropdownMenu.Group>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				{:else}
					<!-- The single accent in the bar — compact on mobile, labelled on tablet+ -->
					<Button variant="default" size="sm" href={loginUrl} class="gap-1.5 px-2.5 sm:px-3">
						<LogIn />
						<span class="hidden sm:inline">Login</span>
					</Button>
				{/if}
				{#snippet pending()}
					<!-- Loading state -->
					<Button variant="default" size="sm" disabled class="gap-1.5 px-2.5 sm:px-3">
						<LogIn />
						<span class="hidden sm:inline">Login</span>
					</Button>
				{/snippet}
			</svelte:boundary>

			<!-- Mobile menu (slide-over) -->
			<Sheet.Root bind:open={mobileMenuOpen}>
				<Sheet.Trigger class="{iconButtonClass} md:hidden">
					<Menu />
					<span class="sr-only">Open navigation menu</span>
				</Sheet.Trigger>
				<Sheet.Content class="flex flex-col gap-6">
					<Sheet.Header class="text-left">
						<Sheet.Title class="flex items-center gap-2 text-base font-semibold tracking-tight">
							<span class="size-5"><Svelte /></span>
							Mini Apps
						</Sheet.Title>
						<Sheet.Description class="sr-only">Site navigation</Sheet.Description>
					</Sheet.Header>

					<nav class="flex flex-col gap-0.5" aria-label="Mobile">
						{#each menuItems as item}
							<a
								href={item.href}
								class={sheetLinkClass(isActive(item))}
								aria-current={isActive(item) ? 'page' : undefined}
								onclick={() => (mobileMenuOpen = false)}>{item.name}</a
							>
						{/each}
					</nav>

					<Separator />

					<div class="flex flex-col gap-1">
						<span
							class="text-muted-foreground px-3 pt-1 pb-2 text-xs font-medium tracking-wider uppercase"
						>
							Connect
						</span>
						<Button
							variant="ghost"
							href={GITHUB_URL}
							target="_blank"
							rel="noopener noreferrer"
							class="justify-start"
						>
							<Github />
							GitHub
						</Button>
						<Button
							variant="ghost"
							href={BLUESKY_URL}
							target="_blank"
							rel="noopener noreferrer"
							class="justify-start"
						>
							{@render bluesky('size-4')}
							Bluesky
						</Button>
					</div>
				</Sheet.Content>
			</Sheet.Root>
		</div>
	</div>
</header>

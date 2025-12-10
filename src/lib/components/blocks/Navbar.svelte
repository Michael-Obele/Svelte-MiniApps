<script lang="ts">
	import ThemeSwitch from './ThemeSwitch.svelte';
	import LanguageSwitcher from '@/blocks/LanguageSwitcher.svelte';
	import { page } from '$app/state';
	import * as Avatar from '@/ui/avatar';
	import Svelte from '$lib/assets/svelte.svelte';
	import { Button, buttonVariants } from '@/ui/button';
	import * as DropdownMenu from '@/ui/dropdown-menu/index.js';
	import { Github, LogIn, LogOut, User, Settings, LifeBuoy, MoreHorizontal } from '@lucide/svelte';
	import { bluesky } from '$lib/components/blocks/Icons.svelte';
	import { beforeNavigate } from '$app/navigation';
	import NavigationProgressIndicator from '@/blocks/NavigationProgressIndicator.svelte';
	import { getCurrentUser } from '$lib/remote/auth.remote';

	const menuItems = [
		{ name: 'Home', href: '/' },
		{ name: 'Apps', href: '/apps' },
		{ name: 'About', href: '/about' },
		{ name: 'Hire', href: '/hire' },
		{ name: 'Changelog', href: '/changelog' }
	];

	let show = $state(false);

	let loginUrl = $derived(
		`/login?redirect=${encodeURIComponent(page.url.pathname + page.url.search)}`
	);

	// Reset `show` when navigating
	beforeNavigate(() => {
		show = false;
	});

	// Reactive statement to determine if the current route matches the item
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
</script>

<!-- Global navigation progress indicator -->
<NavigationProgressIndicator />

<nav class="border-gray-200 bg-white py-2 md:py-3 dark:bg-gray-900">
	<div class="flex flex-nowrap items-center justify-between gap-2 px-3 md:gap-3 xl:gap-6 xl:px-5">
		<!-- Logo -->
		<a
			href="/"
			class="relative flex shrink-0 items-center space-x-1.5 md:flex-col md:space-y-0.5 md:space-x-0 lg:flex-row lg:space-y-0 lg:space-x-2 rtl:space-x-reverse"
		>
			<!-- Christmas Hat -->
			<div class="absolute -top-5 -left-2 rotate-[-15deg] transform text-2xl">🎅</div>
			<span class="size-5 shrink-0 sm:size-5 md:size-4 lg:size-5 xl:size-6">
				<Svelte />
			</span>
			<span
				class="hidden text-xs font-semibold whitespace-nowrap sm:inline sm:text-sm md:text-xs lg:text-base xl:text-xl dark:text-white"
				>Mini Apps</span
			>
		</a>
		<!-- End of Logo -->

		<!-- Desktop Menu Items (hidden on mobile) -->
		<div class="hidden grow items-center md:order-1 md:flex">
			<ul
				class="flex flex-row items-center space-x-1 font-medium md:space-x-0.5 lg:space-x-2 xl:space-x-4"
			>
				{#each menuItems as item}
					<li>
						<a
							href={item.href}
							class={isActive(item)
								? 'rounded bg-red-700 px-2 py-1.5 text-sm text-white md:bg-transparent md:p-0 md:text-red-700 xl:px-3 xl:py-2 xl:text-base md:dark:text-red-500'
								: 'rounded px-2 py-1.5 text-sm text-gray-900 hover:bg-gray-100 md:p-0 md:px-1 md:hover:bg-transparent md:hover:text-red-700 xl:px-3 xl:py-2 xl:text-base dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent md:dark:hover:text-red-500'}
							aria-current={isActive(item) ? 'page' : undefined}>{item.name}</a
						>
					</li>
				{/each}
			</ul>
		</div>

		<!-- Right side controls -->
		<div class="flex shrink-0 items-center gap-1 md:order-2 md:gap-1.5 xl:gap-2">
			<!-- Language switcher - visible on all screen sizes -->
			<LanguageSwitcher />

			<!-- Theme toggle - visible on all screen sizes -->
			<ThemeSwitch />

			<!-- Social icons - hidden on mobile, visible on tablet+ -->
			<div class="hidden items-center gap-1.5 lg:flex">
				<Button variant="outline" type="button" size="icon" class="size-9 xl:size-10">
					<a
						target="_blank"
						href="https://github.com/Michael-Obele/Svelte-MiniApps"
						class="flex items-center justify-center"
					>
						<span class="sr-only">See GitHub Repo</span>
						<Github class="size-4 lg:size-5" />
					</a>
				</Button>
				<!-- Bluesky icon (tablet and desktop) -->
				<Button variant="outline" type="button" size="icon" class="size-9 xl:size-10">
					<a
						target="_blank"
						href="https://bsky.app/profile/svelte-apps.me"
						rel="noopener noreferrer"
						class="flex items-center justify-center"
					>
						<span class="sr-only">Bluesky</span>
						{@render bluesky('size-4 xl:size-5')}
					</a>
				</Button>
			</div>

			<!-- More menu for mobile only -->
			<div class="lg:hidden">
				<DropdownMenu.Root>
					<DropdownMenu.Trigger
						class={`${buttonVariants({ variant: 'outline', size: 'icon' })} size-8 sm:size-9`}
					>
						<MoreHorizontal class="size-5" />
						<span class="sr-only">More options</span>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="end">
						<DropdownMenu.Item>
							<a
								href="https://github.com/Michael-Obele/Svelte-MiniApps"
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
								href="https://bsky.app/profile/svelte-apps.me"
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
							class={`${buttonVariants({ variant: 'ghost', size: 'icon' })} size-8 sm:size-9 xl:size-10`}
						>
							<Avatar.Root class="size-6 sm:size-7 xl:size-8">
								<Avatar.Fallback class="text-sm capitalize xl:text-base">
									{user.username.charAt(0)}
								</Avatar.Fallback>
							</Avatar.Root>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content class="w-56">
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
					<!-- Login button - compact on mobile, full on tablet+ -->
					<a href={loginUrl}>
						<Button variant="outline" type="button" size="sm" class="h-8 sm:h-9 xl:h-10">
							<span class="flex items-center gap-1.5">
								<LogIn class="size-4" />
								<span class="hidden sm:inline">Login</span>
							</span>
						</Button>
					</a>
				{/if}
				{#snippet pending()}
					<!-- Loading state -->
					<Button variant="outline" type="button" size="sm" disabled class="h-8 sm:h-9 xl:h-10">
						<span class="flex items-center gap-1.5">
							<LogIn class="size-4" />
							<span class="hidden sm:inline">Checking...</span>
						</span>
					</Button>
				{/snippet}
			</svelte:boundary>

			<!-- Mobile menu toggle (hamburger) -->
			<Button
				data-collapse-toggle="navbar-user"
				variant="outline"
				type="button"
				size="icon"
				class="inline-flex size-8 items-center justify-center rounded-lg text-sm text-gray-500 hover:bg-gray-100 focus:ring-2 focus:ring-gray-200 focus:outline-none sm:size-9 md:hidden dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
				onclick={() => (show = !show)}
			>
				<div class="relative size-5 rounded focus:outline-none">
					<div
						class="absolute top-1/2 left-1/2 block w-full -translate-x-1/2 -translate-y-1/2 transform"
					>
						<span
							class="absolute block h-0.5 w-full transform bg-gray-900 transition duration-300 ease-in-out dark:bg-white {show
								? 'translate-y-[.0125rem] rotate-45'
								: '-translate-y-1.5'}"
						></span>
						<span
							class="absolute block h-0.5 w-full transform bg-gray-900 transition duration-300 ease-in-out dark:bg-white {show
								? 'opacity-0'
								: ''}"
						></span>
						<span
							class="absolute block h-0.5 w-full transform bg-gray-900 transition duration-300 ease-in-out dark:bg-white {show
								? '-translate-y-[.0125rem] -rotate-45'
								: 'translate-y-1.5'}"
						></span>
					</div>
				</div>
				<span class="sr-only">Toggle navigation menu</span>
			</Button>
		</div>
	</div>

	<!-- Mobile menu panel -->
	<div
		class={`w-full items-center justify-between px-3 md:hidden ${show ? 'block' : 'hidden'}`}
		id="navbar-user"
	>
		<ul
			class="mt-3 flex flex-col gap-1 rounded-lg border border-gray-100 bg-gray-50 p-3 font-medium dark:border-gray-700 dark:bg-gray-800"
		>
			{#each menuItems as item}
				<li>
					<a
						href={item.href}
						class={isActive(item)
							? 'block rounded bg-red-700 px-3 py-2 text-white'
							: 'block rounded px-3 py-2 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white'}
						aria-current={isActive(item) ? 'page' : undefined}>{item.name}</a
					>
				</li>
			{/each}
		</ul>
	</div>
</nav>

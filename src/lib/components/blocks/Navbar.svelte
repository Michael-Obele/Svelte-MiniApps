<script lang="ts">
	import ThemeSwitch from './ThemeSwitch.svelte';
	import { page } from '$app/state';
	import { navigating } from '$app/state';
	import * as Avatar from '@/ui/avatar';
	import Svelte from '$lib/assets/svelte.svelte';
	import { Button, buttonVariants } from '@/ui/button';
	import * as DropdownMenu from '@/ui/dropdown-menu/index.js';
	import { Github, LogIn, LogOut, User, Settings, LifeBuoy } from 'lucide-svelte';
	import { userContext } from '$lib/utils';
	import { beforeNavigate, goto } from '$app/navigation';
	import { invalidate } from '$app/navigation';
	import NavigationProgressIndicator from '@/blocks/NavigationProgressIndicator.svelte';

	const menuItems = [
		{ name: 'Home', href: '/' },
		{ name: 'Apps', href: '/apps' },
		{ name: 'About', href: '/about' },
		{ name: 'Changelog', href: '/changelog' }
	];

	let open = () => {
		show = !show;
	};

	let show = $state(false);

	// Reset `show` when navigating
	beforeNavigate(() => {
		show = false;
	});

	$effect(() => {
		console.log('user on navbar', $userContext);
	});

	// Reactive statement to determine if the current route matches the item
	let isActive = (item: string) => {
		const routeId = page.url.pathname;

		if (item === 'Home' && routeId == '/') {
			return true;
		} else {
			return routeId && (`/${item}` === routeId || routeId.includes(item.toLowerCase()));
		}
	};
</script>

<!-- Global navigation progress indicator -->
<NavigationProgressIndicator />

<nav class="border-gray-200 bg-white dark:bg-gray-900">
	<div class="flex flex-wrap items-center justify-around p-4">
		<!-- Logo -->
		<a href="/" class="flex items-center space-x-3 rtl:space-x-reverse">
			<div class="flex text-2xl font-semibold dark:text-white">
				<span class="m-1 h-6 w-6 self-center whitespace-nowrap">
					<Svelte />
				</span>
				MiniApps
			</div>
		</a>
		<!-- End of Logo -->
		<div class="flex items-center space-x-3 md:order-2 md:mx-0 md:space-x-0">
			<div class="px-2">
				<ThemeSwitch />
				<Button variant="outline" type="button" size="icon">
					<a target="_blank" href="https://github.com/Michael-Obele/Svelte-MiniApps">
						<span class="sr-only">See GitHub Repo</span>
						<Github class="h-[1.2rem] w-[1.2rem]" />
					</a>
				</Button>
				{#if $userContext?.username}
					<DropdownMenu.Root>
						<DropdownMenu.Trigger class={buttonVariants({ variant: 'ghost', size: 'icon' })}>
							<Avatar.Root class="size-8">
								<Avatar.Fallback class="capitalize">
									{$userContext.username.charAt(0)}
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
										<span class="capitalize">{$userContext.username}</span>
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
					<a href="/login">
						<Button variant="outline" type="button" size="sm">
							<span class="flex items-center space-x-2">
								<LogIn class="h-4 w-4" />
								<span>Login</span>
							</span>
						</Button>
					</a>
				{/if}
			</div>
			<!-- <Button
				data-collapse-toggle="navbar-user"
				variant="outline"
				type="button"
				size="icon"
				class="inline-flex h-10 w-10 items-center justify-center rounded-lg px-2 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600 md:hidden"
				aria-controls="navbar-user"
				onclick={() => (show = !show)}
				aria-expanded="false"
			>
				<span class="sr-only">Open/Close main menu</span>
				<X class={show ? 'block' : 'hidden'} aria-hidden="true" />
				<Menu class={show ? 'hidden' : 'block'} aria-hidden="true" />
			</Button> -->

			<Button
				data-collapse-toggle="navbar-user"
				variant="outline"
				type="button"
				size="icon"
				class="inline-flex h-10 w-10 items-center justify-center rounded-lg px-2 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600 md:hidden"
				onclick={() => open()}
			>
				<div class="relative size-6 rounded p-3 focus:outline-none">
					<div
						class="absolute left-1/2 top-1/2 block w-full -translate-x-1/2 -translate-y-1/2 transform"
					>
						<span
							class="absolute block h-0.5 w-full transform bg-gray-900 transition duration-300 ease-in-out dark:bg-white
									{show ? 'translate-y-[.0125rem] rotate-45' : '-translate-y-1.5'}"
						></span>
						<span
							class="absolute block h-0.5 w-full transform bg-gray-900 transition duration-300 ease-in-out dark:bg-white
									{show ? 'opacity-0' : ''}"
						></span>
						<span
							class="absolute block h-0.5 w-full transform bg-gray-900 transition duration-300 ease-in-out dark:bg-white
									{show ? '-translate-y-[.0125rem] -rotate-45' : 'translate-y-1.5'}"
						></span>
					</div>
				</div>
			</Button>
		</div>
		<div
			class={` w-full items-center justify-between md:order-1 md:flex md:w-auto ${show ? 'block' : 'hidden'}`}
			id="navbar-user"
		>
			<ul
				class="mt-4 flex flex-col rounded-lg border border-gray-100 bg-gray-50 p-4 font-medium dark:border-gray-700 dark:bg-gray-800 md:mt-0 md:flex-row md:space-x-8 md:border-0 md:bg-white md:p-0 md:dark:bg-gray-900 rtl:space-x-reverse"
			>
				{#each menuItems as item}
					<li>
						<a
							href={item.href}
							class={`${isActive(item.name) ? 'block rounded bg-red-700 px-3 py-2 text-white md:bg-transparent md:p-0 md:text-red-700 md:dark:text-red-500' : 'block rounded px-3 py-2 text-gray-900 hover:bg-gray-100 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:p-0 md:hover:bg-transparent md:hover:text-red-700 md:dark:hover:bg-transparent md:dark:hover:text-red-500'}`}
							aria-current={isActive(item.name) ? 'page' : undefined}>{item.name}</a
						>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</nav>

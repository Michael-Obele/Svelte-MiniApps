<script lang="ts">
	import ThemeSwitch from './ThemeSwitch.svelte';

	import { page } from '$app/stores';
	import * as Avatar from '$lib/components/ui/avatar';
	import Sun from 'lucide-svelte/icons/sun';
	import { signOut } from '@auth/sveltekit/client';
	import Moon from 'lucide-svelte/icons/moon';
	import { toggleMode } from 'mode-watcher';
	import Svelte from '$lib/logo/svelte.svelte';
	import { Button } from './ui/button';

	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Github, Menu } from 'lucide-svelte';

	// Reactive statement to determine if the current route matches the item
	$: isActive = (item: string) => {
		const routeId = $page.url.pathname;
		show = false;
		if (item === 'Home' && routeId == '/') {
			return true;
		} else {
			return routeId && (`/${item}` === routeId || routeId.includes(item.toLowerCase()));
		}
	};

	$: show = false;
	export let userData;

	let href = (item: string) => {
		if (item === 'Home') {
			return '/';
		} else {
			return `/${item.toLowerCase()}`;
		}
	};
</script>

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
			{#if userData}
				{#if userData?.id == null}
					<DropdownMenu.Root>
						<DropdownMenu.Trigger asChild let:builder>
							<Button builders={[builder]} size="icon" variant="link" class="hover:no-underline">
								<Avatar.Root>
									<Avatar.Image src={userData.image} alt="profile image" />
									<Avatar.Fallback class="capitalize">{userData.name.charAt(0)}</Avatar.Fallback>
								</Avatar.Root>
							</Button>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content class="w-56">
							<DropdownMenu.Label>{userData?.name}</DropdownMenu.Label>
							<DropdownMenu.Separator />
							<DropdownMenu.Item href="/Profile">Profile</DropdownMenu.Item>
							<DropdownMenu.Separator />
							<DropdownMenu.Item on:click={() => signOut()}>Log out</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				{:else}
					<DropdownMenu.Root>
						<DropdownMenu.Trigger asChild let:builder>
							<Button builders={[builder]} size="icon" variant="link" class="hover:no-underline">
								<Avatar.Root>
									<Avatar.Fallback class="capitalize">{userData.username.charAt(0)}</Avatar.Fallback
									>
								</Avatar.Root>
							</Button>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content class="w-56">
							<DropdownMenu.Label>{userData.username}</DropdownMenu.Label>
							<DropdownMenu.Separator />
							<DropdownMenu.Item href="/Profile">Profile</DropdownMenu.Item>
							<DropdownMenu.Separator />
							<DropdownMenu.Item data-sveltekit-reload href="/Logout">Log out</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				{/if}
			{:else}
				<a
					href="/Login"
					class="rounded-lg bg-green-700 px-4 py-2 text-center text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
					>Sign In</a
				>
			{/if}
			<div class="px-2">
				<ThemeSwitch />
				<Button variant="outline" type="button" size="icon">
					<a target="_blank" href="https://github.com/Michael-Obele/Svelte-MiniApps">
						<span class="sr-only">See GitHub Repo</span>
						<Github class="h-[1.2rem] w-[1.2rem]" />
					</a>
				</Button>
			</div>
			<Button
				data-collapse-toggle="navbar-user"
				variant="outline"
				type="button"
				size="icon"
				class="inline-flex h-10 w-10 items-center justify-center rounded-lg px-2 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600 md:hidden"
				aria-controls="navbar-user"
				on:click={() => (show = !show)}
				aria-expanded="false"
			>
				<span class="sr-only">Open main menu</span>

				<Menu aria-hidden="true" />
			</Button>
		</div>
		<div
			class={` w-full items-center justify-between md:order-1 md:flex md:w-auto ${show ? 'block' : 'hidden'}`}
			id="navbar-user"
		>
			<ul
				class="mt-4 flex flex-col rounded-lg border border-gray-100 bg-gray-50 p-4 font-medium dark:border-gray-700 dark:bg-gray-800 md:mt-0 md:flex-row md:space-x-8 md:border-0 md:bg-white md:p-0 md:dark:bg-gray-900 rtl:space-x-reverse"
			>
				{#each ['Home', 'Apps', 'About'] as item}
					<li>
						<a
							href={href(item)}
							class={`${isActive(item) ? 'block rounded bg-red-700 px-3 py-2 text-white md:bg-transparent md:p-0 md:text-red-700 md:dark:text-red-500' : 'block rounded px-3 py-2 text-gray-900 hover:bg-gray-100 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:p-0 md:hover:bg-transparent md:hover:text-red-700 md:dark:hover:bg-transparent md:dark:hover:text-red-500'}`}
							aria-current={isActive(item) ? 'page' : undefined}>{item}</a
						>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</nav>

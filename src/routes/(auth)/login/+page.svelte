<script lang="ts">
	import Loading from '@/blocks/Loading.svelte';
	import type { PageData } from './$types';
	import { Button } from '@/ui/button';
	import { Input } from '@/ui/input';
	import { Label } from '@/ui/label';
	import { Alert, AlertDescription } from '@/ui/alert';
	import { AlertCircle, Eye, EyeOff, Github } from '@lucide/svelte';
	import Svelte from '$lib/assets/svelte.svelte';
	import google from '$lib/assets/google-logo.svg';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import { loginUser } from '$lib/remote';

	$effect(() => {
		invalidateAll();
		if (document.referrer.includes('/logout')) {
			console.log('Reloading page');
			window.location.reload();
		}

		// If no redirect parameter is set, use document.referrer
		if (!page.url.searchParams.has('redirect') && document.referrer) {
			const referrerUrl = new URL(document.referrer);
			// Only use referrer if it's from the same origin
			if (referrerUrl.origin === window.location.origin) {
				const newUrl = new URL(window.location.href);
				newUrl.searchParams.set('redirect', document.referrer);
				window.history.replaceState(null, '', newUrl.toString());
			}
		}
	});

	let { data }: { data: PageData } = $props();

	const login = loginUser;
	let showPassword = $state(false);

	let githubUrl = $derived(
		`/login/github?redirect=${encodeURIComponent(page.url.searchParams.get('redirect') || '/')}`
	);

	function togglePassword() {
		showPassword = !showPassword;
	}
</script>

<svelte:head>
	<title>Login | Svelte Mini Apps</title>
	<meta name="description" content="Login to access your Svelte Mini Apps account" />
</svelte:head>

<section class="bg-background min-h-screen py-3">
	<div class="mx-auto flex flex-col items-center justify-center px-6 py-8 md:h-screen lg:py-0">
		<!-- Logo -->
		<a href="/" class="my-5 flex items-center space-x-3 rtl:space-x-reverse">
			<div class="flex text-2xl font-semibold">
				<span class="m-1 h-6 w-6 self-center whitespace-nowrap">
					<Svelte />
				</span>
				MiniApps
			</div>
		</a>

		<div class="bg-card w-full rounded-lg p-6 shadow sm:max-w-md sm:p-8 md:mt-0">
			<h2 class="mb-1 text-xl leading-tight font-bold tracking-tight md:text-2xl">
				Sign in to your account
			</h2>
			<div class="mb-4 flex flex-col gap-3">
				{#if data.error}
					<Alert variant="destructive">
						<AlertCircle class="h-4 w-4" />
						<AlertDescription>
							{data.error}
						</AlertDescription>
					</Alert>
				{/if}
			</div>
			<form {...login} class="space-y-4">
				<div class="grid gap-2">
					<Label for="username">Username</Label>
					<Input
						{...login.fields.username.as('text')}
						id="username"
						autocapitalize="none"
						autocomplete="username"
						autocorrect="off"
						required
						placeholder="e.g., john_doe123"
					/>
					{#each login.fields.username.issues() ?? [] as issue}
						<p class="text-xs text-red-500">{issue.message}</p>
					{/each}
					<p class="text-muted-foreground text-xs">
						3-31 characters: lowercase letters, numbers, underscores, and hyphens
					</p>
				</div>

				<div class="grid gap-2">
					<Label for="password">Password</Label>
					<div class="relative">
						<Input
							{...login.fields.password.as('password')}
							id="password"
							type={showPassword ? 'text' : 'password'}
							autocomplete="current-password"
							required
							placeholder="••••••••"
						/>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							class="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
							onclick={togglePassword}
						>
							{#if showPassword}
								<EyeOff class="h-4 w-4" />
							{:else}
								<Eye class="h-4 w-4" />
							{/if}
						</Button>
					</div>
					{#each login.fields.password.issues() ?? [] as issue}
						<p class="text-xs text-red-500">{issue.message}</p>
					{/each}
					<p class="text-muted-foreground text-xs">Minimum 6 characters</p>
				</div>

				<div class="space-y-2">
					<div class="relative">
						<div class="absolute inset-0 flex items-center">
							<span class="w-full border-t"></span>
						</div>
						<div class="relative flex justify-center text-xs uppercase">
							<span class="bg-background text-muted-foreground px-2">Or continue with</span>
						</div>
					</div>

					<div class="grid grid-cols-2 gap-3">
						<a href={githubUrl}>
							<Button variant="outline" class="group w-full" disabled={!!login.pending}>
								<Github class="mr-2 size-4" />
								Github
							</Button>
						</a>
						<Button variant="outline" class="group w-full" disabled={!!login.pending}>
							<img
								src={google}
								alt="Google"
								class="mr-2 size-4 saturate-0 transition-colors delay-150 duration-300 group-hover:saturate-100"
							/>
							Google
						</Button>
					</div>
				</div>

				<Button type="submit" class="w-full" disabled={!!login.pending}>
					{#if login.pending}
						<Loading class="fill-red-600/70 text-white dark:text-white" />
					{/if}
					Sign in with Username
				</Button>

				<p class="text-muted-foreground px-8 text-center text-sm">
					Don't have an account?
					<a href="/register" class="hover:text-primary underline underline-offset-4">Sign up</a>
				</p>
			</form>
		</div>
	</div>
</section>

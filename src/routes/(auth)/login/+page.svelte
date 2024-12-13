<script lang="ts">
	import Loading from '@/components/blocks/Loading.svelte';

	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { AlertCircle, Eye, EyeOff, Github } from 'lucide-svelte';
	import Svelte from '$lib/assets/svelte.svelte';
	import google from '$lib/assets/google-logo.svg';
	import { invalidate, invalidateAll } from "$app/navigation";
	$effect(() => {
		invalidateAll();
	});

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let isLoading = $state(false);
	let showPassword = $state(false);

	function handleSubmit() {
		isLoading = true;
		return async ({ update }: { update: () => Promise<void> }) => {
			await update();
			isLoading = false;
		};
	}

	function togglePassword() {
		showPassword = !showPassword;
	}
</script>

<svelte:head>
	<title>Login | Svelte MiniApps</title>
	<meta name="description" content="Login to access your Svelte MiniApps account" />
</svelte:head>

<section class="min-h-screen bg-background py-3">
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

		<div
			class="w-full rounded-lg bg-card p-6 shadow sm:max-w-md sm:p-8 md:mt-0"
		>
			<h2 class="mb-1 text-xl font-bold leading-tight tracking-tight md:text-2xl">Sign in to your account</h2>
			<div class="mb-4 flex flex-col gap-3">
				{#if form?.message || data.error}
					<Alert variant="destructive">
						<AlertCircle class="h-4 w-4" />
						<AlertDescription>
							{form?.message || data.error}
						</AlertDescription>
					</Alert>
				{/if}
			</div>
			<form method="POST" action="?/login" use:enhance={handleSubmit} class="space-y-4">
				<div class="grid gap-2">
					<Label for="username">Username</Label>
					<Input
						id="username"
						name="username"
						type="text"
						value={form?.username ?? ''}
						autocapitalize="none"
						autocomplete="username"
						autocorrect="off"
						required
						placeholder="e.g., john_doe123"
					/>
					<p class="text-xs text-muted-foreground">
						3-31 characters: lowercase letters, numbers, underscores, and hyphens
					</p>
				</div>

				<div class="grid gap-2">
					<Label for="password">Password</Label>
					<div class="relative">
						<Input
							id="password"
							name="password"
							type={showPassword ? 'text' : 'password'}
							autocomplete="current-password"
							required
							placeholder="••••••••"
						/>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							class="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
							onclick={togglePassword}
						>
							{#if showPassword}
								<EyeOff class="h-4 w-4" />
							{:else}
								<Eye class="h-4 w-4" />
							{/if}
						</Button>
					</div>
					<p class="text-xs text-muted-foreground">Minimum 6 characters</p>
				</div>

				<div class="space-y-2">
					<div class="relative">
						<div class="absolute inset-0 flex items-center">
							<span class="w-full border-t"></span>
						</div>
						<div class="relative flex justify-center text-xs uppercase">
							<span class="bg-background px-2 text-muted-foreground">Or continue with</span>
						</div>
					</div>

					<div class="grid grid-cols-2 gap-3">
						<a href="/login/github">
							<Button variant="outline" class="group w-full" disabled={isLoading}>
								<Github class="mr-2 size-4" />
								Github
							</Button>
						</a>
						<Button variant="outline" class="group w-full" disabled={isLoading}>
							<img
								src={google}
								alt="Google"
								class="mr-2 size-4 saturate-0 transition-colors delay-150 duration-300 group-hover:saturate-100"
							/>
							Google
						</Button>
					</div>
				</div>

				<Button type="submit" class="w-full" disabled={isLoading}>
					{#if isLoading}
						<Loading class="fill-red-600/70 text-white dark:text-white" />
					{/if}
					Sign in with Username
				</Button>

				<p class="px-8 text-center text-sm text-muted-foreground">
					Don't have an account?
					<a href="/register" class="underline underline-offset-4 hover:text-primary">Sign up</a>
				</p>
			</form>
		</div>
	</div>
</section>

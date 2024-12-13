<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { AlertCircle, Eye, EyeOff } from 'lucide-svelte';
	import Loading from '@/components/blocks/Loading.svelte';
	import { invalidate, invalidateAll } from "$app/navigation";
	$effect(() => {
		invalidateAll();
	});

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let isLoading = $state(false);
	let password = $state('');
	let confirmPassword = $state('');
	let passwordMatch = $state(true);
	let showPassword = $state(false);
	let showConfirmPassword = $state(false);

	function handleSubmit() {
		isLoading = true;
		return async ({ update }: { update: () => Promise<void> }) => {
			await update();
			isLoading = false;
		};
	}

	function checkPasswordMatch() {
		passwordMatch = !password || !confirmPassword || password === confirmPassword;
	}

	function togglePassword() {
		showPassword = !showPassword;
	}

	function toggleConfirmPassword() {
		showConfirmPassword = !showConfirmPassword;
	}

	$effect(() => {
		checkPasswordMatch();
	});
</script>

<svelte:head>
	<title>Sign Up | Svelte MiniApps</title>
	<meta name="description" content="Create your Svelte MiniApps account" />
</svelte:head>

<div class="container mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-8">
	<div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
		<div class="flex flex-col space-y-2 text-center">
			<h1 class="text-2xl font-semibold tracking-tight">Create an account</h1>
			<p class="text-sm text-muted-foreground">Enter your details to get started</p>
		</div>

		<div class="grid gap-6">
			<form method="POST" action="?/register" use:enhance={handleSubmit} class="space-y-4">
				{#if form?.message}
					<Alert variant="destructive">
						<AlertCircle class="h-4 w-4" />
						<AlertDescription>{form.message}</AlertDescription>
					</Alert>
				{/if}

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
					<div class="space-y-1 text-xs text-muted-foreground">
						<p>Username requirements:</p>
						<ul class="list-disc pl-4">
							<li>3-31 characters long</li>
							<li>Lowercase letters (a-z)</li>
							<li>Numbers (0-9)</li>
							<li>Underscores (_) and hyphens (-)</li>
							<li>Must start with a letter</li>
						</ul>
					</div>
				</div>

				<div class="grid gap-2">
					<Label for="password">Password</Label>
					<div class="relative">
						<Input
							id="password"
							name="password"
							type={showPassword ? 'text' : 'password'}
							bind:value={password}
							autocomplete="new-password"
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
					<div class="space-y-1 text-xs text-muted-foreground">
						<p>Password requirements:</p>
						<ul class="list-disc pl-4">
							<li>Minimum 6 characters</li>
							<li>Maximum 255 characters</li>
							<li>No spaces at beginning or end</li>
							<li>Case sensitive</li>
						</ul>
					</div>
				</div>

				<div class="grid gap-2">
					<Label for="confirmPassword">Confirm Password</Label>
					<div class="relative">
						<Input
							id="confirmPassword"
							name="confirmPassword"
							type={showConfirmPassword ? 'text' : 'password'}
							bind:value={confirmPassword}
							autocomplete="new-password"
							required
							placeholder="••••••••"
							class={!passwordMatch ? 'border-red-500' : ''}
						/>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							class="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
							onclick={toggleConfirmPassword}
						>
							{#if showConfirmPassword}
								<EyeOff class="h-4 w-4" />
							{:else}
								<Eye class="h-4 w-4" />
							{/if}
						</Button>
					</div>
					{#if !passwordMatch}
						<p class="text-xs text-red-500">Passwords do not match</p>
					{/if}
				</div>

				<Button type="submit" class="w-full" disabled={isLoading || !passwordMatch}>
					{#if isLoading}
					<Loading class="fill-red-600/70 text-white dark:text-white" />
					{/if}
					Create Account
				</Button>
			</form>
		</div>

		<p class="px-8 text-center text-sm text-muted-foreground">
			<a href="/login" class="hover:text-brand underline underline-offset-4">
				Already have an account? Sign In
			</a>
		</p>
	</div>
</div>

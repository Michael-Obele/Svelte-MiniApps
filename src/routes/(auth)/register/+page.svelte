<script lang="ts">
	import type { PageData } from './$types';
	import { Button } from '@/ui/button';
	import { Input } from '@/ui/input';
	import { Label } from '@/ui/label';
	import { Alert, AlertDescription } from '@/ui/alert';
	import { AlertCircle, Eye, EyeOff } from '@lucide/svelte';
	import Loading from '@/blocks/Loading.svelte';
	import { invalidateAll } from '$app/navigation';
	import { Switch } from '@/ui/switch/index.js';
	import { registerUser } from '$lib/remote';

	$effect(() => {
		invalidateAll();
	});

	let { data }: { data: PageData } = $props();

	const register = registerUser;
	let showPassword = $state(false);
	let showConfirmPassword = $state(false);
	let isAdmin = $state(false); // Default to not admin

	let passwordMatch = $derived(
		!register.fields.password.value() ||
			!register.fields.confirmPassword.value() ||
			register.fields.password.value() === register.fields.confirmPassword.value()
	);

	function togglePassword() {
		showPassword = !showPassword;
	}

	function toggleConfirmPassword() {
		showConfirmPassword = !showConfirmPassword;
	}

	// Update role field when switch changes
	$effect(() => {
		register.fields.role.set(isAdmin ? 'tester' : 'user');
	});
</script>

<svelte:head>
	<title>Sign Up | Svelte Mini Apps</title>
	<meta name="description" content="Create your Svelte Mini Apps account" />
</svelte:head>

<div
	class="container mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-8"
>
	<div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
		<div class="flex flex-col space-y-2 text-center">
			<h1 class="text-2xl font-semibold tracking-tight">Create an account</h1>
			<p class="text-muted-foreground text-sm">Enter your details to get started</p>
		</div>

		<div class="grid gap-6">
			<form {...register} class="space-y-4">
				<div class="grid gap-2">
					<Label for="username">Username</Label>
					<Input
						{...register.fields.username.as('text')}
						id="username"
						autocapitalize="none"
						autocomplete="username"
						autocorrect="off"
						required
						placeholder="e.g., john_doe123"
					/>
					{#each register.fields.username.issues() ?? [] as issue}
						<p class="text-xs text-red-500">{issue.message}</p>
					{/each}
					<div class="text-muted-foreground space-y-1 text-xs">
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
							{...register.fields.password.as('password')}
							id="password"
							type={showPassword ? 'text' : 'password'}
							autocomplete="new-password"
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
					{#each register.fields.password.issues() ?? [] as issue}
						<p class="text-xs text-red-500">{issue.message}</p>
					{/each}
					<div class="text-muted-foreground space-y-1 text-xs">
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
							{...register.fields.confirmPassword.as('password')}
							id="confirmPassword"
							type={showConfirmPassword ? 'text' : 'password'}
							autocomplete="new-password"
							required
							placeholder="••••••••"
							class={!passwordMatch ? 'border-red-500' : ''}
						/>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							class="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
							onclick={toggleConfirmPassword}
						>
							{#if showConfirmPassword}
								<EyeOff class="h-4 w-4" />
							{:else}
								<Eye class="h-4 w-4" />
							{/if}
						</Button>
					</div>
					{#each register.fields.confirmPassword.issues() ?? [] as issue}
						<p class="text-xs text-red-500">{issue.message}</p>
					{/each}
					{#if !passwordMatch && !register.fields.confirmPassword.issues()?.length}
						<p class="text-xs text-red-500">Passwords do not match</p>
					{/if}
				</div>

				<div class="flex items-center space-x-2">
					<Switch id="tester-mode" bind:checked={isAdmin} />
					<Label for="tester-mode">Tester</Label>
				</div>

				<Button type="submit" class="w-full" disabled={!!register.pending || !passwordMatch}>
					{#if register.pending}
						<Loading class="fill-red-600/70 text-white dark:text-white" />
					{/if}
					Create Account
				</Button>
			</form>
		</div>

		<p class="text-muted-foreground px-8 text-center text-sm">
			<a href="/login" class="hover:text-brand underline underline-offset-4">
				Already have an account? Sign In
			</a>
		</p>
	</div>
</div>

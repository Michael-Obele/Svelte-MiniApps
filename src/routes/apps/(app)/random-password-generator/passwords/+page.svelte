<script lang="ts">
	import { Button } from '@/ui/button';
	import { ArrowLeft, Shield } from '@lucide/svelte';
	import { site } from '$lib/index.svelte';
	import RouteHead from '$lib/components/blocks/RouteHead.svelte';
	import { PasswordDisplay } from '../components';
	import { getSavedPasswords } from '$lib/remote';
	import * as Card from '@/ui/card';
	import { Separator } from '@/ui/separator';
</script>

<RouteHead
	title="{site().name} - Saved Passwords"
	description="View and manage your saved passwords securely."
	keywords="saved passwords, password manager, secure passwords, svelte apps"
	route="/apps/password-generator/passwords"
	image={site().image}
/>

<div class="container mx-auto px-4 py-6 sm:py-8 md:py-12">
	<div class="mx-auto max-w-7xl space-y-8">
		<!-- Header Section -->
		<div class="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
			<div class="flex items-start gap-4">
				<Button
					variant="outline"
					size="icon"
					href="/apps/random-password-generator"
					class="shrink-0"
				>
					<ArrowLeft class="h-5 w-5" />
				</Button>
				<div class="space-y-1">
					<div class="flex items-center gap-2">
						<Shield class="text-primary h-6 w-6" />
						<h1 class="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
							Saved Passwords
						</h1>
					</div>
					<p class="text-muted-foreground text-sm sm:text-base">
						Securely manage and access your generated passwords
					</p>
				</div>
			</div>

			<Button href="/apps/random-password-generator" variant="default" class="w-full sm:w-auto">
				Generate New Password
			</Button>
		</div>

		<Separator />

		<!-- Content Section -->
		<!-- Passwords Section with Reactive Query -->
		{#await getSavedPasswords()}
			<div class="flex items-center justify-center py-12">
				<div
					class="size-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-600"
				></div>
			</div>
		{:then passwords}
			<!-- Empty State -->
			{#if passwords.length === 0}
				<Card.Root class="mx-auto max-w-2xl">
					<Card.Content class="flex flex-col items-center justify-center py-12 text-center">
						<div class="bg-muted mb-4 rounded-full p-4">
							<Shield class="text-muted-foreground h-12 w-12" />
						</div>
						<Card.Title class="mb-2 text-xl">No Saved Passwords</Card.Title>
						<Card.Description class="text-muted-foreground mb-6 max-w-sm">
							Start generating secure passwords to keep track of them here. Your passwords are
							encrypted and stored safely.
						</Card.Description>
						<Button href="/apps/random-password-generator" size="lg">
							Create Your First Password
						</Button>
					</Card.Content>
				</Card.Root>
			{:else}
				<div class="space-y-6">
					<!-- Stats Card -->
					<Card.Root>
						<Card.Header class="flex flex-row items-center justify-between py-3">
							<div>
								<Card.Title class="text-lg sm:text-xl">Your Password Vault</Card.Title>
								<Card.Description class="mt-1">
									{passwords.length}
									{passwords.length === 1 ? 'password' : 'passwords'} stored securely
								</Card.Description>
							</div>
							<div
								class="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold"
							>
								{passwords.length}
							</div>
						</Card.Header>
					</Card.Root>

					<!-- Passwords Grid -->
					<div class="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
						{#each passwords as savedPassword (savedPassword.id)}
							<div class="h-full">
								<PasswordDisplay password={savedPassword} />
							</div>
						{/each}
					</div>
				</div>
			{/if}
		{/await}
		<!-- Info Section -->
		<Card.Root class="bg-muted/50 border-dashed">
			<Card.Content class="py-6">
				<div class="flex items-start gap-3">
					<Shield class="text-primary mt-0.5 h-5 w-5 shrink-0" />
					<div class="space-y-1">
						<p class="text-sm font-medium">Secure Storage</p>
						<p class="text-muted-foreground text-xs leading-relaxed">
							All passwords are encrypted and stored securely. You can view, copy, and delete your
							passwords at any time. For maximum security, consider using a dedicated password
							manager for sensitive accounts.
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</div>

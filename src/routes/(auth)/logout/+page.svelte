<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '@/ui/button';
	import { LogOut } from '@lucide/svelte';
	import { invalidate, invalidateAll } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	$effect(() => {
		invalidateAll();
	});
</script>

<svelte:head>
	<title>Logout | Svelte Mini Apps</title>
</svelte:head>

<div class="container flex min-h-screen min-w-screen flex-col items-center justify-center">
	<div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
		<div class="flex flex-col space-y-2 text-center">
			<h1 class="text-2xl font-semibold tracking-tight">Sign Out</h1>
			<p class="text-muted-foreground text-sm">Click below to sign out of your account</p>
		</div>

		<form
			method="POST"
			action="?/logout"
			use:enhance={() => {
				toast.loading('Signing out...', {
					duration: Number.POSITIVE_INFINITY
				});
				return async ({ result }) => {
					if (result.type === 'redirect') {
						toast.success('Successfully signed out');
						toast.dismiss();
						window.location.reload();
					}
				};
			}}
			class="space-y-4"
		>
			<Button type="submit" class="w-full">
				<LogOut class="mr-2 h-4 w-4" />
				Sign Out
			</Button>
		</form>
	</div>
</div>

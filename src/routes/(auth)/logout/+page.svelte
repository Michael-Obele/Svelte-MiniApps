<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { LogOut } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Logout | Svelte MiniApps</title>
</svelte:head>

<div class="container flex h-screen w-screen flex-col items-center justify-center">
	<div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
		<div class="flex flex-col space-y-2 text-center">
			<h1 class="text-2xl font-semibold tracking-tight">Sign Out</h1>
			<p class="text-sm text-muted-foreground">Click below to sign out of your account</p>
		</div>

		<form method="POST" action="?/logout" use:enhance class="space-y-4">
			<Button type="submit" class="w-full">
				<LogOut class="mr-2 h-4 w-4" />
				Sign Out
			</Button>
		</form>
	</div>
</div>

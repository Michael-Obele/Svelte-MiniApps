<script lang="ts">
	import RouteHead from '$lib/components/blocks/RouteHead.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import AccountSettingsList from '../AccountSettingsList.svelte';
	import { User, Link, Bell } from 'lucide-svelte';
</script>

<RouteHead
	title="Profile Settings - Svelte Mini Apps"
	description="Manage your account settings and preferences."
/>

<div class="space-y-8">
	<!-- Page Header -->
	<div>
		<h2 class="text-xl font-semibold tracking-tight">Account Settings</h2>
		<p class="text-muted-foreground text-sm">Manage your profile information and connected accounts</p>
	</div>

	<!-- Main Settings Card -->
	<Card.Root>
		<Card.Header>
			<div class="flex items-center gap-2">
				<div class="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
					<User class="text-primary size-4" />
				</div>
				<div>
					<Card.Title>Profile & Account</Card.Title>
					<Card.Description>Update your personal information and manage security settings</Card.Description>
				</div>
			</div>
		</Card.Header>
		<Card.Content>
			<AccountSettingsList />
		</Card.Content>
	</Card.Root>
</div>

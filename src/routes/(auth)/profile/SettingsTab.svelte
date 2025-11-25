<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import AccountSettingsList from './AccountSettingsList.svelte';
	import PwdComponent from './PwdComponent.svelte';
	import SessionManagement from './SessionManagement.svelte';
	import { User, KeyRound, Shield } from 'lucide-svelte';
</script>

<div class="space-y-8">
	<!-- Account Settings Section -->
	<section class="space-y-4">
		<div class="flex items-center gap-2">
			<div class="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
				<User class="text-primary size-4" />
			</div>
			<div>
				<h2 class="font-semibold">Account Settings</h2>
				<p class="text-muted-foreground text-sm">Manage your profile and connected accounts</p>
			</div>
		</div>
		<Card.Root>
			<Card.Content class="pt-6">
				<AccountSettingsList />
			</Card.Content>
		</Card.Root>
	</section>

	<Separator />

	<!-- Security Section -->
	<section class="space-y-4">
		<div class="flex items-center gap-2">
			<div class="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
				<Shield class="text-primary size-4" />
			</div>
			<div>
				<h2 class="font-semibold">Security</h2>
				<p class="text-muted-foreground text-sm">Manage your sessions and security settings</p>
			</div>
		</div>
		<SessionManagement />
	</section>

	<Separator />

	<!-- Password Section -->
	<section class="space-y-4">
		<div class="flex items-center gap-2">
			<div class="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
				<KeyRound class="text-primary size-4" />
			</div>
			<div>
				<h2 class="font-semibold">Password</h2>
				<p class="text-muted-foreground text-sm">
					Update your password to keep your account secure
				</p>
			</div>
		</div>
		<PwdComponent />
	</section>
</div>

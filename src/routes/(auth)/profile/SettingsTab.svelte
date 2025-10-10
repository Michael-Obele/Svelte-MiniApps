<script lang="ts">
	import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/ui/card";
	import AccountSettingsList from './AccountSettingsList.svelte';
	import PwdComponent from './PwdComponent.svelte';
</script>

<div class="space-y-6">
	<Card>
		<CardHeader>
			<CardTitle>Account Settings</CardTitle>
			<CardDescription>Manage your profile and preferences</CardDescription>
		</CardHeader>
		<CardContent>
			<AccountSettingsList />
		</CardContent>
	</Card>
	
	<PwdComponent />
</div>

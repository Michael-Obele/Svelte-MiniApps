<script lang="ts">
	import RouteHead from '$lib/components/blocks/RouteHead.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import { Separator } from '$lib/components/ui/separator';
	import { Sliders, Bell, Lock, Palette, Globe } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	// Preference states
	let emailNotifications = $state(true);
	let pushNotifications = $state(false);
	let activityUpdates = $state(true);
	let weeklyDigest = $state(false);

	// Privacy settings
	let publicProfile = $state(false);
	let showActivity = $state(true);
	let dataCollection = $state(true);

	// UI preferences
	let compactMode = $state(false);
	let autoSave = $state(true);

	// Save preferences
	async function savePreferences() {
		const toastId = toast.loading('Saving preferences...');

		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1000));

		// In a real app, you'd save to database via remote function
		localStorage.setItem(
			'userPreferences',
			JSON.stringify({
				notifications: {
					email: emailNotifications,
					push: pushNotifications,
					activity: activityUpdates,
					digest: weeklyDigest
				},
				privacy: {
					publicProfile,
					showActivity,
					dataCollection
				},
				ui: {
					compact: compactMode,
					autoSave
				}
			})
		);

		toast.success('Preferences saved successfully!', { id: toastId });
	}

	// Load preferences from localStorage on mount
	$effect(() => {
		const saved = localStorage.getItem('userPreferences');
		if (saved) {
			try {
				const prefs = JSON.parse(saved);
				emailNotifications = prefs.notifications?.email ?? true;
				pushNotifications = prefs.notifications?.push ?? false;
				activityUpdates = prefs.notifications?.activity ?? true;
				weeklyDigest = prefs.notifications?.digest ?? false;
				publicProfile = prefs.privacy?.publicProfile ?? false;
				showActivity = prefs.privacy?.showActivity ?? true;
				dataCollection = prefs.privacy?.dataCollection ?? true;
				compactMode = prefs.ui?.compact ?? false;
				autoSave = prefs.ui?.autoSave ?? true;
			} catch (e) {
				console.error('Failed to load preferences:', e);
			}
		}
	});
</script>

<RouteHead
	title="Preferences - Svelte Mini Apps"
	description="Manage your app preferences and settings."
/>

<div class="space-y-6">
	<!-- Header -->
	<div>
		<h2 class="flex items-center gap-2 text-2xl font-bold">
			<Sliders class="size-6" />
			Preferences
		</h2>
		<p class="text-muted-foreground mt-1 text-sm">
			Customize your experience and manage your settings
		</p>
	</div>

	<!-- Notifications -->
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<Bell class="size-5 text-blue-500" />
				Notifications
			</Card.Title>
			<Card.Description>Manage how you receive notifications and updates</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-6">
			<div class="flex items-center justify-between">
				<div class="space-y-0.5">
					<Label for="email-notifications" class="text-base">Email Notifications</Label>
					<p class="text-muted-foreground text-sm">Receive email updates about your activity</p>
				</div>
				<Switch id="email-notifications" bind:checked={emailNotifications} />
			</div>

			<Separator />

			<div class="flex items-center justify-between">
				<div class="space-y-0.5">
					<Label for="push-notifications" class="text-base">Push Notifications</Label>
					<p class="text-muted-foreground text-sm">Get instant browser notifications</p>
				</div>
				<Switch id="push-notifications" bind:checked={pushNotifications} />
			</div>

			<Separator />

			<div class="flex items-center justify-between">
				<div class="space-y-0.5">
					<Label for="activity-updates" class="text-base">Activity Updates</Label>
					<p class="text-muted-foreground text-sm">Notifications for app usage milestones</p>
				</div>
				<Switch id="activity-updates" bind:checked={activityUpdates} />
			</div>

			<Separator />

			<div class="flex items-center justify-between">
				<div class="space-y-0.5">
					<Label for="weekly-digest" class="text-base">Weekly Digest</Label>
					<p class="text-muted-foreground text-sm">Weekly summary of your activity and stats</p>
				</div>
				<Switch id="weekly-digest" bind:checked={weeklyDigest} />
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Privacy -->
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<Lock class="size-5 text-green-500" />
				Privacy
			</Card.Title>
			<Card.Description>Control your data and visibility settings</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-6">
			<div class="flex items-center justify-between">
				<div class="space-y-0.5">
					<Label for="public-profile" class="text-base">Public Profile</Label>
					<p class="text-muted-foreground text-sm">Allow others to view your profile information</p>
				</div>
				<Switch id="public-profile" bind:checked={publicProfile} />
			</div>

			<Separator />

			<div class="flex items-center justify-between">
				<div class="space-y-0.5">
					<Label for="show-activity" class="text-base">Show Activity</Label>
					<p class="text-muted-foreground text-sm">Display your activity to other users</p>
				</div>
				<Switch id="show-activity" bind:checked={showActivity} />
			</div>

			<Separator />

			<div class="flex items-center justify-between">
				<div class="space-y-0.5">
					<Label for="data-collection" class="text-base">Analytics Data Collection</Label>
					<p class="text-muted-foreground text-sm">Help improve the app by sharing usage data</p>
				</div>
				<Switch id="data-collection" bind:checked={dataCollection} />
			</div>
		</Card.Content>
	</Card.Root>

	<!-- UI Preferences -->
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<Palette class="size-5 text-purple-500" />
				Interface
			</Card.Title>
			<Card.Description>Customize how the app looks and behaves</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-6">
			<div class="flex items-center justify-between">
				<div class="space-y-0.5">
					<Label for="compact-mode" class="text-base">Compact Mode</Label>
					<p class="text-muted-foreground text-sm">Reduce spacing for a more condensed view</p>
				</div>
				<Switch id="compact-mode" bind:checked={compactMode} />
			</div>

			<Separator />

			<div class="flex items-center justify-between">
				<div class="space-y-0.5">
					<Label for="auto-save" class="text-base">Auto-Save</Label>
					<p class="text-muted-foreground text-sm">Automatically save your work</p>
				</div>
				<Switch id="auto-save" bind:checked={autoSave} />
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Save Button -->
	<div class="flex justify-end gap-3">
		<Button variant="outline" onclick={() => location.reload()}>Reset</Button>
		<Button onclick={savePreferences} class="gap-2">
			<Globe class="size-4" />
			Save Preferences
		</Button>
	</div>
</div>

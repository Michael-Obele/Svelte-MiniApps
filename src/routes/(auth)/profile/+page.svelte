<script lang="ts">
	import { getUserProfile } from '$lib/remote';
	import { setContext } from 'svelte';

	// Fetch user profile data using remote function
	const profileQuery = getUserProfile();

	// Set context for child components to access without prop drilling
	setContext('profileQuery', profileQuery);

	// Tab components
	import OverviewTab from './OverviewTab.svelte';
	import ProjectsTab from './ProjectsTab.svelte';
	import LearningTab from './LearningTab.svelte';
	import SettingsTab from './SettingsTab.svelte';
	import AppUsageStats from './AppUsageStats.svelte';

	// UI components
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs';
	import { Button } from '@/ui/button';
	import { TrendingUp, User, RefreshCw } from '@lucide/svelte';

	// Active tab state
	let activeTab = $state('overview');

	// Refresh profile data
	function refreshProfile() {
		getUserProfile().refresh();
	}
</script>

<svelte:head>
	<title>Profile - Svelte Mini Apps</title>
	<meta
		name="description"
		content="Profile page for Svelte Mini Apps, a collection of small, focused web applications built with Svelte."
	/>
</svelte:head>
<main class="bg-gray-100 dark:bg-gray-900">
	<section class="container min-h-screen space-y-6 p-6 py-4">
		<div class="flex items-center justify-between">
			<h1 class="text-2xl font-semibold md:text-3xl lg:text-4xl">Developer Dashboard</h1>
			<div class="flex items-center gap-2">
				<Button variant="outline" class="gap-2" onclick={refreshProfile}>
					<RefreshCw class="h-4 w-4" />
					<span class="hidden sm:inline">Refresh</span>
				</Button>
				<Button variant="ghost" size="icon" class="sm:hidden">
					<User class="h-4 w-4" />
				</Button>
			</div>
		</div>

		<Tabs bind:value={activeTab} class="w-full">
			<TabsList class="grid w-full grid-cols-5 lg:w-[750px]">
				<TabsTrigger value="overview">Overview</TabsTrigger>
				<TabsTrigger value="projects">Projects</TabsTrigger>
				<TabsTrigger value="usage">Usage Stats</TabsTrigger>
				<TabsTrigger value="learning">Learning</TabsTrigger>
				<TabsTrigger value="settings">Settings</TabsTrigger>
			</TabsList>

			<TabsContent value="overview">
				<OverviewTab />
			</TabsContent>

			<TabsContent value="projects">
				<ProjectsTab />
			</TabsContent>

			<TabsContent value="usage">
				<AppUsageStats />
			</TabsContent>

			<TabsContent value="learning">
				<LearningTab />
			</TabsContent>

			<TabsContent value="settings">
				<SettingsTab />
			</TabsContent>
		</Tabs>
	</section>
</main>

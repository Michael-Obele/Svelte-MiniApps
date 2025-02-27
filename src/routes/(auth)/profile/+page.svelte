<script lang="ts">
	import type { PageData } from './$types';
	import type { ActionData } from './$types.js';

	let { data, form }: { data: PageData, form: ActionData } = $props();
	
	// Tab components
	import OverviewTab from './OverviewTab.svelte';
	import ProjectsTab from './ProjectsTab.svelte';
	import LearningTab from './LearningTab.svelte';
	import SettingsTab from './SettingsTab.svelte';
	import AppUsageStats from './AppUsageStats.svelte';
	
	// UI components
	import { Tabs, TabsContent, TabsList, TabsTrigger } from "$lib/components/ui/tabs";
	import { Button } from "$lib/components/ui/button";
	import { TrendingUp } from "lucide-svelte";
</script>

<svelte:head>
	<title>Profile - Svelte Mini Apps</title>
	<meta
		name="description"
		content="Profile page for Svelte Mini Apps, a collection of small, focused web applications built with Svelte."
	/>
</svelte:head>

<section class="min-h-screen space-y-6 bg-gray-100 p-6 py-4 dark:bg-gray-900">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-semibold md:text-3xl lg:text-4xl">Developer Dashboard</h1>
		<Button variant="outline" class="gap-2">
			<TrendingUp class="h-4 w-4" />
			<span>Your Progress</span>
		</Button>
	</div>
	
	<Tabs value="overview" class="w-full">
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

<script lang="ts">
	import RouteHead from '$lib/components/blocks/RouteHead.svelte';
	import {
		Card,
		CardHeader,
		CardTitle,
		CardDescription,
		CardContent
	} from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertTitle, AlertDescription } from '$lib/components/ui/alert';
	import { Smartphone, Monitor, Download, Users, MessageSquare, TestTube } from '@lucide/svelte';
	import BlurInText from '@/blocks/BlurInText.svelte';

	// Announcement data based on plan/announcements.md
	const announcements = [
		{
			id: 'mobile-desktop-apps',
			title: 'Svelte-MiniApps: Mobile & Desktop Coming Soon',
			date: 'Coming Soon',
			type: 'major',
			content: `We're excited to announce plans to build official mobile and desktop companion apps for Svelte-MiniApps. The apps will be designed to complement the PWA and provide native experiences for offline use, quicker access to frequently used mini-apps, and optional OS integrations.`,
			highlights: [
				'Native shell with offline-first support and selective sync for user data',
				'Tight integration with the existing PWA and account system',
				'Desktop builds (Tauri or Capacitor) with native menus and system tray'
			],
			helpSections: [
				{
					title: 'Feedback',
					description: 'File issues for features you want in the mobile/desktop apps',
					icon: MessageSquare,
					action: 'Create Issue',
					link: 'https://github.com/Michael-Obele/Svelte-MiniApps/issues'
				},
				{
					title: 'Testing',
					description: 'Volunteer to test prototypes when available',
					icon: TestTube,
					action: 'Join Testing',
					link: 'https://github.com/Michael-Obele/Svelte-MiniApps/discussions'
				}
			]
		}
	];

	const getTypeColor = (type: string) => {
		switch (type) {
			case 'major':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
			case 'feature':
				return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
			case 'update':
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
		}
	};
</script>

<svelte:head>
	<title>Announcements - Changelog - Svelte Mini Apps</title>
	<meta
		name="description"
		content="Stay updated with the latest announcements and future plans for Svelte Mini Apps"
	/>
</svelte:head>

<RouteHead
	title="Announcements - Changelog"
	description="Stay updated with the latest announcements and future plans for Svelte Mini Apps including mobile and desktop companion apps"
	route="/changelog/announcements"
	keywords="announcements, updates, mobile apps, desktop apps, Svelte Mini Apps, roadmap"
/>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8">
		<BlurInText>
			<h1 class="mb-4 text-center text-4xl font-bold">Latest Announcements</h1>
			<p class="text-muted-foreground mx-auto max-w-2xl text-center text-lg">
				Stay informed about major milestones, new features, and exciting developments in Svelte
				MiniApps.
			</p>
		</BlurInText>
	</div>

	<div class="space-y-8">
		{#each announcements as announcement}
			<Card class="w-full">
				<CardHeader>
					<div class="flex items-start justify-between">
						<div class="flex-1">
							<CardTitle class="mb-2 text-2xl">{announcement.title}</CardTitle>
							<div class="mb-3 flex items-center gap-2">
								<Badge class={getTypeColor(announcement.type)}>
									{announcement.type.toUpperCase()}
								</Badge>
								<span class="text-muted-foreground text-sm">{announcement.date}</span>
							</div>
						</div>
						<div class="ml-4 flex gap-2">
							<Smartphone class="h-6 w-6 text-blue-500" />
							<Monitor class="h-6 w-6 text-green-500" />
						</div>
					</div>
				</CardHeader>

				<CardContent class="space-y-6">
					<CardDescription class="text-base leading-relaxed">
						{announcement.content}
					</CardDescription>

					<div>
						<h3 class="mb-3 flex items-center gap-2 text-lg font-semibold">
							<Download class="h-5 w-5" />
							Planned Highlights
						</h3>
						<ul class="space-y-2">
							{#each announcement.highlights as highlight}
								<li class="flex items-start gap-2">
									<div class="bg-primary mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full"></div>
									<span class="text-muted-foreground">{highlight}</span>
								</li>
							{/each}
						</ul>
					</div>

					<Alert>
						<Users class="h-4 w-4" />
						<AlertTitle>How You Can Help</AlertTitle>
						<AlertDescription>
							We value your input! Here are ways you can contribute to the development of mobile and
							desktop apps.
						</AlertDescription>
					</Alert>

					<div class="grid gap-4 md:grid-cols-2">
						{#each announcement.helpSections as section}
							<Card class="hover:border-primary/50 border-2 transition-colors">
								<CardContent class="p-4">
									<div class="flex items-start gap-3">
										<svelte:component this={section.icon} class="text-primary mt-0.5 h-5 w-5" />
										<div class="flex-1">
											<h4 class="mb-1 font-semibold">{section.title}</h4>
											<p class="text-muted-foreground mb-3 text-sm">{section.description}</p>
											<Button variant="outline" size="sm">
												<a href={section.link} target="_blank" rel="noopener noreferrer">
													{section.action}
												</a>
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						{/each}
					</div>
				</CardContent>
			</Card>
		{/each}
	</div>

	{#if announcements.length === 0}
		<div class="py-12 text-center">
			<div class="mb-4 text-6xl">📢</div>
			<h2 class="mb-2 text-2xl font-semibold">No Announcements Yet</h2>
			<p class="text-muted-foreground">
				Check back soon for exciting updates and announcements about Svelte Mini Apps!
			</p>
		</div>
	{/if}
</div>

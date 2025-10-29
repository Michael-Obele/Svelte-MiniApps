<script lang="ts">
	import BlurInText from '$lib/components/blocks/BlurInText.svelte';
	import {
		Card,
		CardHeader,
		CardTitle,
		CardDescription,
		CardContent
	} from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import {
		Smartphone,
		Monitor,
		Megaphone,
		Gamepad2,
		BookOpen,
		Calendar,
		Accessibility,
		FileText,
		Image,
		Download,
		Github
	} from '@lucide/svelte';
	import RouteHead from '$lib/components/blocks/RouteHead.svelte';

	// Feature data based on plan/planned-features.md
	const highLevelFeatures = [
		{
			title: 'Mobile Companion Apps',
			description: 'iOS & Android apps with offline-first support and selective sync',
			icon: Smartphone,
			phases: ['Ideation', 'Prototype', 'Alpha', 'Beta', 'Public Release'],
			options: ['WebView shell', 'Capacitor', 'React Native'],
			capabilities: ['Offline-first', 'Selective sync', 'Native integrations']
		},
		{
			title: 'Desktop Companion Apps',
			description: 'Windows, macOS, Linux apps with native menus and system tray',
			icon: Monitor,
			options: ['Tauri (recommended)', 'Electron'],
			capabilities: ['Native menus', 'System tray', 'Window controls']
		},
		{
			title: 'Announcements Page',
			description: 'Markdown-backed announcements with server-side listing',
			icon: Megaphone,
			status: 'Implemented',
			storage: 'plan/announcements.md'
		},
		{
			title: 'Playground',
			description: 'Learning area with walkthroughs and interactive sandbox',
			icon: Gamepad2,
			mvp: 'Non-interactive stepper with Next/Prev controls',
			longTerm: 'Interactive sandbox (StackBlitz/CodeSandbox)'
		},
		{
			title: 'Walkthroughs Per-App',
			description: 'Chunked learning steps for each mini-app',
			icon: BookOpen,
			steps: ['Overview', 'Design', 'Data Model', 'UI', 'Logic', 'Testing', 'Deployment'],
			storage: 'plan/walkthroughs/<app>/'
		},
		{
			title: 'Timeline UI & Data',
			description: 'Structured milestone tracking and roadmap visualization',
			icon: Calendar,
			dataFormat: 'JSON milestones',
			source: 'plan/timeline.md'
		},
		{
			title: 'Accessibility & UX',
			description: 'Enhanced keyboard navigation and screen-reader support',
			icon: Accessibility,
			features: ['Keyboard navigation', 'Screen-reader affordances']
		}
	];

	const exportFeature = {
		title: 'Budget Tracker Export',
		description: 'Export budget data as PDF or image files',
		icon: FileText,
		options: [
			{
				name: 'Client-side Export (MVP)',
				pros: ['No server changes', 'Works offline', 'Fast iteration'],
				cons: ['Layout quirks', 'Memory-heavy for large data'],
				libs: ['html2canvas', 'jsPDF']
			},
			{
				name: 'Server-side Rendering',
				pros: ['Consistent rendering', 'Handles complex CSS'],
				cons: ['Requires server infrastructure', 'Rate limiting needed'],
				libs: ['Puppeteer', 'Playwright']
			},
			{
				name: 'Native App Integration',
				pros: ['Leverages native APIs'],
				cons: ['Platform-specific implementation']
			}
		],
		recommendation: 'Client-side export with html2canvas + jsPDF'
	};
</script>

<RouteHead
	title="Planned Features | Svelte Mini Apps Changelog"
	description="Explore upcoming features and planned enhancements for Svelte-MiniApps, including mobile apps, desktop companions, and new functionality."
	keywords="svelte, planned features, roadmap, mobile apps, desktop apps, announcements, playground"
	route="/changelog/planned-features"
	type="article"
/>

<div class="via-background/98 from-background to-background/95 min-h-screen bg-linear-to-b">
	<div class="container mx-auto px-4 py-16">
		<BlurInText>
			<h1
				class="from-foreground to-foreground/80 mb-4 bg-linear-to-r bg-clip-text py-6 text-center text-4xl font-bold text-transparent sm:text-5xl"
			>
				Planned Features
			</h1>
		</BlurInText>

		<p class="text-muted-foreground mx-auto mt-6 mb-16 max-w-2xl text-center text-lg">
			Discover what's coming next for Svelte-MiniApps. From mobile and desktop companion apps to
			enhanced learning tools and accessibility improvements, explore our development roadmap.
		</p>

		<!-- High-level Features Grid -->
		<section class="mb-16">
			<h2 class="text-foreground mb-8 text-center text-2xl font-bold">High-Level Features</h2>
			<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each highLevelFeatures as feature}
					<Card class="border-border/50 bg-card/50 relative overflow-hidden backdrop-blur">
						<CardHeader class="pb-3">
							<div class="flex items-center gap-3">
								<div class="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
									<feature.icon class="text-primary h-5 w-5" />
								</div>
								<CardTitle class="text-lg">{feature.title}</CardTitle>
							</div>
							<CardDescription class="text-sm">{feature.description}</CardDescription>
						</CardHeader>
						<CardContent class="space-y-3">
							{#if feature.phases}
								<div>
									<h4 class="mb-2 text-sm font-medium">Phases:</h4>
									<div class="flex flex-wrap gap-1">
										{#each feature.phases as phase}
											<Badge variant="outline" class="text-xs">{phase}</Badge>
										{/each}
									</div>
								</div>
							{/if}
							{#if feature.options}
								<div>
									<h4 class="mb-2 text-sm font-medium">Options:</h4>
									<div class="flex flex-wrap gap-1">
										{#each feature.options as option}
											<Badge variant="secondary" class="text-xs">{option}</Badge>
										{/each}
									</div>
								</div>
							{/if}
							{#if feature.capabilities}
								<div>
									<h4 class="mb-2 text-sm font-medium">Capabilities:</h4>
									<div class="flex flex-wrap gap-1">
										{#each feature.capabilities as capability}
											<Badge variant="outline" class="text-xs">{capability}</Badge>
										{/each}
									</div>
								</div>
							{/if}
							{#if feature.status}
								<div class="flex items-center gap-2">
									<Badge variant="default" class="text-xs">{feature.status}</Badge>
									{#if feature.storage}
										<span class="text-muted-foreground text-xs">({feature.storage})</span>
									{/if}
								</div>
							{/if}
							{#if feature.mvp}
								<div>
									<h4 class="mb-1 text-sm font-medium">MVP:</h4>
									<p class="text-muted-foreground text-xs">{feature.mvp}</p>
								</div>
							{/if}
							{#if feature.longTerm}
								<div>
									<h4 class="mb-1 text-sm font-medium">Long-term:</h4>
									<p class="text-muted-foreground text-xs">{feature.longTerm}</p>
								</div>
							{/if}
							{#if feature.steps}
								<div>
									<h4 class="mb-2 text-sm font-medium">Steps:</h4>
									<div class="flex flex-wrap gap-1">
										{#each feature.steps as step}
											<Badge variant="outline" class="text-xs">{step}</Badge>
										{/each}
									</div>
								</div>
							{/if}
							{#if feature.dataFormat}
								<div>
									<h4 class="mb-1 text-sm font-medium">Data Format:</h4>
									<p class="text-muted-foreground text-xs">{feature.dataFormat}</p>
								</div>
							{/if}
							{#if feature.source}
								<div>
									<h4 class="mb-1 text-sm font-medium">Source:</h4>
									<p class="text-muted-foreground text-xs">{feature.source}</p>
								</div>
							{/if}
							{#if feature.features}
								<div>
									<h4 class="mb-2 text-sm font-medium">Features:</h4>
									<div class="flex flex-wrap gap-1">
										{#each feature.features as feat}
											<Badge variant="outline" class="text-xs">{feat}</Badge>
										{/each}
									</div>
								</div>
							{/if}
						</CardContent>
					</Card>
				{/each}
			</div>
		</section>

		<!-- Budget Tracker Export Feature -->
		<section class="mb-16">
			<h2 class="text-foreground mb-8 text-center text-2xl font-bold">
				Budget Tracker Export Feature
			</h2>
			<Card class="border-border/50 bg-card/50 backdrop-blur">
				<CardHeader>
					<div class="flex items-center gap-3">
						<div class="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
							<exportFeature.icon class="text-primary h-5 w-5" />
						</div>
						<div>
							<CardTitle class="text-xl">{exportFeature.title}</CardTitle>
							<CardDescription>{exportFeature.description}</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent class="space-y-6">
					<div>
						<h3 class="mb-4 text-lg font-semibold">Implementation Options</h3>
						<div class="grid gap-4 md:grid-cols-3">
							{#each exportFeature.options as option}
								<div class="rounded-lg border p-4">
									<h4 class="mb-2 font-medium">{option.name}</h4>
									<div class="space-y-2">
										<div>
											<h5 class="text-sm font-medium text-green-600">Pros:</h5>
											<ul class="text-muted-foreground ml-4 list-disc text-xs">
												{#each option.pros as pro}
													<li>{pro}</li>
												{/each}
											</ul>
										</div>
										{#if option.cons}
											<div>
												<h5 class="text-sm font-medium text-orange-600">Cons:</h5>
												<ul class="text-muted-foreground ml-4 list-disc text-xs">
													{#each option.cons as con}
														<li>{con}</li>
													{/each}
												</ul>
											</div>
										{/if}
										{#if option.libs}
											<div>
												<h5 class="text-sm font-medium">Libraries:</h5>
												<div class="mt-1 flex flex-wrap gap-1">
													{#each option.libs as lib}
														<Badge variant="outline" class="text-xs">{lib}</Badge>
													{/each}
												</div>
											</div>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					</div>
					<div class="bg-primary/5 border-primary/20 rounded-lg border p-4">
						<h3 class="mb-2 flex items-center gap-2 text-lg font-semibold">
							<Badge variant="default">Recommended MVP</Badge>
						</h3>
						<p class="text-muted-foreground mb-3 text-sm">{exportFeature.recommendation}</p>
						<div class="flex items-center gap-2">
							<Button variant="outline" size="sm">
								<Download class="mr-2 h-4 w-4" />
								Export PDF
							</Button>
							<Button variant="outline" size="sm">
								<Image class="mr-2 h-4 w-4" />
								Export Image
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</section>

		<!-- Implementation Notes -->
		<section class="mb-16">
			<h2 class="text-foreground mb-8 text-center text-2xl font-bold">Implementation Notes</h2>
			<div class="grid gap-6 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Next Steps</CardTitle>
						<CardDescription>Priority actions for development</CardDescription>
					</CardHeader>
					<CardContent class="space-y-3">
						<div class="flex items-start gap-3">
							<div class="bg-primary mt-2 h-2 w-2 rounded-full"></div>
							<p class="text-sm">Break features into issues and assign estimates</p>
						</div>
						<div class="flex items-start gap-3">
							<div class="bg-primary mt-2 h-2 w-2 rounded-full"></div>
							<p class="text-sm">Implement walkthrough stepper and announcements page</p>
						</div>
						<div class="flex items-start gap-3">
							<div class="bg-primary mt-2 h-2 w-2 rounded-full"></div>
							<p class="text-sm">Create follow-up issue for interactive sandboxes</p>
						</div>
						<div class="flex items-start gap-3">
							<div class="bg-primary mt-2 h-2 w-2 rounded-full"></div>
							<p class="text-sm">Evaluate server-side export endpoints</p>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Contributing</CardTitle>
						<CardDescription>How to add new feature ideas</CardDescription>
					</CardHeader>
					<CardContent class="space-y-3">
						<div class="flex items-start gap-3">
							<div class="bg-primary mt-2 h-2 w-2 rounded-full"></div>
							<p class="text-sm">Add single bullets for small ideas</p>
						</div>
						<div class="flex items-start gap-3">
							<div class="bg-primary mt-2 h-2 w-2 rounded-full"></div>
							<p class="text-sm">Use template format for larger ideas</p>
						</div>
						<div class="flex items-start gap-3">
							<div class="bg-primary mt-2 h-2 w-2 rounded-full"></div>
							<p class="text-sm">Update Table of Contents when adding headings</p>
						</div>
						<Button variant="outline" size="sm" class="mt-4 w-full">
							<Github class="mr-2 h-4 w-4" />
							Create Issue
						</Button>
					</CardContent>
				</Card>
			</div>
		</section>
	</div>
</div>

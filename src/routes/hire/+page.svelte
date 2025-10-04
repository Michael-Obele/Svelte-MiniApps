<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import {
		Code,
		Briefcase,
		Mail,
		Github,
		Twitter,
		Linkedin,
		Globe,
		Star,
		Zap,
		Heart,
		ArrowLeft,
		ExternalLink
	} from '@lucide/svelte';
	import Bluesky from '$lib/assets/bluesky-outline-light.svelte';
	import XIcon from '@/blocks/XIcon.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// Skills and technologies (revamped: initials avatars + level pill)
	const skills = [
		{
			name: 'Svelte/SvelteKit',
			level: 'Expert',
			initials: 'SM',
			color: 'bg-primary/10 text-primary'
		},
		{ name: 'TypeScript', level: 'Expert', initials: 'TS', color: 'bg-sky-100 text-sky-600' },
		{
			name: 'React/Next.js',
			level: 'Advanced',
			initials: 'R',
			color: 'bg-violet-100 text-violet-600'
		},
		{
			name: 'Node.js',
			level: 'Advanced',
			initials: 'ND',
			color: 'bg-emerald-100 text-emerald-600'
		},
		{ name: 'Python', level: 'Intermediate', initials: 'PY', color: 'bg-amber-100 text-amber-600' },
		{
			name: 'Database Design',
			level: 'Advanced',
			initials: 'DB',
			color: 'bg-rose-100 text-rose-600'
		},
		{
			name: 'UI/UX Design',
			level: 'Intermediate',
			initials: 'UX',
			color: 'bg-pink-100 text-pink-600'
		},
		{
			name: 'DevOps/CI/CD',
			level: 'Intermediate',
			initials: 'DO',
			color: 'bg-slate-100 text-slate-600'
		}
	];

	const projects = [
		{
			name: 'Svelte MiniApps',
			description:
				'A collection of productivity mini-apps built with SvelteKit and modern web technologies',
			tech: ['Svelte 5', 'SvelteKit', 'TypeScript', 'Tailwind CSS', 'Prisma'],
			link: 'https://github.com/Michael-Obele/Svelte-MiniApps',
			stars: 'Featured Project'
		},
		{
			name: 'VaultNote',
			description:
				'A modern, secure, and open-source desktop application designed to be a productivity hub for professionals, developers, and power users. VaultNote integrates essential tools into a single, focused, and trustworthy environment.',
			tech: ['Svelte 5', 'SvelteKit', 'Rust', 'Tauri', 'TypeScript', 'Tailwind CSS'],
			link: 'https://github.com/Michael-Obele/VaultNote',
			stars: 'Active Development'
		},
		{
			name: 'Myth Buster',
			description:
				'An interactive web application transforming myth verification into a profound, user-guided research journey. Leveraging the Perplexity Sonar API, it acts as a dynamic AI research assistant empowering users to uncover layers of information, critically examine evidence, explore diverse contexts, and synthesize knowledge into coherent understanding.',
			tech: [
				'SvelteKit',
				'TypeScript',
				'Tailwind CSS',
				'Prisma',
				'Perplexity Sonar API',
				'PostgreSQL'
			],
			link: 'https://github.com/Michael-Obele/myth-buster',
			stars: 'Hackathon Project'
		},
		{
			name: 'Various Open Source',
			description: 'Contributions to open source projects and community development',
			tech: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
			link: 'https://github.com/Michael-Obele',
			stars: 'Community Contributions'
		}
	];

	const services = [
		{
			title: 'Full-Stack Web Development',
			description: 'End-to-end web application development with modern frameworks',
			icon: Code
		},
		{
			title: 'Svelte/SvelteKit Consulting',
			description: 'Expert guidance on Svelte ecosystem and best practices',
			icon: Zap
		},
		{
			title: 'UI/UX Implementation',
			description: 'Transforming designs into pixel-perfect, responsive interfaces',
			icon: Heart
		},
		{
			title: 'Performance Optimization',
			description: 'Improving application speed, accessibility, and user experience',
			icon: Star
		}
	];
</script>

<svelte:head>
	<title>Hire Michael - Full-Stack Developer | Svelte MiniApps</title>
	<meta
		name="description"
		content="Hire Michael — Full‑stack developer and Svelte maintainer. I build fast, maintainable web apps with SvelteKit, TypeScript and Node. Open to freelance, contract, and collaboration."
	/>
	<meta
		name="keywords"
		content="hire developer, freelance developer, Svelte developer, SvelteKit expert, full-stack developer, web development"
	/>
</svelte:head>

<div class="from-background via-background to-primary/5 min-h-screen bg-gradient-to-br">
	<!-- Header -->
	<div class="container mx-auto px-4 py-8 md:px-6 md:py-12">
		<button
			class="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center"
			onclick={() => goto('/')}
		>
			<ArrowLeft class="mr-2 size-4" />
			Back to Home
		</button>

		<div class="text-center">
			<h1 class="mb-4 text-4xl font-bold tracking-tight md:text-6xl">
				Hire <span class="text-primary">Michael</span>
			</h1>
			<p class="text-muted-foreground mx-auto max-w-2xl text-lg md:text-xl">
				I'm Michael — a full‑stack developer and open source contributor. I build delightful web
				apps with SvelteKit, TypeScript and Node. Available for freelance, contract, and
				collaboration.
			</p>
		</div>
	</div>

	<!-- Main Content -->
	<div class="container mx-auto px-4 pb-16 md:px-6">
		<div class="grid gap-12 lg:grid-cols-2">
			<!-- About Section -->
			<div class="space-y-8">
				<div class="bg-card rounded-lg border p-6 shadow-sm">
					<h2 class="mb-4 text-2xl font-semibold">About Me</h2>
					<p class="text-muted-foreground mb-4">
						Full‑stack developer and open source enthusiast. I focus on building fast, maintainable
						web applications using SvelteKit, TypeScript, and Node. I also contribute to Svelte
						projects and enjoy mentoring and collaborating with other developers.
					</p>
					<p class="text-muted-foreground">
						If you'd like to work together, tell me a little about your project and what success
						looks like — mentioning the project or area (for example: "Svelte MiniApps") helps me
						prioritize messages.
					</p>
				</div>

				<!-- Skills -->
				<div class="bg-card rounded-lg border p-6 shadow-sm">
					<h2 class="mb-4 text-2xl font-semibold">Technical Skills</h2>
					<div class="grid gap-3 sm:grid-cols-2">
						{#each skills as skill}
							<div class="flex items-center justify-between rounded-md border p-3">
								<div class="flex items-center space-x-3">
									<div
										class={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${skill.color ?? 'bg-primary/10 text-primary'}`}
									>
										<span class="text-sm font-medium">{skill.initials}</span>
									</div>
									<span class="font-medium">{skill.name}</span>
								</div>
								<span
									class="bg-muted/5 text-muted-foreground rounded-full px-2 py-0.5 text-xs font-medium"
									>{skill.level}</span
								>
							</div>
						{/each}
					</div>
				</div>

				<!-- Services -->
				<div class="bg-card rounded-lg border p-6 shadow-sm">
					<h2 class="mb-4 text-2xl font-semibold">Services Offered</h2>
					<div class="grid gap-4 sm:grid-cols-2">
						{#each services as service}
							<div class="rounded-md border p-4">
								<div class="mb-2 flex items-center space-x-2">
									<service.icon class="text-primary size-5" />
									<h3 class="font-medium">{service.title}</h3>
								</div>
								<p class="text-muted-foreground text-sm">{service.description}</p>
							</div>
						{/each}
					</div>
				</div>
			</div>

			<!-- Contact & Projects -->
			<div class="space-y-8">
				<!-- Contact Info -->
				<div class="bg-card rounded-lg border p-6 shadow-sm">
					<h2 class="mb-4 text-2xl font-semibold">Get In Touch</h2>
					<div class="space-y-4">
						<a
							href="mailto:hire@svelte-apps.me?subject=Hiring Inquiry"
							class="hover:bg-accent flex items-center space-x-3 rounded-md border p-3 transition-colors"
						>
							<Mail class="text-primary size-5" />
							<div>
								<p class="font-medium">Email</p>
								<p class="text-muted-foreground text-sm">hire@svelte-apps.me</p>
							</div>
						</a>
						<div class="flex space-x-2">
							<a
								href="https://github.com/Michael-Obele"
								target="_blank"
								rel="noopener noreferrer"
								class="hover:bg-accent flex items-center space-x-2 rounded-md border p-3 transition-colors"
							>
								<Github class="size-5" />
								<span class="text-sm">GitHub</span>
							</a>

							<a
								href="https://twitter.com/Dev_Obele"
								target="_blank"
								rel="noopener noreferrer"
								class="hover:bg-accent flex items-center space-x-2 rounded-md border p-3 transition-colors"
							>
								<span class="size-5">
									<XIcon class="size-5" />
								</span>
								<span class="text-sm">Twitter</span>
							</a>

							<a
								href="https://www.linkedin.com/in/dev-obele"
								target="_blank"
								rel="noopener noreferrer"
								class="hover:bg-accent flex items-center space-x-2 rounded-md border p-3 transition-colors"
							>
								<Linkedin class="size-5" />
								<span class="text-sm">LinkedIn</span>
							</a>

							<a
								href="https://bsky.app/profile/svelte-apps.me"
								target="_blank"
								rel="noopener noreferrer"
								class="hover:bg-accent flex items-center space-x-2 rounded-md border p-3 transition-colors"
							>
								<Bluesky class="size-5" />
								<span class="text-sm">Bluesky</span>
							</a>
						</div>
					</div>
				</div>

				<!-- Featured Projects -->
				<div class="bg-card rounded-lg border p-6 shadow-sm">
					<h2 class="mb-4 text-2xl font-semibold">Featured Projects</h2>
					<div class="space-y-4">
						{#each projects as project}
							<div class="rounded-md border p-4">
								<div class="mb-2 flex items-start justify-between">
									<h3 class="font-medium">{project.name}</h3>
									<a
										href={project.link}
										target="_blank"
										rel="noopener noreferrer"
										class="text-primary hover:underline"
									>
										<ExternalLink class="size-4" />
									</a>
								</div>
								<p class="text-muted-foreground mb-3 text-sm">{project.description}</p>
								<div class="flex flex-wrap gap-2">
									{#each project.tech as tech}
										<span class="bg-primary/10 text-primary rounded-full px-2 py-1 text-xs">
											{tech}
										</span>
									{/each}
								</div>
								<div class="text-muted-foreground mt-2 flex items-center text-sm">
									<Star class="mr-1 size-4" />
									{project.stars}
								</div>
							</div>
						{/each}
					</div>
				</div>

				<!-- Call to Action -->
				<div class="bg-primary/5 rounded-lg border p-6 text-center shadow-sm">
					<Briefcase class="text-primary mx-auto mb-4 size-12" />
					<h2 class="mb-2 text-xl font-semibold">Ready to chat?</h2>
					<p class="text-muted-foreground mb-4">
						I'm open to freelance and consulting work, as well as collaboration on OSS and
						mentoring. Share a brief note about the project and timeline and I'll get back to you.
					</p>
					<a
						href="mailto:hire@svelte-apps.me?subject=Hiring Inquiry"
						class="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center rounded-md px-6 py-3 font-medium transition-colors"
					>
						<Mail class="mr-2 size-4" />
						Email Michael
					</a>
				</div>
			</div>
		</div>
	</div>
</div>

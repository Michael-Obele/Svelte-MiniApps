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
		ExternalLink,
		Sparkles,
		CheckCircle2,
		Rocket
	} from '@lucide/svelte';
	import Bluesky from '$lib/assets/bluesky-outline-light.svelte';
	import RouteHead from '$lib/components/blocks/RouteHead.svelte';
	import { google, bluesky, X } from '$lib/components/blocks/Icons.svelte';
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
			name: 'Svelte Mini Apps',
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

<RouteHead title="Hire Michael - Full-Stack Developer | Svelte Mini Apps" description="Hire Michael — Full‑stack developer and Svelte maintainer. I build fast, maintainable web apps with SvelteKit, TypeScript and Node. Open to freelance, contract, and collaboration." keywords="hire developer, freelance developer, Svelte developer, SvelteKit expert, full-stack developer, web development" />

<div class="from-background via-primary/5 to-background min-h-screen bg-gradient-to-br">
	<!-- Hero Section with animated gradient -->
	<div class="relative overflow-hidden">
		<div
			class="from-primary/10 absolute inset-0 bg-gradient-to-r via-purple-500/10 to-pink-500/10 opacity-50"
		></div>
		<div class="relative container mx-auto px-4 py-12 md:px-6 md:py-20">
			<button
				class="group text-muted-foreground hover:text-foreground mb-8 inline-flex items-center transition-colors"
				onclick={() => goto('/')}
			>
				<ArrowLeft class="mr-2 size-4 transition-transform group-hover:-translate-x-1" />
				Back to Home
			</button>

			<div class="text-center">
				<div class="mb-6 flex items-center justify-center gap-2">
					<Sparkles class="text-primary size-8 animate-pulse" />
					<span
						class="bg-primary/10 text-primary ring-primary/20 rounded-full px-4 py-1.5 text-sm font-medium ring-1"
					>
						Available for Work
					</span>
				</div>
				<h1 class="mb-6 text-5xl font-bold tracking-tight md:text-7xl">
					Let's Build Something
					<span
						class="from-primary bg-gradient-to-r via-purple-500 to-pink-500 bg-clip-text text-transparent"
					>
						Amazing
					</span>
				</h1>
				<p class="text-muted-foreground mx-auto max-w-3xl text-lg md:text-xl">
					Full‑stack developer specializing in <strong class="text-foreground"
						>Svelte & SvelteKit</strong
					>. I build fast, maintainable web applications with modern technologies. Open to
					freelance, contract work, and exciting collaborations.
				</p>

				<div class="mt-8 flex flex-wrap items-center justify-center gap-4">
					<a
						href="mailto:hire@svelte-apps.me?subject=Hiring Inquiry"
						class="group bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-lg px-8 py-4 font-semibold shadow-lg transition-all hover:scale-105 hover:shadow-xl"
					>
						<Mail class="size-5" />
						Get In Touch
						<Rocket
							class="size-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
						/>
					</a>
					<a
						href="#projects"
						class="border-border bg-background/50 hover:bg-background/80 inline-flex items-center gap-2 rounded-lg border px-8 py-4 font-semibold backdrop-blur-sm transition-all"
					>
						View Work
						<ExternalLink class="size-4" />
					</a>
				</div>
			</div>
		</div>
	</div>

	<!-- Main Content -->
	<div class="container mx-auto px-4 py-16 md:px-6 md:py-24">
		<!-- Quick Stats/Highlights Bar -->
		<div class="mb-16 grid gap-6 sm:grid-cols-3">
			<div
				class="bg-card rounded-lg border p-6 text-center shadow-sm transition-all hover:shadow-md"
			>
				<div class="mb-2 flex justify-center">
					<Code class="text-primary size-8" />
				</div>
				<p class="text-3xl font-bold">5+</p>
				<p class="text-muted-foreground text-sm">Years Experience</p>
			</div>
			<div
				class="bg-card rounded-lg border p-6 text-center shadow-sm transition-all hover:shadow-md"
			>
				<div class="mb-2 flex justify-center">
					<Star class="size-8 text-yellow-500" />
				</div>
				<p class="text-3xl font-bold">50+</p>
				<p class="text-muted-foreground text-sm">Projects Completed</p>
			</div>
			<div
				class="bg-card rounded-lg border p-6 text-center shadow-sm transition-all hover:shadow-md"
			>
				<div class="mb-2 flex justify-center">
					<Heart class="size-8 text-red-500" />
				</div>
				<p class="text-3xl font-bold">100%</p>
				<p class="text-muted-foreground text-sm">Client Satisfaction</p>
			</div>
		</div>

		<!-- Bento Grid Layout -->
		<div class="grid auto-rows-auto grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-6">
			<!-- About Me - Hero Card -->
			<div
				class="group bg-card/50 rounded-xl border p-8 shadow-md backdrop-blur-sm transition-all hover:shadow-lg md:col-span-2 lg:col-span-3 lg:row-span-2"
			>
				<div class="mb-4 flex items-center gap-3">
					<div
						class="bg-primary/10 ring-primary/20 rounded-lg p-3 ring-2 transition-transform group-hover:scale-110"
					>
						<Briefcase class="text-primary size-6" />
					</div>
					<h2 class="text-2xl font-semibold">About Me</h2>
				</div>
				<p class="text-muted-foreground mb-4 leading-relaxed">
					Full‑stack developer and open source enthusiast passionate about building fast,
					maintainable web applications. I specialize in <strong class="text-foreground"
						>SvelteKit</strong
					>, <strong class="text-foreground">TypeScript</strong>, and modern web technologies.
				</p>
				<p class="text-muted-foreground leading-relaxed">
					Beyond code, I contribute to Svelte projects, mentor developers, and love collaborating on
					innovative solutions. Let's create something exceptional together!
				</p>
				<div class="mt-6 flex flex-wrap gap-2">
					<span
						class="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-3 py-1 text-sm font-medium text-green-700 dark:text-green-400"
					>
						<CheckCircle2 class="size-4" />
						Available Now
					</span>
					<span
						class="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-700 dark:text-blue-400"
					>
						<Zap class="size-4" />
						Fast Response
					</span>
				</div>
			</div>

			<!-- Technical Skills -->
			<div
				class="group bg-card/50 rounded-xl border p-8 shadow-md backdrop-blur-sm transition-all hover:shadow-lg md:col-span-2 lg:col-span-3 lg:row-span-2"
			>
				<div class="mb-6 flex items-center gap-3">
					<div
						class="bg-primary/10 ring-primary/20 rounded-lg p-3 ring-2 transition-transform group-hover:scale-110"
					>
						<Zap class="text-primary size-6" />
					</div>
					<h2 class="text-2xl font-semibold">Technical Skills</h2>
				</div>
				<div class="grid gap-3 sm:grid-cols-2">
					{#each skills as skill (skill.name)}
						<div
							class="group/skill bg-background/50 hover:border-primary/50 hover:bg-background/80 flex items-center justify-between rounded-lg border p-3 transition-all hover:shadow-md"
						>
							<div class="flex items-center space-x-3">
								<div
									class={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-transform group-hover/skill:scale-110 ${skill.color ?? 'bg-primary/10 text-primary'}`}
								>
									<span class="text-sm font-semibold">{skill.initials}</span>
								</div>
								<span class="font-medium">{skill.name}</span>
							</div>
							<span class="bg-primary/10 text-primary rounded-full px-2.5 py-1 text-xs font-medium"
								>{skill.level}</span
							>
						</div>
					{/each}
				</div>
			</div>

			<!-- Services Offered -->
			<div
				class="group bg-card/50 rounded-xl border p-8 shadow-md backdrop-blur-sm transition-all hover:shadow-lg md:col-span-4 lg:col-span-4"
			>
				<div class="mb-6 flex items-center gap-3">
					<div
						class="bg-primary/10 ring-primary/20 rounded-lg p-3 ring-2 transition-transform group-hover:scale-110"
					>
						<Heart class="text-primary size-6" />
					</div>
					<h2 class="text-2xl font-semibold">Services Offered</h2>
				</div>
				<div class="grid gap-6 sm:grid-cols-2">
					{#each services as service (service.title)}
						<div
							class="group/service bg-background/50 hover:border-primary/50 hover:bg-background/80 flex flex-col rounded-lg border p-6 transition-all hover:shadow-md"
						>
							<div class="mb-4 flex items-start gap-3">
								<div
									class="bg-primary/10 shrink-0 rounded-lg p-3 transition-transform group-hover/service:scale-110"
								>
									<service.icon class="text-primary size-6" />
								</div>
								<div class="flex-1">
									<h3 class="mb-2 text-lg font-semibold">{service.title}</h3>
									<p class="text-muted-foreground text-sm leading-relaxed">
										{service.description}
									</p>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Get In Touch -->
			<div
				class="group bg-card/50 rounded-xl border p-8 shadow-md backdrop-blur-sm transition-all hover:shadow-lg md:col-span-4 lg:col-span-2"
			>
				<div class="mb-6 flex items-center gap-3">
					<div
						class="bg-primary/10 ring-primary/20 rounded-lg p-3 ring-2 transition-transform group-hover:scale-110"
					>
						<Mail class="text-primary size-6" />
					</div>
					<h2 class="text-2xl font-semibold">Get In Touch</h2>
				</div>
				<div class="space-y-4">
					<a
						href="mailto:hire@svelte-apps.me?subject=Hiring Inquiry"
						class="group/email from-primary/5 hover:border-primary/50 flex items-center space-x-4 rounded-lg border bg-gradient-to-r to-purple-500/5 p-4 transition-all hover:shadow-md"
					>
						<div
							class="bg-primary/10 rounded-full p-3 transition-transform group-hover/email:scale-110"
						>
							<Mail class="text-primary size-6" />
						</div>
						<div>
							<p class="font-semibold">Email Me</p>
							<p class="text-muted-foreground text-sm">hire@svelte-apps.me</p>
						</div>
					</a>
					<div class="grid grid-cols-2 gap-3">
						<a
							href="https://github.com/Michael-Obele"
							target="_blank"
							rel="noopener noreferrer"
							class="group/social bg-background/50 hover:border-primary/50 hover:bg-background/80 flex flex-col items-center space-y-2 rounded-lg border p-4 transition-all hover:shadow-md"
						>
							<Github class="size-6 transition-transform group-hover/social:scale-110" />
							<span class="text-sm font-medium">GitHub</span>
						</a>

						<a
							href="https://twitter.com/Dev_Obele"
							target="_blank"
							rel="noopener noreferrer"
							class="group/social bg-background/50 hover:border-primary/50 hover:bg-background/80 flex flex-col items-center space-y-2 rounded-lg border p-4 transition-all hover:shadow-md"
						>
							<span class="size-6">
								<XIcon class="size-6 transition-transform group-hover/social:scale-110" />
							</span>
							<span class="text-sm font-medium">Twitter</span>
						</a>

						<a
							href="https://www.linkedin.com/in/dev-obele"
							target="_blank"
							rel="noopener noreferrer"
							class="group/social bg-background/50 hover:border-primary/50 hover:bg-background/80 flex flex-col items-center space-y-2 rounded-lg border p-4 transition-all hover:shadow-md"
						>
							<Linkedin class="size-6 transition-transform group-hover/social:scale-110" />
							<span class="text-sm font-medium">LinkedIn</span>
						</a>

						<a
							href="https://bsky.app/profile/svelte-apps.me"
							target="_blank"
							rel="noopener noreferrer"
							class="group/social bg-background/50 hover:border-primary/50 hover:bg-background/80 flex flex-col items-center space-y-2 rounded-lg border p-4 transition-all hover:shadow-md"
						>
							<Bluesky class="size-6 transition-transform group-hover/social:scale-110" />
							<span class="text-sm font-medium">Bluesky</span>
						</a>

						<a
							href="https://discord.com/users/michael_obele"
							target="_blank"
							rel="noopener noreferrer"
							class="group/social bg-background/50 hover:border-primary/50 hover:bg-background/80 flex flex-col items-center space-y-2 rounded-lg border p-4 transition-all hover:shadow-md"
							title="Discord: michael_obele"
						>
							<span
								class="icon-[ic--baseline-discord] size-10 transition-transform group-hover/social:scale-110"
							></span>
							<span class="text-sm font-medium">Discord</span>
						</a>
					</div>
				</div>
			</div>
		</div>

		<!-- Featured Projects - Now in a full-width section -->
		<div class="mt-16">
			<div
				id="projects"
				class="group bg-card/50 rounded-xl border p-8 shadow-md backdrop-blur-sm transition-all hover:shadow-lg"
			>
				<div class="mb-6 flex items-center gap-3">
					<div
						class="bg-primary/10 ring-primary/20 rounded-lg p-3 ring-2 transition-transform group-hover:scale-110"
					>
						<Code class="text-primary size-6" />
					</div>
					<h2 class="text-2xl font-semibold">Featured Projects</h2>
				</div>
				<div class="grid gap-5 md:grid-cols-2">
					{#each projects as project (project.name)}
						<div
							class="group/project bg-background/50 hover:border-primary/50 hover:bg-background/80 rounded-lg border p-5 transition-all hover:shadow-md"
						>
							<div class="mb-3 flex items-start justify-between">
								<h3 class="text-lg font-semibold">{project.name}</h3>
								<a
									href={project.link}
									target="_blank"
									rel="noopener noreferrer"
									class="bg-primary/10 text-primary hover:bg-primary/20 rounded-full p-2 transition-all hover:scale-110"
									aria-label="View project"
								>
									<ExternalLink class="size-4" />
								</a>
							</div>
							<p class="text-muted-foreground mb-4 text-sm leading-relaxed">
								{project.description}
							</p>
							<div class="mb-3 flex flex-wrap gap-2">
								{#each project.tech as tech (tech)}
									<span
										class="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium"
									>
										{tech}
									</span>
								{/each}
							</div>
							<div class="text-muted-foreground flex items-center text-sm font-medium">
								<Star class="mr-1.5 size-4 fill-yellow-500 text-yellow-500" />
								{project.stars}
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- Call to Action -->
		<div class="mt-8">
			<div
				class="from-primary/10 relative overflow-hidden rounded-xl border bg-gradient-to-br via-purple-500/10 to-pink-500/10 p-8 text-center shadow-md"
			>
				<div
					class="bg-grid-white/10 absolute inset-0 [mask-image:radial-gradient(white,transparent_85%)]"
				></div>
				<div class="relative">
					<div
						class="bg-primary/20 ring-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ring-4"
					>
						<Briefcase class="text-primary size-8" />
					</div>
					<h2 class="mb-3 text-2xl font-bold">Let's Work Together!</h2>
					<p class="text-muted-foreground mx-auto mb-6 max-w-md leading-relaxed">
						I'm open to freelance and consulting work, as well as collaboration on open source
						projects and mentoring. Share a brief note about your project and I'll get back to you
						within 24 hours.
					</p>
					<a
						href="mailto:hire@svelte-apps.me?subject=Hiring Inquiry"
						class="group bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-lg px-8 py-4 font-semibold shadow-lg transition-all hover:scale-105 hover:shadow-xl"
					>
						<Mail class="size-5" />
						Start a Conversation
						<Rocket
							class="size-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
						/>
					</a>
				</div>
			</div>
		</div>
	</div>
</div>

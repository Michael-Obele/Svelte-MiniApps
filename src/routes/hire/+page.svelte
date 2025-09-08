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

	// Skills and technologies
	const skills = [
		{ name: 'Svelte/SvelteKit', level: 'Expert', icon: '⚡' },
		{ name: 'TypeScript', level: 'Expert', icon: '🔷' },
		{ name: 'React/Next.js', level: 'Advanced', icon: '⚛️' },
		{ name: 'Node.js', level: 'Advanced', icon: '🟢' },
		{ name: 'Python', level: 'Intermediate', icon: '🐍' },
		{ name: 'Database Design', level: 'Advanced', icon: '🗄️' },
		{ name: 'UI/UX Design', level: 'Intermediate', icon: '🎨' },
		{ name: 'DevOps/CI/CD', level: 'Intermediate', icon: '🚀' }
	];

	const projects = [
		{
			name: 'Svelte MiniApps',
			description:
				'A collection of productivity mini-apps built with SvelteKit and modern web technologies',
			tech: ['Svelte 5', 'SvelteKit', 'TypeScript', 'Tailwind CSS', 'Prisma'],
			link: 'https://github.com/Michael-Obele/Svelte-MiniApps',
			stars: 'Featured'
		},
		{
			name: 'Various Open Source',
			description: 'Contributions to open source projects and community development',
			tech: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
			link: 'https://github.com/Michael-Obele',
			stars: 'Active'
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
		content="Hire Michael Obele, a skilled full-stack developer specializing in Svelte, SvelteKit, TypeScript, and modern web technologies. Available for freelance and contract work."
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
				Hire the <span class="text-primary">Developer</span>
			</h1>
			<p class="text-muted-foreground mx-auto max-w-2xl text-lg md:text-xl">
				I'm Michael Obele, a passionate full-stack developer specializing in modern web
				technologies. Let's build something amazing together.
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
						I'm a dedicated full-stack developer with a passion for creating exceptional user
						experiences. With expertise in the Svelte ecosystem and modern web technologies, I build
						fast, scalable, and maintainable applications.
					</p>
					<p class="text-muted-foreground">
						When I'm not coding, you'll find me exploring new technologies, contributing to open
						source, and sharing knowledge with the developer community.
					</p>
				</div>

				<!-- Skills -->
				<div class="bg-card rounded-lg border p-6 shadow-sm">
					<h2 class="mb-4 text-2xl font-semibold">Technical Skills</h2>
					<div class="grid gap-3 sm:grid-cols-2">
						{#each skills as skill}
							<div class="flex items-center justify-between rounded-md border p-3">
								<div class="flex items-center space-x-3">
									<span class="text-lg">{skill.icon}</span>
									<span class="font-medium">{skill.name}</span>
								</div>
								<span class="text-muted-foreground text-sm">{skill.level}</span>
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
							href="mailto:michaelobele.dev@gmail.com"
							class="hover:bg-accent flex items-center space-x-3 rounded-md border p-3 transition-colors"
						>
							<Mail class="text-primary size-5" />
							<div>
								<p class="font-medium">Email</p>
								<p class="text-muted-foreground text-sm">michaelobele.dev@gmail.com</p>
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
								href="https://www.linkedin.com/in/michael-amachree-263841325/"
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
					<h2 class="mb-2 text-xl font-semibold">Ready to Work Together?</h2>
					<p class="text-muted-foreground mb-4">
						I'm currently available for freelance projects and consulting work. Let's discuss how we
						can bring your ideas to life.
					</p>
					<a
						href="mailto:michaelobele.dev@gmail.com?subject=Hiring Inquiry"
						class="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center rounded-md px-6 py-3 font-medium transition-colors"
					>
						<Mail class="mr-2 size-4" />
						Start a Conversation
					</a>
				</div>
			</div>
		</div>
	</div>
</div>

<script lang="ts">
	import ThemeSwitch from '@/blocks/ThemeSwitch.svelte';
	import LanguageSwitcher from '@/blocks/LanguageSwitcher.svelte';
	import NukeButton from '@/blocks/NukeButton.svelte';
	import Svelte from '$lib/assets/svelte.svelte';

	import { scrollToTop } from '$lib/utils';
	import {
		ArrowUp,
		Github,
		Copyright,
		Sparkles,
		Download,
		Heart,
		Wrench,
		ShieldCheck,
		MessageCircle,
		ExternalLink
	} from '@lucide/svelte';

	import { bluesky } from './Icons.svelte';

	// shadcn-svelte components
	import { Separator } from '@/ui/separator';
	import { Badge } from '@/ui/badge';
	import { Button, buttonVariants } from '@/ui/button';
	import * as Accordion from '@/ui/accordion';
	import * as Tooltip from '@/ui/tooltip';

	// Dynamic app count — stays accurate as apps are added/removed
	import { projects } from '$lib/index.svelte';

	const currentYear = new Date().getFullYear();
	const appCount = $derived(projects().length);

	// Single source of truth for footer navigation
	const linkGroups: FooterGroup[] = $derived([
		{
			id: 'discover',
			title: 'Discover',
			links: [
				{ href: '/apps', label: `All Apps`, badge: String(appCount) },
				{ href: '/changelog', label: "What's New" },
				{ href: '/', label: 'Home' }
			]
		},
		{
			id: 'connect',
			title: 'Connect',
			links: [
				{ href: 'mailto:support@svelte-apps.me', label: 'Get Support' },
				{ href: 'mailto:feedback@svelte-apps.me', label: 'Send Feedback' },
				{ href: 'mailto:info@svelte-apps.me', label: 'Contact' }
			]
		},
		{
			id: 'build',
			title: 'Build',
			links: [
				{
					href: 'https://github.com/Michael-Obele/Svelte-MiniApps',
					label: 'View Source',
					external: true
				},
				{
					href: 'https://github.com/sponsors/Michael-Obele',
					label: 'Sponsor',
					external: true,
					icon: Heart
				},
				{ href: '/hire', label: 'Work with Michael' }
			]
		},
		{
			id: 'trust',
			title: 'Trust',
			links: [
				{ href: '/about', label: 'About' },
				{
					href: 'https://github.com/Michael-Obele/Svelte-MiniApps/blob/master/LICENSE',
					label: 'MIT License',
					external: true
				},
				{
					href: 'https://github.com/Michael-Obele/Svelte-MiniApps/blob/master/CODE_OF_CONDUCT.md',
					label: 'Code of Conduct',
					external: true
				}
			]
		}
	]);

	interface FooterLink {
		href: string;
		label: string;
		badge?: string;
		external?: boolean;
		icon?: typeof Heart;
	}

	interface FooterGroup {
		id: string;
		title: string;
		links: FooterLink[];
	}
</script>

<footer class="bg-background text-foreground w-full border-t py-8 shadow-lg md:py-10">
	<div class="mx-auto px-4 md:px-6">
		<!-- Mobile: Accordion sections -->
		<div class="md:hidden">
			<Accordion.Root type="multiple">
				{#each linkGroups as group (group.id)}
					<Accordion.Item value={group.id}>
						<Accordion.Trigger class="text-sm font-semibold tracking-wide uppercase">
							{group.title}
						</Accordion.Trigger>
						<Accordion.Content>
							<nav class="flex flex-col gap-2 pb-2">
								{#each group.links as link (link.href)}
									{@const isExternal = link.external ?? false}
									<a
										href={link.href}
										target={isExternal ? '_blank' : undefined}
										rel={isExternal ? 'noopener noreferrer' : undefined}
										class="text-muted-foreground hover:text-primary inline-flex items-center gap-1 text-sm transition-colors"
									>
										{link.label}
										{#if link.badge}
											<Badge variant="outline" class="ml-1 h-4 px-1 text-[10px]">{link.badge}</Badge
											>
										{/if}
										{#if isExternal}
											<ExternalLink class="size-3" strokeWidth={1.5} />
										{/if}
									</a>
								{/each}
							</nav>
						</Accordion.Content>
					</Accordion.Item>
				{/each}
			</Accordion.Root>
		</div>

		<!-- Desktop: 4-column flex, data-driven from linkGroups -->
		<div class="hidden md:flex md:flex-wrap md:gap-8">
			{#each linkGroups as group (group.id)}
				<div class="flex flex-1 flex-col gap-3">
					<h3 class="text-sm font-semibold tracking-wide uppercase">{group.title}</h3>
					<nav class="flex flex-col gap-2">
						{#each group.links as link (link.href)}
							{@const isExternal = link.external ?? false}
							<a
								href={link.href}
								target={isExternal ? '_blank' : undefined}
								rel={isExternal ? 'noopener noreferrer' : undefined}
								class="text-muted-foreground hover:text-primary inline-flex items-center gap-1 text-sm transition-colors"
							>
								{link.label}
								{#if link.badge}
									<Badge variant="outline" class="ml-1 h-4 px-1 text-[10px]">{link.badge}</Badge>
								{/if}
								{#if isExternal}
									<ExternalLink class="size-3" strokeWidth={1.5} />
								{/if}
							</a>
						{/each}
					</nav>
				</div>
			{/each}
		</div>

		<Separator class="my-8" />

		<!-- Middle band: Brand + Trust badges + Socials + Conversion CTA -->
		<div class="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
			<!-- Left: Brand + proof badges -->
			<div class="flex flex-col items-center gap-3 md:items-start">
				<div class="flex items-center gap-2">
					<span class="size-6">
						<Svelte />
					</span>
					<span class="text-xl font-bold">Mini Apps</span>
				</div>
				<p class="text-muted-foreground text-center text-sm md:text-left">
					<Sparkles class="text-primary me-1 inline-block size-4" strokeWidth={1.5} />
					A collection of useful mini applications built with Svelte and love.
				</p>
				<!-- Trust proof: shadcn Badge components -->
				<div class="flex flex-wrap items-center justify-center gap-2 md:justify-start">
					<Badge variant="outline" class="gap-1 text-xs font-normal">
						<Wrench class="size-3" strokeWidth={1.5} />
						{appCount} free tools
					</Badge>
					<Badge variant="outline" class="gap-1 text-xs font-normal">
						<ShieldCheck class="size-3" strokeWidth={1.5} />
						Open source
					</Badge>
					<Badge variant="outline" class="text-xs font-normal">No ads • No tracking</Badge>
				</div>
			</div>

			<!-- Right: Conversion CTA + social proof -->
			<div class=" flex flex-col items-center gap-4 md:items-end">
				<a
					href="/hire"
					class={buttonVariants({
						variant: 'outline',
						size: 'default',
						class: 'border-primary/60'
					})}
				>
					<MessageCircle class="size-4" strokeWidth={1.5} />
					Loved these tools? Work with Michael
				</a>

				<!-- Social icons with shadcn Tooltip hover labels -->
				<Tooltip.Provider delayDuration={300}>
					<div class="flex items-center gap-4">
						<Tooltip.Root>
							<Tooltip.Trigger>
								<a
									href="https://github.com/Michael-Obele"
									target="_blank"
									rel="noopener noreferrer"
									class="text-muted-foreground hover:text-primary transition-colors"
									aria-label="GitHub"
								>
									<Github class="size-5" strokeWidth={1.5} />
								</a>
							</Tooltip.Trigger>
							<Tooltip.Content>
								<p>GitHub</p>
							</Tooltip.Content>
						</Tooltip.Root>

						<Tooltip.Root>
							<Tooltip.Trigger>
								<a
									href="https://twitter.com/Dev_Obele"
									target="_blank"
									rel="noopener noreferrer"
									class="text-muted-foreground hover:text-primary transition-colors"
									aria-label="X (Twitter)"
								>
									<svg
										class="size-[18px]"
										viewBox="0 0 24 24"
										fill="currentColor"
										xmlns="http://www.w3.org/2000/svg"
										aria-hidden="true"
									>
										<path
											d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
										/>
									</svg>
								</a>
							</Tooltip.Trigger>
							<Tooltip.Content>
								<p>X / Twitter</p>
							</Tooltip.Content>
						</Tooltip.Root>

						<Tooltip.Root>
							<Tooltip.Trigger>
								<a
									href="https://bsky.app/profile/svelte-apps.me"
									target="_blank"
									rel="noopener noreferrer"
									class="text-muted-foreground hover:text-primary transition-colors"
									aria-label="Bluesky"
								>
									{@render bluesky('size-5')}
								</a>
							</Tooltip.Trigger>
							<Tooltip.Content>
								<p>Bluesky</p>
							</Tooltip.Content>
						</Tooltip.Root>

						<Tooltip.Root>
							<Tooltip.Trigger>
								<a
									href="https://www.linkedin.com/in/dev-obele"
									target="_blank"
									rel="noopener noreferrer"
									class="text-muted-foreground hover:text-primary transition-colors"
									aria-label="LinkedIn"
								>
									<svg
										class="size-[18px]"
										viewBox="0 0 24 24"
										fill="currentColor"
										xmlns="http://www.w3.org/2000/svg"
										aria-hidden="true"
									>
										<path
											d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
										/>
									</svg>
								</a>
							</Tooltip.Trigger>
							<Tooltip.Content>
								<p>LinkedIn</p>
							</Tooltip.Content>
						</Tooltip.Root>
					</div>
				</Tooltip.Provider>
			</div>
		</div>

		<Separator class="my-6" />

		<!-- Bottom strip: Copyright + Utility row + PWA CTA -->
		<div class="flex flex-col items-center justify-between gap-4 md:flex-row">
			<!-- Copyright -->
			<p class="text-muted-foreground flex items-center text-center text-sm md:text-left">
				<Copyright class="me-1 size-4" strokeWidth={1.5} /> 2024-{currentYear} Svelte Apps
			</p>

			<!-- Utility row: Theme, Language, Back to top, Nuke -->
			<div class="flex items-center gap-2">
				<Button
					variant="ghost"
					size="sm"
					onclick={scrollToTop}
					class="text-muted-foreground hover:text-primary gap-1.5"
				>
					<ArrowUp class="size-4" strokeWidth={1.5} />
					Back to top
				</Button>
				<LanguageSwitcher />
				<ThemeSwitch />
				<NukeButton class="opacity-60 transition-opacity hover:opacity-100" />
			</div>

			<!-- PWA install CTA: Loss aversion framing — "don't lose access" beats "this is installable" -->
			<p class="text-muted-foreground flex items-center text-center text-sm md:text-right">
				<Download class="text-primary me-1.5 size-4" strokeWidth={1.5} />
				<span class="text-primary mr-2 font-semibold">Install for offline use</span>
				<span class="hidden md:inline">your tools, anytime</span>
			</p>
		</div>
	</div>
</footer>

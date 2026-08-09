<!--
	@component
	Hire — Michael Obele, personal shipping machine.

	THESIS: the hire page is a rhythm machine whose pattern is shipping. The
	16-step row is his real weekly commit log; the chase light sweeps his
	actual cadence; banks are projects, tracks are skills, the patch bay is
	contact, RUN is the prefilled email. Refuses the hero-metric + bento-card
	hire template.
	OWN-WORLD: matte charcoal panel (#141414) with silkscreen-white caps
	labels, a quartered step row (red #FF3B30 → orange #FF9A00 → yellow
	#FFD600 → white #F2F2F2), red seven-segment readouts, lit LEDs as the only
	glow, black keys with white borders that go solid red/orange when active.
	Chakra Petch for the nameplate, JetBrains Mono for every readout.
	STORY: a technical buyer lands on a machine that is already running —
	verified publisher, live receipts, one obvious red action.
	FIRST VIEWPORT: nameplate + status LEDs top-left, red RUN transport and
	secondary VIEW BANKS, readout panel (tempo / repos / last commit), then
	the full-width 16-step shipping log with a sweeping chase light.
	FORM: challenger-steprow (early-80s rhythm machine), user-chosen over the
	assigned Package Registry, seed key 4bcb951c.
	FINISH: unreviewed and undocumented is unfinished; this build ends with
	the finish review, the verdict, and DESIGN.md
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import '@fontsource/chakra-petch/400.css';
	import '@fontsource/chakra-petch/600.css';
	import '@fontsource/chakra-petch/700.css';
	import '@fontsource-variable/jetbrains-mono';
	import {
		ArrowLeft,
		ArrowRight,
		Clock,
		ExternalLink,
		GitCommitHorizontal,
		GitFork,
		Github,
		Linkedin,
		Mail,
		Pause,
		Play,
		Star
	} from '@lucide/svelte';
	import Bluesky from '$lib/assets/bluesky-outline-light.svelte';
	import RouteHead from '$lib/components/blocks/RouteHead.svelte';
	import XIcon from '@/blocks/XIcon.svelte';
	import type { PageProps } from './$types';

	// ─── Machine constants ───────────────────────────────────────────────────
	const MAILTO = `mailto:hire@svelte-apps.me?subject=${encodeURIComponent(
		'Hiring inquiry'
	)}&body=${encodeURIComponent(
		'Hi Michael,\n\nI would like to talk about a project.\n\nProject type:\nTimeline:\n\n— '
	)}`;

	const CONTRIB_12MO = '3,366'; // profile contribution count, verified 2026-08-09
	const MINIAPPS_COMMITS_FALLBACK = 1008; // local git, verified 2026-08-09

	// Static, verified project facts (stars/forks merge live when the API answers).
	const banks = [
		{
			repo: 'Svelte-MiniApps',
			bank: 'BANK 01',
			name: 'SVELTE MINI APPS',
			description:
				'20+ single-purpose mini apps in one offline-first PWA — budgets, passwords, QR codes, flash text, trackers. Svelte Hack 2025 winner.',
			tech: ['SVELTE 5', 'SVELTEKIT', 'TYPESCRIPT', 'TAILWIND', 'PRISMA'],
			status: { label: 'ACTIVE', tone: 'green' },
			stats: [
				{ kind: 'stars', icon: Star, value: 46 },
				{ kind: 'forks', icon: GitFork, value: 6 },
				{
					kind: 'commits',
					icon: GitCommitHorizontal,
					value: MINIAPPS_COMMITS_FALLBACK,
					suffix: ' COMMITS'
				}
			],
			link: 'https://github.com/Michael-Obele/Svelte-MiniApps'
		},
		{
			repo: 'VaultNote',
			bank: 'BANK 02',
			name: 'VAULTNOTE',
			description:
				'Secure desktop productivity hub — markdown editor, clipboard manager, zero-knowledge password vault — in Rust + Tauri.',
			tech: ['SVELTE 5', 'RUST', 'TAURI'],
			status: { label: 'RELEASING', tone: 'amber' },
			stats: [
				{ kind: 'stars', icon: Star, value: 4 },
				{ kind: 'releases', icon: GitCommitHorizontal, value: 50, suffix: ' RELEASES' }
			],
			link: 'https://github.com/Michael-Obele/VaultNote'
		},
		{
			repo: 'shadcn-svelte-mcp',
			bank: 'BANK 03',
			name: 'SHADCN-SVELTE MCP',
			description:
				'MCP server and tooling that gives AI agents the shadcn-svelte component docs and developer utilities.',
			tech: ['TYPESCRIPT', 'MCP', 'MASTRA'],
			status: { label: 'ACTIVE', tone: 'green' },
			stats: [{ kind: 'stars', icon: Star, value: 58 }],
			link: 'https://github.com/Michael-Obele/shadcn-svelte-mcp'
		},
		{
			repo: 'sveltekit-api-gen',
			bank: 'BANK 04',
			name: 'SVELTEKIT-API-GEN',
			description:
				'Automatically generate OpenAPI 3.0 specs from your SvelteKit server endpoints using JSDoc @swagger annotations.',
			tech: ['TYPESCRIPT', 'SVELTEKIT'],
			status: { label: 'SHIPPED', tone: 'green' },
			stats: [{ kind: 'stars', icon: Star, value: 37 }],
			link: 'https://github.com/Michael-Obele/sveltekit-api-gen'
		},
		{
			repo: 'cinder',
			bank: 'BANK 05',
			name: 'CINDER',
			description:
				'High-performance, self-hosted web scraping API built with Go. 23 commits in August 2026 alone.',
			tech: ['GO'],
			status: { label: 'BUILDING', tone: 'amber' },
			stats: [
				{ kind: 'commits', icon: GitCommitHorizontal, value: 23, suffix: ' COMMITS · AUG 2026' }
			],
			link: 'https://github.com/Michael-Obele/cinder'
		}
	];

	const tracks = [
		{ name: 'SVELTE / SVELTEKIT', level: 'EXPERT', leds: 4 },
		{ name: 'TYPESCRIPT', level: 'EXPERT', leds: 4 },
		{ name: 'RUST', level: 'ADVANCED', leds: 3 },
		{ name: 'GO', level: 'ADVANCED', leds: 3 },
		{ name: 'TAURI', level: 'ADVANCED', leds: 3 },
		{ name: 'NODE / BUN', level: 'ADVANCED', leds: 3 },
		{ name: 'TAILWIND CSS', level: 'ADVANCED', leds: 3 },
		{ name: 'PRISMA / POSTGRESQL', level: 'ADVANCED', leds: 3 },
		{ name: 'NETWORK ENGINEERING', level: 'EXPERT', leds: 4 },
		{ name: 'PYTHON', level: 'INTERMEDIATE', leds: 2 },
		{ name: 'UI / UX', level: 'INTERMEDIATE', leds: 2 },
		{ name: 'DEVOPS / CI-CD', level: 'INTERMEDIATE', leds: 2 }
	];

	const jacks = [
		{ label: 'EMAIL', href: MAILTO, primary: true, icon: Mail },
		{ label: 'GITHUB', href: 'https://github.com/Michael-Obele', icon: Github },
		{ label: 'X', href: 'https://x.com/Dev_Obele', icon: XIcon },
		{ label: 'LINKEDIN', href: 'https://www.linkedin.com/in/dev-obele', icon: Linkedin },
		{ label: 'BLUESKY', href: 'https://bsky.app/profile/svelte-apps.me', icon: Bluesky },
		{ label: 'DISCORD', href: 'https://discord.com/users/michael_obele', icon: null },
		{ label: 'DEV.TO', href: 'https://dev.to/dev_michael', icon: null }
	];

	const levelColor: Record<string, string> = {
		EXPERT: 'text-[#ffd600]',
		ADVANCED: 'text-[#ff9a00]',
		INTERMEDIATE: 'text-[#a3a3a3]'
	};

	// ─── Machine state ───────────────────────────────────────────────────────
	let { data }: PageProps = $props();

	let running = $state(true);
	let chase = $state(0);
	let reducedMotion = $state(false);
	let selectedWeek = $state<number | null>(null);

	const weeks = $derived(data.weeks ?? []);
	const signalLost = $derived(weeks.length === 0);
	const publicRepos = $derived(data.publicRepos ?? null);
	const miniAppsCommits = $derived(data.miniAppsCommits ?? MINIAPPS_COMMITS_FALLBACK);
	const lastCommit = $derived(
		data.lastCommitDate ? new Date(data.lastCommitDate).toISOString().slice(0, 10) : null
	);

	const liveBanks = $derived(
		banks.map((b) => {
			const live = data.repos.find((r) => r.name.toLowerCase() === b.repo.toLowerCase());
			const liveCommits = miniAppsCommits;
			return live
				? {
						...b,
						stats: b.stats.map((s) => {
							if (s.kind === 'stars') return { ...s, value: live.stars };
							if (s.kind === 'forks') return { ...s, value: live.forks };
							if (s.kind === 'commits' && liveCommits) return { ...s, value: liveCommits };
							return s;
						})
					}
				: b;
		})
	);

	const quarters = [
		{ from: 0, to: 4, lit: 'bg-[#ff3b30]' },
		{ from: 4, to: 8, lit: 'bg-[#ff9a00]' },
		{ from: 8, to: 12, lit: 'bg-[#ffd600]' },
		{ from: 12, to: 16, lit: 'bg-[#f2f2f2]' }
	];

	const weekOf = (i: number) => weeks[i];
	const quarterOf = (i: number) => quarters[Math.floor(i / 4)];
	const pad2 = (n: number) => String(n).padStart(2, '0');

	const selectedReadout = $derived.by(() => {
		if (selectedWeek === null) return 'SELECT A STEP TO INSPECT';
		const w = weekOf(selectedWeek);
		const commits = w ? w.commits : 0;
		return `WK ${pad2(selectedWeek + 1)} · ${commits} COMMITS`;
	});

	// The chase light — one authored moment, locked to the machine clock.
	$effect(() => {
		if (!running || reducedMotion) return;
		const id = setInterval(() => {
			chase = (chase + 1) % 16;
		}, 900);
		return () => clearInterval(id);
	});

	onMount(() => {
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		reducedMotion = mq.matches;
		const onChange = (e: MediaQueryListEvent) => {
			reducedMotion = e.matches;
		};
		mq.addEventListener('change', onChange);
		return () => mq.removeEventListener('change', onChange);
	});
</script>

<RouteHead
	title="Hire Michael — Full-Stack Engineer | Svelte Mini Apps"
	description="Full-stack engineer shipping web, desktop, mobile and AI tooling — Svelte 5, TypeScript, Rust, Go. Open to freelance, contract and collaboration."
	keywords="hire developer, freelance developer, Svelte developer, SvelteKit expert, full-stack developer, web development"
	route="/hire"
/>

<div class="hire-machine bg-[#141414] text-[#e6e6e6]">
	<div class="container mx-auto px-4 py-10 md:px-6 md:py-16">
		<!-- ── Header strip ─────────────────────────────────────────────── -->
		<header
			class="mb-12 flex flex-wrap items-center justify-between gap-4 border-b border-[#232323] pb-6"
		>
			<a
				href="/"
				class="machine-mono group inline-flex items-center text-xs tracking-[0.25em] text-[#8a8a8a] transition-colors hover:text-[#f2f2f2] focus-visible:ring-2 focus-visible:ring-[#ff3b30] focus-visible:outline-none"
			>
				<ArrowLeft class="mr-2 size-3.5 transition-transform group-hover:-translate-x-0.5" />
				BACK TO HOME
			</a>
			<div class="flex items-center gap-5">
				<span
					class="machine-mono inline-flex items-center gap-2 text-[11px] tracking-[0.2em] text-[#ffd600]"
				>
					<span
						class="size-1.5 animate-pulse rounded-full bg-[#ffd600] shadow-[0_0_6px_rgba(255,214,0,0.9)] motion-reduce:animate-none"
					></span>
					SVELTE HACK 2025 WINNER
				</span>
				<span
					class="machine-mono inline-flex items-center gap-2 text-[11px] tracking-[0.2em] text-[#4ade80]"
				>
					<span
						class="size-1.5 animate-pulse rounded-full bg-[#4ade80] shadow-[0_0_6px_rgba(74,222,128,0.9)] motion-reduce:animate-none"
					></span>
					AVAILABLE NOW
				</span>
			</div>
		</header>

		<!-- ── Machine face ─────────────────────────────────────────────── -->
		<section class="mb-16" aria-label="Intro">
			<p class="machine-mono mb-4 text-xs tracking-[0.35em] text-[#8a8a8a]">
				PERSONAL SHIPPING MACHINE
			</p>
			<div class="grid items-end gap-10 lg:grid-cols-5 lg:gap-12">
				<div class="lg:col-span-3">
					<h1
						class="machine-display text-5xl font-bold tracking-[-0.03em] text-[#f2f2f2] sm:text-6xl md:text-7xl"
					>
						MICHAEL OBELE
						<span
							class="machine-mono align-top text-sm font-medium tracking-[0.2em] text-[#ff3b30] md:text-base"
							>v2026.08</span
						>
					</h1>
					<p class="mt-5 max-w-xl text-base leading-relaxed text-[#a3a3a3] md:text-lg">
						Full-stack engineer. I build fast, verifiable software across every surface — web apps,
						desktop with Tauri, mobile with Capacitor, libraries, plugins and MCP servers. Open to
						freelance, contract and collaboration.
					</p>
					<div class="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
						<a
							href={MAILTO}
							class="group inline-flex items-center justify-center gap-2 rounded-lg bg-[#b91c1c] px-8 py-4 font-semibold text-white shadow-[0_8px_24px_rgba(185,28,28,0.35)] transition-all hover:scale-[1.02] hover:bg-[#dc2626] focus-visible:ring-2 focus-visible:ring-[#ff3b30] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414] focus-visible:outline-none"
						>
							<Mail class="size-5" />
							START A SESSION
							<ArrowRight class="size-4 transition-transform group-hover:translate-x-1" />
						</a>
						<a
							href="#banks"
							class="inline-flex items-center justify-center gap-2 rounded-lg border border-[#f2f2f2]/30 bg-transparent px-8 py-4 font-semibold text-[#f2f2f2] transition-colors hover:border-[#f2f2f2]/70 hover:bg-[#f2f2f2]/5 focus-visible:ring-2 focus-visible:ring-[#ff3b30] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414] focus-visible:outline-none"
						>
							VIEW BANKS
						</a>
					</div>
				</div>

				<!-- Readout panel -->
				<div
					class="rounded-xl border border-[#2e2e2e] bg-[#101010] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.5)] lg:col-span-2"
				>
					<div class="grid grid-cols-3 gap-4">
						<div>
							<p class="machine-mono text-[10px] tracking-[0.2em] text-[#8a8a8a]">SHIPPING TEMPO</p>
							<p
								class="machine-mono mt-2 text-2xl font-bold text-[#ff3b30] drop-shadow-[0_0_10px_rgba(255,59,48,0.45)]"
							>
								{CONTRIB_12MO}
							</p>
							<p class="machine-mono mt-1 text-[10px] tracking-[0.15em] text-[#8a8a8a]">
								CONTRIB / 12 MO
							</p>
						</div>
						<div>
							<p class="machine-mono text-[10px] tracking-[0.2em] text-[#8a8a8a]">PUBLIC REPOS</p>
							<p
								class="machine-mono mt-2 text-2xl font-bold text-[#ff3b30] drop-shadow-[0_0_10px_rgba(255,59,48,0.45)]"
							>
								{publicRepos ?? '—'}
							</p>
							<p class="machine-mono mt-1 text-[10px] tracking-[0.15em] text-[#8a8a8a]">
								LIVE FROM API
							</p>
						</div>
						<div>
							<p class="machine-mono text-[10px] tracking-[0.2em] text-[#8a8a8a]">LAST COMMIT</p>
							<p
								class="machine-mono mt-2 text-base font-bold whitespace-nowrap text-[#ff3b30] drop-shadow-[0_0_10px_rgba(255,59,48,0.45)] md:text-lg"
							>
								{lastCommit ?? '—'}
							</p>
							<p class="machine-mono mt-1 text-[10px] tracking-[0.15em] text-[#8a8a8a]">
								SVELTE-MINIAPPS
							</p>
						</div>
					</div>
					<p
						class="machine-mono mt-4 border-t border-[#232323] pt-3 text-[10px] tracking-[0.1em] text-[#8a8a8a]"
					>
						* CONTRIBUTION COUNT VERIFIED 2026-08-09
					</p>
				</div>
			</div>
		</section>

		<!-- ── The step row: 16-week shipping log ───────────────────────── -->
		<section class="mb-16" aria-label="16-week shipping log">
			<div
				class="rounded-xl border border-[#2e2e2e] bg-[#101010] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.5)] md:p-7"
			>
				<div class="mb-5 flex flex-wrap items-center justify-between gap-3">
					<div class="flex items-center gap-3">
						<p class="machine-mono text-xs tracking-[0.3em] text-[#8a8a8a]">16-WEEK SHIPPING LOG</p>
						<span
							class="machine-mono inline-flex items-center gap-1.5 rounded-full border border-[#2e2e2e] bg-[#1a1a1a] px-2.5 py-1 text-[10px] tracking-[0.15em] text-[#4ade80]"
						>
							<span
								class="size-1.5 animate-pulse rounded-full bg-[#4ade80] shadow-[0_0_6px_rgba(74,222,128,0.9)] motion-reduce:animate-none"
							></span>
							{signalLost ? 'SIGNAL LOST' : 'LIVE FROM GITHUB'}
						</span>
					</div>
					<div class="flex items-center gap-3">
						<p class="machine-mono text-[10px] tracking-[0.2em] text-[#ff3b30]">
							{selectedReadout}
						</p>
						<button
							type="button"
							class="machine-mono inline-flex items-center gap-1.5 rounded-md border border-[#2e2e2e] bg-[#1a1a1a] px-3 py-1.5 text-[11px] tracking-[0.15em] text-[#f2f2f2] transition-colors hover:border-[#ff3b30]/60 focus-visible:ring-2 focus-visible:ring-[#ff3b30] focus-visible:outline-none"
							aria-label={running ? 'Stop the chase light' : 'Start the chase light'}
							onclick={() => (running = !running)}
						>
							{#if running}
								<Pause class="size-3.5" />
								STOP
							{:else}
								<Play class="size-3.5" />
								PLAY
							{/if}
						</button>
					</div>
				</div>

				{#if signalLost}
					<div
						class="machine-mono flex h-16 items-center justify-center rounded-md border border-dashed border-[#2e2e2e] text-[11px] tracking-[0.2em] text-[#8a8a8a]"
					>
						SIGNAL LOST — LIVE FEED UNAVAILABLE
					</div>
				{:else}
					<!-- Keys: one unbroken line, never wraps, scales. On the smallest
							screens it scrolls to keep every key a 24px+ touch target. -->
					<div
						class="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] md:mx-0 md:overflow-visible md:px-0 md:pb-0"
						role="group"
						aria-label="Weekly commit log"
					>
						<div class="flex w-full min-w-[432px] gap-[3px] md:min-w-0 md:gap-1">
							{#each Array.from({ length: 16 }) as _, i (i)}
								{@const w = weekOf(i)}
								{@const lit = !!w && w.commits > 0}
								{@const heavy = !!w && w.commits >= 8}
								{@const chasing = running && !reducedMotion && chase === i}
								{@const selected = selectedWeek === i}
								<button
									type="button"
									class="group/step flex h-12 min-w-0 flex-1 flex-col items-center justify-end gap-1.5 rounded-[4px] border transition-all duration-150 focus-visible:ring-2 focus-visible:ring-[#ff3b30] focus-visible:outline-none md:h-16 {lit
										? quarterOf(i).lit
										: 'border-[#2e2e2e] bg-[#242424]'} {chasing
										? 'scale-[1.04] shadow-[0_0_16px_rgba(255,59,48,0.8)]'
										: ''} {selected ? 'ring-2 ring-[#f2f2f2]/90' : ''}"
									aria-label="Week {i + 1}: {lit ? w.commits : 0} commits"
									aria-pressed={selected}
									onclick={() => (selectedWeek = i)}
								>
									<span
										class="size-1.5 shrink-0 rounded-full transition-colors {heavy
											? 'bg-[#ffa500] shadow-[0_0_8px_rgba(255,165,0,0.95)]'
											: lit
												? 'bg-[#ff3b30] shadow-[0_0_8px_rgba(255,59,48,0.95)]'
												: 'bg-[#3a3a3a]'}"
									></span>
									<span class="block w-full flex-1"></span>
								</button>
							{/each}
						</div>
					</div>
					<!-- Quarter markers -->
					<div class="mt-2 flex w-full gap-[3px] md:gap-1" aria-hidden="true">
						{#each Array.from({ length: 16 }) as _, i (i)}
							<span class="min-w-0 flex-1 text-left">
								{#if i % 4 === 0}
									<span class="machine-mono text-[10px] text-[#8a8a8a]">{i + 1}</span>
								{/if}
							</span>
						{/each}
					</div>
					<div
						class="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-[#232323] pt-4"
					>
						<p class="machine-mono text-[10px] tracking-[0.2em] text-[#8a8a8a]">
							STEPS 1–4 RED · 5–8 ORANGE · 9–12 YELLOW · 13–16 WHITE
						</p>
						<p class="machine-mono text-[10px] tracking-[0.2em] text-[#8a8a8a]">
							CLICK A STEP TO INSPECT
						</p>
					</div>
				{/if}
			</div>
		</section>

		<!-- ── Spec sheet ───────────────────────────────────────────────── -->
		<section class="mb-16" id="spec" aria-label="Spec sheet">
			<p class="machine-mono mb-4 text-xs tracking-[0.35em] text-[#8a8a8a]">SPEC SHEET</p>
			<dl
				class="divide-y divide-[#232323] rounded-xl border border-[#2e2e2e] bg-[#1a1a1a] px-6 shadow-[0_8px_24px_rgba(0,0,0,0.5)] md:px-8"
			>
				<div class="grid gap-1 py-4 md:grid-cols-3 md:gap-4">
					<dt class="machine-mono pt-0.5 text-[10px] tracking-[0.25em] text-[#8a8a8a]">MODEL</dt>
					<dd class="text-sm text-[#f2f2f2] md:col-span-2">Full-stack software engineer</dd>
				</div>
				<div class="grid gap-1 py-4 md:grid-cols-3 md:gap-4">
					<dt class="machine-mono pt-0.5 text-[10px] tracking-[0.25em] text-[#8a8a8a]">DAY JOB</dt>
					<dd class="text-sm text-[#f2f2f2] md:col-span-2">Network engineer</dd>
				</div>
				<div class="grid gap-1 py-4 md:grid-cols-3 md:gap-4">
					<dt class="machine-mono pt-0.5 text-[10px] tracking-[0.25em] text-[#8a8a8a]">BUILDS</dt>
					<dd class="text-sm text-[#f2f2f2] md:col-span-2">
						Web apps · desktop (Tauri) · mobile (Capacitor) · libraries · Vite plugins · MCP servers
						· backend services (Go)
					</dd>
				</div>
				<div class="grid gap-1 py-4 md:grid-cols-3 md:gap-4">
					<dt class="machine-mono pt-0.5 text-[10px] tracking-[0.25em] text-[#8a8a8a]">
						CORE STACK
					</dt>
					<dd class="text-sm text-[#f2f2f2] md:col-span-2">
						Svelte 5 · TypeScript · Rust · Go · Bun
					</dd>
				</div>
				<div class="grid gap-1 py-4 md:grid-cols-3 md:gap-4">
					<dt class="machine-mono pt-0.5 text-[10px] tracking-[0.25em] text-[#8a8a8a]">LICENSE</dt>
					<dd class="text-sm text-[#f2f2f2] md:col-span-2">
						MIT — everything I build is open source
					</dd>
				</div>
				<div class="grid gap-1 py-4 md:grid-cols-3 md:gap-4">
					<dt class="machine-mono pt-0.5 text-[10px] tracking-[0.25em] text-[#8a8a8a]">RESPONSE</dt>
					<dd class="text-sm text-[#f2f2f2] md:col-span-2">Replies within 24 hours</dd>
				</div>
			</dl>
		</section>

		<!-- ── Pattern banks: featured projects ─────────────────────────── -->
		<section class="mb-16" id="banks" aria-label="Featured projects">
			<div class="mb-6 flex items-end justify-between gap-4">
				<p class="machine-mono text-xs tracking-[0.35em] text-[#8a8a8a]">PATTERN BANKS</p>
				<a
					href="https://github.com/Michael-Obele"
					target="_blank"
					rel="noopener noreferrer"
					class="machine-mono inline-flex items-center gap-1.5 text-[11px] tracking-[0.2em] text-[#8a8a8a] transition-colors hover:text-[#f2f2f2] focus-visible:ring-2 focus-visible:ring-[#ff3b30] focus-visible:outline-none"
				>
					137 REPOS ON GITHUB
					<ExternalLink class="size-3.5" />
				</a>
			</div>
			<div class="grid gap-5 md:grid-cols-2">
				{#each liveBanks as project (project.repo)}
					<article
						class="group min-w-0 rounded-xl border border-[#2e2e2e] bg-[#1a1a1a] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-colors hover:border-[#ff3b30]/60"
					>
						<div class="mb-4 flex flex-wrap items-start justify-between gap-4">
							<div class="min-w-0">
								<p class="machine-mono mb-1.5 text-[10px] tracking-[0.25em] text-[#ff9a00]">
									{project.bank}
								</p>
								<h2 class="machine-display text-lg font-semibold tracking-tight text-[#f2f2f2]">
									{project.name}
								</h2>
							</div>
							<div class="flex items-center gap-3">
								<span
									class="machine-mono inline-flex items-center gap-1.5 text-[10px] tracking-[0.2em] {project
										.status.tone === 'green'
										? 'text-[#4ade80]'
										: 'text-[#ffa500]'}"
								>
									<span
										class="size-1.5 rounded-full {project.status.tone === 'green'
											? 'bg-[#4ade80] shadow-[0_0_6px_rgba(74,222,128,0.9)]'
											: 'bg-[#ffa500] shadow-[0_0_6px_rgba(255,165,0,0.9)]'} animate-pulse motion-reduce:animate-none"
									></span>
									{project.status.label}
								</span>
								<a
									href={project.link}
									target="_blank"
									rel="noopener noreferrer"
									class="rounded-md p-1.5 text-[#8a8a8a] transition-colors hover:bg-[#ff3b30]/10 hover:text-[#ff3b30] focus-visible:ring-2 focus-visible:ring-[#ff3b30] focus-visible:outline-none"
									aria-label="Open {project.name} on GitHub"
								>
									<ExternalLink class="size-4" />
								</a>
							</div>
						</div>
						<p class="mb-4 text-sm leading-relaxed text-[#a3a3a3]">{project.description}</p>
						<div class="mb-5 flex flex-wrap gap-2">
							{#each project.tech as tech (tech)}
								<span
									class="machine-mono rounded border border-[#2e2e2e] px-2 py-1 text-[10px] tracking-[0.15em] text-[#a3a3a3]"
								>
									{tech}
								</span>
							{/each}
						</div>
						<div
							class="machine-mono flex flex-wrap items-center gap-4 text-[11px] tracking-[0.15em] text-[#8a8a8a]"
						>
							{#each project.stats as stat (project.repo + '-' + stat.kind)}
								<span class="inline-flex items-center gap-1.5">
									<stat.icon class="size-3.5 text-[#ffd600]" />
									<span class="text-[#f2f2f2]">{stat.value}</span>
									{stat.suffix ?? ''}
								</span>
							{/each}
						</div>
					</article>
				{/each}
			</div>
		</section>

		<!-- ── Instrument tracks: skills ────────────────────────────────── -->
		<section class="mb-16" aria-label="Skills">
			<p class="machine-mono mb-4 text-xs tracking-[0.35em] text-[#8a8a8a]">INSTRUMENT TRACKS</p>
			<div
				class="rounded-xl border border-[#2e2e2e] bg-[#1a1a1a] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.5)] md:p-8"
			>
				<ul class="grid gap-x-10 gap-y-4 md:grid-cols-2">
					{#each tracks as track (track.name)}
						<li class="flex min-w-0 items-center gap-4">
							<span
								class="machine-mono min-w-0 flex-1 truncate text-xs tracking-[0.15em] text-[#f2f2f2]"
							>
								{track.name}
							</span>
							<span class="flex shrink-0 gap-1.5" aria-hidden="true">
								{#each Array.from({ length: 4 }) as _, i (i)}
									<span
										class="size-1.5 rounded-full {i < track.leds
											? 'bg-[#ff3b30] shadow-[0_0_6px_rgba(255,59,48,0.9)]'
											: 'bg-[#2e2e2e]'}"
									></span>
								{/each}
							</span>
							<span
								class="machine-mono w-24 shrink-0 text-right text-[10px] tracking-[0.2em] {levelColor[
									track.level
								]}"
							>
								{track.level}
							</span>
						</li>
					{/each}
				</ul>
			</div>
		</section>

		<!-- ── Patch bay: contact ───────────────────────────────────────── -->
		<section class="mb-16" aria-label="Contact">
			<p class="machine-mono mb-4 text-xs tracking-[0.35em] text-[#8a8a8a]">PATCH BAY</p>
			<div class="grid grid-cols-2 gap-3 md:grid-cols-4">
				{#each jacks as jack (jack.label)}
					<a
						href={jack.href}
						{...jack.href.startsWith('http')
							? { target: '_blank', rel: 'noopener noreferrer' }
							: {}}
						class="group flex flex-col items-start gap-3 rounded-xl border p-5 transition-colors focus-visible:ring-2 focus-visible:ring-[#ff3b30] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414] focus-visible:outline-none {jack.primary
							? 'border-transparent bg-[#b91c1c] shadow-[0_8px_24px_rgba(185,28,28,0.35)] hover:bg-[#dc2626]'
							: 'border-[#2e2e2e] bg-[#1a1a1a] hover:border-[#ff3b30]/60'}"
					>
						<span
							class="flex size-9 items-center justify-center rounded-md border {jack.primary
								? 'border-white/20 text-white'
								: 'border-[#2e2e2e] text-[#f2f2f2]'} transition-transform group-hover:scale-110"
						>
							{#if jack.icon}
								<jack.icon class="size-4.5" />
							{:else if jack.label === 'DISCORD'}
								<span class="icon-[ic--baseline-discord] size-5"></span>
							{:else}
								<span class="icon-[simple-icons--devdotto] size-5"></span>
							{/if}
						</span>
						<span
							class="machine-mono text-xs tracking-[0.25em] {jack.primary
								? 'text-white'
								: 'text-[#f2f2f2]'}"
						>
							{jack.label}
						</span>
					</a>
				{/each}
			</div>
		</section>

		<!-- ── Final transport: CTA ─────────────────────────────────────── -->
		<section aria-label="Start a session">
			<div
				class="relative overflow-hidden rounded-xl border border-[#2e2e2e] bg-[#1a1a1a] p-8 text-center shadow-[0_8px_24px_rgba(0,0,0,0.5)] md:p-12"
			>
				<div
					class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff3b30]/70 to-transparent"
				></div>
				<div class="relative">
					<span
						class="machine-mono mx-auto mb-6 flex size-14 items-center justify-center rounded-full border border-[#ff3b30]/40 bg-[#ff3b30]/10"
					>
						<span
							class="size-2.5 animate-pulse rounded-full bg-[#ff3b30] shadow-[0_0_12px_rgba(255,59,48,0.95)] motion-reduce:animate-none"
						></span>
					</span>
					<h2
						class="machine-display mb-3 text-3xl font-bold tracking-[-0.02em] text-[#f2f2f2] md:text-4xl"
					>
						READY TO RUN?
					</h2>
					<p class="mx-auto mb-8 max-w-md text-sm leading-relaxed text-[#a3a3a3] md:text-base">
						Freelance, contract, collaboration or mentoring — send a short note about your project
						and I will get back to you within 24 hours.
					</p>
					<div class="flex flex-col items-center gap-4">
						<a
							href={MAILTO}
							class="group inline-flex items-center gap-2 rounded-lg bg-[#b91c1c] px-10 py-4 font-semibold text-white shadow-[0_8px_24px_rgba(185,28,28,0.4)] transition-all hover:scale-[1.02] hover:bg-[#dc2626] focus-visible:ring-2 focus-visible:ring-[#ff3b30] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414] focus-visible:outline-none"
						>
							<Mail class="size-5" />
							START A SESSION
							<ArrowRight class="size-4 transition-transform group-hover:translate-x-1" />
						</a>
						<p
							class="machine-mono inline-flex items-center gap-2 text-[11px] tracking-[0.2em] text-[#8a8a8a]"
						>
							<Clock class="size-3.5" />
							REPLIES WITHIN 24 HOURS
						</p>
					</div>
				</div>
			</div>
		</section>
	</div>
</div>

<style>
	.hire-machine {
		/* The machine panel is its own dark world, independent of the site theme. */
		background: #141414;
		color: #e6e6e6;
	}

	.machine-display {
		font-family: 'Chakra Petch', system-ui, sans-serif;
	}

	.machine-mono {
		font-family: 'JetBrains Mono Variable', ui-monospace, SFMono-Regular, Menlo, monospace;
	}
</style>

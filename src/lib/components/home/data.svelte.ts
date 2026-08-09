export function getContentBlocksData() {
	return [
		{
			header: {
				text: [
					{ type: 'strong', content: 'Svelte' },
					{ type: 'span', content: 'Mini Apps' }
				]
			},
			paragraph:
				'Lightning-fast mini apps for budgets, passwords, QR codes, notes & more — each loads instantly and works offline.'
		},
		{
			header: {
				text: [
					{ type: 'span', content: 'Why' },
					{ type: 'strong', content: 'Svelte' }
				]
			},
			paragraph:
				'Blazing fast and incredibly smooth. Every interaction responds instantly — no lag, no waiting.',
			// @wc-ignore
			iconId: 'axteoudt'
		},
		{
			header: {
				text: [
					{ type: 'strong', content: 'Simple' },
					// @wc-include
					{ type: 'span', content: 'and Efficient' }
				]
			},
			paragraph:
				'No tutorials needed. Each app is designed to be instantly intuitive — open it and start working.',
			// @wc-ignore
			iconId: 'zguybvqs'
		},
		{
			header: {
				text: [
					{ type: 'span', content: 'Versatile and' },
					{ type: 'strong', content: 'Scalable' }
				]
			},
			paragraph:
				'Works everywhere you do. Student, professional, or anywhere in between — our apps adapt to your workflow.',
			// @wc-ignore
			iconId: 'yxyampao'
		}
	];
}

export function getTrustBadges() {
	return [
		{ label: 'Free forever', icon: 'check' },
		{ label: 'Works offline', icon: 'zap' },
		{ label: 'No account needed', icon: 'lock' },
		{ label: 'Open source', icon: 'github' }
	];
}

// FAQ — objection handling.
// Answers the questions that would otherwise block conversion.
export function getFaqItems() {
	return [
		{
			question: 'Do I need to create an account to use the apps?',
			answer:
				'No. Every tool works without sign-up. Your data is stored in your browser by default, so you stay in control. Accounts only exist if you want cloud sync or to save progress across devices.'
		},
		{
			question: 'Is my data safe and private?',
			answer:
				"Yes. The default behaviour is local-first: budget entries, notes, to-dos, and timers all live in your browser's storage and never touch a server. When you do use a server-backed tool like FlashText, links self-destruct on schedule."
		},
		{
			question: 'How is this free? What is the catch?',
			answer:
				'There is no catch. The whole project is open source on GitHub and maintained as a portfolio + community resource. No ads, no tracking, no premium tier hidden behind a paywall. You can audit every line.'
		},
		{
			question: 'Can I use these apps offline?',
			answer:
				'Yes. The site is a Progressive Web App — install it once and the full toolkit keeps working on a plane, on the train, or anywhere with no signal. Updates land automatically the next time you reconnect.'
		},
		{
			question: 'Will more tools be added?',
			answer:
				'Yes. New tools ship every few weeks — 20 are live today and more are in the pipeline. Open an issue on GitHub if you want a specific tool next.'
		}
	];
}

// App category breakdown for the donut chart in AppsSection.
// Derived from the shipped catalog so the chart can never drift out of
// sync: every app's `tag` maps into one of the five human-readable
// buckets below, and only apps present in `done()` are counted.
import { done, projects } from '$lib/index.svelte';

const CATEGORY_BUCKETS: Record<string, string> = {
	finance: 'Finance',
	health: 'Health',
	'developer-tools': 'Developer',
	utility: 'Utilities',
	productivity: 'Productivity',
	security: 'Productivity',
	fun: 'Productivity'
};

const CATEGORY_COLORS = [
	'var(--chart-1)',
	'var(--chart-2)',
	'var(--chart-3)',
	'var(--chart-4)',
	'var(--chart-5)'
];

export function getAppCategories() {
	const counts = new Map<string, number>();

	for (const project of projects()) {
		// Only count apps that are actually shipped (prune guard).
		if (!done().some((d) => d.name === project.link)) continue;
		const bucket = CATEGORY_BUCKETS[project.tag] ?? 'Utilities';
		counts.set(bucket, (counts.get(bucket) ?? 0) + 1);
	}

	return [...counts.entries()].map(([name, count], i) => ({
		name,
		count,
		color: CATEGORY_COLORS[i % CATEGORY_COLORS.length]
	}));
}

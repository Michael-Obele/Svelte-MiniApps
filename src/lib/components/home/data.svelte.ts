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
// Returns distribution of apps across functional categories.
export function getAppCategories() {
	return [
		{ name: 'Finance', count: 4, color: 'var(--chart-1)' },
		{ name: 'Text & Notes', count: 5, color: 'var(--chart-2)' },
		{ name: 'Developer', count: 4, color: 'var(--chart-3)' },
		{ name: 'Utilities', count: 5, color: 'var(--chart-4)' },
		{ name: 'Creative', count: 3, color: 'var(--chart-5)' }
	];
}

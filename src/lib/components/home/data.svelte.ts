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

export function getInfoBlocksData() {
	return [
		{
			dir: 'left',
			iconDir: 'right',
			header: 'Share the Joy:',
			// @wc-context: Community engagement section - encouraging users to share positive experiences with Mini Apps
			// @wc-include
			paragraph:
				'<strong>Found a MiniApp that made your day easier?</strong> Why keep it to yourself? Share your success story with friends, family, or colleagues who might benefit too! Your recommendation could help someone discover the perfect tool to simplify their daily routine.',
			iconId: 'ercyvufy' // @wc-ignore
		},
		{
			dir: 'right',
			iconId: 'rpgflpkp', // @wc-ignore
			iconDir: 'left',
			header: 'Help Us Improve:',
			// @wc-context: Community engagement section - inviting users to provide feedback and report issues
			// @wc-include
			paragraph:
				"<strong>Your voice matters!</strong> Whether you've got a brilliant idea, spotted a bug, or just want to share your experience - we're listening. Head over to our <strong>GitHub repository</strong> to open an issue or start a discussion. Every piece of feedback helps us build better tools for you."
		},
		{
			dir: 'left',
			iconDir: 'right',
			header: 'Join the Creation:',
			// @wc-context: Community engagement section - inviting developers to contribute to the open source project
			// @wc-include
			paragraph:
				"<strong>Love coding?</strong> You could be the next contributor to make these Mini Apps even more awesome! Our project is <strong>open source</strong>, which means you're invited to dive in, explore the code, and bring your ideas to life. Whether you're a seasoned developer or just starting out, there's a place for you in our community.",
			// @wc-ignore
			iconId: 'kndkiwmf'
		}
	];
}

// "How it works" — Goal Gradient 3-step framework.
// Each step tells the user what they GET, not what we do.
export function getHowItWorksSteps() {
	return [
		{
			number: 1,
			title: 'Pick a tool',
			description:
				'Browse 20+ purpose-built apps for budgets, passwords, time, notes, and more — all on one site.',
			accent: 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
		},
		{
			number: 2,
			title: 'Use it instantly',
			description:
				'Click in, get to work. No account, no sign-up, no install. Data stays in your browser by default.',
			accent: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
		},
		{
			number: 3,
			title: 'Save it (if you want)',
			description:
				'Install as a PWA and keep the full toolkit offline — your work follows you, never locked to a vendor.',
			accent: 'bg-violet-500/10 text-violet-600 dark:text-violet-400'
		}
	];
}

// Trust micro-bar badges shown in the hero and apps section.
// "Smart defaults" — the user already trusts these before they read further.
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

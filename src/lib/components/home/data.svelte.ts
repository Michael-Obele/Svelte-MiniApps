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
				"Your new favorite productivity toolkit. Lightning-fast mini apps crafted for your daily needs. Budget tracking, habit building, task management, and more — each app loads instantly and works beautifully on any device."
		},
		{
			header: {
				text: [
					{ type: 'span', content: 'Why' },
					{ type: 'strong', content: 'Svelte' }
				]
			},
			paragraph:
				"Blazing fast and incredibly smooth. Built with Svelte, our apps respond instantly to every interaction — no lag, no waiting. Experience the difference that cutting-edge technology makes in your daily workflow.",
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
				"Zero learning curve. Maximum productivity. Each mini app is designed to be instantly intuitive — open it and start working. No tutorials needed, no complexity, just clean tools that help you get things done.",
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
				"Works everywhere you do. Student, professional, or anywhere in between — our apps adapt to your workflow. Seamlessly sync across all your devices and scale from basic features to advanced capabilities as your needs grow.",
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

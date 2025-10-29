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
				"Welcome to your new favorite toolkit! Our Mini Apps are carefully crafted companions for your daily digital journey. Each app is designed with you in mind - quick to load, easy to use, and ready to tackle your everyday challenges. Whether you're planning your budget, building healthy habits, or staying organized, we've got just the right tool for you."
		},
		{
			header: {
				text: [
					{ type: 'span', content: 'Why' },
					{ type: 'strong', content: 'Svelte' }
				]
			},
			paragraph:
				"Ever noticed how some apps just feel smoother and more responsive? That's the magic of Svelte at work! We've chosen this cutting-edge technology because we believe you deserve tools that are not just powerful, but also delightful to use. Our apps respond instantly to your interactions, making every click and keystroke feel natural and effortless.",
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
				"Life's complicated enough - your tools shouldn't be. We've stripped away the clutter to focus on what matters most: helping you get things done(). Each MiniApp is thoughtfully designed to be intuitive and straightforward, while packing all the features you need. No steep learning curves, just pure productivity from the moment you start.",
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
				"Whether you're a student managing assignments, a professional tracking projects, or anyone in between, our Mini Apps adapt to your needs. Start small with basic features and discover more powerful capabilities as you grow. Plus, they work seamlessly across all your devices, so your tools are always right where you need them.",
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

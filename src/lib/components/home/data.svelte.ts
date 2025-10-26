export function getContentBlocksData() {
	return [
		{
			header: {
				text: [
					{ type: 'strong', content: 'Svelte' },
					{ type: 'span', content: 'MiniApps' }
				]
			},
			paragraph:
				"Welcome to your new favorite toolkit! Our MiniApps are carefully crafted companions for your daily digital journey. Each app is designed with you in mind - quick to load, easy to use, and ready to tackle your everyday challenges. Whether you're planning your budget, building healthy habits, or staying organized, we've got just the right tool for you."
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
					{ type: 'span', content: 'and Efficient' }
				]
			},
			paragraph:
				"Life's complicated enough - your tools shouldn't be. We've stripped away the clutter to focus on what matters most: helping you get things done. Each MiniApp is thoughtfully designed to be intuitive and straightforward, while packing all the features you need. No steep learning curves, just pure productivity from the moment you start.",
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
				"Whether you're a student managing assignments, a professional tracking projects, or anyone in between, our MiniApps adapt to your needs. Start small with basic features and discover more powerful capabilities as you grow. Plus, they work seamlessly across all your devices, so your tools are always right where you need them.",
			// @wc-ignore
			iconId: 'yxyampao'
		}
	];
}

export function getInfoBlocksData() {
	return [
		{
			dir: 'left',
			// @wc-ignore
			iconId: 'ercyvufy',
			iconDir: 'right',
			header: 'Share the Joy:',
			paragraph:
				"<strong>Found a MiniApp that made your day easier?</strong> Why keep it to yourself? Share your success story with friends, colleagues, or your social media circle. Whether it's a productivity breakthrough or a clever solution you discovered, your experience could be exactly what someone else needs to hear. Every share helps our community grow stronger!"
		},
		{
			dir: 'right',
			// @wc-ignore
			iconId: 'rpgflpkp',
			iconDir: 'left',
			header: 'Help Us Improve:',
			paragraph:
				"Spotted a <strong>bug</strong>? We're all ears! Your feedback is invaluable in making these tools even more amazing. Whether it's a tiny glitch or a bright idea, hop over to our GitHub page and let us know. Not tech-savvy? No problem! Just describe what you experienced - screenshots are always welcome. Every bug report brings us closer to perfection."
		},
		{
			dir: 'left',

			iconDir: 'right',
			header: 'Join the Creation:',
			paragraph:
				"Got an idea that could make these apps even better? We'd love to hear it! Whether you're a coding wizard ready to dive into the code, or someone with a fresh perspective on how things could work, your input is gold. There's a whole wishlist of apps waiting to be built, and countless ways to enhance existing ones. Ready to leave your mark on something special?",
			// @wc-ignore
			iconId: 'kndkiwmf'
		}
	];
}

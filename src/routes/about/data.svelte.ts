export function getFeatures() {
	return [
		{
			title: 'Install When You Want',
			description:
				"While they work great in the browser, you can also install them as PWAs. It's like having native apps that don't eat up your system resources - the best of both worlds."
		},
		{
			title: 'Svelte-Powered Speed',
			description:
				"We chose SvelteKit because it's blazing fast and fun to work with. The result? Tools that load instantly and run smoothly, making your workflow feel effortless."
		}
	];
}

export function getReasons() {
	return [
		{
			title: 'The SvelteKit Advantage',
			description:
				'When I discovered SvelteKit, it was love at first sight. Its elegant simplicity and powerful features made it perfect for building these focused tools.'
		},
		{
			title: 'Less is More',
			description:
				'Each app solves one problem really well. No feature bloat, no confusing interfaces - just clean, effective tools that respect your time and attention.'
		},
		{
			title: 'Growing Together',
			description:
				"Every mini-app taught me something new about Svelte. Now, I'm sharing these lessons through code, hoping others can learn and build upon them."
		}
	];
}

export function getFuture() {
	return [
		{
			title: 'Your Ideas Matter',
			description:
				"This project grows with your needs. Have an idea for a tool that would make your life easier? Let's build it together!"
		},
		{
			title: 'Building Bridges',
			description:
				'Imagine a community where developers share their mini-tools, learn from each other, and collectively make development more enjoyable.'
		}
	];
}

export function getNext() {
	return [
		{
			title: 'More Tools Coming',
			description:
				"The toolbox is always expanding! I'm constantly working on new mini-apps based on real-world needs and community suggestions."
		},
		{
			title: 'Join the Journey',
			description:
				"Whether you\'re a Svelte enthusiast or just getting started, your perspective is valuable. Let\'s collaborate and make these tools even better!"
		}
	];
}

export function getDataManagement() {
	return {
		title: 'Data Management & Troubleshooting',
		description: `Our app includes a powerful "Nuke Button" that allows you to clear all cached data, including service worker caches and local storage. This is especially useful if you encounter any caching issues or need to reset the app to its default state.`,
		features: [
			'Clear all cached data, including service worker caches and local storage',
			'Reset the app to its initial state when experiencing issues',
			'Unregister service workers for a fresh start',
			'Automatically reload the app after clearing data'
		],
		note: 'Use this feature if you encounter any caching issues or need to reset the app to its default state.'
	};
}

/**
 * Split a description into an array of strings, each containing a maximum number of words.
 * @param {string} description - The description to split
 * @param {number} maxWords - The maximum number of words per line
 * @returns {string[]} An array of strings, each containing a maximum number of words
 */
export function splitDescription(description: string, maxWords: number): string[] {
	const words = description.split(' ');
	const result = [];
	let currentLine = '';

	words.forEach((word) => {
		if ((currentLine + word).split(' ').length <= maxWords) {
			currentLine += ` ${word}`;
		} else {
			result.push(currentLine.trim());
			currentLine = word;
		}
	});

	result.push(currentLine.trim()); // Push the last line

	return result;
}

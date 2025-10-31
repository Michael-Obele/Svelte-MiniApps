import { describe, it, expect } from 'vitest';

// Copied functions from states.svelte.ts for testing

// Format duration in minutes to human readable string
function formatDuration(minutes: number): string {
	if (minutes < 60) {
		return `${Math.floor(minutes)} minute${Math.floor(minutes) !== 1 ? 's' : ''}`;
	} else if (minutes < 1440) {
		const hours = Math.floor(minutes / 60);
		const mins = Math.floor(minutes % 60);
		return `${hours} hour${hours !== 1 ? 's' : ''}${mins > 0 ? ` ${mins} min${mins !== 1 ? 's' : ''}` : ''}`;
	} else {
		const days = Math.floor(minutes / 1440);
		const hours = Math.floor((minutes % 1440) / 60);
		return `${days} day${days !== 1 ? 's' : ''}${hours > 0 ? ` ${hours} hour${hours !== 1 ? 's' : ''}` : ''}`;
	}
}

function generateId(): string {
	return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getDefaultMilestones() {
	return [
		{
			id: '20min',
			name: '20 Minutes',
			description: 'Heart rate and blood pressure drop to normal levels',
			duration: 20,
			icon: '💓'
		},
		{
			id: '2hours',
			name: '2 Hours',
			description: 'Nicotine cravings peak but will decrease over time',
			duration: 120,
			icon: '🧘'
		},
		{
			id: '12hours',
			name: '12 Hours',
			description: 'Carbon monoxide level in blood drops to normal',
			duration: 720,
			icon: '🫁'
		},
		{
			id: '24hours',
			name: '24 Hours',
			description: 'Anxiety peaks but will improve. Risk of heart attack begins to drop',
			duration: 1440,
			icon: '❤️'
		},
		{
			id: '48hours',
			name: '48 Hours',
			description: 'Nerve endings start regrowing. Smell and taste improve',
			duration: 2880,
			icon: '👃'
		},
		{
			id: '3days',
			name: '3 Days',
			description: 'Breathing becomes easier. Bronchial tubes begin to relax',
			duration: 4320,
			icon: '🌬️'
		},
		{
			id: '1week',
			name: '1 Week',
			description: "You've made it through the hardest part! Cravings are less intense",
			duration: 10080,
			icon: '🎉'
		},
		{
			id: '2weeks',
			name: '2 Weeks',
			description: 'Circulation improves. Walking and exercise become easier',
			duration: 20160,
			icon: '🚶'
		},
		{
			id: '1month',
			name: '1 Month',
			description: 'Lung function begins to improve. Coughing and shortness of breath decrease',
			duration: 43200,
			icon: '🏆'
		},
		{
			id: '3months',
			name: '3 Months',
			description: 'Circulation and lung function continue to improve',
			duration: 129600,
			icon: '💪'
		},
		{
			id: '6months',
			name: '6 Months',
			description: 'Stress levels normalize. Breathing problems continue to decrease',
			duration: 259200,
			icon: '🌟'
		},
		{
			id: '1year',
			name: '1 Year',
			description: 'Risk of coronary heart disease is half that of a smoker!',
			duration: 525600,
			icon: '🎊'
		}
	];
}

function getMotivationalQuotes() {
	return [
		'Every minute smoke-free is a victory! 🏆',
		"You're stronger than your cravings! 💪",
		'Think of how much healthier your body is becoming! ❤️',
		'Your lungs are thanking you right now! 🫁',
		"You're saving money and your life! 💰",
		'Cravings are temporary, but your health is forever! ⏳',
		"Look how far you've come! Keep going! 🚀",
		"You're proving to yourself that you can do hard things! 🌟",
		'Every day smoke-free is a gift to your future self! 🎁',
		"You're inspiring others by your commitment! 👏"
	];
}

function getCommonTriggers() {
	return [
		'Stress',
		'After meals',
		'With coffee',
		'Social situations',
		'Boredom',
		'Alcohol',
		'Driving',
		'Work break',
		'Seeing others smoke',
		'Morning routine'
	];
}

function getCopingStrategies() {
	return [
		'Deep breathing',
		'Drink water',
		'Chew gum',
		'Go for a walk',
		'Call a friend',
		'Exercise',
		'Meditation',
		'Distract yourself',
		'Eat healthy snack',
		'Review your goals'
	];
}

describe('Smoke Free Tracker', () => {
	describe('formatDuration', () => {
		it('should format minutes', () => {
			expect(formatDuration(30)).toBe('30 minutes');
			expect(formatDuration(1)).toBe('1 minute');
		});

		it('should format hours', () => {
			expect(formatDuration(120)).toBe('2 hours');
			expect(formatDuration(90)).toBe('1 hour 30 mins');
		});

		it('should format days', () => {
			expect(formatDuration(1440)).toBe('1 day');
			expect(formatDuration(2880)).toBe('2 days');
			expect(formatDuration(1800)).toBe('1 day 6 hours');
		});
	});

	describe('generateId', () => {
		it('should generate unique IDs', () => {
			const id1 = generateId();
			const id2 = generateId();
			expect(id1).not.toBe(id2);
			expect(typeof id1).toBe('string');
			expect(id1.length).toBeGreaterThan(0);
		});
	});

	describe('getDefaultMilestones', () => {
		it('should return array of milestones', () => {
			const milestones = getDefaultMilestones();
			expect(Array.isArray(milestones)).toBe(true);
			expect(milestones.length).toBeGreaterThan(0);
			milestones.forEach((milestone) => {
				expect(milestone).toHaveProperty('id');
				expect(milestone).toHaveProperty('name');
				expect(milestone).toHaveProperty('description');
				expect(milestone).toHaveProperty('duration');
				expect(milestone).toHaveProperty('icon');
			});
		});

		it('should have correct 20 minutes milestone', () => {
			const milestones = getDefaultMilestones();
			const twentyMin = milestones.find((m) => m.id === '20min');
			expect(twentyMin?.duration).toBe(20);
			expect(twentyMin?.icon).toBe('💓');
		});
	});

	describe('getMotivationalQuotes', () => {
		it('should return array of quotes', () => {
			const quotes = getMotivationalQuotes();
			expect(Array.isArray(quotes)).toBe(true);
			expect(quotes.length).toBeGreaterThan(0);
			quotes.forEach((quote) => {
				expect(typeof quote).toBe('string');
				expect(quote.length).toBeGreaterThan(0);
			});
		});
	});

	describe('getCommonTriggers', () => {
		it('should return array of common triggers', () => {
			const triggers = getCommonTriggers();
			expect(Array.isArray(triggers)).toBe(true);
			expect(triggers.length).toBeGreaterThan(0);
			expect(triggers).toContain('Stress');
			expect(triggers).toContain('After meals');
		});
	});

	describe('getCopingStrategies', () => {
		it('should return array of coping strategies', () => {
			const strategies = getCopingStrategies();
			expect(Array.isArray(strategies)).toBe(true);
			expect(strategies.length).toBeGreaterThan(0);
			expect(strategies).toContain('Deep breathing');
			expect(strategies).toContain('Drink water');
		});
	});
});

/**
 * Text analysis for the word counter mini-app.
 *
 * Pure functions only — the counting rules are unit-tested without a DOM so the
 * numbers shown in the UI can be trusted.
 */

export interface KeywordCount {
	word: string;
	count: number;
	/** Share of all words, as a percentage (0–100). */
	density: number;
}

export interface TextStats {
	words: number;
	characters: number;
	charactersNoSpaces: number;
	sentences: number;
	paragraphs: number;
	lines: number;
	uniqueWords: number;
	keywords: KeywordCount[];
	/** Minutes at 200 wpm, rounded up. */
	readingMinutes: number;
	/** Minutes at 130 wpm, rounded up. */
	speakingMinutes: number;
}

/**
 * A word is a run of letters/numbers, optionally joined by apostrophes or
 * hyphens ("don't", "state-of-the-art"). Punctuation and em dashes split.
 */
const WORD_PATTERN = /[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu;

/** Common English words that say little about what a text is actually about. */
const STOP_WORDS = new Set(
	`a about above after again against all am an and any are as at be because been before being
	below between both but by can could did do does doing down during each few for from further had
	has have having he her here hers herself him himself his how i if in into is it its itself just
	me more most my myself no nor not now of off on once only or other our ours ourselves out over own
	same she should so some such than that the their theirs them themselves then there these they
	this those through to too under until up very was we were what when where which while who whom why
	will with would you your yours yourself yourselves`
		.split(/\s+/)
		.filter(Boolean)
);

function countSentences(text: string): number {
	if (!text) return 0;

	// A run of terminators counts once ("..." is one sentence end), and only
	// counts when it closes a sentence rather than sitting inside "3.14".
	const terminators = text.match(/[.!?…]+(?=\s|$)/g)?.length ?? 0;
	const endsWithTerminator = /[.!?…]$/.test(text);

	return terminators + (endsWithTerminator ? 0 : 1);
}

/**
 * Analyses a piece of text.
 *
 * @param text - Text to inspect.
 * @param keywordLimit - Maximum number of keywords to return.
 */
export function analyzeText(text: string, keywordLimit = 8): TextStats {
	const trimmed = text.trim();
	const words = trimmed.match(WORD_PATTERN) ?? [];
	const wordCount = words.length;
	const characters = [...text];

	const frequencies = new Map<string, number>();
	for (const token of words) {
		const word = token.toLowerCase();
		if (word.length < 3 || STOP_WORDS.has(word) || /^\p{N}+$/u.test(word)) continue;
		frequencies.set(word, (frequencies.get(word) ?? 0) + 1);
	}

	const keywords = [...frequencies.entries()]
		.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
		.slice(0, keywordLimit)
		.map(([word, count]) => ({
			word,
			count,
			density: wordCount ? (count / wordCount) * 100 : 0
		}));

	return {
		words: wordCount,
		characters: characters.length,
		charactersNoSpaces: characters.filter((character) => !/\s/u.test(character)).length,
		sentences: countSentences(trimmed),
		paragraphs: trimmed ? trimmed.split(/\n\s*\n/).filter((block) => block.trim()).length : 0,
		lines: text ? text.split('\n').length : 0,
		uniqueWords: new Set(words.map((word) => word.toLowerCase())).size,
		keywords,
		readingMinutes: Math.ceil(wordCount / 200),
		speakingMinutes: Math.ceil(wordCount / 130)
	};
}

/** Formats minutes for display, e.g. 0 → "—", 90 → "1h 30m". */
export function formatDuration(minutes: number): string {
	if (minutes <= 0) return '—';
	if (minutes < 60) return `${minutes} min`;

	const hours = Math.floor(minutes / 60);
	const rest = minutes % 60;
	return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

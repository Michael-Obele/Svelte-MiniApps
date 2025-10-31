import { describe, it, expect } from 'vitest';

describe('Text Summarizer Utilities', () => {
	describe('countWords', () => {
		const countWords = (text: string): number => {
			if (!text) return 0;
			return text
				.trim()
				.split(/\s+/)
				.filter((word) => word.length > 0).length;
		};

		it('should count words correctly in a simple sentence', () => {
			expect(countWords('Hello world')).toBe(2);
			expect(countWords('This is a test')).toBe(4);
		});

		it('should handle empty string', () => {
			expect(countWords('')).toBe(0);
			expect(countWords('   ')).toBe(0);
		});

		it('should handle multiple spaces between words', () => {
			expect(countWords('Hello   world')).toBe(2);
			expect(countWords('This  is   a    test')).toBe(4);
		});

		it('should handle punctuation', () => {
			expect(countWords('Hello, world!')).toBe(2);
			expect(countWords('This is a test.')).toBe(4);
		});

		it('should handle newlines', () => {
			expect(countWords('Hello\nworld')).toBe(2);
			expect(countWords('This is\na test')).toBe(4);
		});

		it('should handle mixed whitespace', () => {
			expect(countWords('Hello \n world \t test')).toBe(3);
		});

		it('should count words with special characters', () => {
			expect(countWords('word1 word2 word3')).toBe(3);
			expect(countWords('test@example.com is valid')).toBe(3);
		});
	});

	describe('Sentence extraction', () => {
		const extractSentences = (text: string) => {
			const paragraphs = text.split(/\n+/);
			let allSentences: { text: string; score: number }[] = [];

			paragraphs.forEach((paragraph) => {
				if (paragraph.trim().startsWith('#')) return; // Skip headers

				const sentences = paragraph.split(/(?<=\.|\?|!)\s+/);

				sentences.forEach((sentence) => {
					if (sentence.trim().length > 10) {
						allSentences.push({
							text: sentence.trim(),
							score: 0
						});
					}
				});
			});

			return allSentences;
		};

		it('should extract sentences from paragraphs', () => {
			const text =
				'This is the first sentence. This is the second sentence! What about this question?';
			const sentences = extractSentences(text);

			expect(sentences).toHaveLength(3);
			expect(sentences[0].text).toBe('This is the first sentence.');
			expect(sentences[1].text).toBe('This is the second sentence!');
			expect(sentences[2].text).toBe('What about this question?');
		});

		it('should skip headers', () => {
			const text = '# Header\nThis is a sentence. Another sentence.';
			const sentences = extractSentences(text);

			expect(sentences).toHaveLength(2);
			expect(sentences[0].text).toBe('This is a sentence.');
			expect(sentences[1].text).toBe('Another sentence.');
		});

		it('should skip short sentences', () => {
			const text = 'Hi. This is a longer sentence that should be included.';
			const sentences = extractSentences(text);

			expect(sentences).toHaveLength(1);
			expect(sentences[0].text).toBe('This is a longer sentence that should be included.');
		});

		it('should handle multiple paragraphs', () => {
			const text = 'First paragraph. First sentence.\n\nSecond paragraph. Second sentence.';
			const sentences = extractSentences(text);

			expect(sentences).toHaveLength(4);
		});
	});

	describe('Word frequency scoring', () => {
		const calculateWordFrequency = (text: string) => {
			const wordFrequency: Record<string, number> = {};
			const words = text.toLowerCase().match(/\b\w+\b/g) || [];

			words.forEach((word) => {
				if (word.length > 3) {
					wordFrequency[word] = (wordFrequency[word] || 0) + 1;
				}
			});

			return wordFrequency;
		};

		const scoreSentences = (
			sentences: { text: string; score: number }[],
			wordFrequency: Record<string, number>
		) => {
			sentences.forEach((sentence) => {
				const sentenceWords = sentence.text.toLowerCase().match(/\b\w+\b/g) || [];
				sentenceWords.forEach((word) => {
					if (word.length > 3) {
						sentence.score += wordFrequency[word] || 0;
					}
				});
				sentence.score = sentence.score / Math.max(1, sentenceWords.length);
			});
		};

		it('should calculate word frequency correctly', () => {
			const text = 'The quick brown fox jumps over the lazy dog. The fox is quick.';
			const frequency = calculateWordFrequency(text);

			// Words with length <= 3 are ignored
			expect(frequency['the']).toBeUndefined(); // 3 chars
			expect(frequency['fox']).toBeUndefined(); // 3 chars
			expect(frequency['dog']).toBeUndefined(); // 3 chars
			expect(frequency['quick']).toBe(2); // 5 chars
			expect(frequency['brown']).toBe(1); // 5 chars
			expect(frequency['jumps']).toBe(1); // 5 chars
			expect(frequency['over']).toBe(1); // 4 chars
			expect(frequency['lazy']).toBe(1); // 4 chars
		});

		it('should ignore short words', () => {
			const text = 'The a an is of to and but or';
			const frequency = calculateWordFrequency(text);

			expect(Object.keys(frequency)).toHaveLength(0);
		});

		it('should score sentences based on word frequency', () => {
			const sentences = [
				{ text: 'The quick brown fox.', score: 0 },
				{ text: 'The lazy dog sleeps.', score: 0 }
			];
			const wordFrequency = { quick: 1, brown: 1, lazy: 1, sleeps: 1 };

			scoreSentences(sentences, wordFrequency);

			// First sentence: (1 + 1) / 4 = 0.5 (words: quick, brown; 'the' and 'fox' ignored)
			expect(sentences[0].score).toBe(0.5);
			// Second sentence: (1 + 1) / 4 = 0.5 (words: lazy, sleeps; 'the' and 'dog' ignored)
			expect(sentences[1].score).toBe(0.5);
		});

		it('should handle sentences with no qualifying words', () => {
			const sentences = [{ text: 'A is of to.', score: 0 }];
			const wordFrequency = { the: 2, quick: 1 };

			scoreSentences(sentences, wordFrequency);

			expect(sentences[0].score).toBe(0);
		});
	});

	describe('Summary generation', () => {
		const countWords = (text: string): number => {
			if (!text) return 0;
			return text
				.trim()
				.split(/\s+/)
				.filter((word) => word.length > 0).length;
		};

		const generateSummary = (text: string, targetWords: number) => {
			if (!text.trim()) {
				throw new Error('Please enter some text to summarize');
			}

			const paragraphs = text.split(/\n+/);
			let allSentences: { text: string; score: number }[] = [];

			paragraphs.forEach((paragraph) => {
				if (paragraph.trim().startsWith('#')) return;

				const sentences = paragraph.split(/(?<=\.|\?|!)\s+/);
				sentences.forEach((sentence) => {
					if (sentence.trim().length > 10) {
						allSentences.push({
							text: sentence.trim(),
							score: 0
						});
					}
				});
			});

			const wordFrequency: Record<string, number> = {};
			const words = text.toLowerCase().match(/\b\w+\b/g) || [];
			words.forEach((word) => {
				if (word.length > 3) {
					wordFrequency[word] = (wordFrequency[word] || 0) + 1;
				}
			});

			allSentences.forEach((sentence) => {
				const sentenceWords = sentence.text.toLowerCase().match(/\b\w+\b/g) || [];
				sentenceWords.forEach((word) => {
					if (word.length > 3) {
						sentence.score += wordFrequency[word] || 0;
					}
				});
				sentence.score = sentence.score / Math.max(1, sentenceWords.length);
			});

			allSentences.sort((a, b) => b.score - a.score);

			let summaryText = '';
			let currentWordCount = 0;

			for (const sentence of allSentences) {
				const sentenceWordCount = countWords(sentence.text);
				if (currentWordCount + sentenceWordCount <= targetWords) {
					summaryText += sentence.text + ' ';
					currentWordCount += sentenceWordCount;
				} else {
					break;
				}
			}

			return summaryText.trim() || "The text couldn't be summarized effectively.";
		};

		it('should generate a summary within word limit', () => {
			const text =
				'This is the first sentence with important information. This is the second sentence that is also important. This is a less important sentence.';
			const summary = generateSummary(text, 10);

			const wordCount = countWords(summary);
			expect(wordCount).toBeLessThanOrEqual(10);
			expect(wordCount).toBeGreaterThan(0);
		});

		it('should throw error for empty text', () => {
			expect(() => generateSummary('', 100)).toThrow('Please enter some text to summarize');
			expect(() => generateSummary('   ', 100)).toThrow('Please enter some text to summarize');
		});

		it('should select highest scoring sentences first', () => {
			const text =
				'The important topic is discussed here in detail. This sentence mentions the topic again. Unrelated content that should be ignored.';
			const summary = generateSummary(text, 20);

			// Should include sentences with "topic"
			expect(summary).toMatch(/topic/);
		});

		it('should return fallback message when no sentences fit', () => {
			const text = 'Short. Very short sentences that cannot be included.';
			const summary = generateSummary(text, 5);

			expect(summary).toBe("The text couldn't be summarized effectively.");
		});

		it('should handle text with headers', () => {
			const text =
				'# Introduction\nThis is an important sentence. This is also important.\n# Conclusion\nThis concludes the text.';
			const summary = generateSummary(text, 20);

			expect(summary).toContain('important');
			expect(summary).not.toContain('Introduction');
		});
	});

	describe('Edge cases', () => {
		it('should handle text with no punctuation', () => {
			const text = 'This is a long sentence without any punctuation it just keeps going and going';
			const sentences = text.split(/(?<=\.|\?|!)\s+/);

			expect(sentences).toHaveLength(1);
			expect(sentences[0]).toBe(text);
		});

		it('should handle very long sentences', () => {
			const longSentence = 'This is a very long sentence '.repeat(50) + '.';
			const wordCount = longSentence
				.trim()
				.split(/\s+/)
				.filter((word) => word.length > 0).length;

			expect(wordCount).toBeGreaterThan(100);
		});

		it('should handle text with only headers', () => {
			const text = '# Header 1\n## Header 2\n### Header 3';
			const generateSummary = (text: string, targetWords: number) => {
				const paragraphs = text.split(/\n+/);
				let allSentences: { text: string; score: number }[] = [];

				paragraphs.forEach((paragraph) => {
					if (paragraph.trim().startsWith('#')) return;
					const sentences = paragraph.split(/(?<=\.|\?|!)\s+/);
					sentences.forEach((sentence) => {
						if (sentence.trim().length > 10) {
							allSentences.push({
								text: sentence.trim(),
								score: 0
							});
						}
					});
				});

				return allSentences.length === 0
					? "The text couldn't be summarized effectively."
					: 'Summary generated';
			};

			const summary = generateSummary(text, 100);
			expect(summary).toBe("The text couldn't be summarized effectively.");
		});
	});
});

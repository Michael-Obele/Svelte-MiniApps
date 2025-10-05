<script lang="ts">
	import RouteHead from '$lib/components/blocks/RouteHead.svelte';
	import { Button } from '@/ui/button/index.js';
	import { Textarea } from '@/ui/textarea/index.js';
	import { Slider } from '@/ui/slider';
	import * as Card from '@/ui/card';
	import { AlertCircle, Copy, Info } from '@lucide/svelte';
	import * as Alert from '@/ui/alert/index.js';
	import { PersistedState } from 'runed';
	import DOMPurify from 'isomorphic-dompurify';
	import { marked } from 'marked';
	import { sampleText, sampleIntroduction } from './data';
	import HowToUseDialog from '@/ui/HowToUseDialog.svelte';
	import { textSummarizerHowToUse } from './how-to-use-config';
	import { HelpCircle } from '@lucide/svelte';

	// Define states with persistence for content
	let inputText = new PersistedState('summarizer-input-text', sampleText);
	let summary = new PersistedState('summarizer-summary', '');

	// Safety check for persistence values
	if (inputText.current === undefined) {
		inputText.current = sampleText;
	}

	if (summary.current === undefined) {
		summary.current = '';
	}

	// Use simple Svelte state for sliders
	let summaryRatioState = $state(30); // Default to 30% of original text
	let maxWordsState = $state(100); // Default max words

	// Active tab state
	let activeTab = $state('text');

	// Word counts
	let inputWordCount = $derived(countWords(inputText.current));
	let summaryWordCount = $derived(countWords(summary.current));
	let targetWordCount = $derived(Math.round(inputWordCount * (summaryRatioState / 100)));

	// Word counts are derived from the current state values

	// Error states
	let error = $state('');
	let copied = $state(false);
	let showHowToUse = $state(false);
	let hasSeenHowToUse = new PersistedState('text-summarizer-has-seen-how-to-use', false);

	// Function to count words in text
	function countWords(text: string): number {
		if (!text) return 0;
		return text
			.trim()
			.split(/\s+/)
			.filter((word) => word.length > 0).length;
	}

	// Function to generate summary using extractive summarization
	function generateSummary() {
		try {
			error = '';

			if (!inputText.current.trim()) {
				error = 'Please enter some text to summarize';
				return;
			}

			// Simple extractive summarization algorithm

			// 1. Split text into paragraphs and then sentences
			const paragraphs = inputText.current.split(/\n+/);
			let allSentences: { text: string; score: number }[] = [];

			// Extract sentences from paragraphs
			paragraphs.forEach((paragraph) => {
				if (paragraph.trim().startsWith('#')) return; // Skip headers

				// Split into sentences (basic implementation)
				const sentences = paragraph.split(/(?<=\.|\?|!)\s+/);

				sentences.forEach((sentence) => {
					if (sentence.trim().length > 10) {
						// Only consider sentences of reasonable length
						allSentences.push({
							text: sentence.trim(),
							score: 0 // Initial score
						});
					}
				});
			});

			// 2. Score each sentence (basic scoring based on word frequency)
			// First, count word frequency
			const wordFrequency: Record<string, number> = {};
			const words = inputText.current.toLowerCase().match(/\b\w+\b/g) || [];

			words.forEach((word) => {
				if (word.length > 3) {
					// Ignore very short words
					wordFrequency[word] = (wordFrequency[word] || 0) + 1;
				}
			});

			// Score sentences based on word frequency
			allSentences.forEach((sentence) => {
				const sentenceWords = sentence.text.toLowerCase().match(/\b\w+\b/g) || [];
				sentenceWords.forEach((word) => {
					if (word.length > 3) {
						sentence.score += wordFrequency[word] || 0;
					}
				});
				// Normalize by sentence length (to avoid favoring very long sentences)
				sentence.score = sentence.score / Math.max(1, sentenceWords.length);
			});

			// 3. Sort sentences by score and select top ones to meet the target word count
			allSentences.sort((a, b) => b.score - a.score);

			let summaryText = '';
			let currentWordCount = 0;
			// Use the state variable for max words
			const targetWords = Math.min(maxWordsState, targetWordCount);

			for (const sentence of allSentences) {
				const sentenceWordCount = countWords(sentence.text);
				if (currentWordCount + sentenceWordCount <= targetWords) {
					summaryText += sentence.text + ' ';
					currentWordCount += sentenceWordCount;
				} else {
					// If we can't fit another complete sentence, we'll stop here
					break;
				}
			}

			// Update the summary
			summary.current = summaryText.trim();

			// If no sentences were selected
			if (!summary.current) {
				summary.current =
					"The text couldn't be summarized effectively. Try adjusting the summary ratio or max words setting.";
			}
		} catch (err) {
			error = `Error generating summary: ${err instanceof Error ? err.message : 'Unknown error'}`;
			console.error(err);
		}
	}

	// Copy to clipboard function
	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(summary.current);
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
		} catch {
			// Catch without a variable is fine since we don't use it
			error = 'Failed to copy to clipboard';
		}
	}

	// Initialize with sample summary if none exists
	if (!summary.current && inputText.current === sampleText) {
		summary.current = sampleIntroduction;
	}

	// Function to render markdown content safely
	function renderMarkdown(text: string): string {
		const html = marked.parse(text) as string;
		return DOMPurify.sanitize(html);
	}

	// Reset everything
	function resetAll() {
		inputText.current = '';
		summary.current = '';
		summaryRatioState = 30;
		maxWordsState = 100;
		error = '';
	}

	// Load sample text
	function loadSample() {
		inputText.current = sampleText;
		summary.current = sampleIntroduction;
	}
</script>

<RouteHead
	title="Text Summarizer - Create Concise Summaries Instantly"
	description="Quickly summarize long text into concise versions with our Text Summarizer tool. Perfect for students, researchers, and professionals who need to extract key information."
	keywords="text summarizer, text summary, content summarization, svelte, nlp, document summary, ai summarizer, extractive summarization"
	route="/apps/text-summarizer"
/>

<div class="container mx-auto min-h-screen bg-gray-50 px-4 py-6 dark:bg-black">
	<div class="mx-auto max-w-4xl space-y-6">
		<div class="container mx-auto min-h-screen px-4 py-8">
			<div class="mx-auto flex max-w-4xl flex-col items-center space-y-8">
				<div class="flex items-center gap-4">
					<h1
						class="text-center text-5xl font-extrabold tracking-tight text-black sm:text-6xl dark:text-gray-100"
					>
						Text Summarizer
					</h1>
					<Button
						variant="outline"
						size="icon"
						onclick={() => (showHowToUse = true)}
						class="shrink-0"
					>
						<HelpCircle class="h-4 w-4" />
					</Button>
				</div>
				<div
					class="flex w-full flex-col space-y-3 text-center text-lg leading-relaxed text-gray-600 sm:text-xl dark:text-gray-400"
				>
					<p class=" block max-w-md justify-start rounded-lg p-6">
						Welcome to the <strong class="text-red-600 dark:text-green-400">Text Summarizer</strong
						>! Quickly create concise summaries of longer texts using algorithmic extractive
						techniques, not AI.
					</p>
					<p class=" block max-w-md justify-self-end rounded-lg p-6">
						Save time and focus on what matters by pasting your text, adjusting the summary length,
						and getting results instantly. Try it with sample text or your own content!
					</p>
				</div>
			</div>

			{#if error}
				<Alert.Root class="mt-4 mb-6" variant="destructive">
					<div class="flex items-center gap-2">
						<AlertCircle class="h-4 w-4" />
						<Alert.Title>Error</Alert.Title>
					</div>
					<Alert.Description>{error}</Alert.Description>
				</Alert.Root>
			{/if}

			<div class="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
				<!-- Input Section -->
				<Card.Root>
					<Card.Header>
						<Card.Title>Input Text</Card.Title>
						<Card.Description>Enter or paste the text you want to summarize</Card.Description>
					</Card.Header>
					<Card.Content>
						<div class="flex items-center justify-between space-x-2">
							<div>
								<Button
									variant="outline"
									size="sm"
									class="mb-2"
									onclick={() => {
										activeTab = 'text';
									}}
								>
									Text
								</Button>
								<Button
									variant="outline"
									size="sm"
									class="mb-2 ml-2"
									onclick={() => {
										activeTab = 'preview';
									}}
								>
									Preview
								</Button>
							</div>
							<div class="text-sm text-gray-500">
								{inputWordCount} words
							</div>
						</div>

						{#if activeTab === 'text'}
							<Textarea
								class="min-h-[300px] w-full resize-none"
								placeholder="Enter text to summarize..."
								bind:value={inputText.current}
							/>
						{:else}
							<div
								class="markdown-preview max-h-[300px] min-h-[300px] overflow-auto rounded-md border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
							>
								<!--
                  Using {@html} is safe here because we're sanitizing the content with DOMPurify
                  in the renderMarkdown function to prevent XSS attacks.
                  See the renderMarkdown function implementation above.
                -->
								<!-- eslint-disable-next-line svelte/no-at-html-tags -->
								{@html renderMarkdown(inputText.current)}
							</div>
						{/if}

						<div class="mt-4 flex justify-between">
							<Button variant="secondary" size="sm" onclick={loadSample}>Load Sample</Button>
							<Button
								variant="destructive"
								size="sm"
								onclick={() => {
									inputText.current = '';
								}}
							>
								Clear
							</Button>
						</div>
					</Card.Content>
				</Card.Root>

				<!-- Settings and Output Section -->
				<div class="space-y-6">
					<!-- Settings Card -->
					<Card.Root>
						<Card.Header>
							<Card.Title>Summary Settings</Card.Title>
							<Card.Description>Adjust how your summary is generated</Card.Description>
						</Card.Header>
						<Card.Content>
							<div class="space-y-4">
								<div class="space-y-2">
									<div class="flex items-center justify-between">
										<label class="text-sm font-medium" for="summary-ratio">
											Summary Length: {summaryRatioState}% of original
										</label>
										<span class="text-xs text-gray-500">
											Target: ~{targetWordCount} words
										</span>
									</div>
									<Slider
										id="summary-ratio"
										type="single"
										bind:value={summaryRatioState}
										min={5}
										max={50}
										step={5}
									/>
								</div>

								<div class="space-y-2">
									<div class="flex items-center justify-between">
										<label class="text-sm font-medium" for="max-words">
											Maximum Words: {maxWordsState}
										</label>
									</div>
									<Slider
										id="max-words"
										type="single"
										bind:value={maxWordsState}
										min={50}
										max={500}
										step={50}
									/>
								</div>

								<Button class="w-full" onclick={generateSummary}>Generate Summary</Button>
							</div>
						</Card.Content>
					</Card.Root>

					<!-- Summary Output Card -->
					<Card.Root>
						<Card.Header>
							<div class="flex items-center justify-between">
								<Card.Title>Summary</Card.Title>
								<span class="text-sm text-gray-500">
									{summaryWordCount} words ({Math.round(
										(summaryWordCount / Math.max(1, inputWordCount)) * 100
									)}% of original)
								</span>
							</div>
							<Card.Description>Your summarized text will appear here</Card.Description>
						</Card.Header>
						<Card.Content class="relative">
							<div
								class="min-h-[150px] rounded-md border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
							>
								{#if summary.current}
									<p class="text-gray-800 dark:text-gray-200">{summary.current}</p>
								{:else}
									<p class="text-gray-500 dark:text-gray-400">
										Click "Generate Summary" to create a summary of your text
									</p>
								{/if}
							</div>

							{#if summary.current}
								<div class="mt-4 flex justify-between">
									<Button
										variant="outline"
										size="sm"
										class="flex items-center gap-2"
										onclick={copyToClipboard}
									>
										<Copy class="h-4 w-4" />
										{copied ? 'Copied!' : 'Copy to Clipboard'}
									</Button>
									<Button
										variant="destructive"
										size="sm"
										onclick={() => {
											summary.current = '';
										}}
									>
										Clear
									</Button>
								</div>
							{/if}
						</Card.Content>
					</Card.Root>
				</div>
			</div>

			<!-- Information Card -->
			<Card.Root class="mt-8">
				<Card.Header>
					<Card.Title class="flex items-center gap-2">
						<Info class="h-5 w-5 text-blue-500" />
						How It Works
					</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="space-y-4 text-sm">
						<p>
							This Text Summarizer uses an extractive summarization algorithm to identify and
							extract the most important sentences from your text.
						</p>
						<p>The process works as follows:</p>
						<ol class="ml-6 list-decimal space-y-2">
							<li>The text is broken down into sentences.</li>
							<li>
								Each sentence is scored based on the frequency and importance of words it contains.
							</li>
							<li>The highest-scoring sentences are selected to form a coherent summary.</li>
							<li>The summary length is adjusted based on your settings.</li>
						</ol>
						<p class="text-gray-600 italic dark:text-gray-400">
							Note: For best results, use well-structured text with clear paragraphs. This
							summarizer works best with informational or educational content rather than creative
							writing.
						</p>
					</div>
				</Card.Content>
			</Card.Root>

			<!-- Reset Button -->
			<div class="mt-8 text-center">
				<Button variant="outline" onclick={resetAll}>Reset Everything</Button>
			</div>
		</div>
	</div>
</div>

<HowToUseDialog
	bind:open={showHowToUse}
	onClose={() => (hasSeenHowToUse.current = true)}
	title={textSummarizerHowToUse.title}
	description={textSummarizerHowToUse.description}
	tabs={textSummarizerHowToUse.tabs}
	showFooterHelpText={textSummarizerHowToUse.showFooterHelpText}
/>

<style>
	:global(.markdown-preview h1) {
		font-size: 1.8em;
		font-weight: bold;
		margin-top: 1em;
		margin-bottom: 0.5em;
	}

	:global(.markdown-preview h2) {
		font-size: 1.5em;
		font-weight: bold;
		margin-top: 1em;
		margin-bottom: 0.5em;
	}

	:global(.markdown-preview h3) {
		font-size: 1.3em;
		font-weight: bold;
		margin-top: 1em;
		margin-bottom: 0.5em;
	}

	:global(.markdown-preview p) {
		margin-bottom: 1em;
	}

	:global(.markdown-preview ul, .markdown-preview ol) {
		margin-left: 1.5em;
		margin-bottom: 1em;
	}

	:global(.markdown-preview li) {
		margin-bottom: 0.5em;
	}

	:global(.markdown-preview a) {
		color: #3b82f6;
		text-decoration: underline;
	}

	:global(.dark .markdown-preview a) {
		color: #60a5fa;
	}

	:global(.markdown-preview code) {
		background-color: #f1f5f9;
		padding: 0.2em 0.4em;
		border-radius: 3px;
		font-family: monospace;
	}

	:global(.dark .markdown-preview code) {
		background-color: #1e293b;
	}

	:global(.markdown-preview pre) {
		background-color: #f1f5f9;
		padding: 1em;
		border-radius: 4px;
		overflow-x: auto;
		margin-bottom: 1em;
	}

	:global(.dark .markdown-preview pre) {
		background-color: #1e293b;
	}

	:global(.markdown-preview blockquote) {
		border-left: 4px solid #e2e8f0;
		padding-left: 1em;
		margin-left: 0;
		margin-bottom: 1em;
		font-style: italic;
	}

	:global(.dark .markdown-preview blockquote) {
		border-left-color: #475569;
	}

	:global(.markdown-preview hr) {
		border: 0;
		border-top: 1px solid #e2e8f0;
		margin: 2em 0;
	}

	:global(.dark .markdown-preview hr) {
		border-top-color: #475569;
	}
</style>

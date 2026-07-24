<!--
@component

PasswordGenerator — the full, unmodified password generator UI.

Used in two places:
  • `/apps/random-password-generator` — the full app. The page renders this
    component inside its card, then adds the saved-passwords history below.
  • The homepage `LivePreview` section — the same UI, wrapped in a marketing
    card with an "Open the full app" CTA beside it.

The component itself does not know or care which surface it's on. It owns
the generation core (character sets, RNG, options, strength meter, colored
display) and the four character-type checkboxes. The save flow, history, and
auth gating are the page's concern.

The save dialog uses `getCurrentUser()` as an awaited remote query directly
in markup (the project pattern, also used by Navbar.svelte / AuthStatus.svelte).
This removes the need for a `$effect` + `.then()` + local state dance.

Implementation note — we use native HTML controls (`<input type="range">`,
`<input type="checkbox">`) instead of the shadcn Slider/Switch. The shadcn
controls rely on bits-ui's `bind:value` typing that was breaking reactivity
in this component (slider value silently went undefined, switches stopped
responding on certain browsers). Native HTML inputs are guaranteed reactive
in Svelte 5 and are styled with Tailwind to match the design system.

A small floating "Copy" button sits in the top-right corner of the password
display so the user can grab the password at any time without the button
ever covering the text.

-->

<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Progress } from '$lib/components/ui/progress';
	import { toast } from 'svelte-sonner';
	import { Lock, Copy, Check, Star } from '@lucide/svelte';
	import { copyToClipboard } from '$lib/utils';
	import { fade } from 'svelte/transition';
	import * as Dialog from '$lib/components/ui/dialog';
	import { untrack } from 'svelte';
	import { savePassword, getSavedPasswords, getCurrentUser } from '$lib/remote';

	// Character sets (single source of truth).
	const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
	const NUMBERS = '0123456789';
	const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

	// Generation state. Initial length is 12 (the existing app default).
	let passwordLength = $state(12);
	let includeUppercase = $state(true);
	let includeLowercase = $state(true);
	let includeNumbers = $state(true);
	let includeSymbols = $state(true);

	// UI state.
	let copySuccess = $state(false);
	let isSaved = $state(false);
	let saving = $state(false);
	let showSavePopover = $state(false);
	let passwordDetails = $state('');

	// Pure: build the charset for the current option set.
	function buildCharset(opts: { upper: boolean; numbers: boolean; symbols: boolean }): string {
		let chars = LOWERCASE;
		if (opts.upper) chars += UPPERCASE;
		if (opts.numbers) chars += NUMBERS;
		if (opts.symbols) chars += SYMBOLS;
		return chars;
	}

	// Fill a random buffer using Web Crypto when available, with a Math.random
	// fallback for ancient environments.
	function fillRandomBuffer(len: number): Uint32Array {
		const useCrypto =
			typeof globalThis !== 'undefined' && typeof globalThis.crypto?.getRandomValues === 'function';
		const buffer = new Uint32Array(len);
		if (useCrypto) {
			globalThis.crypto.getRandomValues(buffer);
			return buffer;
		}
		for (let i = 0; i < len; i++) {
			buffer[i] = Math.floor(Math.random() * 0xffffffff);
		}
		return buffer;
	}

	function buildPassword(
		len: number,
		opts: { upper: boolean; numbers: boolean; symbols: boolean }
	): string {
		const chars = buildCharset(opts);
		const buffer = fillRandomBuffer(len);
		let out = '';
		for (let i = 0; i < len; i++) {
			out += chars[buffer[i] % chars.length];
		}
		return out;
	}

	function currentOptions() {
		return {
			upper: includeUppercase,
			numbers: includeNumbers,
			symbols: includeSymbols
		};
	}

	// Seed a password at component init so the preview is never empty.
	// `untrack` keeps slider/checkbox changes non-reactive — those should only
	// re-roll on the explicit Generate button.
	let password = $state(untrack(() => buildPassword(passwordLength, currentOptions())));

	let passwordStrength = $derived.by(() => {
		if (!password) return 0;
		let strength = 0;
		if (password.length >= 12) strength += 25;
		if (includeUppercase && /[A-Z]/.test(password)) strength += 25;
		if (includeLowercase && /[a-z]/.test(password)) strength += 25;
		if (includeNumbers && /\d/.test(password)) strength += 12.5;
		if (includeSymbols && /[^A-Za-z0-9]/.test(password)) strength += 12.5;
		return strength;
	});

	function getStrengthColor(strength: number): string {
		if (strength <= 25) return 'bg-red-500';
		if (strength <= 50) return 'bg-orange-500';
		if (strength <= 75) return 'bg-yellow-500';
		return 'bg-green-500';
	}

	let coloredPassword = $derived.by(() => {
		return password.split('').map((char) => {
			let colorClass = '';
			if (/\d/.test(char)) colorClass = 'text-orange-700 dark:text-orange-400';
			else if (/[^A-Za-z0-9]/.test(char)) colorClass = 'text-purple-700 dark:text-purple-400';
			else colorClass = 'text-foreground';
			return { char, colorClass };
		});
	});

	function generate() {
		password = buildPassword(passwordLength, currentOptions());
		copySuccess = false;
		isSaved = false;
	}

	async function handleCopy() {
		if (!password) return;
		await copyToClipboard(
			password,
			'Password copied to clipboard',
			'Failed to copy password',
			flashCopySuccess
		);
	}

	function flashCopySuccess() {
		copySuccess = true;
		setTimeout(() => {
			copySuccess = false;
		}, 2000);
	}

	async function handleSave() {
		if (saving || !password) return;
		try {
			saving = true;
			await savePassword({ password, details: passwordDetails || null });
			// Refresh the query so any other consumer (e.g. the password list on
			// the parent page) re-resolves with the new value.
			await getSavedPasswords().refresh();
			toast.success('Password saved successfully!');
			showSavePopover = false;
			passwordDetails = '';
		} catch (error) {
			console.error('Error saving password:', error);
			toast.error('Failed to save password');
		} finally {
			saving = false;
			isSaved = true;
		}
	}
</script>

<!--
  PASSWORD DISPLAY + COPY BUTTON
  Full-width colored display (numbers in orange, symbols in purple,
  letters in default foreground — same logic as the original app). The
  copy button lives in its OWN row below the display, so it can never
  overlap the password text regardless of length or screen width.

  Keying: the each block uses the array index as its key. The
  coloredPassword array is regenerated atomically on every password
  change, so the indices are stable per-password. The previous
  `(char + Math.random())` key looked harmless but Math.random() in
  a key is non-idempotent — Svelte throws `each_key_volatile` on
  re-render, which silently killed the Generate button.
-->
<div
	class="border-input bg-background ring-offset-background placeholder:text-muted-foreground flex min-h-[3rem] w-full items-center rounded-md border px-4 py-3 font-mono text-lg break-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-xl"
>
	{#if password}
		{#each coloredPassword as { char, colorClass }, i (i)}
			<span class={colorClass}>{char}</span>
		{/each}
	{:else}
		<span class="text-muted-foreground text-lg md:text-xl">Your password will appear here</span>
	{/if}
</div>

<!--
  Copy button + strength meter share a row so the layout is compact.
  The copy button is a full-width, clearly-labelled button (not a
  tiny icon) so there's no ambiguity about what it does and it can
  never visually overlap the password above.
-->
<div class="mt-2 flex items-center gap-3">
	<Button
		variant="outline"
		onclick={handleCopy}
		disabled={!password}
		aria-label="Copy password to clipboard"
		class="flex-1"
	>
		{#if copySuccess}
			<Check class="mr-2 h-4 w-4 text-emerald-600 dark:text-emerald-500" />
			Copied
		{:else}
			<Copy class="mr-2 h-4 w-4" />
		{/if}
		Copy password
	</Button>

	{#if password}
		<div class="text-muted-foreground text-xs font-medium whitespace-nowrap">
			{Math.round(passwordStrength)}% strong
		</div>
	{/if}
</div>

<!-- STRENGTH METER (visual bar). -->
{#if password}
	<div transition:fade>
		<Progress
			value={passwordStrength}
			class="mt-3 h-2 transition-all duration-300 ease-out"
			classInner={getStrengthColor(passwordStrength)}
		/>
	</div>
{/if}

<!--
  CONTROLS
  Native range slider + 4 native checkboxes styled with Tailwind. Native
  controls are guaranteed reactive in Svelte 5 and don't have the bits-ui
  binding quirks that the shadcn Slider/Switch were showing here.
-->
<div class="mt-6 space-y-4">
	<div class="space-y-3">
		<div class="flex items-center justify-between">
			<Label for="passwordLength" class="text-base font-medium">Password Length</Label>
			<span class="bg-muted rounded px-2 py-1 font-mono text-sm">{passwordLength}</span>
		</div>
		<input
			id="passwordLength"
			type="range"
			min="8"
			max="32"
			step="1"
			bind:value={passwordLength}
			class="accent-primary w-full cursor-pointer"
		/>
	</div>

	<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
		<label
			class="hover:bg-muted/50 has-checked:border-primary has-checked:bg-primary/5 flex cursor-pointer items-center justify-between gap-2 rounded-lg border p-3 transition-colors"
		>
			<span class="cursor-pointer text-sm font-medium">Uppercase Letters</span>
			<input
				type="checkbox"
				bind:checked={includeUppercase}
				class="accent-primary h-4 w-4 cursor-pointer"
			/>
		</label>
		<label
			class="hover:bg-muted/50 has-checked:border-primary has-checked:bg-primary/5 flex cursor-pointer items-center justify-between gap-2 rounded-lg border p-3 transition-colors"
		>
			<span class="cursor-pointer text-sm font-medium">Lowercase Letters</span>
			<input
				type="checkbox"
				bind:checked={includeLowercase}
				class="accent-primary h-4 w-4 cursor-pointer"
			/>
		</label>
		<label
			class="hover:bg-muted/50 has-checked:border-primary has-checked:bg-primary/5 flex cursor-pointer items-center justify-between gap-2 rounded-lg border p-3 transition-colors"
		>
			<span class="cursor-pointer text-sm font-medium">Numbers</span>
			<input
				type="checkbox"
				bind:checked={includeNumbers}
				class="accent-primary h-4 w-4 cursor-pointer"
			/>
		</label>
		<label
			class="hover:bg-muted/50 has-checked:border-primary has-checked:bg-primary/5 flex cursor-pointer items-center justify-between gap-2 rounded-lg border p-3 transition-colors"
		>
			<span class="cursor-pointer text-sm font-medium">Special Characters</span>
			<input
				type="checkbox"
				bind:checked={includeSymbols}
				class="accent-primary h-4 w-4 cursor-pointer"
			/>
		</label>
	</div>
</div>

<!-- GENERATE BUTTON. -->
<Button class="mt-6 h-12 w-full text-base font-medium" onclick={generate}>
	<Lock class="mr-2 h-4 w-4" />
	Generate Password
</Button>

<!--
  SAVE ROW
  Await the user query as a block (project pattern: Navbar, AuthStatus).
  The query has its own loading + dedup + refresh state — we just
  consume the result.
-->
{#await getCurrentUser() then user}
	<Dialog.Root bind:open={showSavePopover}>
		<div class="mt-4 flex items-center justify-center">
			{#if !saving}
				<Dialog.Trigger
					class="border-input bg-background ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-12 w-full items-center justify-center gap-2 rounded-md border text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
					disabled={!user || !password}
					title={user ? 'Save this password' : 'Sign in to save'}
				>
					<Star class="h-5 w-5 {isSaved ? 'fill-current' : ''}" />
					<span class="ml-2">{user ? 'Save to my account' : 'Sign in to save'}</span>
				</Dialog.Trigger>
			{:else}
				<div class="flex h-12 w-full items-center justify-center rounded-md border">
					<div
						class="size-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"
					></div>
				</div>
			{/if}
		</div>

		<Dialog.Content class="w-80">
			<Dialog.Header>
				<Dialog.Title>Save Password</Dialog.Title>
				<Dialog.Description>
					Add an optional description to help you remember what this password is for.
				</Dialog.Description>
			</Dialog.Header>
			<div class="grid gap-4 py-4">
				<div class="grid gap-2">
					<Label for="password-details">Description (Optional)</Label>
					<Input
						id="password-details"
						bind:value={passwordDetails}
						placeholder="e.g., My email account, Work laptop..."
						maxlength={200}
					/>
					<p class="text-muted-foreground text-xs">
						{passwordDetails.length}/200 characters
					</p>
				</div>
			</div>
			<Dialog.Footer>
				<Button variant="outline" onclick={() => (showSavePopover = false)}>Cancel</Button>
				<Button onclick={handleSave} disabled={saving}>
					{#if saving}
						<div
							class="mr-2 size-4 animate-spin rounded-full border-2 border-gray-300 border-t-white"
						></div>
					{/if}
					Save
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
{/await}

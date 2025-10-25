# Greetings Translation Setup with Wuchale

**Date**: December 28, 2024  
**Task**: Ensure greetings from `getGreetingAndNextPeriod()` are translatable

## Summary

Successfully configured Wuchale to extract and translate the time-based greetings from `src/lib/utility/greetings.ts`. All four greeting strings are now available in 7 languages.

## What Was Done

### 1. Updated Wuchale Configuration

**File**: `wuchale.config.js`

Added the greetings utility file to the `js` adapter configuration:

```javascript
js: js({
	files: [
		'src/**/+{page,layout}.{js,ts}',
		'src/**/+{page,layout}.server.{js,ts}',
		'src/lib/utility/greetings.ts' // ← Added this line
	]
});
```

### 2. Ran Wuchale Extraction

Executed `bunx wuchale` which:

1. **Analyzed** `src/lib/utility/greetings.ts`
2. **Extracted** 4 greeting strings from `getGreetingAndNextPeriod()`:
   - "Good morning"
   - "Good afternoon"
   - "Good evening"
   - "Good night"
3. **Automatically translated** them into 6 languages using Gemini AI

### 3. Verified Translations

**Spanish (es.po)**:

- "Good morning" → "Buenos días"
- "Good afternoon" → "Buenas tardes"
- "Good evening" → "Buenas noches"
- "Good night" → "Buenas noches"

**Note**: Translations are also available in French, German, Chinese, Japanese, and Portuguese.

## How It Works

### Wuchale's Extraction Logic

The `adapter-vanilla` (js adapter) uses a **function-only heuristic** (`defaultHeuristicFuncOnly`):

- ✅ **Extracts**: String literals inside functions (like `getGreetingAndNextPeriod()`)
- ❌ **Ignores**: Top-level variable assignments and expressions

This is perfect for your use case because the greetings are returned from a function!

### Example from greetings.ts

```typescript
export function getGreetingAndNextPeriod(): { greeting: string; millisecondsUntilNext: number } {
	const now = new Date();
	const hour = now.getHours();
	let greeting: string;
	let nextHour: number;

	if (hour >= 0 && hour < 5) {
		greeting = 'Good night'; // ← Extracted!
		nextHour = 5;
	} else if (hour >= 5 && hour < 12) {
		greeting = 'Good morning'; // ← Extracted!
		nextHour = 12;
	} else if (hour >= 12 && hour < 18) {
		greeting = 'Good afternoon'; // ← Extracted!
		nextHour = 18;
	} else {
		greeting = 'Good evening'; // ← Extracted!
		nextHour = 29;
	}
	// ... rest of function
}
```

### When Transformation Happens

**Important**: The source file is NOT modified during extraction. Wuchale transforms the code **at build time** (during `bun run dev` or `bun run build`):

1. **Extraction** (`bunx wuchale`): Creates/updates `.po` catalog files
2. **Translation**: Edit `.po` files or use AI translation
3. **Build/Dev**: Vite plugin transforms code automatically

**During build**, the function will be transformed to something like:

```typescript
import _w_to_rt_ from 'wuchale/runtime';
import _w_load_ from '../../locales/loader.js';

export function getGreetingAndNextPeriod(): { greeting: string; millisecondsUntilNext: number } {
	const _w_runtime_ = _w_to_rt_(_w_load_('js'));
	const now = new Date();
	const hour = now.getHours();
	let greeting: string;
	let nextHour: number;

	if (hour >= 0 && hour < 5) {
		greeting = _w_runtime_.t(0); // ← Translated!
		nextHour = 5;
	} else if (hour >= 5 && hour < 12) {
		greeting = _w_runtime_.t(1); // ← Translated!
		nextHour = 12;
	} else if (hour >= 12 && hour < 18) {
		greeting = _w_runtime_.t(2); // ← Translated!
		nextHour = 18;
	} else {
		greeting = _w_runtime_.t(3); // ← Translated!
		nextHour = 29;
	}
	// ... rest of function
}
```

## Usage in Components

The greeting will be automatically translated when used in Svelte components:

```svelte
<script>
	import { getGreetingAndNextPeriod } from '$lib/utility/greetings';

	// The greeting string is already translated based on the current locale!
	let { greeting } = getGreetingAndNextPeriod();
</script>

<h1>{greeting}</h1>
<!-- Shows "Buenos días", "Bonjour", "おはよう", etc. depending on locale -->
```

## Locale Switching

To switch the locale at runtime, you would typically:

1. **Set the locale** using Wuchale's loader functions
2. **Reload the catalog** for the new locale
3. **Re-render** components

For example (simplified):

```javascript
import { loadLocale } from 'wuchale/load-utils';

// Switch to Spanish
await loadLocale('es');

// Components will automatically show Spanish greetings
```

**Note**: The exact implementation depends on your app architecture. You may need to set up locale switching in your SvelteKit app (via hooks, stores, or URL parameters).

## Catalog Files

All greeting translations are stored in:

```
src/locales/
├── en.po        # English (source)
├── es.po        # Spanish
├── fr.po        # French
├── de.po        # German
├── zh.po        # Chinese
├── ja.po        # Japanese
└── pt.po        # Portuguese
```

You can manually edit these files or use translation tools like Poedit.

## Compile-Time Benefits

Because Wuchale works at compile-time:

✅ **Zero runtime overhead**: Translations are compiled into efficient lookups  
✅ **Type safety**: Missing translations detected at build time  
✅ **Automatic extraction**: No manual key management  
✅ **Tree-shaking**: Only used translations are included in the bundle  
✅ **HMR support**: Translations update instantly during development

## Testing Translations

To test the translations:

1. **Start dev server**: `bun run dev`
2. **Change locale**: Implement locale switching in your app
3. **Verify greetings**: Check that greetings change based on time and locale

Example test scenarios:

| Time    | Locale | Expected Greeting |
| ------- | ------ | ----------------- |
| 8:00 AM | en     | "Good morning"    |
| 8:00 AM | es     | "Buenos días"     |
| 2:00 PM | en     | "Good afternoon"  |
| 2:00 PM | fr     | "Bon après-midi"  |
| 8:00 PM | en     | "Good evening"    |
| 8:00 PM | de     | "Guten Abend"     |
| 2:00 AM | en     | "Good night"      |
| 2:00 AM | ja     | "おやすみなさい"  |

## Key Learnings

1. **Wuchale's js adapter** automatically extracts strings from functions in TypeScript/JavaScript files
2. **No code changes needed** in the greetings function - Wuchale handles everything at build time
3. **AI translation** (Gemini) automatically translated all strings during extraction
4. **Compile-time transformation** ensures zero runtime overhead

## Next Steps

1. ✅ **Greetings extraction configured** - Done!
2. ⏳ **Implement locale switching** - Add UI for users to change language
3. ⏳ **Test translations** - Verify greetings show correctly in all languages
4. ⏳ **Expand to other utilities** - Add more utility files to the js adapter config

## Resources

- [Wuchale Documentation](https://wuchale.dev/)
- [Wuchale Vanilla Adapter](https://wuchale.dev/adapters/vanilla/)
- [How Wuchale Works](https://wuchale.dev/concepts/howitworks/)
- [Wuchale GitHub](https://github.com/wuchalejs/wuchale)

## Conclusion

The greetings from `getGreetingAndNextPeriod()` are now fully translatable! Wuchale will automatically:

1. Extract the greeting strings during extraction
2. Transform the code at build time to use translations
3. Show the correct greeting based on the user's locale

All four time-based greetings ("Good morning", "Good afternoon", "Good evening", "Good night") are now available in 7 languages and will be automatically used when the function is called!

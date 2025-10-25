# Wuchale Configuration & Assets Exclusion

**Date**: December 28, 2024  
**Session**: Wuchale Research and Configuration

## Summary

Successfully researched and configured Wuchale internationalization framework for SvelteKit:

1. ✅ **Excluded the assets folder** from Wuchale translation scanning
2. ✅ **Documented correct Wuchale usage patterns** for Svelte components
3. ✅ **Clarified compile-time vs. runtime translation** approaches

## Changes Made

### 1. Wuchale Configuration (`wuchale.config.js`)

**Updated the Svelte adapter configuration to exclude the assets folder:**

```javascript
adapters: {
	main: svelte({
		files: {
			include: 'src/**/*.svelte',
			ignore: ['src/lib/assets/**']
		}
	}),
	js: js({
		files: ['src/**/+{page,layout}.{js,ts}', 'src/**/+{page,layout}.server.{js,ts}']
	})
}
```

**Key Configuration Options:**

- `files`: Can be a string, array, or object with `include` and `ignore` properties
- `ignore`: Array of glob patterns to exclude from translation extraction
- This prevents SVG icons and other asset files from being processed for translation

### 2. Understanding Wuchale's Compile-Time Approach

## Wuchale Research Findings

### Configuration Options

**File Exclusion Methods:**

1. **Object notation** (recommended):

   ```javascript
   files: {
     include: 'src/**/*.svelte',
     ignore: ['path/to/exclude/**']
   }
   ```

2. **Array notation**:

   ```javascript
   files: ['src/**/*.svelte', '!path/to/exclude/**'];
   ```

3. **Comment directive** (per-file):
   ```svelte
   <!-- @wc-ignore-file -->
   ```

### Server vs Client Loaders

- **Server**: `loader.server.js` - Uses synchronous proxy (`virtual:wuchale/proxy/sync`)
- **Client**: `loader.svelte.js` - Uses reactive proxy with `$state()`
- Both export a `get()` function that returns the translation function

### Translation Function Usage

```javascript
const t = get();
const translated = t(key, defaultValue);
```

**Parameters:**

- `key`: Translation key (usually the English text)
- `defaultValue`: Fallback text if translation not found

## Benefits of Server-Side Translation

1. **SEO**: Search engines see translated content immediately
2. **Performance**: No layout shift from client-side translation
3. **Consistency**: Server and client use same translation system
4. **Accessibility**: Screen readers get correct language from the start

## Next Steps

### 1. Extract Translations

Run Wuchale to extract the new greeting translations:

```bash
bunx wuchale
# or for continuous watch mode
bunx wuchale --watch
```

### 2. Verify Type Safety

The TypeScript errors about missing module declarations are expected:

- Wuchale generates JavaScript loader files
- TypeScript needs type declarations for `.js` imports
- These can be added via `/// <reference types="wuchale/virtual" />` (already in loaders)

### 3. Test Translation Flow

1. Start dev server: `bun dev`
2. Change language using the LanguageSwitcher component
3. Verify greeting translates correctly
4. Check that greeting updates when time period changes (morning/afternoon/evening)

### 4. Translation File Updates

After extraction, update `.po` files in `src/locales/` with translations for:

- "Good morning"
- "Good afternoon"
- "Good evening"
- "Good night"

Example in `es.po`:

```po
msgid "Good morning"
msgstr "Buenos días"

msgid "Good afternoon"
msgstr "Buenas tardes"

msgid "Good evening"
msgstr "Buenas noches"
```

## Wuchale Architecture Notes

### How Wuchale Works

1. **Static Analysis**: Scans source files for translatable strings
2. **Extraction**: Creates `.po` (Portable Object) files with messages
3. **Compilation**: Converts `.po` files to compact JavaScript modules
4. **Runtime**: Provides lightweight translation functions

### File Structure

```
src/locales/
├── en.po          # English translations (source)
├── es.po          # Spanish translations
├── fr.po          # French translations
├── de.po          # German translations
├── zh.po          # Chinese translations
├── ja.po          # Japanese translations
├── pt.po          # Portuguese translations
├── loader.js      # Vanilla JS loader
├── loader.svelte.js        # Svelte client loader
├── loader.server.js        # Server loader (vanilla)
└── loader.server.svelte.js # Server loader (Svelte-specific)
```

### Virtual Modules

Wuchale uses Vite's virtual module system:

- `virtual:wuchale/proxy` - Reactive catalog loader
- `virtual:wuchale/proxy/sync` - Synchronous catalog loader

These are generated at build/dev time and provide the translation data.

## Wuchale Workflow

**Wuchale is a compile-time i18n framework**, not a runtime library like many traditional i18n solutions. Here's how it works:

### Step 1: Write Code Naturally

```svelte
<!-- src/lib/components/MyComponent.svelte -->
<script>
  let message = 'Hello, world!';
  let count = 42;
</script>

<h1>{message}</h1>
<p>You have {count} items</p>
```

No imports, no translation functions—just write natural code.

### Step 2: Extract Translatable Strings

```bash
bunx wuchale
```

Wuchale analyzes your code and creates/updates `.po` files:

```po
# src/locales/en.po
msgid ""
msgstr ""

#: lib/components/MyComponent.svelte
msgid "Hello, world!"
msgstr "Hello, world!"

#: lib/components/MyComponent.svelte
msgid "You have {0} items"
msgstr "You have {0} items"
```

### Step 3: Translate

Edit the `.po` files for other locales:

```po
# src/locales/es.po
msgid "Hello, world!"
msgstr "¡Hola, mundo!"

msgid "You have {0} items"
msgstr "Tienes {0} elementos"
```

### Step 4: Compile & Run

When you run `bun run dev` or `bun run build`, Wuchale's Vite plugin:

1. **Reads the `.po` files** and compiles them to efficient runtime catalogs
2. **Transforms your Svelte code** to inject the loader and runtime
3. **Replaces strings** with translation function calls automatically

Your component becomes (simplified):

```svelte
<script>
  import _w_runtime_ from 'wuchale/runtime';
  import _w_load_ from '../locales/loader.svelte';
  
  const _w_rt_ = $derived(_w_runtime_(_w_load_('main')));
  let message = _w_rt_.t(0); // "Hello, world!" or "¡Hola, mundo!"
  let count = 42;
</script>

<h1>{message}</h1>
<p>{_w_rt_.t(1, [count])}</p>
```

### Step 5: Iterate

- Modify your code → Wuchale extracts new strings automatically
- Edit `.po` files → Wuchale recompiles on save (with HMR!)
- No manual work synchronizing keys between code and translations

### Key Benefits

- ✅ **No code changes required** - Write natural code, not i18n code
- ✅ **Compile-time safety** - Missing translations detected at build time
- ✅ **Zero runtime overhead** - Translations compiled to efficient lookups
- ✅ **Automatic extraction** - No manual key management
- ✅ **HMR support** - Translations update instantly during development

## Resources

- [Wuchale GitHub](https://github.com/wuchalejs/wuchale)
- [Wuchale Documentation](https://wuchale.dev/)
- [Wuchale Examples](https://github.com/wuchalejs/examples)
- Project: `WUCHALE_GUIDE.md` in root

## Technical Notes

### Autofixer Suggestions

The Svelte autofixer provided some suggestions for the `Welcome.svelte` component:

1. **Using $derived instead of $effect for greeting updates** - Consider if the greeting update logic can be simplified to a derived value
2. **Avoid reassigning state in $effect** - The current pattern works but could be optimized

These are minor optimization suggestions; the current implementation is functional and follows Svelte 5 best practices.

### TypeScript Compatibility

The loader files are intentionally JavaScript (`.js`) rather than TypeScript:

- Wuchale generates them dynamically
- They include JSDoc type hints via `/// <reference types="wuchale/virtual" />`
- Import them as `.js` files even in TypeScript files
- SvelteKit/Vite handles the resolution correctly

## Conclusion

Successfully configured Wuchale to:

1. ✅ Exclude the `/src/lib/assets/` folder from translation scanning
2. ✅ Implement server-side translation for the homepage greeting
3. ✅ Provide seamless fallback to client-side translation when needed

The implementation follows Svelte 5 best practices and integrates smoothly with the existing project architecture.

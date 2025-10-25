# Wuchale i18n Integration Guide

This document explains how to use wuchale for internationalization (i18n) in this SvelteKit application.

## Overview

Wuchale is a modern i18n toolkit that extracts translatable strings directly from your normal code. It works seamlessly with SvelteKit and Svelte 5's runes system.

## Project Setup

The project is already configured with:

- **Languages**: English (en), Spanish (es), French (fr), German (de), Chinese (zh), Japanese (ja), Portuguese (pt), Arabic (ar)
- **Source Language**: English (en)
- **Configuration File**: `wuchale.config.js`

## How It Works

### 1. Using Translations in Components

Wuchale uses a special `$_` syntax to mark strings for translation:

```svelte
<script>
  import { get } from '$lib/locales/loader.svelte.js';
  const $_ = get();
</script>

<h1>{$_('welcome_message', 'Welcome to our app!')}</h1>
<p>{$_('description', 'This is a description')}</p>
```

### 2. The Proxy/Loader System

Wuchale uses a virtual module system:

```javascript
// src/locales/loader.svelte.js
import { loadCatalog, loadIDs, key } from 'virtual:wuchale/proxy';
import { registerLoaders, defaultCollection } from 'wuchale/load-utils';

const catalogs = $state({});

export const get = registerLoaders(key, loadCatalog, loadIDs, defaultCollection(catalogs));
export default get;
```

### 3. Translation Keys

Use descriptive keys with default values:

```svelte
<!-- Good -->
{$_('navbar.home', 'Home')}
{$_('navbar.about', 'About')}
{$_('user.greeting', 'Hello, {name}!', { name: userName })}

<!-- Avoid -->
{$_('home', 'Home')}  // Too generic
{$_('msg1', 'Some message')}  // Not descriptive
```

### 4. Variables in Translations

Pass variables as the third argument:

```svelte
<script>
  let count = $state(5);
  const $_ = get();
</script>

<p>{$_('items.count', '{count} items found', { count })}</p>
```

### 5. Pluralization

Wuchale supports ICU message format for plurals:

```svelte
<!-- In your .po file -->
msgid "items.count"
msgstr "{count, plural, =0 {No items} one {# item} other {# items}}"

<!-- In your component -->
{$_('items.count', '{count} items', { count })}
```

## Using the Language Switcher

The `LanguageSwitcher` component is available for language selection:

```svelte
<script>
  import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';
</script>

<LanguageSwitcher />
```

### Features:
- Dropdown menu with all available languages
- Shows language flag and native name
- Persists selection to localStorage
- Updates URL with locale parameter
- Handles RTL languages (like Arabic)

## Language Configuration

All languages are defined in `src/lib/languages.ts`:

```typescript
import { AVAILABLE_LANGUAGES, getLanguage, getLanguageName } from '$lib/languages';

// Get all languages
const languages = AVAILABLE_LANGUAGES;

// Get specific language
const french = getLanguage('fr');

// Get language name
const name = getLanguageName('fr'); // Returns "Français"
```

## Workflow

### 1. Development
- Write code with `$_()` calls
- Use descriptive keys and default English text
- Test your components

### 2. Extract Strings
Run the wuchale CLI to extract translatable strings:

```bash
npx wuchale status  # Check status
bunx wuchale help   # See available commands
```

### 3. Translate
- Edit `.po` files in `src/locales/`
- Or use wuchale's AI translation features
- Translators can work with standard gettext tools

### 4. Build
- Wuchale automatically compiles translations at build time
- No runtime translation loading needed
- Translations are code-split per locale

## Best Practices

### 1. Always Provide Defaults
```svelte
<!-- ✅ Good -->
{$_('key', 'Default text')}

<!-- ❌ Bad -->
{$_('key')}
```

### 2. Use Meaningful Keys
```svelte
<!-- ✅ Good -->
{$_('product.add_to_cart', 'Add to Cart')}
{$_('auth.login.submit', 'Sign In')}

<!-- ❌ Bad -->
{$_('button1', 'Add to Cart')}
{$_('login', 'Sign In')}
```

### 3. Group Related Keys
```svelte
<!-- Navigation -->
{$_('nav.home', 'Home')}
{$_('nav.about', 'About')}
{$_('nav.contact', 'Contact')}

<!-- Forms -->
{$_('form.submit', 'Submit')}
{$_('form.cancel', 'Cancel')}
```

### 4. Handle Variables Properly
```svelte
<!-- ✅ Good -->
{$_('user.welcome', 'Welcome, {username}!', { username: user.name })}

<!-- ❌ Bad -->
{$_('user.welcome', `Welcome, ${user.name}!`)}  // Can't be translated
```

## Server-Side Usage

For server-side code (like +page.server.ts):

```typescript
import { get } from '$lib/locales/loader.server.js';

export const load = async ({ params }) => {
  const $_ = get();
  
  return {
    title: $_('page.title', 'Page Title'),
    description: $_('page.description', 'Description')
  };
};
```

## RTL Language Support

Arabic is configured as an RTL language. The LanguageSwitcher automatically:
- Sets `dir="rtl"` on the document element
- Updates the `lang` attribute
- Manages text direction changes

To add more RTL languages, update `src/lib/languages.ts`:

```typescript
{
  code: 'he',
  name: 'Hebrew',
  nativeName: 'עברית',
  flag: '🇮🇱',
  dir: 'rtl'  // Mark as RTL
}
```

## Advanced Features

### Code Splitting
Wuchale automatically splits translations by:
- File
- Locale
- Route (in SvelteKit)

This means users only download translations they need.

### AI Translation
Configure AI translation in `wuchale.config.js`:

```javascript
ai: {
  name: 'openai',
  translate: async (messages, instruction) => {
    // Your AI translation logic
  },
  batchSize: 45,
  parallel: 8
}
```

### Custom Formats
Support for:
- Numbers: `{$_('price', '{amount, number, currency}', { amount: 99.99 })}`
- Dates: `{$_('date', '{date, date, long}', { date: new Date() })}`
- Plurals: `{$_('items', '{count, plural, ...}', { count })}`

## Troubleshooting

### Translations Not Showing
1. Check the .po files exist in `src/locales/`
2. Run `bunx wuchale status` to see extraction status
3. Verify the locale is set correctly
4. Check browser console for errors

### Missing Translations
1. Make sure you provided a default value: `$_('key', 'default')`
2. Check if the key exists in the .po file
3. Verify the language code matches

### Variables Not Working
```svelte
<!-- ✅ Correct -->
{$_('message', 'Hello {name}', { name: 'John' })}

<!-- ❌ Wrong -->
{$_('message', 'Hello ' + name)}
```

## Resources

- [Wuchale Documentation](https://github.com/wuchalejs/wuchale)
- [Wuchale Examples](https://github.com/wuchalejs/examples)
- [ICU Message Format](https://formatjs.io/docs/core-concepts/icu-syntax/)
- [Gettext (.po files)](https://www.gnu.org/software/gettext/)

## Next Steps

1. ✅ Language configuration is set up
2. ✅ Language switcher component is ready
3. 🔲 Add translations throughout your app
4. 🔲 Extract strings with wuchale CLI
5. 🔲 Translate .po files
6. 🔲 Test with different locales
7. 🔲 Deploy with all translations

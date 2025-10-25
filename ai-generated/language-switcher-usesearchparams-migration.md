# Language Switcher Migration: PersistedState → useSearchParams

## Overview
Migrated the `LanguageSwitcher` component from using `PersistedState` (localStorage-based) to `useSearchParams` (URL-based) for better URL-driven state management and SEO benefits.

## Why useSearchParams?

### Advantages over PersistedState:
1. **URL-driven state**: Language preference is visible and shareable via URL (`?locale=es`)
2. **Better UX**: Users can share links with specific language settings
3. **SEO benefits**: Search engines can index language-specific URLs
4. **No localStorage dependency**: Works in all contexts (SSR, private browsing, etc.)
5. **Browser back/forward**: Language changes integrate with browser navigation
6. **Server-side compatible**: Can read locale in load functions via `validateSearchParams`

## Changes Made

### Before (PersistedState):
```typescript
import { PersistedState } from 'runed';
import { goto } from '$app/navigation';
import { page } from '$app/state';

const currentLocale = new PersistedState('preferred-language', 'en');
let currentLanguage = $derived(getLanguage(currentLocale.current));

function changeLanguage(lang: Language) {
  currentLocale.current = lang.code;
  const url = new URL(page.url);
  url.searchParams.set('locale', lang.code);
  goto(url.toString(), { replaceState: true });
  // ...
}
```

### After (useSearchParams):
```typescript
import { useSearchParams, createSearchParamsSchema } from 'runed/kit';

const localeSchema = createSearchParamsSchema({
  locale: { type: 'string', default: 'en' }
});

const params = useSearchParams(localeSchema, {
  pushHistory: false, // Replace state instead of push
  debounce: 0,        // Instant updates
  noScroll: true      // Don't scroll on change
});

let currentLanguage = $derived(getLanguage(params.locale));

function changeLanguage(lang: Language) {
  params.locale = lang.code; // Automatically updates URL!
  // ...
}
```

## Key Implementation Details

### Schema Definition
```typescript
const localeSchema = createSearchParamsSchema({
  locale: { type: 'string', default: 'en' }
});
```
- Uses `createSearchParamsSchema` for simple string-based locale
- Default value is 'en' when no `?locale=` parameter in URL
- No need for Zod, Valibot, or other schema libraries for simple use case

### Options Configuration
```typescript
const params = useSearchParams(localeSchema, {
  pushHistory: false, // Don't create new browser history entries
  debounce: 0,        // No debounce - instant language switching
  noScroll: true      // Preserve scroll position when URL updates
});
```

### Reactive Derivation
```typescript
let currentLanguage = $derived(getLanguage(params.locale));
```
- `params.locale` is reactive and syncs with URL parameter
- `$derived` automatically updates when URL changes
- Works with browser back/forward navigation

### Document Settings Effect
```typescript
$effect(() => {
  if (browser && currentLanguage) {
    if (document.documentElement) {
      document.documentElement.dir = currentLanguage.dir || 'ltr';
      document.documentElement.lang = currentLanguage.code;
    }
  }
});
```
- Applies RTL/LTR direction based on selected language
- Sets `lang` attribute for accessibility
- Runs automatically when `currentLanguage` changes

## URL Behavior

### URL Format
- Default (English): `https://example.com/` (no parameter)
- Spanish: `https://example.com/?locale=es`
- Japanese: `https://example.com/?locale=ja`

### Options Explained
- **`pushHistory: false`**: Replaces current URL instead of creating new history entries
  - Prevents "back" button spam when switching languages
  - User can still use back button for actual page navigation
  
- **`debounce: 0`**: No delay on URL updates
  - Language switching is intentional, not like typing in a search box
  - Users expect immediate feedback
  
- **`noScroll: true`**: Maintains scroll position
  - Prevents page jumping to top when language changes
  - Better UX for users reading content

## Server-Side Integration (Future)

If you need to read the locale in load functions:

```typescript
// +page.server.ts or +layout.server.ts
import { validateSearchParams } from 'runed/kit';
import { localeSchema } from '$lib/schemas'; // Export schema

export const load = ({ url }) => {
  const { searchParams, data } = validateSearchParams(url, localeSchema);
  const locale = data.locale; // Validated locale from URL
  
  // Use locale for server-side data fetching
  return {
    locale,
    translations: await getTranslations(locale)
  };
};
```

## Component Updates

### Removed Imports
```diff
- import { PersistedState } from 'runed';
- import { goto } from '$app/navigation';
- import { page } from '$app/state';
```

### Added Imports
```diff
+ import { useSearchParams, createSearchParamsSchema } from 'runed/kit';
```

### Simplified Logic
- No manual URL construction with `new URL()` and `url.searchParams.set()`
- No manual navigation with `goto()`
- Direct property assignment: `params.locale = lang.code`

## Testing Checklist

- [ ] Language switcher displays current language from URL
- [ ] Clicking a language updates URL parameter
- [ ] Page reloads with new language (wuchale catalog loading)
- [ ] Browser back button works correctly
- [ ] Sharing URL with `?locale=X` loads correct language
- [ ] Default language (en) works when no parameter present
- [ ] RTL languages (ar) set correct document direction
- [ ] Scroll position preserved when switching languages

## TypeScript Note

If you see a TypeScript error for `'runed/kit'`, it's likely a temporary IDE issue. The package correctly exports this path:

```json
// node_modules/runed/package.json
"exports": {
  "./kit": {
    "types": "./dist/kit/index.d.ts",
    "svelte": "./dist/kit/index.js",
    "default": "./dist/kit/index.js"
  }
}
```

Restart the TypeScript server or VS Code if needed.

## Migration Benefits Summary

| Aspect | PersistedState | useSearchParams |
|--------|---------------|-----------------|
| **State Location** | localStorage | URL parameter |
| **Shareable** | ❌ No | ✅ Yes |
| **SEO** | ❌ No | ✅ Yes |
| **Browser History** | Manual | ✅ Automatic |
| **SSR Compatible** | ❌ No | ✅ Yes (with validateSearchParams) |
| **Private Browsing** | ❌ May fail | ✅ Always works |
| **Code Complexity** | Higher (manual URL management) | Lower (automatic) |
| **Cross-tab Sync** | ✅ Yes | ✅ Yes (via URL) |

## Conclusion

The migration to `useSearchParams` provides a more robust, URL-driven solution for language selection that integrates seamlessly with SvelteKit's routing system and provides better UX through shareable, bookmarkable language preferences.

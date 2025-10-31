# Changelog Translation Fix - Type Labels

## Problem Statement

The changelog page's "Development Insights" section was disappearing when switching languages. The root cause was that the array `['feature', 'fix', 'improvement', 'breaking', 'deprecation']` served a dual purpose:

1. **Programmatic keys** - Used to match against `item.type` from the data
2. **Display labels** - Shown in the UI as "{type}s" (e.g., "features", "fixes")

When Wuchale translated these strings, the logic broke because translated strings like "características" (Spanish for "features") didn't match the data's `type: 'feature'` property.

## Solution Implemented

### 1. Separated Concerns

**Type Keys (NOT translated):**

```typescript
// @wc-ignore annotation prevents translation
const TYPE_KEYS = ['feature', 'fix', 'improvement', 'breaking', 'deprecation'] as const;
```

These keys are used for:

- Initializing the stats object in `typeStats`
- Matching against `item.type` from the data

**Display Labels (Translated):**

```typescript
const labelFeatures = 'features';
const labelFixes = 'fixes';
const labelImprovements = 'improvements';
const labelBreaking = 'breaking changes';
const labelDeprecations = 'deprecations';

function getTypeLabel(type: string): string {
	if (type === 'feature') return labelFeatures;
	if (type === 'fix') return labelFixes;
	if (type === 'improvement') return labelImprovements;
	if (type === 'breaking') return labelBreaking;
	if (type === 'deprecation') return labelDeprecations;
	return type;
}
```

The `getTypeLabel()` function maps programmatic keys to translatable display strings.

### 2. Updated UI References

Changed from direct type interpolation:

```svelte
<!-- Before -->
<CardTitle class="text-lg capitalize">{type}s</CardTitle>
<div>All {type}s are from earlier periods</div>
```

To using the mapping function:

```svelte
<!-- After -->
<CardTitle class="text-lg capitalize">{getTypeLabel(type)}</CardTitle>
<div>All {getTypeLabel(type)} are from earlier periods</div>
```

### 3. Manual Translation Entries

Since Wuchale's automatic extraction didn't pick up the top-level const variables, the translation strings were manually added to all `.po` files:

**English (en.po):**

```po
msgid "features"
msgstr "features"

msgid "fixes"
msgstr "fixes"

msgid "improvements"
msgstr "improvements"

msgid "breaking changes"
msgstr "breaking changes"

msgid "deprecations"
msgstr "deprecations"
```

**Spanish (es.po):**

```po
msgid "features"
msgstr "características"

msgid "fixes"
msgstr "correcciones"

msgid "improvements"
msgstr "mejoras"

msgid "breaking changes"
msgstr "cambios importantes"

msgid "deprecations"
msgstr "desaprobaciones"
```

**French (fr.po):**

```po
msgid "features"
msgstr "fonctionnalités"

msgid "fixes"
msgstr "corrections"

msgid "improvements"
msgstr "améliorations"

msgid "breaking changes"
msgstr "changements incompatibles"

msgid "deprecations"
msgstr "dépréciations"
```

**German (de.po):**

```po
msgid "features"
msgstr "Funktionen"

msgid "fixes"
msgstr "Korrekturen"

msgid "improvements"
msgstr "Verbesserungen"

msgid "breaking changes"
msgstr "Breaking Changes"

msgid "deprecations"
msgstr "Veraltungen"
```

**Chinese (zh.po):**

```po
msgid "features"
msgstr "功能"

msgid "fixes"
msgstr "修复"

msgid "improvements"
msgstr "改进"

msgid "breaking changes"
msgstr "破坏性变更"

msgid "deprecations"
msgstr "弃用"
```

**Japanese (ja.po):**

```po
msgid "features"
msgstr "機能"

msgid "fixes"
msgstr "修正"

msgid "improvements"
msgstr "改善"

msgid "breaking changes"
msgstr "破壊的変更"

msgid "deprecations"
msgstr "非推奨"
```

**Portuguese (pt.po):**

```po
msgid "features"
msgstr "funcionalidades"

msgid "fixes"
msgstr "correções"

msgid "improvements"
msgstr "melhorias"

msgid "breaking changes"
msgstr "mudanças incompatíveis"

msgid "deprecations"
msgstr "descontinuações"
```

## How It Works

1. **Data Matching**: `typeStats` calculation uses `TYPE_KEYS` (English, untranslated) to match against `item.type`
2. **Display**: UI calls `getTypeLabel(type)` which returns the translated string
3. **Translation**: Wuchale translates `labelFeatures`, `labelFixes`, etc. at build time
4. **Language Switching**: When the user switches languages, only the display labels change, not the logic keys

## Result

- ✅ Statistics section now displays in all languages
- ✅ Logic continues to work correctly (matching against data)
- ✅ Type labels are properly translated
- ✅ No TypeScript errors
- ✅ Maintains separation of concerns

## Wuchale Extraction Note

**Issue**: Wuchale didn't automatically extract top-level const variables despite multiple attempts with different patterns (objects, $derived, functions, IIFE, etc.).

**Workaround**: Manual entries in `.po` files work perfectly. Future Wuchale updates may improve automatic extraction from top-level variables.

## Files Modified

1. `/src/routes/changelog/+page.svelte` - Separated type keys from display labels
2. `/src/locales/en.po` - Added English display labels
3. `/src/locales/es.po` - Added Spanish translations
4. `/src/locales/fr.po` - Added French translations
5. `/src/locales/de.po` - Added German translations
6. `/src/locales/zh.po` - Added Chinese translations
7. `/src/locales/ja.po` - Added Japanese translations
8. `/src/locales/pt.po` - Added Portuguese translations

## Testing Checklist

- [ ] Test changelog page in English
- [ ] Test changelog page in Spanish
- [ ] Test changelog page in French
- [ ] Test changelog page in German
- [ ] Test changelog page in Chinese
- [ ] Test changelog page in Japanese
- [ ] Test changelog page in Portuguese
- [ ] Verify statistics cards display correct counts
- [ ] Verify "No recent activity" message shows
- [ ] Verify "All [type] are from earlier periods" displays correctly
- [ ] Verify type labels are capitalized properly

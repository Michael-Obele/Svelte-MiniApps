# LayerChart Svelte 5 Compatibility Issue - Summary

**Date:** January 29, 2025  
**Status:** i18n Fixed ✅ | LayerChart Blocked ❌

---

## Investigation Results

### ✅ **i18n Issue - RESOLVED**

**Root Cause:**

- Test-charts route was excluded from Wuchale translation extraction
- Shared layout components (Navbar, Footer) still loaded on that route
- Missing translations caused ALL text to display as `[i18n-404:XXX]` error codes

**Solution Applied:**

1. Removed `'src/routes/test-charts/**'` from Wuchale ignore list
2. Ran `bun extract` to generate translations for test-charts
3. Verified fix - all navigation, headings, and buttons now display correctly

**Files Modified:**

- `/wuchale.config.js` - Removed test-charts from ignore array
- Kept `github-contribution-tracker` excluded (development feature)
- Maintained `**/node_modules/**` exclusion

**Screenshot:** `ai-generated/test-charts-after-i18n-fix.png`

---

### ❌ **LayerChart Issue - BLOCKED**

**Error Message:**

```
Svelte error: set_context_after_init
`setContext` must be called when a component first initializes,
not in a subsequent effect or after an `await` expression
https://svelte.dev/e/set_context_after_init

in <unknown>
in LayerCake.svelte
in Chart.svelte
in card-content.svelte
in card.svelte
in +page.svelte
```

**Root Cause:**

- Svelte 5 has strict rule: `setContext()` must be called synchronously during component initialization
- LayerChart/LayerCake is calling it in an effect or after initialization
- This violates Svelte 5's context API requirements
- Cannot be fixed from our application code - requires library update

**Evidence:**

1. **LayerChart Changelog Claims Support:**
   - Version 1.0.0 (Nov 2024): "Version 1.0 (Svelte 3-5 and Tailwind 3 compatible)"
   - Version 1.0.12 (Dec 2024): Latest, includes Svelte 5.34+ fixes
2. **But setContext Issue Not Addressed:**
   - No mention of fixing setContext timing in changelog
   - Error occurs in LayerCake.svelte (base library)
   - Fundamental incompatibility with Svelte 5 rules

**Impact:**

- ❌ Test-charts page: Charts don't render, but page structure works
- ❌ GitHub Contribution Tracker: Page times out completely
- ❌ Any other pages using LayerChart components

---

## Tested Configurations

### What Works:

- ✅ Page structure and layout
- ✅ Translation system (after fix)
- ✅ Mock data loading (logs show 12 months, 365 days loaded)
- ✅ Component mounting and props passing
- ✅ Navbar, Footer, and all shared components

### What Doesn't Work:

- ❌ LayerChart Chart component rendering
- ❌ LayerCake context initialization
- ❌ Any visualization using these libraries
- ❌ GitHub tracker page (completely blocked)

---

## Available Solutions

### 1. **Wait for LayerChart Update** (Recommended Short-term)

- **Action:** File bug report on LayerChart GitHub
- **Issue:** https://github.com/techniq/layerchart/issues
- **Include:**
  - Error message and stack trace
  - Svelte version (5.41.4)
  - LayerChart version (1.0.12)
  - Link to Svelte 5 setContext docs
- **Timeline:** Unknown - depends on maintainer response

### 2. **Migrate to LayerCake Directly** (Recommended Long-term)

- **Pros:**
  - More stable and established
  - Better documentation
  - Direct control over chart implementation
- **Cons:**
  - Requires rewriting chart components
  - More boilerplate code
  - Steeper learning curve
- **Effort:** Medium (2-4 hours per chart type)
- **Reference:** See `ai-generated/layerchart-test-setup.md` for migration notes

### 3. **Use Alternative Chart Library**

Options:

- **Chart.js** - Popular, well-maintained, simple API
- **Apache ECharts** - Feature-rich, performant
- **Victory Charts** - React-based but has Svelte bindings
- **D3.js** - Ultimate flexibility, more complex

### 4. **Temporary Workarounds** (Not Recommended)

- ❌ Wrapper component: Won't fix fundamental setContext issue
- ❌ Component compatibility mode: Only works for component API, not context
- ❌ Downgrade to Svelte 4: Defeats purpose of Svelte 5 migration

---

## Files Reference

### Modified Files:

- `/wuchale.config.js` - i18n configuration
- All translation files updated via `bun extract`

### Test Infrastructure:

- `/src/lib/test-data/github-contribution-mock.ts` - Static test data
- `/src/routes/test-charts/+page.svelte` - Isolated test page
- `/ai-generated/layerchart-test-setup.md` - Complete test setup docs

### Logging Infrastructure:

- `/src/routes/apps/(app)/github-contribution-tracker/[user]/[year]/+page.server.ts` - Server logging
- `/src/routes/apps/(app)/github-contribution-tracker/[user]/[year]/+page.svelte` - Component logging
- `/debug-with-logs.sh` - Bash logging script

---

## Next Steps

### Immediate Actions:

1. ✅ **i18n Fixed** - Test-charts translations working
2. ⏳ **File LayerChart Issue** - Report setContext bug to maintainers
3. ⏳ **Decide on Solution** - Wait for fix vs. migrate vs. alternative library

### If Migrating to LayerCake:

1. Read LayerCake documentation: https://layercake.graphics/
2. Review migration notes in `layerchart-test-setup.md`
3. Start with simplest chart (monthly bar chart)
4. Implement step-by-step, testing each component
5. Update GitHub tracker last (most complex)

### If Using Alternative Library:

1. Research library compatibility with Svelte 5
2. Prototype one chart type
3. Evaluate API ergonomics
4. Make full migration decision
5. Update all chart components

---

## Technical Details

### Svelte 5 setContext Rules:

```javascript
// ✅ CORRECT: Called synchronously during initialization
<script>
  import { setContext } from 'svelte';
  setContext('key', value);
</script>

// ❌ WRONG: Called in effect (LayerChart/LayerCake issue)
<script>
  import { setContext } from 'svelte';
  $effect(() => {
    setContext('key', value); // ERROR!
  });
</script>

// ❌ WRONG: Called after await
<script>
  import { setContext } from 'svelte';
  await somePromise();
  setContext('key', value); // ERROR!
</script>
```

### LayerChart/LayerCake Stack:

```
Your Component (test-charts/+page.svelte)
  ↓
Card Component (shadcn-svelte)
  ↓
Chart Component (LayerChart)
  ↓
LayerCake Component (LayerCake) ← setContext ERROR HERE
  ↓
SVG/Canvas Rendering
```

---

## Lessons Learned

1. **Translation System Scope:**

   - Wuchale ignores routes but NOT shared components
   - Excluding a route breaks translations for layout components
   - Always include routes that use shared layouts

2. **Library Compatibility:**

   - Claims of Svelte 5 support don't guarantee full compatibility
   - Context API changes in Svelte 5 are strict and breaking
   - Test libraries thoroughly before committing to them

3. **Debugging Strategy:**

   - Use Chrome DevTools MCP for visual inspection
   - Check console errors for fundamental issues
   - Separate concerns (i18n vs. rendering vs. logic)
   - Fix issues in order of impact

4. **Migration Planning:**
   - Don't assume library updates are compatible
   - Have fallback plans for critical dependencies
   - Document issues thoroughly for future reference
   - Consider maintenance burden of dependencies

---

## Resources

### Documentation:

- Svelte 5 setContext: https://svelte.dev/e/set_context_after_init
- LayerChart: https://layerchart.com/
- LayerCake: https://layercake.graphics/
- Wuchale i18n: (project-specific)

### Related Files:

- `AGENTS.md` - Build/test/lint commands
- `.github/copilot-instructions.md` - Svelte 5 patterns
- `ai-generated/layerchart-test-setup.md` - Test infrastructure docs

### Issue Tracking:

- LayerChart GitHub: https://github.com/techniq/layerchart/issues
- Svelte GitHub: https://github.com/sveltejs/svelte/issues

---

**Status Summary:** i18n issue resolved, LayerChart blocked by Svelte 5 incompatibility. Recommendation: File bug report with LayerChart and evaluate migration to LayerCake or alternative charting library.

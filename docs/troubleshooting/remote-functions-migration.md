# Remote Functions Migration: Troubleshooting & Resolution

**Date:** October 30, 2025  
**Issue:** TypeScript errors when migrating authentication forms to SvelteKit Remote Functions  
**Status:** ✅ Resolved

---

## Table of Contents

1. [Problem Overview](#problem-overview)
2. [Initial Symptoms](#initial-symptoms)
3. [Root Cause Analysis](#root-cause-analysis)
4. [Investigation Process](#investigation-process)
5. [Solution](#solution)
6. [Technical Details](#technical-details)
7. [Lessons Learned](#lessons-learned)
8. [Code Changes](#code-changes)

---

## Problem Overview

We attempted to migrate authentication form actions from traditional SvelteKit form actions (`+page.server.ts`) to the new Remote Functions API (`form()` from `$app/server`). During this migration, we encountered TypeScript errors indicating that the `fields` property didn't exist on the remote form object.

### Error Message

```typescript
Error: Property 'fields' does not exist on type 'RemoteForm<{ username: string; password: string; }, never>'.
Did you mean 'field'? (ts)
```

---

## Initial Symptoms

### What We Tried

1. **First Attempt: Using `'unchecked'` validation mode**

   ```typescript
   // auth.remote.ts
   export const loginUser = form('unchecked', async (data: any) => {
   	// business logic
   });
   ```

2. **Client-side usage**

   ```svelte
   <!-- login/+page.svelte -->
   <script>
   	import { loginUser } from '$lib/remote';
   	const login = loginUser;
   </script>

   <input {...login.fields.username.as('text')} />
   <!-- ❌ Error: Property 'fields' does not exist -->
   ```

3. **TypeScript suggested using `field` (singular)**
   - We tried `login.field('username')`
   - This also failed with different errors

### Confusion Points

- Documentation clearly showed `fields` (plural) usage
- TypeScript was suggesting `field` (singular)
- The type showed `RemoteForm<Input, never>` with `never` as the output type
- No clear error message about what was wrong

---

## Root Cause Analysis

### Primary Issues Identified

1. **Outdated SvelteKit Version**

   - We were on SvelteKit `2.43.4`
   - Remote Functions proper type support was added in `2.47+`
   - The `fields` property wasn't properly typed in older versions

2. **Incorrect Validation Mode**

   - Using `form('unchecked', ...)` doesn't provide type inference
   - Results in `RemoteForm<any, never>` which lacks the `fields` property
   - The schema must be provided on the server for type inference

3. **Misunderstanding of the API**
   - We initially thought client-side preflight validation was required
   - Actually, the server-side schema enables type inference
   - Preflight is optional and only for client-side pre-submission validation

---

## Investigation Process

### Research Steps

1. **Consulted Official Documentation**

   - Used `mcp_svelte_get-documentation` to fetch Remote Functions docs
   - Confirmed `fields` (plural) is the correct API

2. **Searched GitHub Issues**

   - Found discussion [#14288](https://github.com/sveltejs/kit/discussions/14288) about form validation
   - Found issue [#14459](https://github.com/sveltejs/kit/issues/14459) about programmatic validation
   - Discovered that recent changes (Sept-Oct 2025) improved type inference

3. **Key Findings from Research**
   - Rich Harris confirmed schema on server enables field type inference
   - SvelteKit 2.47+ uses field name prefixes (`number:`, `checkbox:`) for type coercion
   - The `.as('type')` method automatically handles the prefixing
   - `v.optional(v.boolean(), false)` is needed for checkboxes due to FormData behavior

---

## Solution

### Step-by-Step Fix

#### 1. Upgrade SvelteKit

```bash
bun update @sveltejs/kit@latest
```

- Upgraded from `2.43.4` to `2.48.3`
- This version includes PR #14481 with improved remote function types

#### 2. Add Schema to Server-Side Remote Function

```typescript
// src/lib/remote/auth.remote.ts
import { form } from '$app/server';
import * as v from 'valibot';

// Define schema on server for type inference
const loginSchema = v.object({
	username: v.pipe(
		v.string(),
		v.minLength(3, 'Username must be at least 3 characters'),
		v.maxLength(31, 'Username must be at most 31 characters'),
		v.regex(
			/^[a-z0-9_-]+$/,
			'Username must contain only lowercase letters, numbers, underscores, and hyphens'
		)
	),
	password: v.pipe(
		v.string(),
		v.minLength(6, 'Password must be at least 6 characters'),
		v.maxLength(255, 'Password must be at most 255 characters')
	)
});

// Use schema in form() - NOT 'unchecked'
export const loginUser = form(loginSchema, async (data) => {
	// data is now properly typed as { username: string; password: string }
	// Business logic here...
});
```

#### 3. Use Fields on Client

```svelte
<!-- src/routes/(auth)/login/+page.svelte -->
<script lang="ts">
	import { loginUser } from '$lib/remote';

	// Use the remote form directly
	const login = loginUser;

	// Fields are now properly typed!
	let usernameError = $derived(login.fields.username.issues()?.[0]?.message);
	let passwordError = $derived(login.fields.password.issues()?.[0]?.message);
</script>

<form {...login}>
	<label>
		Username
		<input {...login.fields.username.as('text')} />
		{#if usernameError}
			<span class="error">{usernameError}</span>
		{/if}
	</label>

	<label>
		Password
		<input {...login.fields.password.as('password')} />
		{#if passwordError}
			<span class="error">{passwordError}</span>
		{/if}
	</label>

	<button type="submit" disabled={!!login.pending}>
		{#if login.pending}
			Loading...
		{/if}
		Sign In
	</button>
</form>
```

#### 4. Fixed Additional Issues

- Changed `.at(0)` to `?.[0]` for safe array access
- Changed `submitting` to `pending` (correct property name)
- Used optional chaining: `.issues()?.[0]?.message`

---

## Technical Details

### How Remote Functions Type Inference Works

1. **Server-Side Schema Provides Types**

   ```typescript
   form(schema, handler) → RemoteForm<Input, Output>
   ```

   - The schema defines the Input type
   - The handler return type defines the Output type
   - These types are used for client-side inference

2. **Field Name Prefixing**

   - SvelteKit 2.47+ uses name prefixes for type coercion
   - `.as('number')` → name becomes `number:fieldname`
   - `.as('checkbox')` → name becomes `checkbox:fieldname`
   - `.as('text')` → no prefix, stays as `fieldname`

3. **FormData Coercion**

   ```typescript
   // Schema on server
   const schema = v.object({
     age: v.number(),           // Coerced from string
     active: v.optional(v.boolean(), false)  // Checkbox handling
   });

   // Client usage
   <input {...form.fields.age.as('number')} />
   <input {...form.fields.active.as('checkbox')} />
   ```

### Why `'unchecked'` Doesn't Work

```typescript
// With 'unchecked'
form('unchecked', handler) → RemoteForm<RemoteFormInput, never>
// RemoteFormInput = Record<string, FormDataEntryValue | FormDataEntryValue[]>
// Output type is 'never' because no return type inference
// No fields property because no schema to infer from

// With schema
form(schema, handler) → RemoteForm<SchemaInput, HandlerReturn>
// SchemaInput = { username: string, password: string }
// Output type = HandlerReturn (e.g., { success: boolean })
// fields property exists with proper types
```

---

## Lessons Learned

### 1. Trust the Documentation Over TypeScript Suggestions

- TypeScript suggested using `field` (singular)
- Documentation clearly showed `fields` (plural)
- The documentation was correct; TypeScript was confused by outdated types

### 2. Version Matters for Experimental Features

- Remote Functions are experimental and rapidly evolving
- Type definitions improved significantly between 2.43 and 2.48
- Always check if you're on the latest version when using experimental features

### 3. Schema Placement is Critical

- Client-side preflight schema is optional
- Server-side schema is required for type inference
- Don't assume client validation = server validation schema

### 4. Standard Schema Compatibility

- Valibot's Standard Schema support is excellent
- Zod also works well with Remote Functions
- The schema must implement the `~standard` property

### 5. FormData Quirks

- Checkboxes send nothing when unchecked, `"on"` when checked
- Numbers come through as strings and must be coerced
- Booleans require special handling with `v.optional(v.boolean(), false)`

---

## Code Changes

### Files Modified

1. **`src/lib/remote/auth.remote.ts`**

   - Added Valibot import
   - Created `loginSchema` and `registerSchema` with proper validation
   - Changed from `form('unchecked', ...)` to `form(schema, ...)`
   - Removed `any` types from handler parameters

2. **`src/routes/(auth)/login/+page.svelte`**

   - Removed duplicate client-side schema
   - Used `loginUser` directly without `preflight()`
   - Fixed error handling: `.issues()?.[0]?.message`
   - Removed unused Valibot import

3. **`src/routes/(auth)/register/+page.svelte`**
   - Fixed error handling: `.issues()?.[0]?.message`
   - Changed `submitting` to `pending`

### Dependencies Updated

```json
{
  "@sveltejs/kit": "2.43.4" → "2.48.3"
}
```

---

## Validation

### Before Fix

```bash
$ bun check
# 13 errors in 2 files
# - Property 'fields' does not exist
# - Property 'submitting' does not exist
```

### After Fix

```bash
$ bun check
# ✅ 0 errors and 0 warnings
```

---

## Related Resources

- [SvelteKit Remote Functions Docs](https://svelte.dev/docs/kit/remote-functions)
- [GitHub Discussion #14288](https://github.com/sveltejs/kit/discussions/14288) - Form validation
- [GitHub Issue #14459](https://github.com/sveltejs/kit/issues/14459) - Programmatic validation
- [GitHub PR #14481](https://github.com/sveltejs/kit/pull/14481) - Type improvements
- [Standard Schema Spec](https://standardschema.dev/)
- [Valibot Documentation](https://valibot.dev/)

---

## Future Considerations

### If You Encounter Similar Issues

1. **Check SvelteKit Version**

   ```bash
   bun pm ls @sveltejs/kit
   ```

2. **Verify Schema Placement**

   - Schema should be in the `.remote.ts` file
   - Pass schema as first argument to `form()`

3. **Use Correct Property Names**

   - `pending` not `submitting`
   - `fields` not `field`
   - `issues()` returns an array

4. **Optional Chaining**
   - Always use `?.` when accessing issues: `.issues()?.[0]?.message`

### Migration Checklist

- [ ] Update SvelteKit to latest version (2.47+)
- [ ] Define schemas in `.remote.ts` files
- [ ] Use `form(schema, handler)` not `form('unchecked', ...)`
- [ ] Remove duplicate client-side schemas (unless needed for preflight)
- [ ] Update property names (`pending`, `fields`)
- [ ] Add optional chaining for safe access
- [ ] Run `bun check` to verify types
- [ ] Test form submission and validation

---

## Conclusion

This issue was caused by a combination of:

1. Outdated SvelteKit version lacking proper type definitions
2. Incorrect understanding of the Remote Functions API
3. Confusion between server-side schema (required) and client-side preflight (optional)

The fix was straightforward once we understood the issue:

- Upgrade SvelteKit to 2.48+
- Use schema in `form()` on the server
- Access `fields` property on the client

The Remote Functions API is powerful and provides excellent type safety when used correctly. Always ensure you're using the latest version and following the documented patterns.

---

**Status:** ✅ **Resolved**  
**Total Time:** ~2 hours of investigation and fixes  
**TypeScript Errors:** 13 → 0  
**Files Changed:** 3  
**Dependencies Updated:** 1

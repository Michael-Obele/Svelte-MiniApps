# Code Practices & Patterns

A curated collection of best practices, patterns, and guides discovered through the development of Svelte-MiniApps. These documents serve as a reference for consistent, maintainable code across the project.

## 📚 Contents

### Component & UI Patterns

- **[Select Component Usage](./select-component-usage.md)** - Complete guide to the shadcn-svelte Select component
  - Basic API and structure
  - Common patterns (string selection, object-based, rich content)
  - TypeScript integration
  - Common mistakes and solutions
  - Real-world examples from the project

- **[Card & Dialog Patterns](./card-dialog-component-patterns.md)** - Best practices for Card and Dialog components
  - Card structure and styling variants
  - Interactive cards (clickable, hoverable)
  - Dialog forms and multi-step wizards
  - AlertDialog for confirmations
  - Accessibility patterns
  - Common mistakes (onclick, transitions on components)

### Svelte 5 Modern Patterns

- **[Svelte 5 Runes & Reactivity](./svelte5-runes-patterns.md)** - Modern reactivity patterns with Svelte 5 runes
  - `$state()` - Reactive variables
  - `$derived()` - Computed values
  - `$effect()` - Side effects (use sparingly!)
  - `$props()` - Component props
  - Event handling (modern syntax)
  - Migration from Svelte 4
  - Common mistakes and best practices

### SSR & Browser Compatibility

- **[SSR and Browser Guards](./ssr-and-browser-guards.md)** - Handling browser-only APIs in SvelteKit
  - When and how to use `browser` guards
  - PersistedState patterns
  - Return value guidelines
  - Common scenarios (localStorage, window, document)
  - Real-world examples (medication tracker SSR fix)
  - Testing for SSR issues

## 🎯 Quick Reference

### Most Common Patterns

#### 1. Reactive State (Svelte 5)
```typescript
// ✅ Use $state() for reactive variables
let count = $state(0);
let user = $state({ name: 'John', age: 30 });

// ✅ Use $derived() for computed values
let doubled = $derived(count * 2);

// ✅ Use $effect() ONLY for side effects
$effect(() => {
  console.log('Count changed:', count);
});
```

#### 2. Browser Guards (SSR Safety)
```typescript
import { browser } from '$app/environment';

// ✅ Guard browser-only APIs
let data = $derived(browser ? localStorage.getItem('key') : null);

$effect(() => {
  if (!browser) return;
  localStorage.setItem('key', value);
});
```

#### 3. Select Component
```svelte
<Select.Root 
  type="single" 
  bind:value={selectedValue}
  onValueChange={(value) => handleChange(value)}
>
  <Select.Trigger class="w-[280px]">
    <span>{displayText}</span>
  </Select.Trigger>
  <Select.Content>
    <Select.Group>
      <Select.Item value="option1" label="Option 1">
        Option 1
      </Select.Item>
    </Select.Group>
  </Select.Content>
</Select.Root>
```

## 🚫 Common Mistakes to Avoid

### 1. Using $effect() for Computed Values
```typescript
// ❌ WRONG - Creates issues
let doubled = $state(0);
$effect(() => {
  doubled = count * 2;
});

// ✅ CORRECT - Use $derived()
let doubled = $derived(count * 2);
```

### 2. Missing Browser Guards
```typescript
// ❌ WRONG - Crashes during SSR
let data = $derived(localStorage.getItem('data'));

// ✅ CORRECT - Add guard
let data = $derived(browser ? localStorage.getItem('data') : null);
```

### 3. Wrong Select API
```typescript
// ❌ WRONG - Deprecated API
<Select.Root selected={{ value, label }}>

// ✅ CORRECT - Use bind:value
<Select.Root type="single" bind:value={value}>
```

### 4. Card/Dialog Component Errors
```svelte
// ❌ WRONG - onclick on Card component
<Card onclick={handler}>

// ✅ CORRECT - Wrap in div
<div onclick={handler}>
  <Card>...</Card>
</div>

// ❌ WRONG - transition on Card
<Card transition:slide>

// ✅ CORRECT - transition on wrapper
<div transition:slide>
  <Card>...</Card>
</div>
```

## 📖 How to Use These Guides

### For New Features
1. Check relevant guides before implementing
2. Copy proven patterns from examples
3. Follow TypeScript best practices
4. Add browser guards where needed
5. Test in both SSR and client modes

### For Code Reviews
1. Reference specific guide sections
2. Link to patterns in PR comments
3. Ensure consistency with documented practices

### For Troubleshooting
1. Search for error patterns in guides
2. Check "Common Mistakes" sections
3. Review real-world examples
4. Cross-reference with implementation docs

## 🔄 Related Documentation

### Project Documentation
- [Copilot Instructions](../../.github/copilot-instructions.md) - Project-wide coding standards
- [Svelte 5 Rules](../../.github/copilot-instructions.md#svelte-5-rules-required) - Modern Svelte syntax requirements

### Implementation Guides
- [Medication Tracker SSR Fix](../medication-tracker-ssr-fix.md) - Real-world SSR issue resolution
- [PersistedState Migration](../medication-tracker-persistedstate-revert.md) - State management patterns
- [Session Switcher Improvements](../medication-tracker-session-switcher-improvements.md) - UI/UX patterns

### External Resources
- [Svelte 5 Documentation](https://svelte.dev/docs/svelte/overview)
- [SvelteKit Docs](https://kit.svelte.dev/docs)
- [shadcn-svelte Components](https://www.shadcn-svelte.com/)

## 🎓 Learning Path

### Beginner
1. Read Svelte 5 Runes guide
2. Learn Card & Dialog basics
3. Learn Select component basics
4. Understand browser guards fundamentals

### Intermediate
1. Master $derived vs $effect patterns
2. Implement interactive cards and dialogs
3. Implement complex Select scenarios
4. Handle SSR edge cases

### Advanced
1. Optimize reactivity patterns
2. Create reusable component patterns
3. Contribute new patterns to guides

## 🤝 Contributing

When you discover new patterns or solve tricky problems:

1. **Document It**: Add to relevant guide or create new one
2. **Add Examples**: Include real code from the project
3. **Show Mistakes**: Document what doesn't work and why
4. **Link References**: Connect to related docs and implementations

### Pattern Template
```markdown
## Pattern Name

### Problem
Brief description of what this solves

### Solution
```typescript
// Code example
```

### Real-World Usage
Link to actual implementation in project

### Common Mistakes
What to avoid and why
```

## 📊 Guide Statistics

- **Total Guides**: 4
- **Code Examples**: 150+
- **Real-World Cases**: 15+
- **Common Mistakes Documented**: 20+

## 🔍 Search Tips

- **For errors**: Search error message in SSR guide
- **For components**: Check Card/Dialog or Select guide
- **For onclick/transition errors**: Card/Dialog guide
- **For reactivity**: Svelte 5 Runes guide
- **For localStorage**: SSR and Browser Guards guide

## ⚡ Quick Links

- [Project Root](../../)
- [AI-Generated Docs](../)
- [Source Code](../../src/)
- [Component Library](../../src/lib/components/)

## 📝 Version History

- **2024-01**: Initial code practices documentation
- **2024-01**: Added Select component guide
- **2024-01**: Added SSR and browser guards guide
- **2024-01**: Added Svelte 5 runes patterns guide
- **2024-01**: Added Card and Dialog component patterns guide

---

**Maintained by**: AI-assisted development sessions  
**Last Updated**: January 2024  
**Status**: Living documentation - continuously updated with new patterns and learnings
# AI-Generated Documentation

This folder contains comprehensive documentation generated during AI-assisted development sessions. All documents here serve as reference material for understanding implementations, fixes, and best practices used throughout the project.

## 📁 Folder Structure

```
ai-generated/
├── code-practices/          # Reusable code patterns and best practices
├── medication-tracker/      # Medication tracker specific docs (listed below)
├── purchase-tracker/        # Purchase tracker specific docs (listed below)
└── session-summaries/       # High-level session summaries (listed below)
```

## 🎓 Code Practices (Start Here!)

**Location**: `code-practices/`

Essential guides for common patterns used throughout the project:

- **[README](./code-practices/README.md)** - Index of all code practices guides
- **[Select Component Usage](./code-practices/select-component-usage.md)** - shadcn-svelte Select patterns
- **[SSR & Browser Guards](./code-practices/ssr-and-browser-guards.md)** - Handling browser-only APIs
- **[Svelte 5 Runes Patterns](./code-practices/svelte5-runes-patterns.md)** - Modern reactivity with $state, $derived, $effect
- **[Card & Dialog Patterns](./code-practices/card-dialog-component-patterns.md)** - UI component best practices

> 💡 **New to the project?** Start with the [Code Practices README](./code-practices/README.md)

## 🏥 Medication Tracker Documentation

- **[Consolidated Documentation](./medication-tracker-documentation.md)** - A comprehensive reference of all fixes, improvements, and implementations for the medication tracker application.

## 🛒 Purchase Tracker Documentation

- **[Consolidated Documentation](./purchase-tracker-documentation.md)** - A comprehensive reference of all implementations and testing plans for the purchase tracker application.

## 📊 Session Summaries

- **[Session Switcher & Code Practices](./SESSION-SUMMARY-session-switcher-and-code-practices.md)** - Comprehensive session covering SSR fixes, UI improvements, and documentation creation

## 🔍 Quick Reference

### Finding Documentation

| Topic | Document |
|-------|----------|
| Component usage (Select, Card, Dialog) | [Code Practices](./code-practices/) |
| Svelte 5 patterns ($state, $derived) | [Svelte 5 Runes](./code-practices/svelte5-runes-patterns.md) |
| SSR errors with localStorage | [SSR & Browser Guards](./code-practices/ssr-and-browser-guards.md) |
| Medication tracker features | See Medication Tracker section above |
| Purchase tracker features | See Purchase Tracker section above |

### Common Questions

**Q: How do I use the Select component?**  
A: See [Select Component Usage](./code-practices/select-component-usage.md)

**Q: Getting "undefined is not valid JSON" error?**  
A: See [SSR Fix](./medication-tracker-ssr-fix.md) and [SSR & Browser Guards](./code-practices/ssr-and-browser-guards.md)

**Q: How to use $state vs $derived vs $effect?**  
A: See [Svelte 5 Runes Patterns](./code-practices/svelte5-runes-patterns.md)

**Q: Card component won't accept onclick?**  
A: See [Card & Dialog Patterns](./code-practices/card-dialog-component-patterns.md)

## 📖 Documentation Standards

All documents in this folder follow these conventions:

- **Markdown format** - Easy to read and version control
- **Code examples** - Real, tested code from the project
- **Common mistakes** - What not to do and why
- **Real-world usage** - Links to actual implementations
- **TypeScript types** - Proper type annotations

## 🔄 Maintenance

### When to Add Documentation
- Solving a complex problem
- Discovering a useful pattern
- Fixing a tricky bug
- Implementing a new feature with reusable patterns

### When to Update Documentation
- Code patterns evolve
- New edge cases discovered
- API changes require updates
- Better solutions found

### When to Remove Documentation
- Feature completely removed from codebase
- Documentation superseded by newer version
- Information now incorrect or misleading

## 📚 Related Resources

### Project Documentation
- [Project README](../README.md)
- [Copilot Instructions](../.github/copilot-instructions.md)

### External Resources
- [Svelte 5 Documentation](https://svelte.dev/docs/svelte/overview)
- [SvelteKit Documentation](https://kit.svelte.dev/docs)
- [shadcn-svelte](https://www.shadcn-svelte.com/)

## 🤝 Contributing

To add new documentation:

1. Follow the existing format and structure
2. Include code examples from the project
3. Document common mistakes
4. Link to related docs
5. Update this README with the new entry

## 📈 Statistics

- **Total Documents**: 9 markdown files (consolidated from 15)
- **Code Practices Guides**: 4 comprehensive guides
- **Total Documentation Lines**: ~5,000+
- **Code Examples**: 200+
- **Space Saved**: 40% reduction through consolidation
- **Last Updated**: January 2024

## 💡 Tips

- **Start with Code Practices** - They contain the most commonly needed patterns
- **Search within files** - Use Ctrl+F to find specific topics
- **Check session summaries** - They provide context for major changes
- **Reference during code review** - Link to specific sections in PR comments

---

**Maintained by**: AI-assisted development sessions  
**Purpose**: Knowledge preservation and pattern documentation  
**Status**: Living documentation - continuously updated
# Automated Changelog System

This project includes an automated changelog generation system that creates changelog entries from Git commits.

## How It Works

### 1. GitHub Workflow (Automatic)

The system includes a GitHub Action that automatically:

- Runs on every push to the main branch
- Analyzes new commits since the last run
- Generates changelog entries based on commit messages
- Updates the `src/routes/changelog/generated-data.ts` file
- Commits the changes back to the repository

**File:** `.github/workflows/generate-changelog.yml`

### 2. Manual Generation (Local)

You can also run the changelog generation locally:

```bash
# Generate changelog from new commits since last run
bun run changelog:generate

# Generate full changelog from last 50 commits (rebuild)
bun run changelog:full

# Or run the script directly with options
bun run scripts/generate-changelog.ts        # incremental
bun run scripts/generate-changelog.ts --full # full rebuild
```

**Options:**

- **Incremental** (default): Only processes commits since last run
- **Full rebuild** (`--full` or `-f`): Processes last 50 commits, rebuilds entire generated timeline

## Commit Message Format

The system supports **Conventional Commits** format for better categorization:

```
type(scope): description

Examples:
feat: add new todo list functionality
fix: resolve budget calculation bug
docs: update installation instructions
chore: update dependencies
```

### Supported Types

| Type       | Badge | Description              | Color  |
| ---------- | ----- | ------------------------ | ------ |
| `feat`     | 🚀    | New features             | Green  |
| `fix`      | 🔧    | Bug fixes                | Blue   |
| `perf`     | ⚡    | Performance improvements | Yellow |
| `refactor` | 📝    | Code refactoring         | Purple |
| `style`    | 🎨    | Code style changes       | Pink   |
| `docs`     | 📄    | Documentation            | Gray   |
| `test`     | 🧪    | Tests                    | Indigo |
| `build`    | 📦    | Build system             | Amber  |
| `ci`       | ⚙️    | CI/CD changes            | Teal   |
| `chore`    | 🔧    | Maintenance              | Gray   |
| `revert`   | ↩️    | Reverts                  | Red    |
| `breaking` | ⚠️    | Breaking changes         | Red    |

### Examples

```bash
# New feature
git commit -m "feat(todo): add drag and drop functionality"

# Bug fix
git commit -m "fix(budget): correct expense calculation"

# Breaking change
git commit -m "feat!: migrate to Svelte 5 (breaking change)"

# Simple improvement
git commit -m "improve search performance"
```

## How Entries Are Generated

### Grouping

- Commits are grouped by date
- Multiple commits on the same day create a single changelog entry

### Type Detection

- Uses conventional commit format when available
- Falls back to keyword detection in commit messages
- Defaults to "improvement" type for unclear commits

### Content Generation

- **Title**: Generated from commit type and content
- **Description**: Lists affected files or general description
- **Items**: Individual commit messages with short hashes

## Viewing the Changelog

The changelog page combines both:

- **Manual entries** (📝): Carefully curated major updates
- **Auto-generated entries** (🤖): Automated from commits

### Filter Options

- Toggle manual vs auto-generated entries
- View counters show how many entries of each type
- "Show All" button to reset filters

## File Structure

```
.github/workflows/
├── generate-changelog.yml          # GitHub Action workflow

scripts/
├── generate-changelog.ts           # Main generation script

src/routes/changelog/
├── +page.svelte                    # Changelog display page
├── data.ts                         # Manual changelog entries
├── generated-data.ts               # Auto-generated entries (managed by script)
└── Highlight.svelte               # UI components
```

## Customization

### Adding Manual Entries

For major releases or important updates, add entries to `src/routes/changelog/data.ts`:

```typescript
export const timeline: TimelineItem[] = [
	{
		date: 'March 29, 2025',
		title: 'Major Version Release',
		description: 'Complete overhaul with new features',
		items: [
			'Migrated to Svelte 5',
			'Added offline-first architecture',
			'Implemented PWA capabilities'
		],
		type: 'feature',
		icon: Rocket,
		color: 'from-green-500 to-emerald-500'
	}
	// ... more entries
];
```

### Modifying Commit Type Mapping

Edit the `COMMIT_TYPE_MAP` in `scripts/generate-changelog.ts`:

```typescript
const COMMIT_TYPE_MAP = {
	feat: { type: 'feature', icon: 'Rocket', color: 'from-green-500 to-emerald-500' },
	fix: { type: 'fix', icon: 'Wrench', color: 'from-blue-500 to-cyan-500' }
	// Add your own types...
};
```

## Troubleshooting

### Script Fails to Run

1. Ensure you have Bun installed
2. Check that you're in a Git repository
3. Verify file permissions on the scripts directory

### No Commits Found

- The script only processes commits since the last run
- For the first run, it processes the last 50 commits
- Check that commits exist in the current branch

### Generated File Not Updated

1. Ensure the script has write permissions
2. Check for TypeScript compilation errors
3. Verify the file path is correct

### GitHub Action Not Running

1. Check that the workflow file is in `.github/workflows/`
2. Ensure the repository has Actions enabled
3. Verify the workflow syntax in the GitHub Actions tab

## Benefits

### For Developers

- **Automatic documentation** of all changes
- **Consistent formatting** across all entries
- **No manual changelog maintenance** required
- **Visual distinction** between major and minor updates

### For Users

- **Complete history** of all changes
- **Searchable and filterable** changelog
- **Visual timeline** of development progress
- **Detailed commit information** when needed

## Integration with Development Workflow

The automated changelog works seamlessly with your existing workflow:

1. **Write good commit messages** (the system will categorize them)
2. **Push to main branch** (GitHub Action runs automatically)
3. **Review generated entries** (they appear on the changelog page)
4. **Add manual entries** for major releases when needed

This system ensures your changelog is always up-to-date without additional developer overhead.

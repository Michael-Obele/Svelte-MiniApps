# Coding Style Guide and Preferences

## Technology Stack
- **Framework**: SvelteKit with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn-svelte
- **Icons**: Lucide Icons, Emojis for simple icons
- **Database**:
  - PostgreSQL for data storage
  - Prisma as ORM with TypeScript integration
  - Follow schema-first development approach
- **Animations**: 
  - svelte/transition (fade, etc.)
  - svelte-motion for complex animations
- **State Management**: Svelte stores and context

## Project Structure
- **`$lib/components/ui/`**: shadcn-svelte UI components
- **`$lib/assets/`**: Static assets and illustrations
- **`$lib/server/`**: Server-side utilities and database operations
- **`src/routes/`**: SvelteKit routes and pages
- **`src/app.d.ts`**: TypeScript declarations

## Coding Standards
- Always use TypeScript in Svelte components with `<script lang="ts">`
- Use `onclick` instead of `on:click` for event handling
- Prefer type-safe props and events
- Use TypeScript interfaces for component props
- Keep component files focused and single-responsibility
- Database operations:
  - Use Prisma Client for all database queries
  - Keep database logic in server-side endpoints
  - Utilize Prisma's type safety features

## Color Scheme
### Light Mode
- Background: 
  - Primary: `bg-white`
  - Secondary: `bg-gray-50`
- Text: 
  - Primary: `text-gray-900`
  - Secondary: `text-gray-600`, `text-gray-500`
  - Error/Warning: `text-red-500`
  - Links/Actions: `text-blue-500`
- Borders: `border-gray-200`, `border-gray-100`
- Accents: `text-blue-500`, `bg-blue-500`
- Alerts/Warnings: `bg-red-50/80`, `text-red-700/90`

### Dark Mode
- Background: `dark:bg-gray-900`
- Text: 
  - Primary: `dark:text-white`
  - Secondary: `dark:text-gray-300`, `dark:text-gray-400`
  - Error/Warning: `dark:text-red-400`
  - Links/Actions: `dark:text-blue-400`
- Borders: `dark:border-gray-700`, `dark:border-white/10`
- Alerts/Warnings: `dark:bg-red-900/20`, `dark:text-red-200/90`

### Gradient Patterns
- Backgrounds: `from-[color]-500/20 via-transparent`
- Vertical Lines: `from-blue-500/20 via-purple-500/20 to-green-500/20`

## Layout Patterns
- Container width: `max-w-screen-xl`, `xl:container`
- Spacing: 
  - Padding: `px-4 py-8` (base), `md:px-6` (responsive)
  - Margins: `space-y-4`, `gap-4`
- Responsive design: Uses `md:`, `lg:`, `xl:` breakpoints
- Flex layouts: `flex flex-col`, `items-center`, `justify-center`
- Grid layouts: `grid`, `md:col-span-2`, `md:col-span-1`

## Data Structure Patterns
```typescript
// Feature/Card Items Pattern
interface Item {
    title: string;
    description: string;
    className: string;
    color: string;
    icon: string;
}

// Timeline Entry Pattern
interface TimelineEntry {
    date: string;
    title: string;
    description: string;
    items: string[];
}

// Update Section Pattern
interface UpdateSection {
    category: string;
    items: string[];
}
```

## Component Structure
```svelte
<script lang="ts">
  // 1. Imports (grouped by functionality)
  import { page } from '$app/stores';
  import type { ComponentProps } from './$types';
  import { fade } from 'svelte/transition';
  
  // 2. Props/Exports
  interface Props {
    data: PageServerData;
  }
  
  // 3. State/Variables
  let isLoading = false;
  
  // 4. Functions/Handlers
  function handleSubmit() {
    // Implementation
  }
</script>

<!-- Template structure -->
<div class="container-classes">
  <!-- Group related elements in semantic sections -->
  <section class="section-classes">
    <!-- Component content -->
  </section>
</div>
```

## Animation Patterns
- Use `transition:fade` for simple transitions
- Use `Motion` component for complex animations
- Apply transitions to lists and dynamic content
- Use gradients for visual interest

## Best Practices
1. Use semantic HTML elements
2. Group related Tailwind classes logically
3. Implement proper dark mode support
4. Use responsive design patterns consistently
5. Keep components focused and modular
6. Use TypeScript for type safety
7. Implement proper loading states
8. Use SvelteKit's built-in features
9. Use emojis for simple icons where appropriate
10. Implement gradient patterns for visual hierarchy

## File Organization
- Components in `$lib/components/`
- UI components in `$lib/components/ui/`
- Utility functions in `$lib/utils/`
- Assets in `$lib/assets/`
- Routes in `src/routes/`

## Import Aliases
- `$lib` for library imports
- `@/` for root-relative imports
- `$app` for SvelteKit-specific imports

## Meta Information
Always include proper meta tags for:
- SEO optimization
- Social media sharing (Open Graph, Twitter)
- Responsive viewport settings

## Progressive Enhancement
1. Implement offline-first architecture
2. Use service workers for offline capabilities
3. Implement local data persistence
4. Support PWA features
5. Ensure graceful degradation

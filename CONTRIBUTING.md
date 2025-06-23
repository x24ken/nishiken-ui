# Contributing to Nishiken UI

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Start Storybook: `npm run storybook`

## Development Workflow

### Creating a New Component

1. Create component directory: `src/components/[component-name]/`
2. Add component files:
   - `[component-name].tsx` - Component implementation
   - `[component-name].stories.tsx` - Storybook stories
   - `index.ts` - Export file
3. Export from main index: `src/index.ts`

### Component Guidelines

- Use TypeScript for all components
- Follow existing patterns for consistency
- Include proper TypeScript types
- Make components accessible by default
- Use Tailwind CSS classes with the `cn` utility
- Support dark mode via CSS variables

### Code Style

- Run `npm run lint` before committing
- Run `npm run typecheck` to check types
- Follow the existing code style

### Testing

- Write comprehensive Storybook stories
- Cover all component variants
- Include edge cases

## Commit Convention

Follow conventional commits:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Build process/tooling changes

## Pull Request Process

1. Update documentation if needed
2. Ensure all checks pass
3. Request review from maintainers
4. Squash commits before merging
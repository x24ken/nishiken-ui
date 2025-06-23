# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

```bash
# Development
npm run dev              # Start Vite dev server
npm run storybook        # Start Storybook on port 6006 (primary development tool)

# Building
npm run build            # Build library (TypeScript + Vite)
npm run build:watch      # Build in watch mode
npm run build-storybook  # Build static Storybook

# Quality Checks (run before committing)
npm run typecheck        # TypeScript type checking
npm run lint             # ESLint checks
```

## Architecture Overview

This is a React component library using:
- **React 18+** with TypeScript in strict mode
- **Tailwind CSS v4 (beta)** with CSS variables for theming
- **Vite** for library bundling (ES modules output)
- **Storybook** for component development and documentation
- **class-variance-authority (CVA)** for component variants
- **@radix-ui/react-slot** for polymorphic components

### Component Pattern

All components follow this structure:
```typescript
// 1. Define variants using CVA
const componentVariants = cva('base-classes', {
  variants: { ... },
  defaultVariants: { ... }
})

// 2. Export interface extending HTML props + variant props
export interface ComponentProps 
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof componentVariants> {
  asChild?: boolean  // For polymorphic rendering
}

// 3. Use forwardRef
const Component = React.forwardRef<HTMLElement, ComponentProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'element'
    return <Comp className={cn(componentVariants({ variant, size, className }))} ref={ref} {...props} />
  }
)
```

### Design System Architecture

**CSS Variables Theme System:**
- All colors defined as HSL values in CSS variables
- Light/dark mode via `.dark` class
- Semantic color tokens: `primary`, `secondary`, `destructive`, `muted`, `accent`
- Applied via Tailwind classes like `bg-primary`, `text-primary-foreground`

**Component Categories:**
- **Layout**: Container, Grid, Stack components
- **Form**: Input-related components with consistent styling
- **Feedback**: User feedback components (alerts, toasts)
- **Overlay**: Modal-type components
- **Typography**: Text and heading components with predefined styles

### Key Development Patterns

1. **Creating New Components:**
   ```bash
   src/components/[name]/
   ├── [name].tsx           # Implementation
   ├── [name].stories.tsx   # Storybook stories
   └── index.ts            # Barrel export
   ```

2. **Styling Approach:**
   - Use `cn()` utility from `@/lib/utils` for className merging
   - Prefer Tailwind classes over custom CSS
   - Support all interactive states: hover, active, focus, disabled

3. **Storybook Stories:**
   - Include default story with controls
   - Add variant showcase stories
   - Create interactive examples showing real usage
   - Test all props and states

4. **Type Safety:**
   - Export component props interfaces
   - Use `VariantProps` from CVA for variant types
   - Maintain strict TypeScript settings

## Current Development Phase

**Phase 1: Foundation** (Current)
- Core components: Button, Input, Card, Typography
- Design token system established
- Build and development infrastructure

**Upcoming Phases:**
- Phase 2: Form and layout components
- Phase 3: Data display and navigation
- Phase 4: Documentation and polish

## Important Notes

- Tailwind CSS v4 is in beta - avoid `@layer` directives, use direct CSS
- All components must support dark mode via CSS variables
- Follow compound component pattern for complex components (see Card)
- Maintain accessibility with proper ARIA attributes and keyboard support
- Use conventional commits: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`
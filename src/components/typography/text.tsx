import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const textVariants = cva('', {
  variants: {
    variant: {
      p: 'leading-7 [&:not(:first-child)]:mt-6',
      lead: 'text-xl text-muted-foreground',
      large: 'text-lg font-semibold',
      small: 'text-sm font-medium leading-none',
      muted: 'text-sm text-muted-foreground',
      code: 'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold',
    },
  },
  defaultVariants: {
    variant: 'p',
  },
})

export interface TextProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof textVariants> {
  as?: 'p' | 'span' | 'div' | 'code'
}

const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ className, variant, as = 'p', ...props }, ref) => {
    const Comp = as
    return React.createElement(Comp, {
      ref,
      className: cn(textVariants({ variant, className })),
      ...props,
    })
  }
)
Text.displayName = 'Text'

export { Text, textVariants }
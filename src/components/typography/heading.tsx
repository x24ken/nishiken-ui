import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const headingVariants = cva('scroll-m-20 tracking-tight', {
  variants: {
    level: {
      h1: 'text-4xl font-extrabold lg:text-5xl',
      h2: 'text-3xl font-semibold first:mt-0',
      h3: 'text-2xl font-semibold',
      h4: 'text-xl font-semibold',
      h5: 'text-lg font-semibold',
      h6: 'text-base font-semibold',
    },
  },
  defaultVariants: {
    level: 'h2',
  },
})

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level = 'h2', as, ...props }, ref) => {
    const Comp = as || level || 'h2'
    return (
      <Comp
        ref={ref}
        className={cn(headingVariants({ level, className }))}
        {...props}
      />
    )
  }
)
Heading.displayName = 'Heading'

export { Heading, headingVariants }
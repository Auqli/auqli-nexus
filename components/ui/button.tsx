import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  asLink?: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string
  }
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, asLink, children, ...props }, ref) => {
    // When using asLink, return an anchor tag directly
    if (asLink && asLink.href) {
      return (
        <a href={asLink.href} className={cn(buttonVariants({ variant, size, className }))} {...asLink}>
          {children}
        </a>
      )
    }

    // For asChild, we need to ensure we're passing a single child
    if (asChild) {
      // Create a wrapper element if needed
      const childArray = React.Children.toArray(children)
      if (childArray.length === 0) {
        // No children, return an empty button
        return <button className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />
      } else if (childArray.length === 1 && React.isValidElement(childArray[0])) {
        // Single valid element child, use Slot
        return (
          <Slot className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props}>
            {childArray[0]}
          </Slot>
        )
      } else {
        // Multiple children or non-element child, fallback to regular button
        console.warn("Button with asChild prop expected a single React element child. Falling back to regular button.")
        return (
          <button className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props}>
            {children}
          </button>
        )
      }
    }

    // Default case: return a regular button
    return (
      <button className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props}>
        {children}
      </button>
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }


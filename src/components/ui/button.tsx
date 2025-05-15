import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-base font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2AB6A6] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-sm [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[#2AB6A6] text-white hover:bg-[#229b8e]",
        destructive:
          "bg-red-500 text-white hover:bg-red-600",
        outline:
          "border border-[#D9F4F0] dark:border-[#22304a] bg-white dark:bg-[#23272f] text-[#2AB6A6] dark:text-[#D9F4F0] hover:bg-[#D9F4F0] dark:hover:bg-[#22304a]",
        secondary:
          "bg-[#D9F4F0] text-[#2AB6A6] hover:bg-[#b8eae3] dark:bg-[#22304a] dark:text-[#D9F4F0] dark:hover:bg-[#101624]",
        ghost: "bg-transparent text-[#2AB6A6] dark:text-[#D9F4F0] hover:bg-[#D9F4F0]/60 dark:hover:bg-[#22304a]/60",
        link: "text-[#2AB6A6] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-xl px-4 py-1.5 text-sm",
        lg: "h-12 rounded-xl px-8 py-3 text-lg",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

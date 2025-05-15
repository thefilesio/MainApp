import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-[#D9F4F0] dark:border-[#22304a] bg-white dark:bg-[#23272f] px-4 py-2 text-base font-sans placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2AB6A6] focus-visible:ring-offset-2 transition-all disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        style={{ fontFamily: 'Inter, sans-serif' }}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }

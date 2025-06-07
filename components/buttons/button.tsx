import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"


const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-[var(--button-color)] text-[var(--text-color)] hover:scale-95 transition-all duration-300",
        destructive: "bg-red-600 text-[var(--text-color)] hover:bg-red-700 focus-visible:ring-red-500",
        outline: "border border-[#333] bg-transparent text-[var(--text-color)] hover:bg-[var(--button-color)]",
        secondary: "bg-[var(--background)] text-[var(--text-color)] hover:bg-[var(--button-color)]",
        ghost: "bg-transparent hover:bg-[var(--button-color)] text-[var(--text-color)]",
        link: "text-blue-600 underline hover:text-blue-700",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 py-1.5 text-sm",
        lg: "h-10 px-6 py-2.5 text-base",
        icon: "p-2", 
      }, 
    },
    defaultVariants: { 
      variant: "default", 
      size: "default", 
    },
  }
) 

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}



const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    )
  }
)

export { Button, buttonVariants }
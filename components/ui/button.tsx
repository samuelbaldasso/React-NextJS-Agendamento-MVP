import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Note: Ensure @radix-ui/react-slot and class-variance-authority are installed
// If not, we can simplify this validation. Assuming shadcn-like structure.

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    size?: "default" | "sm" | "lg" | "icon"
}

// Simplified version avoiding complex CVA if dependencies are worrysome, 
// but using standard pattern as requested for "Senior Frontend".
// I will create a utils file for 'cn'.

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        // Basic tailwind classes simulating the variants
        const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"

        let variantStyles = ""
        switch (variant) {
            case "default": variantStyles = "bg-primary text-primary-foreground hover:bg-primary/90"; break; // assuming tailwind config
            case "destructive": variantStyles = "bg-destructive text-destructive-foreground hover:bg-destructive/90"; break;
            case "outline": variantStyles = "border border-input bg-background hover:bg-accent hover:text-accent-foreground"; break;
            case "secondary": variantStyles = "bg-secondary text-secondary-foreground hover:bg-secondary/80"; break;
            case "ghost": variantStyles = "hover:bg-accent hover:text-accent-foreground"; break;
            case "link": variantStyles = "text-primary underline-offset-4 hover:underline"; break;
            default: variantStyles = "bg-blue-600 text-white hover:bg-blue-700"; // Fallback
        }

        let sizeStyles = ""
        switch (size) {
            case "default": sizeStyles = "h-10 px-4 py-2"; break;
            case "sm": sizeStyles = "h-9 rounded-md px-3"; break;
            case "lg": sizeStyles = "h-11 rounded-md px-8"; break;
            case "icon": sizeStyles = "h-10 w-10"; break;
        }

        return (
            <Comp
                className={cn(baseStyles, variantStyles, sizeStyles, className)}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }

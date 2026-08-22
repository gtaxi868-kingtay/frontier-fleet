import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-tactical uppercase tracking-wider text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden beveled select-none touch-manipulation active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-glow-gold hover:scale-[1.02] border border-primary-glow/30",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md hover:shadow-lg border border-destructive/50",
        outline: "border-2 border-primary/50 bg-background/50 backdrop-blur-sm text-foreground hover:bg-primary/10 hover:border-primary hover:shadow-glow",
        secondary: "bg-gradient-metallic text-secondary-foreground hover:bg-secondary shadow-md hover:shadow-lg border border-border",
        ghost: "hover:bg-accent/10 hover:text-accent-foreground hover:shadow-sm",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary-glow",
        success: "bg-success text-success-foreground hover:bg-success/90 shadow-md hover:shadow-lg border border-success/50",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90 shadow-md hover:shadow-lg border border-warning/50",
        tactical: "bg-gradient-blue text-accent-foreground shadow-glow-blue hover:shadow-glow-blue hover:scale-[1.02] border border-accent/30",
        command: "bg-gradient-gold text-gold-foreground shadow-glow-gold hover:shadow-glow-gold hover:scale-[1.02] border border-gold/30",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 px-4 text-xs",
        lg: "h-13 px-10 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

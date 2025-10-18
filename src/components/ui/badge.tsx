import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-3 py-1 text-xs font-tactical font-bold uppercase tracking-wider transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 beveled",
  {
    variants: {
      variant: {
        default: "border-primary/30 bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-glow-gold",
        secondary: "border-border bg-gradient-metallic text-secondary-foreground shadow-md hover:shadow-lg",
        destructive: "border-destructive/50 bg-destructive text-destructive-foreground shadow-md hover:shadow-lg",
        outline: "border-primary/50 text-foreground hover:bg-primary/10 hover:border-primary",
        success: "border-success/50 bg-success text-success-foreground shadow-md",
        warning: "border-warning/50 bg-warning text-warning-foreground shadow-md",
        tactical: "border-accent/30 bg-gradient-blue text-accent-foreground shadow-glow-blue",
        command: "border-gold/30 bg-gradient-gold text-gold-foreground shadow-glow-gold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

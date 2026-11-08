import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        // Deep Navy
        default:
          "border-transparent bg-primary text-primary-foreground shadow-subtle",
        // Royal Blue
        secondary:
          "border-transparent bg-secondary text-secondary-foreground shadow-subtle",
        // Emerald Green Accent
        accent:
          "border-transparent bg-accent text-accent-foreground shadow-subtle",
        // Soft Emerald Success
        success:
          "border-emerald-200 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
        // Soft Amber Warning
        warning:
          "border-amber-200 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
        // Soft Blue Info
        info:
          "border-blue-200 bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
        // Soft Rose Destructive
        destructive:
          "border-rose-200 bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
        // Clean Outline
        outline:
          "text-foreground border-border bg-background/50",
        // Subtle Surface
        subtle:
          "border-border/60 bg-surface text-charcoal-700",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px] font-medium leading-none",
        default: "px-2.5 py-0.5 text-xs font-semibold",
        lg: "px-3.5 py-1 text-sm font-semibold",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, size, dot, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full shrink-0",
            variant === "success" && "bg-emerald-500",
            variant === "warning" && "bg-amber-500",
            variant === "info" && "bg-blue-500",
            variant === "destructive" && "bg-rose-500",
            variant === "accent" && "bg-white",
            variant === "secondary" && "bg-white",
            (!variant || variant === "default") && "bg-emerald-400"
          )}
        />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };

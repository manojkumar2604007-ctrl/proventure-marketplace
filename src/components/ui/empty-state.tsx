import * as React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  children?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  secondaryActionLabel,
  onSecondaryAction,
  children,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-surface/50 p-8 text-center",
        className
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/10 text-secondary shadow-subtle ring-4 ring-secondary/5">
        {icon || <FolderOpen className="h-7 w-7 stroke-[1.75]" />}
      </div>
      <h3 className="text-base font-bold text-primary sm:text-lg">
        {title}
      </h3>
      <p className="mt-1.5 max-w-sm text-xs sm:text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>

      {(actionLabel || secondaryActionLabel || children) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {secondaryActionLabel && onSecondaryAction && (
            <Button variant="outline" size="sm" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}

          {actionLabel && (
            actionHref ? (
              <Button asChild size="sm">
                <a href={actionHref}>{actionLabel}</a>
              </Button>
            ) : (
              <Button size="sm" onClick={onAction}>
                {actionLabel}
              </Button>
            )
          )}

          {children}
        </div>
      )}
    </div>
  );
}

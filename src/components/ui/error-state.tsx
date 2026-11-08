import * as React from "react";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  error?: Error | string | null;
  onRetry?: () => void;
  showBack?: boolean;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred while loading this content. Please try again or return to the dashboard.",
  error,
  onRetry,
  showBack = false,
  className,
}: ErrorStateProps) {
  const errorMessage =
    error instanceof Error ? error.message : typeof error === "string" ? error : null;

  return (
    <div
      role="alert"
      className={cn(
        "flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-rose-50/40 dark:bg-rose-950/10 p-8 text-center",
        className
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive shadow-subtle ring-4 ring-destructive/10">
        <AlertTriangle className="h-7 w-7" />
      </div>

      <h3 className="text-base font-bold text-charcoal-900 dark:text-charcoal-100 sm:text-lg">
        {title}
      </h3>

      <p className="mt-1.5 max-w-md text-xs sm:text-sm text-muted-foreground leading-relaxed">
        {message}
      </p>

      {errorMessage && (
        <div className="mt-3 max-w-md rounded-lg bg-background/80 border border-destructive/20 px-3 py-1.5 text-left">
          <p className="text-[11px] font-mono text-destructive break-all">
            {errorMessage}
          </p>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {showBack && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.history.back()}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Go Back
          </Button>
        )}

        {onRetry && (
          <Button
            variant="default"
            size="sm"
            onClick={onRetry}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}

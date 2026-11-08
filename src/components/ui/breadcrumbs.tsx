import * as React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  className?: string;
}

export function Breadcrumbs({
  items,
  showHome = true,
  className,
}: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center text-xs text-muted-foreground", className)}
    >
      <ol className="flex items-center flex-wrap gap-1.5">
        {showHome && (
          <li className="flex items-center">
            <Link
              href="/"
              className="flex items-center gap-1 hover:text-foreground transition-colors p-0.5 rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-secondary"
            >
              <Home className="h-3.5 w-3.5" />
              <span className="sr-only">Home</span>
            </Link>
            {items.length > 0 && (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 mx-1 shrink-0" />
            )}
          </li>
        )}

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.label + index} className="flex items-center">
              {isLast || !item.href ? (
                <span
                  className="font-medium text-foreground truncate max-w-[200px]"
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-foreground transition-colors truncate max-w-[150px] p-0.5 rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-secondary"
                >
                  {item.label}
                </Link>
              )}

              {!isLast && (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 mx-1 shrink-0" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Sparkles, TrendingUp, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchBarProps {
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  onSearchSubmit?: (query: string) => void;
}

const POPULAR_SEARCHES = [
  "Mechanical Keyboards",
  "Noise Cancelling Headphones",
  "Leather Backpack",
  "Smart Watch Ultra",
  "Ceramic Coffee Dripper",
  "Oversized Linen Shirt",
];

const SUGGESTED_CATEGORIES = [
  { name: "Electronics", slug: "electronics" },
  { name: "Fashion", slug: "fashion" },
  { name: "Home & Living", slug: "home-living" },
];

export function SearchBar({
  placeholder = "Search across thousands of verified products & stores...",
  className,
  autoFocus = false,
  onSearchSubmit,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut Ctrl+K / Cmd+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const executeSearch = (searchTerm: string) => {
    const term = searchTerm.trim();
    if (!term) return;
    setIsOpen(false);
    if (onSearchSubmit) {
      onSearchSubmit(term);
    } else {
      router.push(`/products?search=${encodeURIComponent(term)}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <form onSubmit={handleSubmit} role="search" className="relative w-full">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none transition-colors" />

          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className={cn(
              "w-full h-11 pl-10 pr-20 rounded-xl border border-input bg-surface/60 text-sm text-foreground placeholder:text-muted-foreground shadow-subtle transition-all duration-200",
              "hover:bg-background hover:border-secondary/50",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:border-transparent focus-visible:bg-background"
            )}
            aria-label="Search marketplace"
            aria-autocomplete="list"
            aria-expanded={isOpen}
          />

          <div className="absolute right-3 flex items-center gap-1.5">
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border/80 bg-background px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground select-none pointer-events-none shadow-subtle">
                <span className="text-xs">⌘</span>K
              </kbd>
            )}
          </div>
        </div>
      </form>

      {/* Instant Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 overflow-hidden rounded-xl border border-border/80 bg-background shadow-dropdown animate-in fade-in-0 zoom-in-95 duration-150">
          <div className="p-3 border-b border-border/60 bg-surface/30">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-secondary" /> Popular Marketplace Searches
            </span>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {POPULAR_SEARCHES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setQuery(item);
                    executeSearch(item);
                  }}
                  className="rounded-lg border border-border/70 bg-background hover:bg-surface hover:border-secondary/40 px-2.5 py-1 text-xs text-foreground/80 transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-accent" /> Recommended Categories
            </span>
            <div className="mt-2 space-y-1">
              {SUGGESTED_CATEGORIES.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    router.push(`/category/${cat.slug}`);
                  }}
                  className="w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-foreground hover:bg-surface transition-colors"
                >
                  <span>{cat.name}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

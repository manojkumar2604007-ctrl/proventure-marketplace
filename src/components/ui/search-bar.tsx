"use client";

import * as React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  X,
  Sparkles,
  TrendingUp,
  History,
  Store,
  FolderTree,
  Package,
  ArrowRight,
  Clock,
  Trash2,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { searchService } from "@/services/search.service";
import { SearchAutocompleteResult } from "@/types";

export interface SearchBarProps {
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  onSearchSubmit?: (query: string) => void;
}

export function SearchBar({
  placeholder = "Search across thousands of verified products & stores...",
  className,
  autoFocus = false,
  onSearchSubmit,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [autocompleteData, setAutocompleteData] = useState<SearchAutocompleteResult | null>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const popularSearches = searchService.getPopularSearches();

  // Load recent searches from localStorage on mount
  useEffect(() => {
    setRecentSearches(searchService.getRecentSearches());
  }, []);

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

  // Debounced Autocomplete Fetch
  const fetchAutocomplete = useCallback((searchTerm: string) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (!searchTerm.trim()) {
      setAutocompleteData(null);
      setIsLoadingSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/autocomplete?q=${encodeURIComponent(searchTerm.trim())}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setAutocompleteData(json.data);
          }
        }
      } catch {
        // Fallback to client-side service
        const fallback = await searchService.getAutocomplete(searchTerm.trim());
        setAutocompleteData(fallback);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 200);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);
    fetchAutocomplete(val);
  };

  const executeSearch = (searchTerm: string) => {
    const term = searchTerm.trim();
    if (!term) return;

    // Save to search history
    const updated = searchService.saveRecentSearch(term);
    setRecentSearches(updated);

    setIsOpen(false);
    if (onSearchSubmit) {
      onSearchSubmit(term);
    } else {
      router.push(`/search?q=${encodeURIComponent(term)}`);
    }
  };

  const handleRemoveHistoryItem = (e: React.MouseEvent, item: string) => {
    e.stopPropagation();
    const updated = searchService.removeRecentSearch(item);
    setRecentSearches(updated);
  };

  const handleClearAllHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    searchService.clearRecentSearches();
    setRecentSearches([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  const hasAutocompleteResults =
    autocompleteData &&
    (autocompleteData.products.length > 0 ||
      autocompleteData.categories.length > 0 ||
      autocompleteData.sellers.length > 0 ||
      autocompleteData.suggestions.length > 0);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <form onSubmit={handleSubmit} role="search" className="relative w-full">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none transition-colors" />

          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={handleInputChange}
            onFocus={() => {
              setIsOpen(true);
              if (query) fetchAutocomplete(query);
            }}
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
                  setAutocompleteData(null);
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

      {/* Dynamic Search Autocomplete & Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 overflow-hidden rounded-2xl border border-border/80 bg-background shadow-dropdown animate-in fade-in-0 zoom-in-95 duration-150 max-h-[80vh] overflow-y-auto">
          {query.trim().length > 0 ? (
            /* ========================================== */
            /* Active Query Autocomplete Dropdown         */
            /* ========================================== */
            <div className="divide-y divide-border/60">
              {/* Keyword Query Suggestions */}
              {autocompleteData?.suggestions && autocompleteData.suggestions.length > 0 && (
                <div className="p-3 bg-surface/20">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-accent" /> Keyword Suggestions
                  </span>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {autocompleteData.suggestions.map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => {
                          setQuery(sug);
                          executeSearch(sug);
                        }}
                        className="rounded-lg border border-border/70 bg-background hover:bg-surface hover:border-secondary/40 px-2.5 py-1 text-xs text-foreground/90 transition-colors flex items-center gap-1.5"
                      >
                        <Search className="h-3 w-3 text-muted-foreground" />
                        <span>{sug}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Matching Products */}
              {autocompleteData?.products && autocompleteData.products.length > 0 && (
                <div className="p-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
                    <Package className="h-3.5 w-3.5 text-primary" /> Matching Products
                  </span>
                  <div className="space-y-1">
                    {autocompleteData.products.map((prod) => (
                      <Link
                        key={prod.id}
                        href={`/products/${prod.slug}`}
                        onClick={() => {
                          searchService.saveRecentSearch(prod.title);
                          setIsOpen(false);
                        }}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface transition-colors group"
                      >
                        <div className="relative h-10 w-10 rounded-lg overflow-hidden border border-border/60 bg-surface shrink-0">
                          <Image
                            src={prod.image}
                            alt={prod.title}
                            fill
                            sizes="40px"
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate group-hover:text-secondary transition-colors">
                            {prod.title}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                            {prod.categoryName && <span>{prod.categoryName}</span>}
                            <span>•</span>
                            <span className="font-bold text-primary font-mono">
                              {formatPrice(prod.price)}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Matching Categories & Sellers Dual Column */}
              {((autocompleteData?.categories && autocompleteData.categories.length > 0) ||
                (autocompleteData?.sellers && autocompleteData.sellers.length > 0)) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border/60 p-3 bg-surface/30 gap-3">
                  {/* Matching Categories */}
                  {autocompleteData.categories.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <FolderTree className="h-3.5 w-3.5 text-secondary" /> Categories
                      </span>
                      <div className="space-y-1">
                        {autocompleteData.categories.map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              searchService.saveRecentSearch(cat.name);
                              setIsOpen(false);
                              router.push(`/categories/${cat.slug}`);
                            }}
                            className="w-full flex items-center justify-between p-2 rounded-lg text-xs text-foreground hover:bg-background hover:shadow-subtle transition-all text-left"
                          >
                            <span className="font-medium">{cat.name}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {cat.productCount} items
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Sellers / Stores */}
                  {autocompleteData.sellers.length > 0 && (
                    <div className="space-y-1.5 pt-2 sm:pt-0 sm:pl-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Store className="h-3.5 w-3.5 text-emerald-600" /> Verified Sellers
                      </span>
                      <div className="space-y-1">
                        {autocompleteData.sellers.map((seller) => (
                          <button
                            key={seller.id}
                            type="button"
                            onClick={() => {
                              searchService.saveRecentSearch(seller.storeName);
                              setIsOpen(false);
                              router.push(`/stores/${seller.slug}`);
                            }}
                            className="w-full flex items-center justify-between p-2 rounded-lg text-xs text-foreground hover:bg-background hover:shadow-subtle transition-all text-left"
                          >
                            <span className="font-medium truncate">{seller.storeName}</span>
                            <span className="text-[10px] text-emerald-600 font-semibold">
                              ★ {seller.rating?.toFixed(1) || "5.0"}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* View All Matching Results Footer */}
              <div className="p-3 bg-surface/50 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Press <kbd className="px-1.5 py-0.5 rounded border bg-background text-[10px] font-mono font-bold">Enter</kbd> to see all results
                </span>
                <button
                  type="button"
                  onClick={() => executeSearch(query)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-secondary hover:underline"
                >
                  <span>Search for "{query}"</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          ) : (
            /* ========================================== */
            /* Default Dropdown (Recent & Popular Search) */
            /* ========================================== */
            <div className="divide-y divide-border/60">
              {/* Search History (Recent Searches) */}
              {recentSearches.length > 0 && (
                <div className="p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <History className="h-3.5 w-3.5 text-secondary" /> Recent Searches
                    </span>
                    <button
                      type="button"
                      onClick={handleClearAllHistory}
                      className="text-[11px] text-muted-foreground hover:text-destructive transition-colors font-medium"
                    >
                      Clear History
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.slice(0, 6).map((item) => (
                      <span
                        key={item}
                        onClick={() => {
                          setQuery(item);
                          executeSearch(item);
                        }}
                        className="group inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-surface/40 hover:bg-surface hover:border-secondary/40 px-2.5 py-1 text-xs text-foreground/90 transition-colors cursor-pointer"
                      >
                        <Clock className="h-3 w-3 text-muted-foreground group-hover:text-secondary" />
                        <span>{item}</span>
                        <button
                          type="button"
                          onClick={(e) => handleRemoveHistoryItem(e, item)}
                          className="text-muted-foreground/60 hover:text-destructive p-0.5"
                          title="Remove from history"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Marketplace Searches */}
              <div className="p-3.5 bg-surface/20 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-secondary" /> Trending Searches
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {popularSearches.map((item) => (
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

              {/* Curated Categories */}
              <div className="p-3.5 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <FolderTree className="h-3.5 w-3.5 text-accent" /> Popular Departments
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { name: "Electronics", slug: "electronics" },
                    { name: "Fashion", slug: "fashion" },
                    { name: "Home & Living", slug: "home-living" },
                    { name: "Health & Beauty", slug: "health-beauty" },
                    { name: "Books & Media", slug: "books-media" },
                    { name: "Sports & Fitness", slug: "sports-fitness" },
                  ].map((cat) => (
                    <button
                      key={cat.slug}
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        router.push(`/categories/${cat.slug}`);
                      }}
                      className="flex items-center justify-between p-2 rounded-xl border border-border/50 bg-surface/30 hover:bg-surface hover:border-secondary/30 text-xs font-medium text-foreground transition-all"
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
      )}
    </div>
  );
}

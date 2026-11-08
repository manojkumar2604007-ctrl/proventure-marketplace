import { prisma } from "@/lib/db/prisma";
import { productService } from "./product.service";
import { categoryService } from "./category.service";
import { vendorService } from "./vendor.service";
import { SearchAutocompleteResult, Product, Category, SellerProfile } from "@/types";
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_SELLERS } from "@/lib/db/mock-data";

const TRENDING_KEYWORDS = [
  "Noise Cancelling Headphones",
  "Leather Briefcase",
  "Mechanical Keyboard",
  "Titanium Chronograph",
  "Ceramic Pour Over",
  "Studio Monitor Speakers",
  "Wireless Earbuds",
  "Ergonomic Chair",
  "Smart Watch Ultra",
];

export const searchService = {
  /**
   * Returns instant search autocomplete results categorized by Products, Categories, and Stores/Sellers.
   */
  async getAutocomplete(rawQuery: string): Promise<SearchAutocompleteResult> {
    const q = (rawQuery || "").trim().toLowerCase();
    if (!q) {
      return {
        query: "",
        suggestions: TRENDING_KEYWORDS.slice(0, 5),
        products: [],
        categories: [],
        sellers: [],
      };
    }

    try {
      if (process.env.DATABASE_URL && process.env.NEXT_PUBLIC_USE_MOCK_FALLBACK !== "true") {
        const [dbProducts, dbCategories, dbStores] = await Promise.all([
          prisma.product.findMany({
            where: {
              status: "ACTIVE",
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
                { tags: { has: q } },
              ],
            },
            include: {
              images: { where: { isPrimary: true }, take: 1 },
              category: { select: { name: true } },
              store: { select: { name: true } },
            },
            take: 6,
          }),
          prisma.category.findMany({
            where: {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { slug: { contains: q, mode: "insensitive" } },
              ],
            },
            include: {
              _count: { select: { products: true } },
            },
            take: 4,
          }),
          prisma.store.findMany({
            where: {
              isActive: true,
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { slug: { contains: q, mode: "insensitive" } },
              ],
            },
            take: 3,
          }),
        ]);

        const products = dbProducts.map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          price: Number(p.price),
          comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
          image:
            p.images[0]?.url ||
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80",
          categoryName: p.category?.name,
          sellerName: p.store?.name,
          rating: Number(p.rating || 5.0),
        }));

        const categories = dbCategories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          productCount: c._count?.products ?? 0,
        }));

        const sellers = dbStores.map((s) => ({
          id: s.id,
          storeName: s.name,
          slug: s.slug,
          logo: s.logo,
          rating: Number(s.rating || 5.0),
        }));

        // Dynamic keyword suggestions from matching titles and tags
        const suggestionsSet = new Set<string>();
        dbProducts.forEach((p) => {
          suggestionsSet.add(p.title);
          p.tags.forEach((t) => {
            if (t.toLowerCase().includes(q)) suggestionsSet.add(t);
          });
        });

        return {
          query: rawQuery,
          suggestions: Array.from(suggestionsSet).slice(0, 5),
          products,
          categories,
          sellers,
        };
      }
    } catch (e) {
      console.warn("Neon DB autocomplete fallback:", e);
    }

    // In-memory fallback
    const matchedProducts = MOCK_PRODUCTS.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    ).slice(0, 6);

    const matchedCategories = MOCK_CATEGORIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
    ).slice(0, 4);

    const matchedSellers = MOCK_SELLERS.filter(
      (s) => s.storeName.toLowerCase().includes(q) || s.slug.toLowerCase().includes(q)
    ).slice(0, 3);

    const suggestionsSet = new Set<string>();
    matchedProducts.forEach((p) => {
      suggestionsSet.add(p.title);
      p.tags.forEach((t) => {
        if (t.toLowerCase().includes(q)) suggestionsSet.add(t);
      });
    });

    return {
      query: rawQuery,
      suggestions: Array.from(suggestionsSet).slice(0, 5),
      products: matchedProducts.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        price: p.price,
        comparePrice: p.comparePrice,
        image:
          p.images?.[0]?.url ||
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80",
        categoryName: p.category?.name || "General",
        sellerName: p.seller?.storeName || "Verified Vendor",
        rating: p.rating,
      })),
      categories: matchedCategories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        productCount: 12,
      })),
      sellers: matchedSellers.map((s) => ({
        id: s.id,
        storeName: s.storeName,
        slug: s.slug,
        logo: s.logo,
        rating: s.rating,
      })),
    };
  },

  /**
   * Retrieves popular marketplace searches.
   */
  getPopularSearches(): string[] {
    return TRENDING_KEYWORDS;
  },

  /**
   * Client-side search history helper.
   */
  getRecentSearches(): string[] {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("proventure_search_history");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  saveRecentSearch(query: string): string[] {
    if (typeof window === "undefined") return [];
    const term = query.trim();
    if (!term) return this.getRecentSearches();

    try {
      const history = this.getRecentSearches().filter(
        (item) => item.toLowerCase() !== term.toLowerCase()
      );
      history.unshift(term);
      const capped = history.slice(0, 10);
      localStorage.setItem("proventure_search_history", JSON.stringify(capped));
      return capped;
    } catch {
      return [];
    }
  },

  removeRecentSearch(query: string): string[] {
    if (typeof window === "undefined") return [];
    try {
      const history = this.getRecentSearches().filter(
        (item) => item.toLowerCase() !== query.toLowerCase()
      );
      localStorage.setItem("proventure_search_history", JSON.stringify(history));
      return history;
    } catch {
      return [];
    }
  },

  clearRecentSearches(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem("proventure_search_history");
    } catch {
      // Ignore
    }
  },
};

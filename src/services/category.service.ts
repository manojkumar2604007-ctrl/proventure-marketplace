import { prisma } from "@/lib/db/prisma";
import { MOCK_CATEGORIES } from "@/lib/db/mock-data";
import type { Category } from "@/types";

let localCategories: Category[] = [...MOCK_CATEGORIES];

function mapPrismaCategory(cat: any): Category {
  return {
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description || "",
    image: cat.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
    icon: cat.icon || "Sparkles",
    featured: cat.featured ?? false,
    productCount: cat._count?.products ?? 12,
  };
}

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    try {
      if (process.env.DATABASE_URL && process.env.NEXT_PUBLIC_USE_MOCK_FALLBACK !== "true") {
        const categories = await prisma.category.findMany({
          include: {
            _count: {
              select: { products: true },
            },
          },
          orderBy: { name: "asc" },
        });
        if (categories && categories.length > 0) {
          return categories.map(mapPrismaCategory);
        }
      }
    } catch (e) {
      console.warn("Neon PostgreSQL getCategories fallback:", e);
    }
    return localCategories;
  },

  async getFeaturedCategories(): Promise<Category[]> {
    try {
      if (process.env.DATABASE_URL && process.env.NEXT_PUBLIC_USE_MOCK_FALLBACK !== "true") {
        const categories = await prisma.category.findMany({
          where: { featured: true },
          include: {
            _count: {
              select: { products: true },
            },
          },
        });
        if (categories && categories.length > 0) {
          return categories.map(mapPrismaCategory);
        }
      }
    } catch {
      // Fallback
    }
    return localCategories.filter((c) => c.featured);
  },

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      if (process.env.DATABASE_URL && process.env.NEXT_PUBLIC_USE_MOCK_FALLBACK !== "true") {
        const cat = await prisma.category.findUnique({
          where: { slug },
          include: {
            _count: {
              select: { products: true },
            },
          },
        });
        if (cat) return mapPrismaCategory(cat);
      }
    } catch {
      // Fallback
    }
    return localCategories.find((c) => c.slug === slug) || null;
  },

  async createCategory(data: {
    name: string;
    slug: string;
    description?: string;
    image?: string;
    icon?: string;
    featured?: boolean;
  }): Promise<Category> {
    const newCat: Category = {
      id: `cat_${Date.now()}`,
      name: data.name,
      slug: data.slug,
      description: data.description,
      image: data.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
      icon: data.icon || "Sparkles",
      featured: data.featured ?? false,
      productCount: 0,
    };

    localCategories.push(newCat);
    return newCat;
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    const idx = localCategories.findIndex((c) => c.id === id);
    if (idx === -1) return null;

    localCategories[idx] = {
      ...localCategories[idx],
      ...updates,
    };
    return localCategories[idx];
  },

  async deleteCategory(id: string): Promise<boolean> {
    const initialLen = localCategories.length;
    localCategories = localCategories.filter((c) => c.id !== id);
    return localCategories.length < initialLen;
  },
};

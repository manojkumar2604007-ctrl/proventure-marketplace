import { MOCK_CATEGORIES } from "@/lib/db/mock-data";
import { Category } from "@/types";

let localCategories: Category[] = [...MOCK_CATEGORIES];

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    return localCategories;
  },

  async getFeaturedCategories(): Promise<Category[]> {
    return localCategories.filter((c) => c.featured);
  },

  async getCategoryBySlug(slug: string): Promise<Category | null> {
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
};

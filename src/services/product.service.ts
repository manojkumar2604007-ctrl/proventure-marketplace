import { prisma } from "@/lib/db/prisma";
import { MOCK_PRODUCTS } from "@/lib/db/mock-data";
import { Product, ProductFilterParams, ProductStatus } from "@/types";

// In-memory working copy for local dev updates
let localProducts: Product[] = [...MOCK_PRODUCTS];

export const productService = {
  async getProducts(params: ProductFilterParams = {}): Promise<{
    products: Product[];
    total: number;
  }> {
    try {
      // Attempt Neon DB query if configured and not fallback
      if (process.env.DATABASE_URL && process.env.NEXT_PUBLIC_USE_MOCK_FALLBACK !== "true") {
        const whereClause: any = {
          status: "ACTIVE",
        };

        if (params.category) {
          whereClause.category = { slug: params.category };
        }
        if (params.seller) {
          whereClause.seller = { slug: params.seller };
        }
        if (params.search) {
          whereClause.OR = [
            { title: { contains: params.search, mode: "insensitive" } },
            { description: { contains: params.search, mode: "insensitive" } },
            { tags: { has: params.search } },
          ];
        }
        if (params.featured !== undefined) {
          whereClause.featured = params.featured;
        }

        const [items, count] = await Promise.all([
          prisma.product.findMany({
            where: whereClause,
            include: {
              images: { orderBy: { displayOrder: "asc" } },
              variants: true,
              store: true,
              category: true,
            },
            take: params.limit || 24,
            skip: ((params.page || 1) - 1) * (params.limit || 24),
          }),
          prisma.product.count({ where: whereClause }),
        ]);

        if (items.length > 0) {
          return {
            products: items as unknown as Product[],
            total: count,
          };
        }
      }
    } catch {
      // Silently fall back to in-memory store
    }

    // Fallback: In-memory store
    let filtered = [...localProducts];

    if (params.category) {
      filtered = filtered.filter(
        (p) => p.categoryId === params.category || p.category?.slug === params.category
      );
    }

    if (params.seller) {
      filtered = filtered.filter(
        (p) => p.sellerId === params.seller || p.seller?.slug === params.seller
      );
    }

    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (params.minPrice !== undefined) {
      filtered = filtered.filter((p) => p.price >= params.minPrice!);
    }

    if (params.maxPrice !== undefined) {
      filtered = filtered.filter((p) => p.price <= params.maxPrice!);
    }

    if (params.rating !== undefined) {
      filtered = filtered.filter((p) => p.rating >= params.rating!);
    }

    if (params.featured !== undefined) {
      filtered = filtered.filter((p) => p.featured === params.featured);
    }

    if (params.inStock) {
      filtered = filtered.filter((p) => p.stock > 0);
    }

    // Sort
    if (params.sort === "price-asc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (params.sort === "price-desc") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (params.sort === "rating") {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (params.sort === "popular") {
      filtered.sort((a, b) => b.reviewCount - a.reviewCount);
    }

    return {
      products: filtered,
      total: filtered.length,
    };
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      if (process.env.DATABASE_URL && process.env.NEXT_PUBLIC_USE_MOCK_FALLBACK !== "true") {
        const product = await prisma.product.findUnique({
          where: { slug },
          include: {
            images: { orderBy: { displayOrder: "asc" } },
            variants: true,
            store: true,
            category: true,
            reviews: {
              include: { user: true },
              orderBy: { createdAt: "desc" },
            },
          },
        });
        if (product) return product as unknown as Product;
      }
    } catch {
      // Fallback
    }

    return localProducts.find((p) => p.slug === slug) || null;
  },

  async getProductById(id: string): Promise<Product | null> {
    return localProducts.find((p) => p.id === id) || null;
  },

  async getProductsBySeller(sellerId: string): Promise<Product[]> {
    return localProducts.filter((p) => p.sellerId === sellerId);
  },

  async createProduct(data: {
    title: string;
    slug: string;
    description: string;
    shortDescription?: string | null;
    price: number;
    comparePrice?: number | null;
    sku?: string;
    stock: number;
    status?: ProductStatus;
    featured?: boolean;
    tags?: string[];
    sellerId: string;
    categoryId: string;
    imageUrl?: string;
  }): Promise<Product> {
    const newProduct: Product = {
      id: `prod_${Date.now()}`,
      title: data.title,
      slug: data.slug,
      description: data.description,
      shortDescription: data.shortDescription,
      price: data.price,
      comparePrice: data.comparePrice,
      sku: data.sku,
      stock: data.stock,
      status: data.status || "ACTIVE",
      featured: data.featured || false,
      tags: data.tags || [],
      rating: 5.0,
      reviewCount: 0,
      sellerId: data.sellerId,
      categoryId: data.categoryId,
      images: [
        {
          id: `img_${Date.now()}`,
          url:
            data.imageUrl ||
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
          altText: data.title,
          isPrimary: true,
          order: 0,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localProducts.unshift(newProduct);
    return newProduct;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const index = localProducts.findIndex((p) => p.id === id);
    if (index === -1) return null;

    localProducts[index] = {
      ...localProducts[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return localProducts[index];
  },

  async deleteProduct(id: string): Promise<boolean> {
    const initialLen = localProducts.length;
    localProducts = localProducts.filter((p) => p.id !== id);
    return localProducts.length < initialLen;
  },
};

import { prisma } from "@/lib/db/prisma";
import { MOCK_PRODUCTS } from "@/lib/db/mock-data";
import type { Product, ProductFilterParams, ProductStatus, SellerProfile, ProductImage } from "@/types";

// In-memory working copy for local dev updates or offline fallback
let localProducts: Product[] = [...MOCK_PRODUCTS];

// Helper to convert Prisma DB item (with Decimal & store relation) to Product interface
function mapPrismaProduct(item: any): Product {
  const images: ProductImage[] = (item.images || []).map((img: any) => ({
    id: img.id,
    url: img.url,
    altText: img.altText || item.title,
    isPrimary: img.isPrimary,
    order: img.displayOrder ?? 0,
  }));

  const seller: SellerProfile = {
    id: item.store?.id || item.storeId,
    userId: item.store?.sellerProfile?.userId || "",
    storeName: item.store?.name || "Verified Merchant",
    slug: item.store?.slug || "store",
    description: item.store?.description,
    logo: item.store?.logo || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
    banner: item.store?.banner || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80",
    email: item.store?.sellerProfile?.businessEmail,
    phone: item.store?.sellerProfile?.businessPhone,
    commissionRate: item.store?.commissionRate ? Number(item.store.commissionRate) : 10,
    status: item.store?.isActive ? "APPROVED" : "PENDING",
    rating: item.store?.rating ? Number(item.store.rating) : 5.0,
    reviewCount: item.store?.reviewCount ?? 0,
    totalSales: item.store?.totalSales ? Number(item.store.totalSales) : 0,
  };

  // Stock calculation from inventories
  const stock = item.inventories && item.inventories.length > 0
    ? item.inventories.reduce((acc: number, inv: any) => acc + (inv.quantity - inv.reserved), 0)
    : 25;

  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    description: item.description,
    shortDescription: item.shortDescription,
    price: Number(item.price),
    comparePrice: item.comparePrice ? Number(item.comparePrice) : null,
    sku: item.sku,
    stock: stock > 0 ? stock : 0,
    status: (item.status as ProductStatus) || "ACTIVE",
    featured: item.featured ?? false,
    tags: item.tags || [],
    rating: Number(item.rating || 5.0),
    reviewCount: item.reviewCount || 0,
    sellerId: item.storeId,
    seller,
    categoryId: item.categoryId,
    category: item.category
      ? {
          id: item.category.id,
          name: item.category.name,
          slug: item.category.slug,
          description: item.category.description,
          image: item.category.image,
          icon: item.category.icon,
          featured: item.category.featured,
        }
      : undefined,
    images: images.length > 0
      ? images
      : [
          {
            id: `img_${item.id}`,
            url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
            isPrimary: true,
            order: 0,
          },
        ],
    variants: (item.variants || []).map((v: any) => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      price: Number(v.price),
      stock: 15,
      options: v.options as Record<string, string>,
    })),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export const productService = {
  async getProducts(params: ProductFilterParams = {}): Promise<{
    products: Product[];
    total: number;
  }> {
    try {
      // Query Neon PostgreSQL if connection is present
      if (process.env.DATABASE_URL && process.env.NEXT_PUBLIC_USE_MOCK_FALLBACK !== "true") {
        const whereClause: any = {
          status: "ACTIVE",
        };

        if (params.category) {
          whereClause.category = { slug: params.category };
        }
        if (params.seller) {
          whereClause.store = { slug: params.seller };
        }
        if (params.brand) {
          whereClause.tags = { has: params.brand };
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
        if (params.minPrice !== undefined || params.maxPrice !== undefined) {
          whereClause.price = {};
          if (params.minPrice !== undefined) whereClause.price.gte = params.minPrice;
          if (params.maxPrice !== undefined) whereClause.price.lte = params.maxPrice;
        }
        if (params.rating !== undefined) {
          whereClause.rating = { gte: params.rating };
        }

        let orderBy: any = { createdAt: "desc" };
        if (params.sort === "price-asc") orderBy = { price: "asc" };
        else if (params.sort === "price-desc") orderBy = { price: "desc" };
        else if (params.sort === "rating") orderBy = { rating: "desc" };
        else if (params.sort === "popular") orderBy = { reviewCount: "desc" };
        else if (params.sort === "bestselling") orderBy = { reviewCount: "desc" };

        const limit = params.limit || 24;
        const page = params.page || 1;

        const [items, count] = await Promise.all([
          prisma.product.findMany({
            where: whereClause,
            include: {
              images: { orderBy: { displayOrder: "asc" } },
              variants: true,
              store: {
                include: { sellerProfile: true },
              },
              category: true,
              inventories: true,
            },
            orderBy,
            take: limit,
            skip: (page - 1) * limit,
          }),
          prisma.product.count({ where: whereClause }),
        ]);

        if (items && items.length > 0) {
          return {
            products: items.map(mapPrismaProduct),
            total: count,
          };
        }
      }
    } catch (error) {
      // Gracefully fall back to local store
      console.warn("Neon PostgreSQL product query fallback:", error);
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

    if (params.brand) {
      const b = params.brand.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.tags.some((t) => t.toLowerCase().includes(b)) ||
          p.title.toLowerCase().includes(b)
      );
    }

    if (params.discount) {
      filtered = filtered.filter((p) => {
        if (!p.comparePrice || p.comparePrice <= p.price) return false;
        const discountPct = Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100);
        return discountPct >= params.discount!;
      });
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
    } else if (params.sort === "bestselling") {
      filtered.sort((a, b) => (b.reviewCount * (b.rating || 1)) - (a.reviewCount * (a.rating || 1)));
    } else if (params.sort === "newest") {
      filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }

    const total = filtered.length;
    const page = params.page || 1;
    const limit = params.limit || 24;
    const paginated = filtered.slice((page - 1) * limit, page * limit);

    return {
      products: paginated,
      total,
    };
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      if (process.env.DATABASE_URL && process.env.NEXT_PUBLIC_USE_MOCK_FALLBACK !== "true") {
        const item = await prisma.product.findUnique({
          where: { slug },
          include: {
            images: { orderBy: { displayOrder: "asc" } },
            variants: true,
            store: {
              include: { sellerProfile: true },
            },
            category: true,
            inventories: true,
            reviews: {
              include: { user: true },
              orderBy: { createdAt: "desc" },
            },
          },
        });
        if (item) return mapPrismaProduct(item);
      }
    } catch (error) {
      console.warn("Neon PostgreSQL product by slug fallback:", error);
    }

    return localProducts.find((p) => p.slug === slug) || null;
  },

  async getProductById(id: string): Promise<Product | null> {
    try {
      if (process.env.DATABASE_URL && process.env.NEXT_PUBLIC_USE_MOCK_FALLBACK !== "true") {
        const item = await prisma.product.findUnique({
          where: { id },
          include: {
            images: { orderBy: { displayOrder: "asc" } },
            variants: true,
            store: {
              include: { sellerProfile: true },
            },
            category: true,
            inventories: true,
          },
        });
        if (item) return mapPrismaProduct(item);
      }
    } catch {
      // Fallback
    }

    return localProducts.find((p) => p.id === id) || null;
  },

  async getProductsBySeller(sellerSlugOrId: string): Promise<Product[]> {
    try {
      if (process.env.DATABASE_URL && process.env.NEXT_PUBLIC_USE_MOCK_FALLBACK !== "true") {
        const items = await prisma.product.findMany({
          where: {
            OR: [
              { storeId: sellerSlugOrId },
              { store: { slug: sellerSlugOrId } },
            ],
            status: "ACTIVE",
          },
          include: {
            images: { orderBy: { displayOrder: "asc" } },
            variants: true,
            store: {
              include: { sellerProfile: true },
            },
            category: true,
            inventories: true,
          },
        });
        if (items && items.length > 0) {
          return items.map(mapPrismaProduct);
        }
      }
    } catch {
      // Fallback
    }

    return localProducts.filter(
      (p) => p.sellerId === sellerSlugOrId || p.seller?.slug === sellerSlugOrId
    );
  },

  async getRelatedProducts(productId: string, categoryId: string, limit = 4): Promise<Product[]> {
    try {
      if (process.env.DATABASE_URL && process.env.NEXT_PUBLIC_USE_MOCK_FALLBACK !== "true") {
        const items = await prisma.product.findMany({
          where: {
            categoryId,
            id: { not: productId },
            status: "ACTIVE",
          },
          include: {
            images: { orderBy: { displayOrder: "asc" } },
            variants: true,
            store: {
              include: { sellerProfile: true },
            },
            category: true,
            inventories: true,
          },
          take: limit,
        });
        if (items && items.length > 0) {
          return items.map(mapPrismaProduct);
        }
      }
    } catch {
      // Fallback
    }

    return localProducts
      .filter((p) => p.categoryId === categoryId && p.id !== productId)
      .slice(0, limit);
  },

  async createProduct(data: {
    title: string;
    slug?: string;
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
    const slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const newProduct: Product = {
      id: `prod_${Date.now()}`,
      title: data.title,
      slug,
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

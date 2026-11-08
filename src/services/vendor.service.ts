import { prisma } from "@/lib/db/prisma";
import { MOCK_SELLERS, MOCK_ORDERS } from "@/lib/db/mock-data";
import { SellerProfile, SellerMetrics, SellerStatus } from "@/types";
import { productService } from "./product.service";

let localSellers: SellerProfile[] = [...MOCK_SELLERS];

function mapPrismaStore(store: any): SellerProfile {
  return {
    id: store.id,
    userId: store.sellerProfile?.userId || "",
    storeName: store.name,
    slug: store.slug,
    description: store.description || "",
    logo: store.logo || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
    banner: store.banner || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80",
    email: store.sellerProfile?.businessEmail || "merchant@proventure.in",
    phone: store.sellerProfile?.businessPhone || "+91 98765 43210",
    city: "Bengaluru",
    state: "Karnataka",
    postalCode: "560001",
    commissionRate: store.commissionRate ? Number(store.commissionRate) : 10,
    status: store.isActive ? "APPROVED" : "PENDING",
    rating: store.rating ? Number(store.rating) : 5.0,
    reviewCount: store.reviewCount || 0,
    totalSales: store.totalSales ? Number(store.totalSales) : 0,
    createdAt: store.createdAt,
  };
}

export const vendorService = {
  async getAllVendors(): Promise<SellerProfile[]> {
    try {
      if (process.env.DATABASE_URL && process.env.NEXT_PUBLIC_USE_MOCK_FALLBACK !== "true") {
        const stores = await prisma.store.findMany({
          include: { sellerProfile: true },
          orderBy: { createdAt: "desc" },
        });
        if (stores && stores.length > 0) {
          return stores.map(mapPrismaStore);
        }
      }
    } catch (e) {
      console.warn("Neon PostgreSQL getAllVendors fallback:", e);
    }
    return localSellers;
  },

  async getApprovedVendors(): Promise<SellerProfile[]> {
    try {
      if (process.env.DATABASE_URL && process.env.NEXT_PUBLIC_USE_MOCK_FALLBACK !== "true") {
        const stores = await prisma.store.findMany({
          where: { isActive: true },
          include: { sellerProfile: true },
          orderBy: { rating: "desc" },
        });
        if (stores && stores.length > 0) {
          return stores.map(mapPrismaStore);
        }
      }
    } catch {
      // Fallback
    }
    return localSellers.filter((s) => s.status === "APPROVED");
  },

  async getVendorBySlug(slug: string): Promise<SellerProfile | null> {
    try {
      if (process.env.DATABASE_URL && process.env.NEXT_PUBLIC_USE_MOCK_FALLBACK !== "true") {
        const store = await prisma.store.findUnique({
          where: { slug },
          include: { sellerProfile: true },
        });
        if (store) return mapPrismaStore(store);
      }
    } catch {
      // Fallback
    }
    return localSellers.find((s) => s.slug === slug) || null;
  },

  async getVendorById(id: string): Promise<SellerProfile | null> {
    try {
      if (process.env.DATABASE_URL && process.env.NEXT_PUBLIC_USE_MOCK_FALLBACK !== "true") {
        const store = await prisma.store.findUnique({
          where: { id },
          include: { sellerProfile: true },
        });
        if (store) return mapPrismaStore(store);
      }
    } catch {
      // Fallback
    }
    return localSellers.find((s) => s.id === id) || null;
  },

  async getVendorMetrics(sellerId: string): Promise<SellerMetrics> {
    const products = await productService.getProductsBySeller(sellerId);
    
    // Find all orders containing this vendor's items
    const sellerOrders = MOCK_ORDERS.filter((order) =>
      order.items.some((item) => item.sellerId === sellerId)
    );

    let totalRevenue = 0;
    sellerOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (item.sellerId === sellerId) {
          totalRevenue += item.total;
        }
      });
    });

    const vendor = await this.getVendorById(sellerId);
    const commissionRate = vendor?.commissionRate ?? 10;
    const netEarnings = Math.round(totalRevenue * (1 - commissionRate / 100));

    const pendingOrders = sellerOrders.filter(
      (o) => o.status === "PENDING" || o.status === "PROCESSING"
    ).length;

    return {
      totalRevenue: totalRevenue || (vendor?.totalSales ?? 125000),
      netEarnings: netEarnings || Math.round((vendor?.totalSales ?? 125000) * 0.9),
      totalOrders: sellerOrders.length || 18,
      pendingOrders,
      activeProducts: products.length || 4,
      rating: vendor?.rating ?? 4.9,
      recentOrders: sellerOrders,
    };
  },

  async updateVendorStatus(sellerId: string, status: SellerStatus): Promise<SellerProfile | null> {
    const index = localSellers.findIndex((s) => s.id === sellerId);
    if (index === -1) return null;
    localSellers[index].status = status;
    return localSellers[index];
  },

  async updateCommissionRate(sellerId: string, rate: number): Promise<SellerProfile | null> {
    const index = localSellers.findIndex((s) => s.id === sellerId);
    if (index === -1) return null;
    localSellers[index].commissionRate = rate;
    return localSellers[index];
  },

  async createVendor(data: {
    userId: string;
    storeName: string;
    slug: string;
    description?: string;
    email: string;
    phone: string;
    city: string;
    state: string;
    postalCode: string;
  }): Promise<SellerProfile> {
    const newVendor: SellerProfile = {
      id: `seller_${Date.now()}`,
      userId: data.userId,
      storeName: data.storeName,
      slug: data.slug,
      description: data.description,
      logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
      banner: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80",
      email: data.email,
      phone: data.phone,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
      commissionRate: 10,
      status: "PENDING",
      rating: 5.0,
      reviewCount: 0,
      totalSales: 0,
      createdAt: new Date().toISOString(),
    };

    localSellers.push(newVendor);
    return newVendor;
  },
};

import { prisma } from "@/lib/db/prisma";
import { MOCK_USERS, MOCK_SELLERS, MOCK_ORDERS, MOCK_PRODUCTS } from "@/lib/db/mock-data";
import { User, SellerProfile, Order, Product, Role } from "@/types";

export interface AdminUserRecord extends User {
  status: "ACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION";
  totalOrders?: number;
  totalSpent?: number;
  lastLogin?: string;
}

export interface AdminAuditLog {
  id: string;
  adminName: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  timestamp: string;
  ipAddress: string;
}

// In-memory working copies
let localUsers: AdminUserRecord[] = MOCK_USERS.map((u, i) => ({
  ...u,
  status: "ACTIVE",
  totalOrders: u.role === "CUSTOMER" ? 4 : u.role === "SELLER" ? 18 : 0,
  totalSpent: u.role === "CUSTOMER" ? 38996 : 0,
  lastLogin: i === 0 ? "Just now" : `${i * 2 + 1} hours ago`,
}));

// Additional mock users for rich administrative directory
if (!localUsers.some((u) => u.id === "usr_cust_2")) {
  localUsers.push(
    {
      id: "usr_cust_2",
      name: "Rahul Verma",
      email: "rahul.verma@example.com",
      role: "CUSTOMER",
      status: "ACTIVE",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      phone: "+91 98765 43210",
      totalOrders: 2,
      totalSpent: 18498,
      lastLogin: "1 day ago",
      createdAt: "2024-02-10T00:00:00Z",
    },
    {
      id: "usr_cust_3",
      name: "Ananya Iyer",
      email: "ananya.iyer@example.com",
      role: "CUSTOMER",
      status: "ACTIVE",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      phone: "+91 98450 12345",
      totalOrders: 1,
      totalSpent: 8999,
      lastLogin: "3 days ago",
      createdAt: "2024-02-15T00:00:00Z",
    },
    {
      id: "usr_cust_4",
      name: "Vikram Malhotra",
      email: "vikram.m@example.com",
      role: "CUSTOMER",
      status: "SUSPENDED",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
      phone: "+91 97110 54321",
      totalOrders: 3,
      totalSpent: 26497,
      lastLogin: "2 weeks ago",
      createdAt: "2024-02-20T00:00:00Z",
    }
  );
}

let localAuditLogs: AdminAuditLog[] = [
  {
    id: "audit_1",
    adminName: "Alex Vane (Super Admin)",
    action: "VENDOR_APPROVED",
    entityType: "SellerProfile",
    entityId: "seller_technexus",
    details: "Approved merchant TechNexus Innovations with verified GSTIN 29ABCDE1234F1Z5.",
    timestamp: "Today, 08:30 AM",
    ipAddress: "192.168.1.1 (Admin HQ)",
  },
  {
    id: "audit_2",
    adminName: "Alex Vane (Super Admin)",
    action: "COMMISSION_UPDATED",
    entityType: "Store",
    entityId: "store_luxe",
    details: "Adjusted platform commission from 12% to standard 10% promotional tier.",
    timestamp: "Yesterday, 04:15 PM",
    ipAddress: "192.168.1.1 (Admin HQ)",
  },
  {
    id: "audit_3",
    adminName: "Alex Vane (Super Admin)",
    action: "USER_SUSPENDED",
    entityType: "User",
    entityId: "usr_cust_4",
    details: "Suspended Vikram Malhotra due to suspicious chargeback dispute pattern.",
    timestamp: "2 days ago",
    ipAddress: "192.168.1.1 (Admin HQ)",
  },
  {
    id: "audit_4",
    adminName: "Alex Vane (Super Admin)",
    action: "PRODUCT_APPROVED",
    entityType: "Product",
    entityId: "prod_headphones",
    details: "Reviewed and approved Aura Spatial Wireless Headphones catalog compliance.",
    timestamp: "3 days ago",
    ipAddress: "192.168.1.1 (Admin HQ)",
  },
];

export const adminService = {
  // 1. Users
  async getUsers(params: { role?: string; status?: string; search?: string } = {}): Promise<AdminUserRecord[]> {
    try {
      if (process.env.DATABASE_URL && process.env.NEXT_PUBLIC_USE_MOCK_FALLBACK !== "true") {
        const whereClause: any = {};
        if (params.role && params.role !== "ALL") whereClause.role = params.role as any;
        if (params.status && params.status !== "ALL") whereClause.status = params.status as any;
        if (params.search) {
          whereClause.OR = [
            { name: { contains: params.search, mode: "insensitive" } },
            { email: { contains: params.search, mode: "insensitive" } },
          ];
        }

        const dbUsers = await prisma.user.findMany({
          where: whereClause,
          include: {
            orders: { select: { id: true, total: true } },
          },
          orderBy: { createdAt: "desc" },
        });

        if (dbUsers && dbUsers.length > 0) {
          return dbUsers.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            status: u.status as any,
            image: u.image,
            phone: u.phone,
            createdAt: u.createdAt,
            totalOrders: u.orders?.length || 0,
            totalSpent: u.orders?.reduce((sum, o) => sum + Number(o.total), 0) || 0,
          }));
        }
      }
    } catch {
      // Fallback
    }

    return localUsers.filter((u) => {
      if (params.role && params.role !== "ALL" && u.role !== params.role) return false;
      if (params.status && params.status !== "ALL" && u.status !== params.status) return false;
      if (params.search) {
        const q = params.search.toLowerCase();
        if (!u.name?.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  },

  async updateUserStatus(userId: string, status: "ACTIVE" | "SUSPENDED"): Promise<AdminUserRecord | null> {
    try {
      if (process.env.DATABASE_URL && process.env.NEXT_PUBLIC_USE_MOCK_FALLBACK !== "true") {
        const updated = await prisma.user.update({
          where: { id: userId },
          data: { status },
        });
        if (updated) {
          return {
            id: updated.id,
            name: updated.name,
            email: updated.email,
            role: updated.role,
            status: updated.status as any,
            image: updated.image,
            phone: updated.phone,
            createdAt: updated.createdAt,
          };
        }
      }
    } catch {
      // Fallback
    }

    const idx = localUsers.findIndex((u) => u.id === userId);
    if (idx === -1) return null;
    localUsers[idx].status = status;

    // Log action
    this.recordAuditLog({
      adminName: "Alex Vane (Super Admin)",
      action: status === "SUSPENDED" ? "USER_SUSPENDED" : "USER_REACTIVATED",
      entityType: "User",
      entityId: userId,
      details: `${status === "SUSPENDED" ? "Suspended" : "Reactivated"} user account ${localUsers[idx].email}.`,
    });

    return localUsers[idx];
  },

  // 2. Audit Logs
  async getAuditLogs(): Promise<AdminAuditLog[]> {
    return localAuditLogs;
  },

  recordAuditLog(log: {
    adminName: string;
    action: string;
    entityType: string;
    entityId: string;
    details: string;
    ip?: string;
  }) {
    const newLog: AdminAuditLog = {
      id: `audit_${Date.now()}`,
      adminName: log.adminName || "Alex Vane (Super Admin)",
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      details: log.details,
      timestamp: "Just now",
      ipAddress: log.ip || "192.168.1.1 (Admin HQ)",
    };
    localAuditLogs.unshift(newLog);
    return newLog;
  },

  // 3. Macro Platform Telemetry
  async getPlatformMetrics() {
    const totalGMV = MOCK_SELLERS.reduce((sum, s) => sum + s.totalSales, 0);
    const platformCommissions = Math.round(totalGMV * 0.1);
    const totalCustomers = localUsers.filter((u) => u.role === "CUSTOMER").length;
    const totalSellers = MOCK_SELLERS.length;
    const pendingSellers = MOCK_SELLERS.filter((s) => s.status === "PENDING").length;
    const totalProducts = MOCK_PRODUCTS.length;
    const totalOrders = MOCK_ORDERS.length;
    const pendingOrders = MOCK_ORDERS.filter(
      (o) => o.status === "PENDING" || o.status === "PROCESSING" || o.status === "CONFIRMED"
    ).length;

    return {
      totalGMV,
      platformCommissions,
      totalCustomers,
      totalSellers,
      pendingSellers,
      totalProducts,
      totalOrders,
      pendingOrders,
    };
  },

  // 4. Disputes Resolution
  async resolveDispute(
    orderId: string,
    resolution: "REFUND_BUYER" | "RELEASE_TO_SELLER" | "CANCELLED",
    notes: string
  ): Promise<{ success: boolean; message: string }> {
    const order = MOCK_ORDERS.find((o) => o.id === orderId);
    if (!order) return { success: false, message: "Order not found" };

    if (resolution === "REFUND_BUYER") {
      order.status = "REFUNDED";
      order.paymentStatus = "REFUNDED";
    } else if (resolution === "CANCELLED") {
      order.status = "CANCELLED";
    }

    this.recordAuditLog({
      adminName: "Alex Vane (Super Admin)",
      action: "DISPUTE_RESOLVED",
      entityType: "Order",
      entityId: orderId,
      details: `Dispute resolved with ${resolution}. Notes: ${notes}`,
    });

    return {
      success: true,
      message: `Dispute for order ${order.orderNumber} successfully resolved with outcome: ${resolution}.`,
    };
  },
};

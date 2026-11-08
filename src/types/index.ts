export type Role = "CUSTOMER" | "SELLER" | "ADMIN";

export type SellerStatus = "PENDING" | "APPROVED" | "SUSPENDED" | "REJECTED";

export type ProductStatus = "DRAFT" | "ACTIVE" | "ARCHIVED" | "OUT_OF_STOCK";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURN_REQUESTED"
  | "RETURNED"
  | "REFUNDED";

export type PaymentStatus =
  | "PENDING"
  | "AUTHORIZED"
  | "PAID"
  | "FAILED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

export type PayoutStatus = "PENDING" | "PROCESSING" | "PAID" | "FAILED";

export interface User {
  id: string;
  name: string | null;
  email: string;
  image?: string | null;
  phone?: string | null;
  role: Role;
  createdAt?: string | Date;
}

export interface SellerProfile {
  id: string;
  userId: string;
  storeName: string;
  slug: string;
  description?: string | null;
  logo?: string | null;
  banner?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  commissionRate: number;
  status: SellerStatus;
  rating: number;
  reviewCount: number;
  totalSales: number;
  createdAt?: string | Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  icon?: string | null;
  parentId?: string | null;
  featured?: boolean;
  productCount?: number;
}

export interface ProductImage {
  id: string;
  url: string;
  altText?: string | null;
  isPrimary: boolean;
  order: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku?: string | null;
  price: number;
  stock: number;
  options?: Record<string, string>;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string | null;
  price: number;
  comparePrice?: number | null;
  sku?: string | null;
  stock: number;
  status: ProductStatus;
  featured?: boolean;
  tags: string[];
  rating: number;
  reviewCount: number;
  sellerId: string;
  seller?: SellerProfile;
  categoryId: string;
  category?: Category;
  images: ProductImage[];
  variants?: ProductVariant[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface ProductFilterParams {
  category?: string;
  seller?: string;
  search?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  discount?: number;
  sort?: "newest" | "price-asc" | "price-desc" | "rating" | "popular" | "bestselling";
  featured?: boolean;
  inStock?: boolean;
  page?: number;
  limit?: number;
}

export interface SearchAutocompleteResult {
  query: string;
  suggestions: string[];
  products: Array<{
    id: string;
    title: string;
    slug: string;
    price: number;
    comparePrice?: number | null;
    image: string;
    categoryName?: string;
    sellerName?: string;
    rating?: number;
  }>;
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    productCount?: number;
  }>;
  sellers: Array<{
    id: string;
    storeName: string;
    slug: string;
    logo?: string | null;
    rating?: number;
  }>;
}

export interface CartItem {
  id: string; // unique item key (productId + variantId)
  productId: string;
  variantId?: string;
  title: string;
  price: number;
  comparePrice?: number | null;
  image: string;
  quantity: number;
  sellerId: string;
  sellerName: string;
  stock: number;
  variantName?: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  sellerId: string;
  title: string;
  price: number;
  quantity: number;
  total: number;
  variantName?: string | null;
  fulfillmentStatus: OrderStatus;
  trackingNumber?: string | null;
  carrier?: string | null;
  product?: Partial<Product>;
  seller?: Partial<SellerProfile>;
}

export interface OrderStatusHistoryItem {
  id: string;
  orderId: string;
  orderItemId?: string | null;
  previousStatus: OrderStatus | null;
  newStatus: OrderStatus;
  changedBy: string;
  changedByName?: string | null;
  changedByRole?: "CUSTOMER" | "SELLER" | "ADMIN" | "SYSTEM" | string | null;
  description?: string | null;
  timestamp: string | Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customer?: Partial<User>;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  shippingFee: number;
  tax: number;
  discount: number;
  total: number;
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  notes?: string | null;
  items: OrderItem[];
  statusHistory?: OrderStatusHistoryItem[];
  cancellationReason?: string | null;
  returnReason?: string | null;
  refundStatus?: "NONE" | "REQUESTED" | "APPROVED" | "PROCESSED" | "REJECTED";
  refundAmount?: number | null;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface Review {
  id: string;
  productId: string;
  customerId: string;
  orderId?: string | null;
  orderItemId?: string | null;
  customer?: {
    name: string | null;
    image?: string | null;
  };
  rating: number;
  title?: string | null;
  comment: string;
  verifiedPurchase: boolean;
  sellerResponse?: string | null;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface Payout {
  id: string;
  sellerId: string;
  seller?: Partial<SellerProfile>;
  amount: number;
  commissionDeducted: number;
  netAmount: number;
  status: PayoutStatus;
  referenceNumber?: string | null;
  notes?: string | null;
  createdAt: string | Date;
}

export interface MarketplaceMetrics {
  totalRevenue: number;
  platformCommissions: number;
  totalOrders: number;
  activeVendors: number;
  totalProducts: number;
  totalCustomers: number;
  recentOrders: Order[];
}

export interface SellerMetrics {
  totalRevenue: number;
  netEarnings: number;
  totalOrders: number;
  pendingOrders: number;
  activeProducts: number;
  rating: number;
  recentOrders: Order[];
}

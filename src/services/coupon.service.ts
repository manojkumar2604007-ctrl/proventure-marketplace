import { prisma } from "@/lib/db/prisma";

export interface ValidatedCouponResult {
  valid: boolean;
  error?: string;
  coupon?: {
    id: string;
    code: string;
    description?: string | null;
    discountType: "PERCENTAGE" | "FIXED_AMOUNT";
    discountValue: number;
    discountAmount: number;
  };
}

interface FallbackCoupon {
  id: string;
  code: string;
  description: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  isActive: boolean;
  startDate: Date;
  endDate: Date;
}

const FALLBACK_COUPONS: FallbackCoupon[] = [
  {
    id: "cpn_proventure500",
    code: "PROVENTURE500",
    description: "Flat ₹500 discount on orders over ₹1,500",
    discountType: "FIXED_AMOUNT",
    discountValue: 500,
    minOrderAmount: 1500,
    isActive: true,
    startDate: new Date("2024-01-01"),
    endDate: new Date("2028-12-31"),
  },
  {
    id: "cpn_technexus15",
    code: "TECHNEXUS15",
    description: "15% discount on electronics up to ₹1,500",
    discountType: "PERCENTAGE",
    discountValue: 15,
    minOrderAmount: 1999,
    maxDiscount: 1500,
    isActive: true,
    startDate: new Date("2024-01-01"),
    endDate: new Date("2028-12-31"),
  },
  {
    id: "cpn_launch20",
    code: "LAUNCH20",
    description: "20% discount on first orders up to ₹2,000",
    discountType: "PERCENTAGE",
    discountValue: 20,
    minOrderAmount: 999,
    maxDiscount: 2000,
    isActive: true,
    startDate: new Date("2024-01-01"),
    endDate: new Date("2028-12-31"),
  },
  {
    id: "cpn_freeship",
    code: "FREESHIP",
    description: "Free standard shipping on orders over ₹499",
    discountType: "FIXED_AMOUNT",
    discountValue: 149,
    minOrderAmount: 499,
    isActive: true,
    startDate: new Date("2024-01-01"),
    endDate: new Date("2028-12-31"),
  },
];

export const couponService = {
  async validateCoupon(code: string, subtotal: number): Promise<ValidatedCouponResult> {
    if (!code || typeof code !== "string") {
      return { valid: false, error: "Please enter a valid coupon code" };
    }

    const cleanCode = code.trim().toUpperCase();
    const now = new Date();

    // 1. Try fetching from Neon PostgreSQL
    try {
      if (process.env.DATABASE_URL && process.env.NEXT_PUBLIC_USE_MOCK_FALLBACK !== "true") {
        const dbCoupon = await prisma.coupon.findUnique({
          where: { code: cleanCode },
        });

        if (dbCoupon) {
          if (!dbCoupon.isActive) {
            return { valid: false, error: "This coupon is no longer active" };
          }

          if (dbCoupon.startDate > now || dbCoupon.endDate < now) {
            return { valid: false, error: "This coupon has expired or is not yet valid" };
          }

          if (dbCoupon.usageLimit && dbCoupon.usedCount >= dbCoupon.usageLimit) {
            return { valid: false, error: "This coupon has reached its maximum usage limit" };
          }

          const minOrder = dbCoupon.minOrderAmount ? Number(dbCoupon.minOrderAmount) : 0;
          if (subtotal < minOrder) {
            return {
              valid: false,
              error: `Minimum order amount of ₹${minOrder.toLocaleString("en-IN")} required for this voucher`,
            };
          }

          let discountAmount = 0;
          const discountVal = Number(dbCoupon.discountValue);
          if (dbCoupon.discountType === "PERCENTAGE") {
            discountAmount = (subtotal * discountVal) / 100;
            if (dbCoupon.maxDiscount && discountAmount > Number(dbCoupon.maxDiscount)) {
              discountAmount = Number(dbCoupon.maxDiscount);
            }
          } else {
            discountAmount = Math.min(subtotal, discountVal);
          }

          return {
            valid: true,
            coupon: {
              id: dbCoupon.id,
              code: dbCoupon.code,
              description: dbCoupon.description,
              discountType: dbCoupon.discountType as "PERCENTAGE" | "FIXED_AMOUNT",
              discountValue: discountVal,
              discountAmount: Math.round(discountAmount),
            },
          };
        }
      }
    } catch (err) {
      console.warn("DB coupon check failed, falling back to local registry:", err);
    }

    // 2. Check Fallback Registry
    const fallback = FALLBACK_COUPONS.find((c) => c.code === cleanCode);
    if (!fallback) {
      return { valid: false, error: `Invalid coupon code "${cleanCode}". Try PROVENTURE500 or TECHNEXUS15.` };
    }

    if (!fallback.isActive || fallback.startDate > now || fallback.endDate < now) {
      return { valid: false, error: "This coupon has expired" };
    }

    if (fallback.minOrderAmount && subtotal < fallback.minOrderAmount) {
      return {
        valid: false,
        error: `Minimum order of ₹${fallback.minOrderAmount.toLocaleString("en-IN")} required to use "${fallback.code}"`,
      };
    }

    let discountAmount = 0;
    if (fallback.discountType === "PERCENTAGE") {
      discountAmount = (subtotal * fallback.discountValue) / 100;
      if (fallback.maxDiscount && discountAmount > fallback.maxDiscount) {
        discountAmount = fallback.maxDiscount;
      }
    } else {
      discountAmount = Math.min(subtotal, fallback.discountValue);
    }

    return {
      valid: true,
      coupon: {
        id: fallback.id,
        code: fallback.code,
        description: fallback.description,
        discountType: fallback.discountType,
        discountValue: fallback.discountValue,
        discountAmount: Math.round(discountAmount),
      },
    };
  },
};

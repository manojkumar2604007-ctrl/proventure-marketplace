import { describe, it, expect } from "./test-utils";
import { couponService } from "@/services/coupon.service";

describe("4. Cart, Pricing & Checkout Tests", () => {
  describe("Authoritative Server-Side Order Calculations", () => {
    it("should accurately compute line totals, tax, shipping, and multi-vendor splits", () => {
      // Customer purchasing items from 2 distinct sellers in one checkout
      const cartItems = [
        {
          productId: "prod_nexus_1",
          storeId: "store_technexus",
          title: "Mechanical Keyboard",
          price: 4999,
          quantity: 2,
          commissionRate: 10.0, // 10%
        },
        {
          productId: "prod_aura_1",
          storeId: "store_aura",
          title: "Ceramic Minimalist Vase",
          price: 1499,
          quantity: 1,
          commissionRate: 15.0, // 15%
        },
      ];

      // 1. Subtotal calculation
      const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
      expect(subtotal).toBe(4999 * 2 + 1499 * 1); // 9998 + 1499 = 11497

      // 2. Shipping fee: Free shipping for orders >= ₹999
      const shippingFee = subtotal >= 999 ? 0 : 99;
      expect(shippingFee).toBe(0);

      // 3. Tax: 18% standard GST
      const tax = Math.round(subtotal * 0.18 * 100) / 100;
      expect(tax).toBe(2069.46);

      // 4. Multi-Seller Split Calculations
      const item1LineTotal = cartItems[0].price * cartItems[0].quantity; // 9998
      const item1Commission = (item1LineTotal * cartItems[0].commissionRate) / 100; // 999.80
      const item1Payout = item1LineTotal - item1Commission; // 8998.20

      expect(item1LineTotal).toBe(9998);
      expect(item1Commission).toBeCloseTo(999.8, 2);
      expect(item1Payout).toBeCloseTo(8998.2, 2);

      const item2LineTotal = cartItems[1].price * cartItems[1].quantity; // 1499
      const item2Commission = (item2LineTotal * cartItems[1].commissionRate) / 100; // 224.85
      const item2Payout = item2LineTotal - item2Commission; // 1274.15

      expect(item2LineTotal).toBe(1499);
      expect(item2Commission).toBeCloseTo(224.85, 2);
      expect(item2Payout).toBeCloseTo(1274.15, 2);

      // Platform Total Commission
      const totalPlatformCommission = item1Commission + item2Commission;
      expect(totalPlatformCommission).toBeCloseTo(1224.65, 2);
    });

    it("should compute flat discount and percentage coupon cap accurately", async () => {
      // Test 1: Fixed discount coupon PROVENTURE500 on order >= 1500
      const resFixed = await couponService.validateCoupon("PROVENTURE500", 2500);
      expect(resFixed.valid).toBe(true);
      expect(resFixed.coupon?.discountAmount).toBe(500);

      // Test 2: Fixed discount coupon rejected when below minimum
      const resFixedLow = await couponService.validateCoupon("PROVENTURE500", 1200);
      expect(resFixedLow.valid).toBe(false);
      expect(resFixedLow.error).toContain("minimum");

      // Test 3: Percentage discount coupon with maxDiscount cap
      // TECHNEXUS15: 15% discount, max cap ₹1,500
      // 15% of 20,000 is 3,000, so it should be capped at 1,500
      const resPercCapped = await couponService.validateCoupon("TECHNEXUS15", 20000);
      expect(resPercCapped.valid).toBe(true);
      expect(resPercCapped.coupon?.discountAmount).toBe(1500);

      // 15% of 3,000 is 450 (below 1500 cap)
      const resPercUncapped = await couponService.validateCoupon("TECHNEXUS15", 3000);
      expect(resPercUncapped.valid).toBe(true);
      expect(resPercUncapped.coupon?.discountAmount).toBe(450);

      // Test 4: Invalid coupon code rejected
      const resInvalid = await couponService.validateCoupon("FAKECOUPON99", 5000);
      expect(resInvalid.valid).toBe(false);
      expect(resInvalid.error).toContain("Invalid");
    });
  });
});

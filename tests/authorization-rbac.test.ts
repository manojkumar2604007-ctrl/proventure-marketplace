import { describe, it, expect } from "./test-utils";
import {
  validateResourceOwnership,
  validateStoreOwnership,
  type AuthenticatedUser,
} from "@/lib/auth/server-guard";

describe("2. Authorization & Role-Based Access Control (RBAC) Tests", () => {
  const customerUser: AuthenticatedUser = {
    id: "user_cust_123",
    name: "Customer John",
    email: "john@customer.com",
    role: "CUSTOMER",
    status: "ACTIVE",
  };

  const sellerUser: AuthenticatedUser = {
    id: "user_seller_456",
    name: "Seller Tech",
    email: "seller@technexus.com",
    role: "SELLER",
    status: "ACTIVE",
    storeId: "store_nexus_01",
    isSellerApproved: true,
  };

  const adminUser: AuthenticatedUser = {
    id: "user_admin_999",
    name: "Alex Vane",
    email: "admin@proventure.com",
    role: "ADMIN",
    status: "ACTIVE",
  };

  describe("Cross-User Data Access (Resource Ownership)", () => {
    it("should allow a customer to access their own private resources", () => {
      expect(validateResourceOwnership("user_cust_123", customerUser)).toBe(true);
    });

    it("should block a customer from accessing another customer's private records", () => {
      expect(() => {
        validateResourceOwnership("user_cust_attacker_999", customerUser);
      }).toThrow("Forbidden");
    });

    it("should permit administrators supervisory access to any user resource", () => {
      expect(validateResourceOwnership("user_cust_123", adminUser)).toBe(true);
      expect(validateResourceOwnership("user_seller_456", adminUser)).toBe(true);
    });
  });

  describe("Cross-Seller Data Access (Store Ownership)", () => {
    it("should allow a seller to manage their own store", async () => {
      const allowed = await validateStoreOwnership("store_nexus_01", sellerUser);
      expect(allowed).toBe(true);
    });

    it("should block a seller from modifying merchandise of another seller", async () => {
      await expect(
        validateStoreOwnership("store_competitor_888", sellerUser)
      ).rejects.toThrow("Forbidden");
    });

    it("should permit administrators supervisory access across all vendor stores", async () => {
      const adminAllowed = await validateStoreOwnership("store_competitor_888", adminUser);
      expect(adminAllowed).toBe(true);
    });
  });
});

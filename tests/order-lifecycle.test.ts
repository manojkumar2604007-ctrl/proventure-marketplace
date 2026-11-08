import { describe, it, expect } from "./test-utils";
import { orderService } from "@/services/order.service";
import { reviewService } from "@/services/review.service";

describe("6. Order Lifecycle & Status Transition Security Tests", () => {
  describe("State Transition Role & Sequence Validation", () => {
    it("should allow valid forward status progression by merchant/admin", () => {
      // PENDING -> CONFIRMED
      const check1 = orderService.validateStatusTransition("PENDING", "CONFIRMED", "SELLER");
      expect(check1.valid).toBe(true);

      // CONFIRMED -> PROCESSING
      const check2 = orderService.validateStatusTransition("CONFIRMED", "PROCESSING", "SELLER");
      expect(check2.valid).toBe(true);

      // PROCESSING -> SHIPPED
      const check3 = orderService.validateStatusTransition("PROCESSING", "SHIPPED", "SELLER");
      expect(check3.valid).toBe(true);

      // SHIPPED -> DELIVERED
      const check4 = orderService.validateStatusTransition("SHIPPED", "DELIVERED", "ADMIN");
      expect(check4.valid).toBe(true);
    });

    it("should block customers from marking orders as DELIVERED or SHIPPED", () => {
      const customerDeliveredCheck = orderService.validateStatusTransition(
        "SHIPPED",
        "DELIVERED",
        "CUSTOMER"
      );
      expect(customerDeliveredCheck.valid).toBe(false);
      expect(customerDeliveredCheck.error).toContain("Customer");

      const customerShippedCheck = orderService.validateStatusTransition(
        "PROCESSING",
        "SHIPPED",
        "CUSTOMER"
      );
      expect(customerShippedCheck.valid).toBe(false);
    });

    it("should block illegal reverse status transitions", () => {
      // DELIVERED cannot revert to PENDING
      const deliveredToPending = orderService.validateStatusTransition(
        "DELIVERED",
        "PENDING",
        "ADMIN"
      );
      expect(deliveredToPending.valid).toBe(false);

      // CANCELLED cannot jump to DELIVERED
      const cancelledToDelivered = orderService.validateStatusTransition(
        "CANCELLED",
        "DELIVERED",
        "ADMIN"
      );
      expect(cancelledToDelivered.valid).toBe(false);
    });
  });

  describe("Verified Purchaser Review Verification", () => {
    it("should reject review eligibility for unauthenticated or non-purchased items", async () => {
      const eligibility = await reviewService.checkReviewEligibility(
        "non_existent_user_999",
        "prod_non_existent"
      );
      expect(eligibility.eligible).toBe(false);
      expect(eligibility.reason).toBeDefined();
    });
  });
});

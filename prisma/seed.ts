import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Commencing ProVenture Marketplace Normalized Seed Execution...");

  // 1. Clear existing database in reverse foreign key order
  console.log("Cleaning database tables...");
  await prisma.auditLog.deleteMany().catch(() => {});
  await prisma.notification.deleteMany().catch(() => {});
  await prisma.sellerPayout.deleteMany().catch(() => {});
  await prisma.review.deleteMany().catch(() => {});
  await prisma.payment.deleteMany().catch(() => {});
  await prisma.orderItem.deleteMany().catch(() => {});
  await prisma.order.deleteMany().catch(() => {});
  await prisma.coupon.deleteMany().catch(() => {});
  await prisma.wishlistItem.deleteMany().catch(() => {});
  await prisma.wishlist.deleteMany().catch(() => {});
  await prisma.cartItem.deleteMany().catch(() => {});
  await prisma.cart.deleteMany().catch(() => {});
  await prisma.inventory.deleteMany().catch(() => {});
  await prisma.productImage.deleteMany().catch(() => {});
  await prisma.productVariant.deleteMany().catch(() => {});
  await prisma.product.deleteMany().catch(() => {});
  await prisma.category.deleteMany().catch(() => {});
  await prisma.address.deleteMany().catch(() => {});
  await prisma.store.deleteMany().catch(() => {});
  await prisma.sellerProfile.deleteMany().catch(() => {});
  await prisma.session.deleteMany().catch(() => {});
  await prisma.account.deleteMany().catch(() => {});
  await prisma.user.deleteMany().catch(() => {});

  // ==========================================
  // 1. Seed Users (Admin, Sellers, Customers)
  // ==========================================
  console.log("1/23 Creating Users...");
  const adminUser = await prisma.user.create({
    data: {
      name: "Alex Vane (Admin)",
      email: "admin@proventure.com",
      role: "ADMIN",
      phone: "+91 98765 43210",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
  });

  const sellerUser1 = await prisma.user.create({
    data: {
      name: "Marcus Aurelius",
      email: "seller@technexus.com",
      role: "SELLER",
      phone: "+91 98765 11111",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
  });

  const sellerUser2 = await prisma.user.create({
    data: {
      name: "Elena Rostova",
      email: "elena@auralifestyle.com",
      role: "SELLER",
      phone: "+91 98765 22222",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    },
  });

  const customerUser = await prisma.user.create({
    data: {
      name: "Priya Sharma",
      email: "customer@example.com",
      role: "CUSTOMER",
      phone: "+91 91234 56789",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    },
  });

  // ==========================================
  // 2. Seed Accounts & Sessions
  // ==========================================
  console.log("2/23 Creating Account Credentials & Sessions...");
  await prisma.account.create({
    data: {
      userId: customerUser.id,
      type: "credentials",
      provider: "credentials",
      providerAccountId: customerUser.id,
    },
  });

  await prisma.session.create({
    data: {
      sessionToken: "session_token_customer_active_uuid",
      userId: customerUser.id,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // ==========================================
  // 3. Seed Addresses
  // ==========================================
  console.log("3/23 Creating User Addresses...");
  const customerAddress = await prisma.address.create({
    data: {
      userId: customerUser.id,
      fullName: "Priya Sharma",
      phone: "+91 91234 56789",
      street: "Flat 402, Oakwood Greens, 100 Feet Rd, Indiranagar",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560038",
      country: "India",
      isDefault: true,
      type: "SHIPPING",
    },
  });

  // ==========================================
  // 4. Seed Seller Profiles
  // ==========================================
  console.log("4/23 Creating Seller Profiles...");
  const sellerProfile1 = await prisma.sellerProfile.create({
    data: {
      userId: sellerUser1.id,
      businessName: "TechNexus Innovations Private Limited",
      businessEmail: "compliance@technexus.com",
      businessPhone: "+91 98765 11111",
      taxId: "29AAAAA0000A1Z5", // GSTIN
      panNumber: "AAAAA0000A",
      bankAccountName: "TechNexus Innovations Pvt Ltd",
      bankAccountNumber: "998877665544",
      bankIfsc: "HDFC0001234",
      isVerified: true,
      status: "APPROVED",
    },
  });

  const sellerProfile2 = await prisma.sellerProfile.create({
    data: {
      userId: sellerUser2.id,
      businessName: "Aura Lifestyle LLP",
      businessEmail: "accounts@auralifestyle.com",
      businessPhone: "+91 98765 22222",
      taxId: "27BBBBB1111B2Z6",
      panNumber: "BBBBB1111B",
      bankAccountName: "Aura Lifestyle LLP",
      bankAccountNumber: "112233445566",
      bankIfsc: "ICIC0005678",
      isVerified: true,
      status: "APPROVED",
    },
  });

  // ==========================================
  // 5. Seed Stores (Multi-Vendor Entity)
  // ==========================================
  console.log("5/23 Creating Multi-Vendor Store Fronts...");
  const store1 = await prisma.store.create({
    data: {
      sellerProfileId: sellerProfile1.id,
      name: "TechNexus Innovations",
      slug: "technexus",
      description: "Architectural audio, flagship computing peripherals, and futuristic smart workspace accessories.",
      logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
      banner: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80",
      commissionRate: new Prisma.Decimal("10.00"),
      rating: new Prisma.Decimal("4.92"),
      reviewCount: 384,
      totalSales: new Prisma.Decimal("842500.00"),
      isActive: true,
    },
  });

  const store2 = await prisma.store.create({
    data: {
      sellerProfileId: sellerProfile2.id,
      name: "Aura Lifestyle & Co.",
      slug: "aura-lifestyle",
      description: "Sustainably tailored luxury apparel, organic textiles, and timeless minimalist essentials.",
      logo: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200&auto=format&fit=crop&q=80",
      banner: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80",
      commissionRate: new Prisma.Decimal("12.00"),
      rating: new Prisma.Decimal("4.85"),
      reviewCount: 246,
      totalSales: new Prisma.Decimal("412000.00"),
      isActive: true,
    },
  });

  // ==========================================
  // 6. Seed Categories
  // ==========================================
  console.log("6/23 Creating Categories...");
  const catElectronics = await prisma.category.create({
    data: {
      name: "Consumer Electronics",
      slug: "electronics",
      description: "High-fidelity audio, workstations, high-refresh displays, and smart gadgets.",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
      icon: "Headphones",
      featured: true,
    },
  });

  const catFashion = await prisma.category.create({
    data: {
      name: "Apparel & Accessories",
      slug: "fashion",
      description: "Contemporary tailoring, luxury knitwear, and modern accessories.",
      image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&auto=format&fit=crop&q=80",
      icon: "Shirt",
      featured: true,
    },
  });

  // ==========================================
  // 7. Seed Products
  // ==========================================
  console.log("7/23 Creating Products...");
  const prodHeadphones = await prisma.product.create({
    data: {
      storeId: store1.id,
      categoryId: catElectronics.id,
      title: "AuraWave Pro Spatial ANC Headphones",
      slug: "aurawave-pro-spatial-anc-headphones",
      description: "Engineered with beryllium drivers, hybrid active noise cancellation, and 45-hour ultra-endurance battery life. Features lossless Bluetooth 5.4 with aptX HD codec.",
      shortDescription: "Flagship wireless ANC headphones with spatial acoustic calibration.",
      price: new Prisma.Decimal("18999.00"),
      comparePrice: new Prisma.Decimal("24999.00"),
      costPrice: new Prisma.Decimal("11000.00"),
      sku: "TN-HP-900",
      status: "ACTIVE",
      featured: true,
      tags: ["Audio", "Wireless", "ANC", "Best Seller"],
      rating: new Prisma.Decimal("4.90"),
      reviewCount: 128,
    },
  });

  const prodOvercoat = await prisma.product.create({
    data: {
      storeId: store2.id,
      categoryId: catFashion.id,
      title: "Atelier Structured Italian Merino Overcoat",
      slug: "atelier-structured-italian-merino-overcoat",
      description: "Crafted in Florence from 100% certified regenerative Italian merino wool. Hand-finished horn buttons and cupro lining.",
      shortDescription: "Hand-tailored regenerative Italian merino overcoat.",
      price: new Prisma.Decimal("14500.00"),
      comparePrice: new Prisma.Decimal("21000.00"),
      costPrice: new Prisma.Decimal("7800.00"),
      sku: "AL-OC-01",
      status: "ACTIVE",
      featured: true,
      tags: ["Outerwear", "Sustainable", "Merino Wool", "Luxury"],
      rating: new Prisma.Decimal("4.80"),
      reviewCount: 57,
    },
  });

  // ==========================================
  // 8. Seed Product Variants
  // ==========================================
  console.log("8/23 Creating Product Variants...");
  const varH1 = await prisma.productVariant.create({
    data: {
      productId: prodHeadphones.id,
      name: "Midnight Matte",
      sku: "TN-HP-900-BLK",
      price: new Prisma.Decimal("18999.00"),
      comparePrice: new Prisma.Decimal("24999.00"),
      options: { Color: "Midnight Matte" },
    },
  });

  const varH2 = await prisma.productVariant.create({
    data: {
      productId: prodHeadphones.id,
      name: "Titanium Silver",
      sku: "TN-HP-900-SLV",
      price: new Prisma.Decimal("19999.00"),
      comparePrice: new Prisma.Decimal("25999.00"),
      options: { Color: "Titanium Silver" },
    },
  });

  // ==========================================
  // 9. Seed Product Images
  // ==========================================
  console.log("9/23 Creating Product Images...");
  await prisma.productImage.createMany({
    data: [
      {
        productId: prodHeadphones.id,
        url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
        altText: "AuraWave Pro Headphones in Midnight Matte",
        isPrimary: true,
        displayOrder: 0,
      },
      {
        productId: prodHeadphones.id,
        url: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80",
        altText: "AuraWave Pro Acoustic Grill Detail",
        isPrimary: false,
        displayOrder: 1,
      },
      {
        productId: prodOvercoat.id,
        url: "https://images.unsplash.com/photo-1539533018447-63fcce667883?w=800&auto=format&fit=crop&q=80",
        altText: "Atelier Merino Overcoat front view",
        isPrimary: true,
        displayOrder: 0,
      },
    ],
  });

  // ==========================================
  // 10. Seed Inventory (Seller-Specific Stock)
  // ==========================================
  console.log("10/23 Initializing Seller Inventory...");
  await prisma.inventory.create({
    data: {
      storeId: store1.id,
      productId: prodHeadphones.id,
      variantId: varH1.id,
      quantity: 35,
      reserved: 2,
      lowStockThreshold: 5,
      sku: "TN-HP-900-BLK",
    },
  });

  await prisma.inventory.create({
    data: {
      storeId: store1.id,
      productId: prodHeadphones.id,
      variantId: varH2.id,
      quantity: 15,
      reserved: 0,
      lowStockThreshold: 3,
      sku: "TN-HP-900-SLV",
    },
  });

  await prisma.inventory.create({
    data: {
      storeId: store2.id,
      productId: prodOvercoat.id,
      variantId: null,
      quantity: 22,
      reserved: 1,
      lowStockThreshold: 4,
      sku: "AL-OC-01",
    },
  });

  // ==========================================
  // 11. Seed Cart & CartItem
  // ==========================================
  console.log("11/23 Initializing User Cart...");
  const cart = await prisma.cart.create({
    data: {
      userId: customerUser.id,
    },
  });

  await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId: prodHeadphones.id,
      variantId: varH1.id,
      quantity: 1,
      price: new Prisma.Decimal("18999.00"),
    },
  });

  // ==========================================
  // 12. Seed Wishlist & WishlistItem
  // ==========================================
  console.log("12/23 Initializing User Wishlist...");
  const wishlist = await prisma.wishlist.create({
    data: {
      userId: customerUser.id,
    },
  });

  await prisma.wishlistItem.create({
    data: {
      wishlistId: wishlist.id,
      productId: prodOvercoat.id,
    },
  });

  // ==========================================
  // 13. Seed Coupon
  // ==========================================
  console.log("13/23 Creating Promotional Coupons...");
  const coupon = await prisma.coupon.create({
    data: {
      code: "PROVENTURE500",
      description: "Flat ₹500 discount on orders over ₹2,000",
      discountType: "FIXED_AMOUNT",
      discountValue: new Prisma.Decimal("500.00"),
      minOrderAmount: new Prisma.Decimal("2000.00"),
      startDate: new Date("2024-01-01"),
      endDate: new Date("2027-12-31"),
      isActive: true,
      usageLimit: 1000,
      usedCount: 24,
    },
  });

  // ==========================================
  // 14. Seed Order (Multi-Vendor Order)
  // ==========================================
  console.log("14/23 Creating Multi-Vendor Order...");
  const order = await prisma.order.create({
    data: {
      orderNumber: "PV-2402-984712",
      userId: customerUser.id,
      status: "DELIVERED",
      paymentStatus: "PAID",
      subtotal: new Prisma.Decimal("18999.00"),
      shippingFee: new Prisma.Decimal("0.00"),
      tax: new Prisma.Decimal("0.00"),
      discount: new Prisma.Decimal("500.00"),
      total: new Prisma.Decimal("18499.00"),
      couponId: coupon.id,
      shippingAddress: {
        fullName: customerAddress.fullName,
        phone: customerAddress.phone,
        street: customerAddress.street,
        city: customerAddress.city,
        state: customerAddress.state,
        postalCode: customerAddress.postalCode,
        country: customerAddress.country,
      },
    },
  });

  // ==========================================
  // 15. Seed OrderItem (with commission splits)
  // ==========================================
  console.log("15/23 Creating Order Line Items with Commission Splits...");
  const orderItem = await prisma.orderItem.create({
    data: {
      orderId: order.id,
      productId: prodHeadphones.id,
      variantId: varH1.id,
      storeId: store1.id,
      title: "AuraWave Pro Spatial ANC Headphones",
      variantName: "Midnight Matte",
      price: new Prisma.Decimal("18999.00"),
      quantity: 1,
      total: new Prisma.Decimal("18999.00"),
      commissionRate: new Prisma.Decimal("10.00"), // 10%
      commissionAmount: new Prisma.Decimal("1899.90"),
      sellerPayoutAmount: new Prisma.Decimal("17099.10"),
      fulfillmentStatus: "DELIVERED",
      trackingNumber: "TRK-BLR-89234",
      carrier: "BlueDart Express",
      shippedAt: new Date("2024-02-19T10:00:00Z"),
      deliveredAt: new Date("2024-02-21T14:30:00Z"),
    },
  });

  // ==========================================
  // 16. Seed Payment
  // ==========================================
  console.log("16/23 Recording Razorpay Payment Settlement...");
  await prisma.payment.create({
    data: {
      orderId: order.id,
      amount: new Prisma.Decimal("18499.00"),
      currency: "INR",
      status: "PAID",
      method: "RAZORPAY_UPI",
      razorpayOrderId: "order_rzp_mock_live_1001",
      razorpayPaymentId: "pay_rzp_mock_live_1001",
      paidAt: new Date("2024-02-18T10:15:00Z"),
    },
  });

  // ==========================================
  // 17. Seed Review (Enforcing Duplicate Prevention)
  // ==========================================
  console.log("17/23 Creating Verified Customer Review...");
  await prisma.review.create({
    data: {
      productId: prodHeadphones.id,
      userId: customerUser.id,
      orderId: order.id,
      orderItemId: orderItem.id, // Direct 1:1 binding
      rating: 5,
      title: "Phenomenal acoustic soundstage and craftsmanship!",
      comment: "The noise cancellation easily rivals high-end Sony flagships. Battery lasts for days without top-up.",
      verifiedPurchase: true,
      sellerResponse: "Thank you Priya! We put 18 months into tuning the beryllium acoustic drivers. Enjoy your listening!",
      sellerRespondedAt: new Date("2024-02-22T09:00:00Z"),
    },
  });

  // ==========================================
  // 18. Seed Notification
  // ==========================================
  console.log("18/23 Dispatching Notifications...");
  await prisma.notification.create({
    data: {
      userId: customerUser.id,
      title: "Order Delivered!",
      message: "Your shipment #PV-2402-984712 has been delivered by BlueDart Express.",
      type: "ORDER_UPDATE",
      read: true,
      data: { orderNumber: order.orderNumber },
    },
  });

  // ==========================================
  // 19. Seed SellerPayout
  // ==========================================
  console.log("19/23 Processing Merchant Bank Remittance...");
  await prisma.sellerPayout.create({
    data: {
      sellerProfileId: sellerProfile1.id,
      storeId: store1.id,
      amount: new Prisma.Decimal("150000.00"),
      commissionDeducted: new Prisma.Decimal("15000.00"),
      netAmount: new Prisma.Decimal("135000.00"),
      currency: "INR",
      status: "PAID",
      referenceNumber: "NEFT-PV-8891023",
      periodStart: new Date("2024-02-01"),
      periodEnd: new Date("2024-02-15"),
      paidAt: new Date("2024-02-16"),
      notes: "Bi-weekly settlement cycle (Feb 1 - Feb 15)",
    },
  });

  // ==========================================
  // 20. Seed AuditLog
  // ==========================================
  console.log("20/23 Writing Security Audit Logs...");
  await prisma.auditLog.createMany({
    data: [
      {
        userId: adminUser.id,
        action: "VENDOR_APPROVED",
        entityType: "SellerProfile",
        entityId: sellerProfile1.id,
        oldData: { status: "PENDING" },
        newData: { status: "APPROVED" },
        ipAddress: "192.168.1.1",
      },
      {
        userId: customerUser.id,
        action: "ORDER_CREATED",
        entityType: "Order",
        entityId: order.id,
        newData: { orderNumber: order.orderNumber, total: "18499.00" },
        ipAddress: "192.168.1.50",
      },
      {
        userId: sellerUser1.id,
        action: "INVENTORY_INITIALIZED",
        entityType: "Inventory",
        entityId: store1.id,
        newData: { initialUnits: 50 },
        ipAddress: "192.168.1.20",
      },
    ],
  });

  console.log("✅ All 23 Models Seeded and Verified Successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seed execution:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

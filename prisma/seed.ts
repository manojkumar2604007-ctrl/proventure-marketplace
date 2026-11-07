import { PrismaClient } from "@prisma/client";
import {
  MOCK_USERS,
  MOCK_SELLERS,
  MOCK_CATEGORIES,
  MOCK_PRODUCTS,
} from "../src/lib/db/mock-data";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding ProVenture Marketplace database...");

  // Clean existing tables in reverse dependency order
  await prisma.payout.deleteMany().catch(() => {});
  await prisma.review.deleteMany().catch(() => {});
  await prisma.orderItem.deleteMany().catch(() => {});
  await prisma.payment.deleteMany().catch(() => {});
  await prisma.order.deleteMany().catch(() => {});
  await prisma.wishlistItem.deleteMany().catch(() => {});
  await prisma.productVariant.deleteMany().catch(() => {});
  await prisma.productImage.deleteMany().catch(() => {});
  await prisma.product.deleteMany().catch(() => {});
  await prisma.category.deleteMany().catch(() => {});
  await prisma.sellerProfile.deleteMany().catch(() => {});
  await prisma.address.deleteMany().catch(() => {});
  await prisma.user.deleteMany().catch(() => {});

  // 1. Seed Users
  console.log("Creating Users...");
  for (const user of MOCK_USERS) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
        phone: user.phone,
      },
    });
  }

  // 2. Seed Sellers
  console.log("Creating Sellers...");
  for (const seller of MOCK_SELLERS) {
    await prisma.sellerProfile.upsert({
      where: { slug: seller.slug },
      update: {},
      create: {
        id: seller.id,
        userId: seller.userId,
        storeName: seller.storeName,
        slug: seller.slug,
        description: seller.description,
        logo: seller.logo,
        banner: seller.banner,
        phone: seller.phone,
        email: seller.email,
        city: seller.city,
        state: seller.state,
        postalCode: seller.postalCode,
        commissionRate: seller.commissionRate,
        status: seller.status,
        rating: seller.rating,
        reviewCount: seller.reviewCount,
        totalSales: seller.totalSales,
      },
    });
  }

  // 3. Seed Categories
  console.log("Creating Categories...");
  for (const cat of MOCK_CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: cat.image,
        icon: cat.icon,
        featured: cat.featured ?? false,
      },
    });
  }

  // 4. Seed Products with Images and Variants
  console.log("Creating Products...");
  for (const prod of MOCK_PRODUCTS) {
    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {},
      create: {
        id: prod.id,
        title: prod.title,
        slug: prod.slug,
        description: prod.description,
        shortDescription: prod.shortDescription,
        price: prod.price,
        comparePrice: prod.comparePrice,
        sku: prod.sku,
        stock: prod.stock,
        status: prod.status,
        featured: prod.featured ?? false,
        tags: prod.tags,
        rating: prod.rating,
        reviewCount: prod.reviewCount,
        sellerId: prod.sellerId,
        categoryId: prod.categoryId,
        images: {
          create: prod.images.map((img) => ({
            id: img.id,
            url: img.url,
            altText: img.altText,
            isPrimary: img.isPrimary,
            order: img.order,
          })),
        },
        variants: {
          create:
            prod.variants?.map((v) => ({
              id: v.id,
              name: v.name,
              sku: v.sku,
              price: v.price,
              stock: v.stock,
            })) || [],
        },
      },
    });
  }

  console.log("✅ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

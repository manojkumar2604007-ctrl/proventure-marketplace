# PROVENTURE MARKETPLACE

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Neon PostgreSQL](https://img.shields.io/badge/Neon-PostgreSQL-00E599?logo=postgresql)](https://neon.tech/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://www.prisma.io/)
[![Razorpay](https://img.shields.io/badge/Payments-Razorpay-0C2340?logo=razorpay)](https://razorpay.com/)

**PROVENTURE MARKETPLACE** is an enterprise-ready, multi-vendor e-commerce platform built with Next.js (App Router), TypeScript strict mode, Tailwind CSS, shadcn/ui, Neon PostgreSQL, Prisma ORM, Zustand, Cloudinary, and Razorpay.

---

## 🏛️ System Architecture & Portals

The marketplace contains three completely isolated, role-specific portals:

### 1. 🛍️ Customer Portal (`/(storefront)`, `/customer/*`)
- **Homepage:** Hero showcase, curated category grid, trending deals, verified vendor spotlights, and value trust badges.
- **Product Discovery (`/products`):** Dynamic facet filtering (by category, merchant, price range, stock availability), real-time search, and sorting.
- **Product Details (`/products/[slug]`):** Multi-image gallery with high-res staging, variant picker, stock indicators, verified merchant trust box, specs table, and authentic review submission system.
- **Unified Cart (`/cart`) & Slide-over Drawer:** Multi-vendor basket grouping, threshold progress bar for free shipping, coupon vouchers (`PROVENTURE500`), and live quantity updates.
- **Multi-Step Checkout (`/checkout`):** Shipping address verification, shipping tier selection, and Razorpay checkout gateway integration.
- **Customer Account (`/customer`):** Order history with 4-stage shipment tracking timeline, saved wishlist, and address book.

### 2. 🏪 Seller Merchant Portal (`/seller/*`)
- **Executive Merchant Dashboard (`/seller`):** Real-time gross revenue, net payout balance (after 10% platform fee), order counts, and rating metrics.
- **Catalog Management (`/seller/products`):** Product listings table, live status toggling (Active / Draft), and item deletion.
- **Add Product (`/seller/products/new`):** Multi-step creation with auto-slugification, SKU generator, category tagging, and Cloudinary media staging.
- **Order Fulfillment (`/seller/orders`):** Order management filtered to the merchant's items, tracking number assignment, and courier status workflow (Processing → Shipped → Delivered).
- **Inventory Control (`/seller/inventory`):** In-place stock adjustments with low-stock warnings.
- **Earnings & Payouts (`/seller/earnings`):** Full ledger of gross sales, commission deductions, bank remittances, and NEFT reference numbers.

### 3. 🛡️ Admin Management Console (`/admin/*`)
- **Macro Platform Dashboard (`/admin`):** Platform Gross Merchandise Value (GMV), net platform commissions revenue (10%), total merchants, and pending merchant applications.
- **Vendor Governance (`/admin/vendors`):** Review merchant KYC submissions, approve or suspend stores, and set per-merchant commission rates.
- **Product Moderation (`/admin/products`):** Enforce marketplace catalog standards, feature listings on the homepage, and archive flagged items.
- **Department & Category CMS (`/admin/categories`):** Add, update, and categorize marketplace collections.
- **Platform Orders (`/admin/orders`):** Global multi-vendor transaction monitoring.
- **Commission Architecture (`/admin/commissions`):** Global take-rate percentages, escrow hold periods, and payout cycles.

---

## 📂 Project Structure

```
proventure-marketplace/
├── prisma/
│   ├── schema.prisma            # Neon PostgreSQL Prisma models
│   └── seed.ts                  # Database seeding script
├── src/
│   ├── app/
│   │   ├── (auth)/              # Login and registration workflows
│   │   ├── (storefront)/        # Storefront home, catalog, details, cart, checkout
│   │   ├── customer/            # Customer account, orders tracking, wishlist, addresses
│   │   ├── seller/              # Seller dashboard, products CRUD, fulfillment, earnings
│   │   ├── admin/               # Admin dashboard, vendor moderation, commissions, orders
│   │   ├── api/                 # Next.js API route handlers (products, orders, vendors, payments)
│   │   ├── layout.tsx           # Global HTML layout with toast and cart drawer
│   │   └── globals.css          # Theme tokens, custom animations, glassmorphism
│   ├── components/
│   │   ├── ui/                  # Button, Badge, Card, Input, Label, Separator, Avatar, Toast
│   │   ├── layout/              # StorefrontHeader, StorefrontFooter, SellerSidebar, AdminSidebar, CustomerSidebar
│   │   ├── storefront/          # ProductCard, HeroBanner, CategoryGrid, VendorSpotlight, ProductGallery, ReviewSection
│   │   ├── seller/              # SellerMetricsCard
│   │   └── admin/               # VendorApprovalCard
│   ├── lib/
│   │   ├── auth/                # RBAC guards & session management
│   │   ├── db/                  # Prisma client singleton & in-memory fallback engine
│   │   ├── validations/         # Zod schemas
│   │   ├── utils.ts             # Currency formatter, slugify, discount calculator
│   │   └── cloudinary.ts        # Media upload utility
│   ├── services/                # Business services: Product, Vendor, Order, Category, Payment
│   ├── hooks/                   # useDebounce, useMediaQuery
│   ├── store/                   # Zustand stores: cart-store, wishlist-store, ui-store
│   └── types/                   # TypeScript interfaces
├── .env.example                 # Environment variables specification
└── package.json
```

---

## 🚀 Quickstart & Local Setup

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd proventure-marketplace
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

The application is pre-configured with **zero-latency local fallback mode** (`NEXT_PUBLIC_USE_MOCK_FALLBACK=true`), so it runs immediately out-of-the-box without requiring live cloud credentials.

To connect your live Neon database:
1. Create a database at [neon.tech](https://neon.tech).
2. Set your connection string in `.env`:
   ```env
   DATABASE_URL="postgresql://[user]:[password]@[neon-hostname]/[database]?sslmode=require"
   DIRECT_URL="postgresql://[user]:[password]@[neon-hostname]/[database]?sslmode=require"
   NEXT_PUBLIC_USE_MOCK_FALLBACK=false
   ```
3. Push schema and seed:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## ⚡ Demo User Personas for Testing

You can use the **Quick Demo Access** buttons on `/login` or enter any of these credentials:

| Persona | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@example.com` | `password123` | Browsing, cart, checkout, order tracking, reviews |
| **Seller** | `seller@technexus.com` | `password123` | Store catalog CRUD, dispatch fulfillment, earnings |
| **Admin** | `admin@proventure.com` | `password123` | Global GMV, vendor approvals, commission policy |

---

## 💳 Payment Gateway Simulation (Razorpay)

During checkout:
- Choose **Razorpay Gateway** for instant simulated payments with simulated order ID generation.
- Use promo code `PROVENTURE500` in the cart for a ₹500 discount.

---

## 📜 License
MIT © PROVENTURE MARKETPLACE

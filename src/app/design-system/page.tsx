"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Palette,
  Layers,
  Component,
  Sparkles,
  Search,
  ShoppingCart,
  Heart,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  MoreVertical,
  Edit,
  Trash2,
  RefreshCw,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FormField, Textarea, Select, Checkbox, Switch } from "@/components/ui/form-fields";
import { Modal, ConfirmDialog } from "@/components/ui/modal";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown";
import { Skeleton, ProductCardSkeleton, DataTableSkeleton, MetricCardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { DataTable, Column } from "@/components/ui/data-table";
import { SearchBar } from "@/components/ui/search-bar";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ProductCard } from "@/components/storefront/product-card";
import { useUIStore } from "@/store/ui-store";
import { Product } from "@/types";

interface SampleOrder {
  id: string;
  orderNumber: string;
  customer: string;
  total: number;
  status: "PAID" | "PENDING" | "SHIPPED" | "CANCELLED";
  date: string;
}

const SAMPLE_ORDERS: SampleOrder[] = [
  {
    id: "ord-1",
    orderNumber: "PV-8921-A",
    customer: "Aarav Patel",
    total: 24999,
    status: "PAID",
    date: "2026-11-07",
  },
  {
    id: "ord-2",
    orderNumber: "PV-8922-B",
    customer: "Meera Krishnan",
    total: 4299,
    status: "SHIPPED",
    date: "2026-11-06",
  },
  {
    id: "ord-3",
    orderNumber: "PV-8923-C",
    customer: "Rohan Deshmukh",
    total: 12500,
    status: "PENDING",
    date: "2026-11-05",
  },
  {
    id: "ord-4",
    orderNumber: "PV-8924-D",
    customer: "Kavita Rao",
    total: 890,
    status: "CANCELLED",
    date: "2026-11-04",
  },
  {
    id: "ord-5",
    orderNumber: "PV-8925-E",
    customer: "Vikram Malhotra",
    total: 31999,
    status: "PAID",
    date: "2026-11-03",
  },
];

const SAMPLE_PRODUCT: Product = {
  id: "prod-demo-1",
  title: "Aura ANC Studio Wireless Headphones",
  slug: "aura-anc-studio-wireless-headphones",
  description:
    "Flagship over-ear hybrid active noise canceling headphones with custom titanium drivers and 45-hour ultra-low latency playback.",
  price: 18999,
  comparePrice: 24999,
  stock: 24,
  status: "ACTIVE",
  tags: ["Audio", "Headphones", "Wireless"],
  rating: 4.9,
  reviewCount: 142,
  featured: true,
  sellerId: "seller-1",
  categoryId: "cat-electronics",
  seller: {
    id: "seller-1",
    userId: "u-1",
    storeName: "Aura Audio Labs",
    slug: "aura-audio",
    commissionRate: 8,
    status: "APPROVED",
    rating: 4.9,
    reviewCount: 142,
    totalSales: 850000,
  },
  images: [
    {
      id: "img-1",
      url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
      isPrimary: true,
      order: 0,
    },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
};

export default function DesignSystemPage() {
  const { addToast } = useUIStore();
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // Modal demo states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Form controls state
  const [checkboxState, setCheckboxState] = useState(true);
  const [switchState, setSwitchState] = useState(true);
  const [selectedCity, setSelectedCity] = useState("bengaluru");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHex(text);
    addToast({
      title: "Color Code Copied",
      description: `${text} copied to clipboard`,
      type: "success",
    });
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const columns: Column<SampleOrder>[] = [
    {
      key: "orderNumber",
      header: "Order ID",
      sortable: true,
      render: (row) => (
        <span className="font-mono font-bold text-xs text-primary">
          {row.orderNumber}
        </span>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      sortable: true,
      render: (row) => (
        <span className="font-medium text-foreground">{row.customer}</span>
      ),
    },
    {
      key: "total",
      header: "Amount (INR)",
      sortable: true,
      render: (row) => (
        <span className="font-extrabold text-foreground">
          ₹{row.total.toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      key: "status",
      header: "Payment Status",
      sortable: true,
      render: (row) => {
        const variants: Record<string, "success" | "warning" | "info" | "destructive"> = {
          PAID: "success",
          SHIPPED: "info",
          PENDING: "warning",
          CANCELLED: "destructive",
        };
        return (
          <Badge variant={variants[row.status] || "outline"} dot>
            {row.status}
          </Badge>
        );
      },
    },
    {
      key: "date",
      header: "Date",
      sortable: true,
      render: (row) => (
        <span className="text-xs text-muted-foreground">{row.date}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (row) => (
        <div className="flex items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Order Options</DropdownMenuLabel>
              <DropdownMenuItem>
                <Edit className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                <span>View Details</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <RefreshCw className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                <span>Resend Invoice</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive>
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                <span>Cancel Order</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-surface/30 pb-24">
      {/* Top Header */}
      <div className="border-b border-border/80 bg-background sticky top-0 z-30 shadow-subtle">
        <div className="container py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#0A192F] text-white flex items-center justify-center font-extrabold shadow-subtle">
              PV
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-primary">
                PROVENTURE Design System
              </h1>
              <p className="text-xs text-muted-foreground">
                Unified UI/UX specification across Customer, Seller, and Admin Portals
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="outline" size="sm">
                Storefront
              </Button>
            </Link>
            <Link href="/seller">
              <Button variant="outline" size="sm">
                Seller Hub
              </Button>
            </Link>
            <Link href="/admin">
              <Button variant="default" size="sm">
                Admin Console
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container py-10 space-y-16">
        {/* Section 1: Color Tokens */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-border/60">
            <Palette className="h-5 w-5 text-secondary" />
            <h2 className="heading-2">1. Color System Architecture</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Primary: Deep Navy */}
            <div
              onClick={() => copyToClipboard("#0A192F")}
              className="group cursor-pointer rounded-2xl border border-border/80 bg-card p-4 shadow-subtle hover:shadow-card transition-all"
            >
              <div className="h-20 w-full rounded-xl bg-[#0A192F] shadow-inner mb-3 flex items-end justify-end p-2">
                <span className="text-[10px] font-mono text-white/80 group-hover:scale-105 transition-transform">
                  #0A192F
                </span>
              </div>
              <h3 className="font-bold text-xs text-primary">Primary: Deep Navy</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Brand headers, hero typography & high-contrast elements.
              </p>
            </div>

            {/* Secondary: Royal Blue */}
            <div
              onClick={() => copyToClipboard("#1D4ED8")}
              className="group cursor-pointer rounded-2xl border border-border/80 bg-card p-4 shadow-subtle hover:shadow-card transition-all"
            >
              <div className="h-20 w-full rounded-xl bg-[#1D4ED8] shadow-inner mb-3 flex items-end justify-end p-2">
                <span className="text-[10px] font-mono text-white/80 group-hover:scale-105 transition-transform">
                  #1D4ED8
                </span>
              </div>
              <h3 className="font-bold text-xs text-secondary">Secondary: Royal Blue</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Primary CTAs, active links, focus rings & interactive accents.
              </p>
            </div>

            {/* Accent: Emerald Green */}
            <div
              onClick={() => copyToClipboard("#059669")}
              className="group cursor-pointer rounded-2xl border border-border/80 bg-card p-4 shadow-subtle hover:shadow-card transition-all"
            >
              <div className="h-20 w-full rounded-xl bg-[#059669] shadow-inner mb-3 flex items-end justify-end p-2">
                <span className="text-[10px] font-mono text-white/80 group-hover:scale-105 transition-transform">
                  #059669
                </span>
              </div>
              <h3 className="font-bold text-xs text-accent">Accent: Emerald Green</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Verified badges, discounts, savings pills, successful states.
              </p>
            </div>

            {/* Background: White */}
            <div
              onClick={() => copyToClipboard("#FFFFFF")}
              className="group cursor-pointer rounded-2xl border border-border/80 bg-card p-4 shadow-subtle hover:shadow-card transition-all"
            >
              <div className="h-20 w-full rounded-xl bg-white border border-border shadow-inner mb-3 flex items-end justify-end p-2">
                <span className="text-[10px] font-mono text-charcoal-700 group-hover:scale-105 transition-transform">
                  #FFFFFF
                </span>
              </div>
              <h3 className="font-bold text-xs text-primary">Background: White</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Crisp background for optimal readability and e-commerce conversion.
              </p>
            </div>

            {/* Surface: Light Gray */}
            <div
              onClick={() => copyToClipboard("#F8FAFC")}
              className="group cursor-pointer rounded-2xl border border-border/80 bg-card p-4 shadow-subtle hover:shadow-card transition-all"
            >
              <div className="h-20 w-full rounded-xl bg-[#F8FAFC] border border-border shadow-inner mb-3 flex items-end justify-end p-2">
                <span className="text-[10px] font-mono text-charcoal-700 group-hover:scale-105 transition-transform">
                  #F8FAFC
                </span>
              </div>
              <h3 className="font-bold text-xs text-primary">Surface: Light Gray</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Soft card backgrounds, table stripes, neutral input fills.
              </p>
            </div>

            {/* Text: Dark Charcoal */}
            <div
              onClick={() => copyToClipboard("#0F172A")}
              className="group cursor-pointer rounded-2xl border border-border/80 bg-card p-4 shadow-subtle hover:shadow-card transition-all"
            >
              <div className="h-20 w-full rounded-xl bg-[#0F172A] shadow-inner mb-3 flex items-end justify-end p-2">
                <span className="text-[10px] font-mono text-white/80 group-hover:scale-105 transition-transform">
                  #0F172A
                </span>
              </div>
              <h3 className="font-bold text-xs text-primary">Text: Dark Charcoal</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                High-contrast WCAG AA accessible text for long reading comfort.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Typography Scale */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-border/60">
            <Layers className="h-5 w-5 text-secondary" />
            <h2 className="heading-2">2. Typography System</h2>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-subtle divide-y divide-border/60">
            <div className="py-4">
              <span className="text-xs font-mono text-muted-foreground">.heading-display (36px - 48px, Extrabold)</span>
              <p className="heading-display mt-1">Discover Curated Artisan Goods</p>
            </div>
            <div className="py-4">
              <span className="text-xs font-mono text-muted-foreground">.heading-1 (24px - 30px, Bold)</span>
              <p className="heading-1 mt-1">Marketplace Operations & Executive Hub</p>
            </div>
            <div className="py-4">
              <span className="text-xs font-mono text-muted-foreground">.heading-2 (20px - 24px, Bold)</span>
              <p className="heading-2 mt-1">Vendor Revenue & Inventory Analytics</p>
            </div>
            <div className="py-4">
              <span className="text-xs font-mono text-muted-foreground">.heading-3 (18px - 20px, Semibold)</span>
              <p className="heading-3 mt-1">Customer Profile & Saved Payment Methods</p>
            </div>
            <div className="py-4">
              <span className="text-xs font-mono text-muted-foreground">.subheading (14px - 16px, Normal)</span>
              <p className="subheading mt-1">
                Browse through verified sellers audited for product quality, swift dispatch, and authenticity.
              </p>
            </div>
            <div className="py-4">
              <span className="text-xs font-mono text-muted-foreground">.body-default (14px, Regular)</span>
              <p className="body-default mt-1">
                ProVenture combines enterprise security with lightning-fast multi-vendor fulfillment across India.
              </p>
            </div>
            <div className="py-4">
              <span className="text-xs font-mono text-muted-foreground">.caption (12px, Medium)</span>
              <p className="caption mt-1">
                All transactions protected by 256-bit SSL encryption and Razorpay Payment Gateway.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Buttons */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-border/60">
            <Component className="h-5 w-5 text-secondary" />
            <h2 className="heading-2">3. Button Variants & States</h2>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-subtle space-y-6">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Color Variants
              </h4>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="default">Primary (Deep Navy)</Button>
                <Button variant="secondary">Secondary (Royal Blue)</Button>
                <Button variant="accent">Accent (Emerald Green)</Button>
                <Button variant="destructive">Destructive (Rose)</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="subtle">Subtle Surface</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link Button</Button>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Sizes & States
              </h4>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small Button</Button>
                <Button size="default">Default Button</Button>
                <Button size="lg">Large CTA Button</Button>
                <Button size="icon" aria-label="Icon only">
                  <ShoppingCart className="h-4 w-4" />
                </Button>
                <Button isLoading loadingText="Processing Order...">
                  Save Changes
                </Button>
                <Button disabled>Disabled Action</Button>
                <Button rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Explore Store
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Badges */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-border/60">
            <Sparkles className="h-5 w-5 text-secondary" />
            <h2 className="heading-2">4. Badges & Status Indicators</h2>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-subtle space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="default">Deep Navy</Badge>
              <Badge variant="secondary">Royal Blue</Badge>
              <Badge variant="accent">Emerald Green</Badge>
              <Badge variant="success" dot>
                Verified Seller
              </Badge>
              <Badge variant="warning" dot>
                Awaiting Approval
              </Badge>
              <Badge variant="info" dot>
                In Transit
              </Badge>
              <Badge variant="destructive" dot>
                Payment Failed
              </Badge>
              <Badge variant="outline">Standard Delivery</Badge>
              <Badge variant="subtle">Flat Rate ₹99</Badge>
            </div>
          </div>
        </section>

        {/* Section 5: Form Fields */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-border/60">
            <Layers className="h-5 w-5 text-secondary" />
            <h2 className="heading-2">5. Form Fields & Accessible Controls</h2>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-subtle grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Product Title"
              placeholder="e.g. Handmade Ceramic Coffee Mug"
              helperText="Include key brand, material, and color specifications."
              required
            />

            <Input
              label="Store Front URL"
              placeholder="store-name"
              leftIcon={<Search className="h-4 w-4" />}
              rightIcon={<span className="text-xs font-semibold">.proventure.in</span>}
            />

            <Input
              label="PAN Card / GST Number"
              placeholder="29AAAAA0000A1Z5"
              error="Please enter a valid 15-digit GSTIN identification number."
              defaultValue="INVALID_GSTIN"
              required
            />

            <FormField label="Fulfillment Hub Location" required>
              <Select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                options={[
                  { value: "bengaluru", label: "Bengaluru Central (BLR-1)" },
                  { value: "mumbai", label: "Mumbai West Logistics (BOM-2)" },
                  { value: "delhi", label: "Delhi NCR Northern Gateway (DEL-1)" },
                  { value: "hyderabad", label: "Hyderabad Deccan Hub (HYD-1)" },
                ]}
              />
            </FormField>

            <div className="md:col-span-2">
              <FormField
                label="Product Specifications & Warranty"
                helperText="Markdown formatted specifications will be displayed on the storefront detail tab."
              >
                <Textarea
                  placeholder="Enter detailed technical specifications, dimensions, and merchant warranty details..."
                  rows={3}
                />
              </FormField>
            </div>

            <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/60 bg-surface/50">
              <Checkbox
                checked={checkboxState}
                onCheckedChange={setCheckboxState}
                label="Enable Real-Time Stock Notifications"
                description="Receive webhook and SMS alerts whenever inventory falls below 5 units."
              />

              <Switch
                checked={switchState}
                onCheckedChange={setSwitchState}
                label="Public Store Visibility"
                description="Showcase products in search index."
              />
            </div>
          </div>
        </section>

        {/* Section 6: Search Bar & Breadcrumbs */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-border/60">
            <Search className="h-5 w-5 text-secondary" />
            <h2 className="heading-2">6. Search Bar & Breadcrumbs</h2>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-subtle space-y-6">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Global Marketplace Search Bar (with Shortcut Hint & Suggestions)
              </h4>
              <SearchBar placeholder="Type to search or press ⌘K..." />
            </div>

            <div className="pt-4 border-t border-border/60">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Accessible Breadcrumbs
              </h4>
              <Breadcrumbs
                items={[
                  { label: "Electronics", href: "/products?category=electronics" },
                  { label: "Audio & Headphones", href: "/products?category=audio" },
                  { label: "Aura ANC Studio Wireless Headphones" },
                ]}
              />
            </div>
          </div>
        </section>

        {/* Section 7: Overlays, Modals & Toast Notifications */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-border/60">
            <Sparkles className="h-5 w-5 text-secondary" />
            <h2 className="heading-2">7. Modals, Dialogs & Toast Notifications</h2>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-subtle space-y-6">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Modal & Confirmation Dialogs
              </h4>
              <div className="flex flex-wrap items-center gap-3">
                <Button onClick={() => setIsModalOpen(true)}>
                  Open Standard Modal
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setIsConfirmOpen(true)}
                >
                  Open Destructive Confirm Dialog
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t border-border/60">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Interactive Toast Triggers
              </h4>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="accent"
                  size="sm"
                  onClick={() =>
                    addToast({
                      title: "Payment Verified",
                      description: "₹24,999 received via Razorpay UPI.",
                      type: "success",
                    })
                  }
                >
                  Trigger Success Toast
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() =>
                    addToast({
                      title: "Session Expired",
                      description: "Please sign in again to continue managing your shop.",
                      type: "error",
                    })
                  }
                >
                  Trigger Error Toast
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    addToast({
                      title: "Low Stock Warning",
                      description: "Wireless Keyboard inventory has reached 2 units.",
                      type: "warning",
                    })
                  }
                >
                  Trigger Warning Toast
                </Button>
                <Button
                  variant="subtle"
                  size="sm"
                  onClick={() =>
                    addToast({
                      title: "New Vendor Onboarding",
                      description: "Kashmir Crafts Hub submitted verification documents.",
                      type: "default",
                    })
                  }
                >
                  Trigger Info Toast
                </Button>
              </div>
            </div>
          </div>

          {/* Standard Modal Demo */}
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Update Marketplace Commission Rate"
            description="Adjust the platform fee deducted from merchant payouts for this product category."
            footer={
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    setIsModalOpen(false);
                    addToast({
                      title: "Commission Rate Saved",
                      description: "Platform commission updated to 8.5%.",
                      type: "success",
                    });
                  }}
                >
                  Save Configuration
                </Button>
              </>
            }
          >
            <div className="space-y-4 py-2">
              <Input
                label="Standard Commission Rate (%)"
                defaultValue="8.5"
                helperText="Applies automatically to gross order totals minus GST."
              />
              <Input
                label="Effective Date"
                type="date"
                defaultValue="2026-11-01"
              />
            </div>
          </Modal>

          {/* Destructive Confirm Dialog Demo */}
          <ConfirmDialog
            isOpen={isConfirmOpen}
            onClose={() => setIsConfirmOpen(false)}
            onConfirm={() => {
              setIsConfirmOpen(false);
              addToast({
                title: "Vendor Suspended",
                description: "Vendor storefront is no longer visible on marketplace.",
                type: "error",
              });
            }}
            title="Suspend Merchant Storefront?"
            description="Are you certain you want to suspend this vendor? All active listings will be unlisted immediately, and pending payouts held for manual compliance review."
            confirmLabel="Suspend Merchant"
            variant="danger"
          />
        </section>

        {/* Section 8: Data Table */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-border/60">
            <Layers className="h-5 w-5 text-secondary" />
            <h2 className="heading-2">8. Data Table Component</h2>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-subtle space-y-4">
            <p className="text-xs text-muted-foreground">
              Feature-rich data table supporting client-side searching, column sorting, row selection checkboxes, and custom action dropdown menus.
            </p>
            <DataTable
              columns={columns}
              data={SAMPLE_ORDERS}
              selectable
              searchPlaceholder="Search by order ID, customer name, status..."
            />
          </div>
        </section>

        {/* Section 9: Product Card & Grid */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-border/60">
            <ShoppingCart className="h-5 w-5 text-secondary" />
            <h2 className="heading-2">9. Product Card & Layout Showcase</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <ProductCard product={SAMPLE_PRODUCT} />
            <ProductCard
              product={{
                ...SAMPLE_PRODUCT,
                id: "prod-demo-2",
                title: "Handcrafted Full-Grain Leather Briefcase",
                slug: "handcrafted-full-grain-leather-briefcase",
                price: 8499,
                comparePrice: 11999,
                images: [
                  {
                    id: "img-2",
                    url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80",
                    isPrimary: true,
                    order: 0,
                  },
                ],
              }}
            />
            <ProductCard
              product={{
                ...SAMPLE_PRODUCT,
                id: "prod-demo-3",
                title: "Automatic Chronograph Watch - Edition 42",
                slug: "automatic-chronograph-watch-edition-42",
                price: 44999,
                comparePrice: 44999,
                stock: 0,
                featured: false,
                images: [
                  {
                    id: "img-3",
                    url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
                    isPrimary: true,
                    order: 0,
                  },
                ],
              }}
            />
            <ProductCard
              product={{
                ...SAMPLE_PRODUCT,
                id: "prod-demo-4",
                title: "Artisanal Pour-Over Matte Brass Stand",
                slug: "artisanal-pour-over-matte-brass-stand",
                price: 3250,
                comparePrice: 4200,
                rating: 4.8,
                reviewCount: 68,
                images: [
                  {
                    id: "img-4",
                    url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80",
                    isPrimary: true,
                    order: 0,
                  },
                ],
              }}
            />
          </div>
        </section>

        {/* Section 10: Skeletons, Empty & Error States */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-border/60">
            <Layers className="h-5 w-5 text-secondary" />
            <h2 className="heading-2">10. Skeletons, Empty States & Error States</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Metric Skeleton */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Skeleton Loader Preview
              </span>
              <MetricCardSkeleton />
            </div>

            {/* Empty State */}
            <div className="space-y-2 md:col-span-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Empty State Component Preview
              </span>
              <EmptyState
                title="No Products Match Current Criteria"
                description="Try resetting price range or clearing category filters to view more items."
                actionLabel="Reset Filters"
                secondaryActionLabel="Explore Featured"
                onAction={() =>
                  addToast({
                    title: "Filters Cleared",
                    description: "Displaying all available products.",
                    type: "default",
                  })
                }
                onSecondaryAction={() =>
                  addToast({
                    title: "Navigating to Featured",
                    type: "default",
                  })
                }
              />
            </div>
          </div>

          <div className="pt-4">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              Error State Component Preview
            </span>
            <ErrorState
              title="Unable to Sync Inventory With Neon PostgreSQL"
              message="The database connection timed out after 5000ms. Please check your network connectivity or try refreshing the request."
              onRetry={() =>
                addToast({
                  title: "Retrying Neon PostgreSQL connection...",
                  type: "default",
                })
              }
              showBack
            />
          </div>
        </section>
      </div>
    </div>
  );
}

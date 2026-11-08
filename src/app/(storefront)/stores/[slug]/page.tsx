import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { vendorService } from "@/services/vendor.service";
import { productService } from "@/services/product.service";
import { ProductCard } from "@/components/storefront/product-card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Star,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Package,
  Store,
  Share2,
} from "lucide-react";

export const revalidate = 60;

export default async function StoreDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const [vendor, products] = await Promise.all([
    vendorService.getVendorBySlug(params.slug),
    productService.getProductsBySeller(params.slug),
  ]);

  if (!vendor) {
    notFound();
  }

  return (
    <div className="container py-8 space-y-10">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Marketplace Stores", href: "/products" },
          { label: vendor.storeName },
        ]}
      />

      {/* Store Hero Banner & Header Card */}
      <div className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-card">
        {/* Banner Image */}
        <div className="relative h-48 sm:h-64 md:h-72 w-full bg-slate-900">
          <Image
            src={
              vendor.banner ||
              "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80"
            }
            alt={vendor.storeName}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </div>

        {/* Profile Info Overlay Container */}
        <div className="p-6 sm:p-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-16 sm:-mt-20">
            {/* Logo & Name */}
            <div className="flex items-end gap-5">
              <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-2xl border-4 border-card bg-card overflow-hidden shadow-modal shrink-0">
                {vendor.logo ? (
                  <Image
                    src={vendor.logo}
                    alt={vendor.storeName}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-[#0A192F] text-white font-extrabold text-3xl">
                    {vendor.storeName.charAt(0)}
                  </div>
                )}
              </div>

              <div className="space-y-1 pb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                    {vendor.storeName}
                  </h1>
                  <Badge variant="success" size="sm" dot>
                    Verified Merchant
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1 font-bold text-amber-500">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span>{vendor.rating.toFixed(1)}</span>
                  </div>
                  <span>•</span>
                  <span>{vendor.reviewCount} Reviews</span>
                  <span>•</span>
                  <span>{products.length} Products</span>
                </div>
              </div>
            </div>

            {/* Contact Actions */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Button variant="outline" size="sm" asChild>
                <a href={`mailto:${vendor.email || "seller@proventure.in"}`}>
                  <Mail className="h-3.5 w-3.5 mr-1.5" />
                  <span>Contact Store</span>
                </a>
              </Button>
            </div>
          </div>

          {/* Description & Contact Details */}
          <div className="mt-6 pt-6 border-t border-border/60 grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                About The Store
              </h3>
              <p className="text-sm text-foreground/90 leading-relaxed">
                {vendor.description ||
                  "Independent maker and authorized boutique merchant operating on ProVenture Marketplace. All orders fulfilled directly with strict quality assurance and insured transit."}
              </p>
            </div>

            {/* Contact Info Card */}
            <div className="lg:col-span-4 rounded-xl border border-border/60 bg-surface/50 p-4 space-y-2.5 text-xs text-muted-foreground">
              <h4 className="font-bold text-foreground">Merchant Details</h4>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-secondary shrink-0" />
                <span>
                  {vendor.city || "Bengaluru"}, {vendor.state || "Karnataka"},{" "}
                  {vendor.postalCode || "India"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-secondary shrink-0" />
                <span className="truncate">{vendor.email || "merchant@proventure.in"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-secondary shrink-0" />
                <span>{vendor.phone || "+91 98765 43210"}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-accent shrink-0" />
                <span>Verified Merchant by ProVenture Compliance</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Store Product Catalog */}
      <section className="space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              Catalog
            </span>
            <h2 className="heading-2 mt-0.5">Products by {vendor.storeName}</h2>
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            {products.length} Active Listings
          </span>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Products Listed Yet"
            description="This merchant is currently preparing new inventory. Please check back soon or browse other shops."
            actionLabel="Discover More Stores"
            actionHref="/products"
          />
        )}
      </section>
    </div>
  );
}

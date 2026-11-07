import React from "react";
import Link from "next/link";
import Image from "next/image";
import { SellerProfile } from "@/types";
import { Star, ShieldCheck, ArrowRight, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VendorSpotlightProps {
  vendors: SellerProfile[];
}

export function VendorSpotlight({ vendors }: VendorSpotlightProps) {
  return (
    <section className="py-12 bg-muted/30 border-y">
      <div className="container">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              Ecosystem
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-1">
              Featured Independent Merchants
            </h2>
          </div>
          <Link
            href="/seller/register"
            className="text-xs sm:text-sm font-semibold text-primary hover:underline flex items-center gap-1"
          >
            Open Your Store <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {vendors.slice(0, 3).map((vendor) => (
            <div
              key={vendor.id}
              className="group rounded-2xl border bg-card overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              {/* Banner with Logo Overlay */}
              <div className="relative h-32 w-full bg-muted">
                {vendor.banner && (
                  <Image
                    src={vendor.banner}
                    alt={vendor.storeName}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-black/30" />

                <div className="absolute -bottom-5 left-4 h-14 w-14 rounded-xl border-2 border-card overflow-hidden shadow-md bg-card">
                  {vendor.logo ? (
                    <Image
                      src={vendor.logo}
                      alt={vendor.storeName}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-primary text-white font-bold text-lg">
                      {vendor.storeName.charAt(0)}
                    </div>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="pt-7 p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-foreground leading-tight">
                      {vendor.storeName}
                    </h3>
                    <Badge variant="success" className="text-[10px] px-2 py-0 gap-1">
                      <ShieldCheck className="h-3 w-3" /> Verified
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                    {vendor.description || "Curated multi-category independent seller on ProVenture."}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 font-semibold text-amber-500">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span>{vendor.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground font-normal">
                      ({vendor.reviewCount} reviews)
                    </span>
                  </div>

                  <Link
                    href={`/products?seller=${vendor.slug}`}
                    className="font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    <Store className="h-3.5 w-3.5" />
                    <span>Browse Shop</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { categoryService } from "@/services/category.service";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ArrowRight, Sparkles, Layers } from "lucide-react";

export const revalidate = 60;

export default async function CategoriesPage() {
  const categories = await categoryService.getCategories();

  return (
    <div className="container py-8 space-y-8">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: "All Categories" }]} />

      {/* Header Banner */}
      <div className="space-y-2 pb-6 border-b border-border/60">
        <div className="flex items-center gap-2 text-xs font-bold text-secondary uppercase tracking-wider">
          <Layers className="h-4 w-4" />
          <span>Marketplace Directory</span>
        </div>
        <h1 className="heading-1">Shop by Department</h1>
        <p className="subheading max-w-2xl">
          Explore specialized collections curated directly from verified makers, independent brands, and authorized technology studios.
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className="group relative rounded-2xl border border-border/80 bg-card overflow-hidden shadow-subtle hover:shadow-card transition-all duration-300 flex flex-col justify-between"
          >
            {/* Image Banner */}
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface">
              <Image
                src={cat.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"}
                alt={cat.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              <div className="absolute bottom-3 left-4 right-4 text-white">
                <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                  {cat.productCount ?? 12}+ Curated Listings
                </span>
                <h3 className="text-xl font-bold tracking-tight text-white mt-0.5">
                  {cat.name}
                </h3>
              </div>
            </div>

            {/* Description & Action */}
            <div className="p-5 flex-1 flex flex-col justify-between bg-card">
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {cat.description ||
                  "Discover hand-picked selections and verified merchant items in this department."}
              </p>

              <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-secondary group-hover:text-primary transition-colors">
                <span>Explore Department</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

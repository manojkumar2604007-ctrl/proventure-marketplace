import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { categoryService } from "@/services/category.service";
import { productService } from "@/services/product.service";
import { ProductCard } from "@/components/storefront/product-card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Layers } from "lucide-react";

export const revalidate = 60;

export default async function CategoryDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const [category, allCategories, productsData] = await Promise.all([
    categoryService.getCategoryBySlug(params.slug),
    categoryService.getCategories(),
    productService.getProducts({ category: params.slug, limit: 24 }),
  ]);

  if (!category) {
    notFound();
  }

  const products = productsData.products;
  const otherCategories = allCategories.filter((c) => c.slug !== category.slug);

  return (
    <div className="container py-8 space-y-10">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "All Categories", href: "/categories" },
          { label: category.name },
        ]}
      />

      {/* Category Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0A192F] via-[#102A43] to-[#1D4ED8] p-8 sm:p-12 text-white shadow-card">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-md text-emerald-400">
            <Layers className="h-3.5 w-3.5" /> Curated Marketplace Department
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            {category.name}
          </h1>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-xl">
            {category.description ||
              "Explore premium verified merchandise, independent artisan crafts, and direct merchant releases."}
          </p>

          <div className="pt-2 flex items-center gap-4 text-xs text-slate-300">
            <span>
              <strong className="text-white font-bold">{products.length}</strong> items available
            </span>
            <span>•</span>
            <span>Direct Merchant Dispatch</span>
          </div>
        </div>

        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 hidden lg:block bg-[radial-gradient(#fff_1.5px,transparent_1.5px)] [background-size:20px_20px]" />
      </div>

      {/* Other Categories Quick-Pills */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
          Other Departments:
        </span>
        <div className="flex flex-wrap gap-2">
          {otherCategories.map((cat) => (
            <Link key={cat.slug} href={`/categories/${cat.slug}`}>
              <span className="inline-block px-3 py-1.5 rounded-xl border border-border/80 bg-card hover:bg-surface text-xs font-semibold text-foreground transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <h2 className="heading-2">Browse {category.name}</h2>
          <Link href={`/products?category=${category.slug}`}>
            <Button variant="outline" size="sm" className="text-xs gap-1.5">
              <span>Open in Advanced Filter Catalog</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={`No Products in ${category.name} Yet`}
            description="Our merchants are preparing fresh inventory for this department. Check back shortly or browse other categories."
            actionLabel="Explore All Products"
            actionHref="/products"
          />
        )}
      </section>
    </div>
  );
}

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Category } from "@/types";
import { ArrowRight } from "lucide-react";

interface CategoryGridProps {
  categories: Category[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <section className="py-12">
      <div className="container">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              Departments
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-1">
              Curated Collections
            </h2>
          </div>
          <Link
            href="/categories"
            className="text-xs sm:text-sm font-semibold text-secondary hover:underline flex items-center gap-1"
          >
            All Categories <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden aspect-[3/4] bg-muted border shadow-sm hover:shadow-lg transition-all"
            >
              <Image
                src={cat.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80"}
                alt={cat.name}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              <div className="absolute inset-x-3 bottom-3 text-white">
                <h3 className="font-bold text-sm leading-tight group-hover:text-primary-200 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-white/70 mt-0.5">
                  {cat.productCount ?? 12}+ items
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

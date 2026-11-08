"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ProductImage } from "@/types";
import { getCloudinaryOptimizedUrl } from "@/lib/cloudinary";
import { Sparkles, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: ProductImage[];
  title: string;
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const activeImage = images[selectedIndex]?.url || images[0]?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80";

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4 items-start">
      {/* Thumbnails Navigation */}
      {images.length > 1 && (
        <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto shrink-0 pb-2 md:pb-0 max-h-[500px]">
          {images.map((img, idx) => {
            const isSelected = selectedIndex === idx;
            const thumbUrl = getCloudinaryOptimizedUrl(img.url, { width: 120, height: 120, crop: "fill" });

            return (
              <button
                key={img.id || idx}
                onClick={() => setSelectedIndex(idx)}
                className={cn(
                  "relative h-16 w-16 md:h-20 md:w-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-surface",
                  isSelected
                    ? "border-secondary ring-2 ring-secondary/20 shadow-subtle scale-102"
                    : "border-border/80 hover:border-muted-foreground/50 opacity-80 hover:opacity-100"
                )}
                aria-label={`View photo ${idx + 1} of ${title}`}
              >
                <Image
                  src={thumbUrl}
                  alt={img.altText || `${title} thumbnail ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Main Image Stage with Hover Zoom */}
      <div
        className="relative aspect-square w-full rounded-2xl overflow-hidden border border-border/80 bg-surface shadow-subtle group cursor-crosshair"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <Image
          src={getCloudinaryOptimizedUrl(activeImage, { width: 1000, quality: "auto" })}
          alt={title}
          fill
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
          style={
            isZoomed
              ? {
                  transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                  transform: "scale(1.75)",
                }
              : undefined
          }
          className="object-cover transition-transform duration-200"
        />

        {/* Counter Badge */}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[11px] font-bold pointer-events-none">
            {selectedIndex + 1} / {images.length}
          </div>
        )}

        {/* Hover Hint */}
        <div className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/80 backdrop-blur-md text-charcoal-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-subtle">
          <ZoomIn className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

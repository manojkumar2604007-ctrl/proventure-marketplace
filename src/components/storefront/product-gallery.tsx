"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ProductImage } from "@/types";

interface ProductGalleryProps {
  images: ProductImage[];
  title: string;
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string>(
    images[0]?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"
  );

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto shrink-0 pb-2 md:pb-0">
          {images.map((img, idx) => {
            const isSelected = selectedImage === img.url;
            return (
              <button
                key={img.id || idx}
                onClick={() => setSelectedImage(img.url)}
                className={`relative h-16 w-16 md:h-20 md:w-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-muted ${
                  isSelected
                    ? "border-primary ring-2 ring-primary/20 shadow-md"
                    : "border-border hover:border-muted-foreground/40"
                }`}
                aria-label={`View thumbnail ${idx + 1}`}
              >
                <Image
                  src={img.url}
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

      {/* Main Image Stage */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden border bg-muted/40 shadow-sm">
        <Image
          src={selectedImage}
          alt={title}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 600px"
          className="object-cover transition-all duration-300"
        />
      </div>
    </div>
  );
}

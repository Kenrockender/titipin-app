"use client";
import Link from "next/link";
import React from "react";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatIDR } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { CatalogProduct } from "@/types/database.types";

export function ProductCard({ product }: { product: CatalogProduct }) {
  const { addToCart } = useStore();
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-black/[.07] bg-white shadow-card">
      <Link href={`/catalog/${product.id}`} className="relative block aspect-square overflow-hidden bg-black/[.04]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.image_url} alt={product.name} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/products/_placeholder.svg"; }} />
        {product.category && <span className="absolute left-3 top-3"><Badge tone="brand">{product.category}</Badge></span>}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link href={`/catalog/${product.id}`} className="text-[15px] font-bold leading-tight text-ink hover:text-brand">{product.name}</Link>
        <div className="flex items-center gap-1 text-xs text-faint">
          <Icon name="store" size={13} /> {product.store_location}
        </div>
        {/* Color swatches for shoes */}
        {product.color_variants && product.color_variants.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {product.color_variants.map((cv) => (
              <Link
                key={cv.product_id}
                href={`/catalog/${cv.product_id}`}
                title={cv.color_name}
                className={`block h-4 w-4 rounded-full border transition-transform hover:scale-125 ${cv.product_id === product.id ? 'ring-2 ring-brand ring-offset-1 border-brand' : 'border-black/20 hover:border-black/40'}`}
                style={{ backgroundColor: cv.hex }}
              />
            ))}
          </div>
        )}
        <div className="mt-auto flex items-end justify-between pt-2">
          <div>
            <div className="text-lg font-extrabold text-ink">{formatIDR(product.final_price_idr)}</div>
            <div className="text-[11px] text-faint">all-in, incl. jastip fee</div>
          </div>
          <Button variant="subtle" className="h-9 px-3" onClick={() => addToCart(product)} aria-label="Add to cart">
            <Icon name="plus" size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}

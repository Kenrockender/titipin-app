import React from "react";
import { ProductCard } from "./ProductCard";
import type { CatalogProduct } from "@/types/database.types";
export function ProductGrid({ products }: { products: CatalogProduct[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}

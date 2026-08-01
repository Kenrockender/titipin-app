"use client";
import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { ProductGrid } from "@/components/catalog/ProductGrid";

export default function CatalogPage() {
  const { products } = useStore();
  const cats = ["All", ...Array.from(new Set(products.filter((p) => p.is_active).map((p) => p.category).filter(Boolean) as string[]))];
  const [cat, setCat] = useState("All");
  const list = products.filter((p) => p.is_active && (cat === "All" || p.category === cat));

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight">Catalog</h1>
      <p className="mb-6 text-sm text-muted">Curated items open for pre-order. Every price is all-in — no surprise fees.</p>
      <div className="mb-6 flex flex-wrap gap-2">
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)}
            className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${cat === c ? "bg-brand text-white" : "bg-surface text-muted border border-edge/10 hover:border-ink"}`}>{c}</button>
        ))}
      </div>
      <ProductGrid products={list} />
    </main>
  );
}

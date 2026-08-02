"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { Icon } from "@/components/ui/Icon";
import { ProductGrid } from "@/components/catalog/ProductGrid";

const PAGE_SIZE = 24;

export default function CatalogPage() {
  const { products } = useStore();
  const cats = ["All", ...Array.from(new Set(products.filter((p) => p.is_active).map((p) => p.category).filter(Boolean) as string[]))];
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return products.filter((p) => {
      if (!p.is_active) return false;
      if (cat !== "All" && p.category !== cat) return false;
      if (!needle) return true;
      return p.name.toLowerCase().includes(needle)
        || (p.category ?? "").toLowerCase().includes(needle)
        || (p.store_location ?? "").toLowerCase().includes(needle);
    });
  }, [products, cat, q]);

  // Reset pagination whenever the active filters change.
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [cat, q]);

  const visible = filtered.slice(0, visibleCount);

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight">Catalog</h1>
      <p className="mb-6 text-sm text-muted">Curated items open for pre-order. Every price is all-in — no surprise fees.</p>
      <div className="relative mb-4">
        <Icon name="search" size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products, brands, stores…"
          className="h-11 w-full rounded-xl border border-edge/15 bg-surface pl-10 pr-4 text-sm text-ink outline-none focus:border-brand"
        />
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)}
            className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${cat === c ? "bg-brand text-white" : "bg-surface text-muted border border-edge/10 hover:border-ink"}`}>{c}</button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-surface p-10 text-center text-muted shadow-card">No products match &quot;{q}&quot;.</div>
      ) : (
        <>
          <ProductGrid products={visible} />
          {visibleCount < filtered.length && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="rounded-full border border-edge/15 bg-surface px-6 py-2.5 text-sm font-bold text-ink hover:border-brand"
              >
                Load more ({filtered.length - visibleCount} left)
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}

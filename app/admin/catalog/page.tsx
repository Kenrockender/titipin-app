"use client";
import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatIDR } from "@/lib/format";
import { calculateQuote } from "@/lib/pricing";
import type { CatalogProduct } from "@/types/database.types";

const blank = (tripId: string): CatalogProduct => ({
  id: `prod-${Math.random().toString(36).slice(2, 8)}`, trip_id: tripId, name: "", description: "",
  base_price_foreign: 0, markup_percentage: 20, flat_jastip_fee: 50000, final_price_idr: 0,
  image_url: "/products/_placeholder.svg",
  is_active: true, category: "Snacks", store_location: ""
});

export default function AdminCatalog() {
  const { products, trips, upsertProduct, toggleProductActive } = useStore();
  const [editing, setEditing] = useState<CatalogProduct | null>(null);

  const save = (p: CatalogProduct) => {
    const trip = trips.find((t) => t.id === p.trip_id);
    const q = calculateQuote({ basePriceForeign: p.base_price_foreign, exchangeRate: trip?.system_exchange_rate ?? 1, markupPercentage: p.markup_percentage, flatJastipFee: p.flat_jastip_fee });
    upsertProduct({ ...p, final_price_idr: q.totalIdr });
    setEditing(null);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Catalog</h1>
          <p className="text-sm text-muted">Add, edit, and toggle pre-curated products. Final price is auto-calculated.</p>
        </div>
        <Button onClick={() => setEditing(blank(trips[0]?.id ?? "trip-tokyo"))}><Icon name="plus" size={16} color="#fff" /> Add Product</Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {products.map((p) => (
          <Card key={p.id} className="flex items-center gap-3 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.image_url} alt={p.name || "Untitled product"} className="h-16 w-16 flex-none rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2"><span className="truncate font-bold">{p.name || "(untitled)"}</span>{!p.is_active && <Badge tone="neutral">Hidden</Badge>}</div>
              <div className="text-xs text-muted">{p.category} · {p.store_location}</div>
              <div className="text-sm font-extrabold">{formatIDR(p.final_price_idr)}</div>
            </div>
            <div className="flex flex-none flex-col gap-1">
              <Button variant="ghost" className="h-8 px-2" onClick={() => setEditing(p)}><Icon name="pencil" size={15} /></Button>
              <Button variant="ghost" className="h-8 px-2" onClick={() => toggleProductActive(p.id)}><Icon name={p.is_active ? "eye" : "eye-off"} size={15} /></Button>
            </div>
          </Card>
        ))}
      </div>

      {editing && <Editor product={editing} trips={trips} onSave={save} onClose={() => setEditing(null)} />}
    </div>
  );
}

function Editor({ product, trips, onSave, onClose }: { product: CatalogProduct; trips: { id: string; name: string; system_exchange_rate: number }[]; onSave: (p: CatalogProduct) => void; onClose: () => void }) {
  const [p, setP] = useState(product);
  const trip = trips.find((t) => t.id === p.trip_id);
  const q = calculateQuote({ basePriceForeign: p.base_price_foreign, exchangeRate: trip?.system_exchange_rate ?? 1, markupPercentage: p.markup_percentage, flatJastipFee: p.flat_jastip_fee });
  const set = (k: keyof CatalogProduct, v: unknown) => setP({ ...p, [k]: v });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <Card className="max-h-[90vh] w-full max-w-lg overflow-auto p-6" >
        <div onClick={(e) => e.stopPropagation()}>
          <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-extrabold">Product</h2><button onClick={onClose}><Icon name="x" size={20} className="text-faint" /></button></div>
          <div className="flex flex-col gap-3 text-sm">
            <Text label="Name" value={p.name} onChange={(v) => set("name", v)} />
            <label className="font-bold text-muted">Description<textarea value={p.description} onChange={(e) => set("description", e.target.value)} className="mt-1 w-full rounded-lg border border-edge/15 bg-transparent p-2 text-ink" rows={2} /></label>
            <div className="grid grid-cols-2 gap-3">
              <Num label="Base price (foreign)" value={p.base_price_foreign} onChange={(v) => set("base_price_foreign", v)} />
              <Num label="Markup %" value={p.markup_percentage} onChange={(v) => set("markup_percentage", v)} />
              <Num label="Flat fee (IDR)" value={p.flat_jastip_fee} onChange={(v) => set("flat_jastip_fee", v)} />
              <label className="font-bold text-muted">Trip
                <select value={p.trip_id} onChange={(e) => set("trip_id", e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-edge/15 bg-transparent px-2 text-ink">
                  {trips.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Text label="Category" value={p.category ?? ""} onChange={(v) => set("category", v)} />
              <Text label="Store location" value={p.store_location ?? ""} onChange={(v) => set("store_location", v)} />
            </div>
            <Text label="Image URL" value={p.image_url} onChange={(v) => set("image_url", v)} />
            <div className="flex items-center justify-between rounded-lg bg-brand-50 dark:bg-brand/15 px-3 py-2 font-bold text-brand-700 dark:text-blue-300"><span>Final price (auto)</span><span>{formatIDR(q.totalIdr)}</span></div>
            <Button className="mt-1" disabled={!p.name} onClick={() => onSave(p)}>Save Product</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
function Text({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return <label className="font-bold text-muted">{label}<input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-edge/15 bg-transparent px-3 text-ink" /></label>;
}
function Num({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return <label className="font-bold text-muted">{label}<input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-1 h-10 w-full rounded-lg border border-edge/15 bg-transparent px-3 text-ink" /></label>;
}

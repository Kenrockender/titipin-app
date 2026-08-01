"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatIDR } from "@/lib/format";
import { calculateQuote } from "@/lib/pricing";
import { waLink } from "@/components/layout/WhatsAppWidget";
import { ProductCard } from "@/components/catalog/ProductCard";

export default function ProductDetail() {
  const { productId } = useParams<{ productId: string }>();
  const router = useRouter();
  const { products, trips, addToCart } = useStore();
  const product = products.find((p) => p.id === productId);
  const [added, setAdded] = useState(false);
  if (!product) return <main className="mx-auto max-w-3xl px-5 py-20 text-center text-muted">Product not found. <Link href="/catalog" className="text-brand">Back to catalog</Link></main>;

  const trip = trips.find((t) => t.id === product.trip_id);
  const q = calculateQuote({ basePriceForeign: product.base_price_foreign, exchangeRate: trip?.system_exchange_rate ?? 1, markupPercentage: product.markup_percentage, flatJastipFee: product.flat_jastip_fee });
  const pairings = products.filter((p) => p.is_active && p.id !== product.id && p.category === product.category).slice(0, 4);

  return (
    <main className="mx-auto max-w-6xl px-5 py-8">
      <Link href="/catalog" className="mb-5 inline-flex items-center gap-1 text-sm font-bold text-muted hover:text-ink"><Icon name="arrow-left" size={15} /> Catalog</Link>
      <div className="grid gap-10 md:grid-cols-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.image_url} alt={product.name} className="aspect-square w-full rounded-2xl object-cover shadow-card" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/products/_placeholder.svg"; }} />
        <div className="flex flex-col gap-4">
          {product.category && <Badge tone="brand">{product.category}</Badge>}
          <h1 className="text-3xl font-extrabold tracking-tight">{product.name}</h1>
          <div className="text-3xl font-extrabold text-ink">{formatIDR(product.final_price_idr)}</div>
          <p className="leading-relaxed text-muted">{product.description}</p>
          <Card className="p-4 text-sm">
            <div className="mb-2 font-bold">Transparent price breakdown</div>
            <Row label={`Base price (${trip?.destination_country})`} value={formatIDR(q.baseIdr)} />
            <Row label={`Jastip upside (${product.markup_percentage}%)`} value={formatIDR(q.markupIdr)} />
            <Row label="Flat jastip fee" value={formatIDR(q.flatFeeIdr)} />
            <div className="mt-2 flex justify-between border-t border-edge/10 pt-2 font-extrabold"><span>All-in price</span><span>{formatIDR(product.final_price_idr)}</span></div>
          </Card>
          <div className="flex items-center gap-2 text-sm text-muted"><Icon name="plane" size={15} className="text-brand" /> Est. arrival with <b className="mx-1 text-ink">{trip?.name}</b></div>
          <div className="flex items-center gap-2 text-sm text-muted"><Icon name="store" size={15} className="text-brand" /> Sourced from {product.store_location}</div>
          {/* Color picker for shoes */}
          {product.color_variants && product.color_variants.length > 0 && (
            <div className="mt-1">
              <div className="mb-2 text-xs font-bold uppercase tracking-wider text-faint">Available Colors</div>
              <div className="flex items-center gap-2 flex-wrap">
                {product.color_variants.map((cv) => (
                  <Link
                    key={cv.product_id}
                    href={`/catalog/${cv.product_id}`}
                    title={cv.color_name}
                    className={`group/swatch flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${cv.product_id === product.id ? 'border-brand bg-brand/5 text-ink ring-1 ring-brand' : 'border-edge/10 text-muted hover:border-ink hover:text-ink'}`}
                  >
                    <span className="block h-3.5 w-3.5 rounded-full border border-edge/10" style={{ backgroundColor: cv.hex }} />
                    {cv.color_name}
                  </Link>
                ))}
              </div>
            </div>
          )}
          <div className="mt-2 flex flex-wrap gap-3">
            <Button className="h-12 px-6" onClick={() => { addToCart(product); setAdded(true); }}>
              <Icon name="shopping-cart" size={17} color="#fff" /> {added ? "Added ✓" : "Add to Cart"}
            </Button>
            {added && <Button variant="outline" className="h-12 px-6" onClick={() => router.push("/cart")}>Go to Checkout</Button>}
            <a href={waLink(`Hi, I have a question about ${product.name}.`)} target="_blank" rel="noreferrer">
              <Button variant="ghost" className="h-12 px-4"><Icon name="message-circle" size={17} /> Ask on WhatsApp</Button>
            </a>
          </div>
        </div>
      </div>

      {pairings.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-5 text-xl font-extrabold tracking-tight">Frequently Bought Together</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{pairings.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        </section>
      )}
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between py-0.5 text-muted"><span>{label}</span><span className="font-semibold text-ink">{value}</span></div>;
}

"use client";
import Link from "next/link";
import React from "react";
import { useStore } from "@/lib/store";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { ProductGrid } from "@/components/catalog/ProductGrid";

export default function LandingPage() {
  const { products, hauls, heroHauls, trips } = useStore();
  const activeTrip = trips.find((t) => t.status === "Active Shopping");
  const featured = products.filter((p) => p.is_active).slice(0, 8);

  return (
    <main>
      {activeTrip && (
        <div className="border-b border-brand-100 dark:border-brand/20 bg-gradient-to-r from-brand-50 to-white dark:from-brand/15 dark:to-transparent">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-5 py-2.5 text-[13.5px]">
            <Icon name="plane" size={16} className="text-brand" />
            <span className="font-bold text-brand-700 dark:text-blue-300">Next Trip: {activeTrip.name}</span>
            <span className="text-faint">— Open for Pre-Orders!</span>
            <Link href="/catalog" className="ml-auto font-bold text-brand hover:underline">Pre-order now →</Link>
          </div>
        </div>
      )}

      {/* HERO */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-14 md:grid-cols-2">
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
            <Icon name="badge-check" size={14} className="text-brand" /> Trusted jastip since 2022
          </div>
          <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight md:text-5xl">Get Anything from Overseas, Delivered to Your Door.</h1>
          <p className="max-w-md text-[17px] leading-relaxed text-muted">Shop our curated pre-order catalog, or send us any item — a link or a photo is enough. We buy it overseas and hand-carry it home to Indonesia.</p>
          <div className="mt-1 flex flex-wrap gap-3">
            <Link href="/request"><Button className="h-12 px-6">Request an Item <Icon name="arrow-right" size={17} color="#fff" /></Button></Link>
            <Link href="/catalog"><Button variant="outline" className="h-12 px-6">Browse Catalog</Button></Link>
          </div>
          <div className="mt-1 flex flex-wrap gap-5 text-[13px] text-faint">
            <span>★ 4.9 · 500+ orders delivered</span>
            <span>· DP protected</span>
            <span>· Real hand-carried hauls</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {heroHauls.map((h, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={h.src} src={h.src} alt={h.alt} className={`w-full rounded-2xl object-cover shadow-card ${i % 2 ? "aspect-[3/4]" : "aspect-square"}`} />
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-y border-edge/[.06] bg-surface">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-12 md:grid-cols-4">
          {[
            { icon: "search", t: "1. Browse or Request", d: "Pick from the catalog or drop a link/photo of what you want." },
            { icon: "receipt-text", t: "2. Get a Quote", d: "We calculate a transparent all-in price and DP." },
            { icon: "shopping-bag", t: "3. We Shop Overseas", d: "You get an instant WhatsApp the moment we secure it." },
            { icon: "house", t: "4. Delivered Home", d: "Pay the balance, we ship it to your door in Indonesia." }
          ].map((s) => (
            <div key={s.t} className="flex flex-col gap-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand/15"><Icon name={s.icon} size={20} className="text-brand" /></span>
              <div className="font-bold">{s.t}</div>
              <div className="text-sm text-muted">{s.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CATALOG */}
      <section id="catalog" className="mx-auto max-w-6xl px-5 py-14">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">Open for Pre-Order</h2>
            <p className="text-sm text-muted">Curated picks from our next trip. Prices are all-in.</p>
          </div>
          <Link href="/catalog" className="text-sm font-bold text-brand hover:underline">View all →</Link>
        </div>
        <ProductGrid products={featured} />
      </section>

      {/* RECENT HAULS */}
      <section className="border-t border-edge/[.06] bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <h2 className="text-2xl font-extrabold tracking-tight">Recent Hauls</h2>
          <p className="mb-6 text-sm text-muted">Real packed boxes and delivered items from past trips.</p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {hauls.map((h) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={h.src} src={h.src} alt={h.alt} loading="lazy" className="aspect-square w-full rounded-xl object-cover shadow-card" />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-brand px-6 py-14 text-center text-white">
          <h2 className="max-w-xl text-3xl font-extrabold tracking-tight">Can&apos;t find it? We&apos;ll hunt it down.</h2>
          <p className="max-w-md text-white/90">Paste a link or upload a screenshot. We&apos;ll send you a transparent quote within hours.</p>
          <Link href="/request"><Button variant="outline" className="h-12 border-surface bg-surface px-7 text-brand-700 dark:text-blue-300">Request an Item</Button></Link>
        </div>
      </section>
    </main>
  );
}

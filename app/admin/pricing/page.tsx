"use client";
import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatIDR } from "@/lib/format";
import { calculateQuote, paddedRate } from "@/lib/pricing";

export default function AdminPricing() {
  const { pricing, updatePricing, trips, updateTripRate } = useStore();
  const [draft, setDraft] = useState(pricing);
  const [saved, setSaved] = useState(false);
  const [rateDrafts, setRateDrafts] = useState<Record<string, number>>({});
  const [rateSaved, setRateSaved] = useState<string | null>(null);
  const realRate = 108;
  const sample = calculateQuote({ basePriceForeign: 1000, exchangeRate: paddedRate(realRate, draft.exchange_rate_buffer_pct), markupPercentage: draft.default_markup_percentage, flatJastipFee: draft.default_flat_fee_idr });

  return (
    <div className="max-w-3xl">
      <h1 className="mb-1 text-2xl font-extrabold tracking-tight">Pricing Engine</h1>
      <p className="mb-6 text-sm text-muted">Change these once — every quote across the app updates instantly.</p>
      <div className="grid gap-5 md:grid-cols-2">
        <Card className="flex flex-col gap-4 p-5">
          <Slider label="Default markup (upside)" suffix="%" value={draft.default_markup_percentage} min={0} max={60} onChange={(v) => { setDraft({ ...draft, default_markup_percentage: v }); setSaved(false); }} />
          <Slider label="Exchange rate buffer" suffix="%" value={draft.exchange_rate_buffer_pct} min={0} max={15} step={0.5} onChange={(v) => { setDraft({ ...draft, exchange_rate_buffer_pct: v }); setSaved(false); }} />
          <label className="text-sm font-bold text-muted">Flat jastip fee (IDR)
            <input type="number" value={draft.default_flat_fee_idr} onChange={(e) => { setDraft({ ...draft, default_flat_fee_idr: Number(e.target.value) }); setSaved(false); }} className="mt-1 h-10 w-full rounded-lg border border-edge/15 px-3 text-ink" />
          </label>
          <Button onClick={() => { updatePricing(draft); setSaved(true); }}>{saved ? "Saved ✓" : "Save Pricing"}</Button>
        </Card>
        <Card className="flex flex-col gap-2 p-5">
          <div className="mb-1 flex items-center gap-2 font-bold"><Icon name="calculator" size={16} className="text-brand" /> Live example</div>
          <p className="text-xs text-muted">For a foreign base price of 1,000 (real FX {realRate}):</p>
          <Row label={`Padded FX (+${draft.exchange_rate_buffer_pct}%)`} value={paddedRate(realRate, draft.exchange_rate_buffer_pct).toFixed(1)} />
          <Row label="Base in IDR" value={formatIDR(sample.baseIdr)} />
          <Row label={`Upside ${draft.default_markup_percentage}%`} value={formatIDR(sample.markupIdr)} />
          <Row label="Flat fee" value={formatIDR(sample.flatFeeIdr)} />
          <div className="mt-1 flex justify-between border-t border-edge/10 pt-2 font-extrabold"><span>Customer pays</span><span className="text-brand-700">{formatIDR(sample.totalIdr)}</span></div>
        </Card>
      </div>
      <Card className="mt-5 p-5">
        <div className="mb-3 font-bold">Trip exchange rates</div>
        <p className="mb-3 text-xs text-muted">This padded rate feeds the pricing engine for that trip&apos;s products — adjust it as the real-world rate moves.</p>
        {trips.map((t) => {
          const draftRate = rateDrafts[t.id] ?? t.system_exchange_rate;
          const dirty = draftRate !== t.system_exchange_rate;
          return (
            <div key={t.id} className="flex items-center justify-between gap-3 border-b border-edge/[.05] py-2 text-sm last:border-0">
              <div>
                <span className="font-semibold">{t.name}</span>
                <span className="ml-2 text-xs text-muted">{t.destination_country}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted">1 unit =</span>
                <input
                  type="number" step="0.1" value={draftRate}
                  onChange={(e) => { setRateDrafts((d) => ({ ...d, [t.id]: Number(e.target.value) })); setRateSaved(null); }}
                  className="h-8 w-24 rounded-lg border border-edge/15 px-2 text-right text-ink"
                />
                <span className="text-muted">IDR</span>
                <Button
                  className="h-8 px-3 text-xs"
                  disabled={!dirty}
                  onClick={() => { updateTripRate(t.id, draftRate); setRateSaved(t.id); }}
                >
                  {rateSaved === t.id && !dirty ? "Saved ✓" : "Save"}
                </Button>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
function Slider({ label, value, min, max, step = 1, suffix, onChange }: { label: string; value: number; min: number; max: number; step?: number; suffix: string; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm font-bold text-muted"><span>{label}</span><span className="text-brand-700">{value}{suffix}</span></div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-brand" />
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between text-sm text-muted"><span>{label}</span><span className="font-semibold text-ink">{value}</span></div>;
}

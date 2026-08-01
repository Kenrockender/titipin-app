"use client";
import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { formatIDR, formatDate, shortId } from "@/lib/format";
import { calculateQuote, calculateDP, DEFAULT_PRICING } from "@/lib/pricing";
import { waLinkTo } from "@/components/layout/WhatsAppWidget";
import { BANK_ACCOUNT_INFO } from "@/lib/constants";

export default function AdminRequests() {
  const { requests, quoteRequest, setRequestStatus, pricing, trips } = useStore();
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold tracking-tight">Request Inbox</h1>
      <p className="mb-6 text-sm text-muted">Review custom submissions, view reference photos, and issue quotes.</p>
      <div className="flex flex-col gap-3">
        {requests.map((r) => (
          <Card key={r.id} className="p-4">
            <div className="flex flex-wrap items-start gap-4">
              {r.uploaded_image_urls?.[0] && /* eslint-disable-next-line @next/next/no-img-element */ (
                <img src={r.uploaded_image_urls[0]} alt="" className="h-20 w-20 flex-none rounded-lg object-cover" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{r.product_name_or_desc}</span>
                  <StatusBadge status={r.status} />
                </div>
                <div className="text-sm text-muted">{r.customer_name} · Qty {r.quantity}{r.variations && ` · ${r.variations}`} · {formatDate(r.created_at)}</div>
                {r.product_url && <a href={r.product_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"><Icon name="link" size={13} /> Source link</a>}
                {r.quoted_price_idr && <div className="mt-1 text-sm">Quoted <b>{formatIDR(r.quoted_price_idr)}</b> · DP <b>{formatIDR(r.required_dp_idr ?? 0)}</b></div>}
              </div>
              <div className="flex flex-none flex-wrap gap-2">
                {r.status === "Pending Review" && <Button className="h-9" onClick={() => setOpenId(openId === r.id ? null : r.id)}><Icon name="calculator" size={15} color="#fff" /> Quote</Button>}
                {r.status === "Pending Review" && <Button variant="outline" className="h-9" onClick={() => setRequestStatus(r.id, "Rejected")}>Reject</Button>}
                {r.customer_whatsapp && (
                  <a
                    href={waLinkTo(r.customer_whatsapp, r.quoted_price_idr
                      ? `Hi ${r.customer_name}, request kamu untuk "${r.product_name_or_desc}" (req #${shortId(r.id)}) sudah saya quote:\n\nTotal: ${formatIDR(r.quoted_price_idr)}\nDP: ${formatIDR(r.required_dp_idr ?? 0)}\n\nSilakan transfer DP ke ${BANK_ACCOUNT_INFO}, lalu upload bukti transfer di app ya. Terima kasih!`
                      : `Hi ${r.customer_name}, soal request kamu "${r.product_name_or_desc}" (req #${shortId(r.id)}) — `)}
                    target="_blank" rel="noreferrer"
                  >
                    <Button variant="outline" className="h-9"><Icon name="message-circle" size={15} /> Chat WA</Button>
                  </a>
                )}
              </div>
            </div>
            {openId === r.id && <QuoteTool onQuote={(price, dp) => { quoteRequest(r.id, price, dp); setOpenId(null); }} rate={trips[0]?.system_exchange_rate ?? 112} pricing={pricing} qty={r.quantity} />}
          </Card>
        ))}
      </div>
    </div>
  );
}

function QuoteTool({ onQuote, rate, pricing, qty }: { onQuote: (p: number, dp: number) => void; rate: number; pricing: typeof DEFAULT_PRICING; qty: number }) {
  const [base, setBase] = useState(0);
  const [markup, setMarkup] = useState(pricing.default_markup_percentage);
  const [fee, setFee] = useState(pricing.default_flat_fee_idr);
  const [dpRatio, setDpRatio] = useState(0.6);
  const q = calculateQuote({ basePriceForeign: base, exchangeRate: rate, markupPercentage: markup, flatJastipFee: fee, quantity: qty });
  const dp = calculateDP(q.totalIdr, dpRatio);

  return (
    <div className="mt-4 grid gap-4 rounded-xl bg-brand-50 p-4 md:grid-cols-2">
      <div className="grid grid-cols-2 gap-3">
        <NumField label={`Base price (foreign)`} value={base} onChange={setBase} />
        <NumField label="Markup %" value={markup} onChange={setMarkup} />
        <NumField label="Flat fee (IDR)" value={fee} onChange={setFee} />
        <NumField label="System FX rate" value={rate} onChange={() => {}} disabled />
      </div>
      <div className="text-sm">
        <Row label={`Base ×${rate} FX`} value={formatIDR(q.baseIdr)} />
        <Row label={`Upside (${markup}%)`} value={formatIDR(q.markupIdr)} />
        <Row label="Flat fee" value={formatIDR(q.flatFeeIdr)} />
        <Row label={`Unit × qty ${qty}`} value={formatIDR(q.totalIdr)} />
        <div className="my-1 border-t border-brand-100" />
        <div className="flex justify-between font-extrabold text-brand-700"><span>Quote total</span><span>{formatIDR(q.totalIdr)}</span></div>
        <div className="mt-2 mb-1 flex gap-1">
          {[0.5, 0.6, 0.7].map((rr) => <button key={rr} onClick={() => setDpRatio(rr)} className={`flex-1 rounded py-1 text-xs font-bold ${dpRatio === rr ? "bg-brand text-white" : "bg-surface text-brand-700"}`}>{rr * 100}% DP</button>)}
        </div>
        <div className="flex justify-between font-bold"><span>Required DP</span><span>{formatIDR(dp)}</span></div>
        <Button className="mt-3 w-full h-10" disabled={base <= 0} onClick={() => onQuote(q.totalIdr, dp)}>Send Quote to Customer</Button>
      </div>
    </div>
  );
}
function NumField({ label, value, onChange, disabled }: { label: string; value: number; onChange: (n: number) => void; disabled?: boolean }) {
  return (
    <label className="text-xs font-bold text-muted">{label}
      <input type="number" value={value} disabled={disabled} onChange={(e) => onChange(Number(e.target.value))} className="mt-1 h-9 w-full rounded-lg border border-edge/15 bg-surface px-2 text-sm text-ink disabled:opacity-60" />
    </label>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between text-muted"><span>{label}</span><span className="font-semibold text-ink">{value}</span></div>;
}

"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { formatIDR, formatDate, shortId } from "@/lib/format";
import { waLink } from "@/components/layout/WhatsAppWidget";
import { BANK_ACCOUNT_INFO } from "@/lib/constants";

const TIMELINE = ["Waiting DP", "DP Paid", "Purchased Overseas", "Shipped to ID", "Awaiting Final Payment", "Completed"];

export default function OrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const { orders, currentUser, isAdmin, markPayment, refundAsStoreCredit } = useStore();
  const [receipt, setReceipt] = useState<string | null>(null);
  if (!currentUser) {
    return (
      <main className="mx-auto max-w-md px-5 py-24 text-center">
        <Icon name="lock" size={36} className="mx-auto mb-4 text-faint" />
        <h1 className="text-2xl font-extrabold">Track your order</h1>
        <p className="mt-1 text-muted">Log in to view this order. You&apos;ll be brought right back here.</p>
        <Link href={`/login?next=/dashboard/${orderId}`}><Button className="mt-5">Log In</Button></Link>
      </main>
    );
  }
  const order = orders.find((o) => o.id === orderId && (isAdmin || o.user_id === currentUser.id));
  if (!order) return <main className="mx-auto max-w-2xl px-5 py-20 text-center text-muted">Order not found. <Link href="/dashboard" className="text-brand">Back</Link></main>;

  const stepIdx = TIMELINE.indexOf(order.status);
  const oosItem = order.items.find((i) => i.item_status === "Out of Stock");
  const needsDP = order.status === "Waiting DP";
  const needsFinal = order.status === "Awaiting Final Payment";
  const finalBalance = order.total_price_idr - order.total_dp_required_idr + (order.local_shipping_fee_idr ?? 0);

  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      <Link href="/dashboard" className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-muted hover:text-ink"><Icon name="arrow-left" size={15} /> My Orders</Link>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Order #{shortId(order.id)}</h1>
          <p className="text-sm text-muted">Placed {formatDate(order.created_at)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Timeline */}
      <Card className="mb-5 overflow-x-auto p-5">
        <div className="relative flex min-w-[560px] items-start justify-between">
          <div className="absolute left-0 right-0 top-3.5 h-0.5 -translate-y-1/2 bg-edge/[.08]" />
          <div
            className="absolute left-0 top-3.5 h-0.5 -translate-y-1/2 bg-brand transition-all"
            style={{ width: `${(stepIdx / (TIMELINE.length - 1)) * 100}%` }}
          />
          {TIMELINE.map((step, i) => (
            <div key={step} className="relative z-10 flex w-0 flex-1 flex-col items-center gap-1.5">
              <span className={`flex h-7 w-7 flex-none items-center justify-center rounded-full text-xs font-bold ${i <= stepIdx ? "bg-brand text-white" : "bg-gray-100 text-faint dark:bg-neutral-800"}`}>{i < stepIdx ? "✓" : i + 1}</span>
              <span className={`text-center text-[11px] font-semibold leading-tight ${i <= stepIdx ? "text-ink" : "text-faint"}`}>{step}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* OOS pivot */}
      {oosItem && (
        <Card className="mb-5 border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-500/10 p-5">
          <div className="flex items-center gap-2 font-bold text-red-700 dark:text-red-400"><Icon name="triangle-alert" size={18} /> {oosItem.item_name} was sold out</div>
          <p className="mt-1 text-sm text-red-700/80 dark:text-red-400/80">Your item wasn&apos;t available overseas. Choose how you&apos;d like your {formatIDR(oosItem.locked_price_idr * oosItem.quantity)} handled:</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a href={waLink(`Hi, I'd like a cash refund for my out-of-stock item on order #${shortId(order.id)}.`)} target="_blank" rel="noreferrer"><Button variant="outline">Refund to Bank</Button></a>
            <Button variant="danger" onClick={() => refundAsStoreCredit(order.id, oosItem.id)}>Keep as Store Credit</Button>
          </div>
        </Card>
      )}

      {/* Items */}
      <Card className="mb-5 p-5">
        <div className="mb-3 font-bold">Items</div>
        <div className="flex flex-col gap-3">
          {order.items.map((it) => (
            <div key={it.id} className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.image_url} alt="" className="h-14 w-14 rounded-lg object-cover" />
              <div className="flex-1">
                <div className="font-semibold">{it.item_name}</div>
                <div className="text-xs text-muted">Qty {it.quantity} · {it.store_location}</div>
              </div>
              <StatusBadge status={it.item_status} />
              <div className="w-24 text-right font-bold">{formatIDR(it.locked_price_idr * it.quantity)}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Payment */}
      <Card className="p-5">
        <div className="mb-3 font-bold">Payment</div>
        <Row label="Total" value={formatIDR(order.total_price_idr)} />
        <Row label="Down payment" value={formatIDR(order.total_dp_required_idr)} />
        <Row label="Delivery" value={order.delivery_method === "GoSend" ? "GoSend" : "Ambil Sendiri (Pickup)"} />
        {order.local_shipping_fee_idr != null && <Row label="Local shipping" value={formatIDR(order.local_shipping_fee_idr)} />}
        <div className="my-2 border-t border-edge/10" />
        {(needsDP || needsFinal) && (
          <div className="rounded-xl bg-brand-50 dark:bg-brand/15 p-4">
            <div className="mb-1 flex items-center justify-between">
              <span className="font-bold text-brand-700 dark:text-blue-300">{needsDP ? "Pay Down Payment" : "Pay Final Balance"}</span>
              <span className="text-lg font-extrabold text-brand-700 dark:text-blue-300">{formatIDR(needsDP ? order.total_dp_required_idr : finalBalance)}</span>
            </div>
            <p className="mb-3 text-xs text-muted">Transfer to <b>{BANK_ACCOUNT_INFO}</b> or scan QRIS, then upload your receipt.</p>
            <label className="mb-3 flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-brand/40 py-4 text-sm font-semibold text-brand-700 dark:text-blue-300 hover:bg-surface">
              <Icon name="upload" size={16} /> {receipt ? "Receipt attached ✓" : "Upload transfer receipt"}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = () => setReceipt(r.result as string); r.readAsDataURL(f); } }} />
            </label>
            <Button className="w-full" disabled={!receipt} onClick={() => markPayment(order.id, needsDP ? "Down Payment" : "Final Payment")}>
              {needsDP ? "Confirm DP Payment" : "Confirm Final Payment"}
            </Button>
          </div>
        )}
        {!needsDP && !needsFinal && <p className="text-sm text-muted">No payment required right now. We&apos;ll notify you on WhatsApp at the next step.</p>}
      </Card>
    </main>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between py-0.5 text-muted"><span>{label}</span><span className="font-semibold text-ink">{value}</span></div>;
}

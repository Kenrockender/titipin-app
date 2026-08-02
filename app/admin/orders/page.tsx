"use client";
import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { formatIDR, formatDate, shortId } from "@/lib/format";
import { waLinkTo } from "@/components/layout/WhatsAppWidget";
import { BANK_ACCOUNT_INFO } from "@/lib/constants";
import type { Order, OrderStatus } from "@/types/database.types";

const NEXT: Partial<Record<OrderStatus, OrderStatus>> = {
  "Waiting DP": "DP Paid", "DP Paid": "Purchased Overseas", "Purchased Overseas": "Shipped to ID",
  "Shipped to ID": "Awaiting Final Payment", "Awaiting Final Payment": "Completed"
};

export default function AdminOrders() {
  const { orders, payments, setOrderStatus, verifyPayment } = useStore();
  const [open, setOpen] = useState<string | null>(orders[0]?.id ?? null);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold tracking-tight">Orders</h1>
      <p className="mb-6 text-sm text-muted">Manage active orders, verify payments, and advance each order through the pipeline.</p>
      <div className="flex flex-col gap-3">
        {orders.map((o) => (
          <Card key={o.id} className="p-4">
            <button className="flex w-full flex-col gap-3 text-left sm:flex-row sm:items-center sm:gap-4" onClick={() => setOpen(open === o.id ? null : o.id)}>
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex flex-none -space-x-3">
                  {o.items.slice(0, 3).map((it) => /* eslint-disable-next-line @next/next/no-img-element */ (
                    <img key={it.id} src={it.image_url} alt={it.item_name} className="h-10 w-10 flex-none rounded-lg border-2 border-surface object-cover" />
                  ))}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-bold">#{shortId(o.id)} · {o.items.length} item(s)</div>
                  <div className="truncate text-xs text-muted">{o.customer_name} · {formatDate(o.created_at)}</div>
                </div>
              </div>
              <div className="flex flex-none items-center gap-2 sm:ml-auto">
                <span className={`hidden rounded-full px-2.5 py-1 text-[11px] font-bold sm:inline-block ${o.delivery_method === "GoSend" ? "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400" : "bg-edge/[.05] text-muted"}`}>
                  {o.delivery_method === "GoSend" ? "GoSend" : "Pickup"}
                </span>
                <StatusBadge status={o.status} />
                <div className="w-24 text-right font-extrabold sm:w-28">{formatIDR(o.total_price_idr)}</div>
                <Icon name={open === o.id ? "chevron-up" : "chevron-down"} size={18} className="flex-none text-faint" />
              </div>
            </button>
            {open === o.id && (
              <div className="mt-4 border-t border-edge/[.06] pt-4">
                {(() => {
                  const pending = payments.find((p) => p.order_id === o.id && p.status === "Pending Verification");
                  if (!pending) return null;
                  const nextStatus = NEXT[o.status];
                  return (
                    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 p-3">
                      {pending.receipt_image_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <a href={pending.receipt_image_url} target="_blank" rel="noreferrer">
                          <img src={pending.receipt_image_url} alt="Payment receipt" className="h-14 w-14 flex-none rounded-lg object-cover" />
                        </a>
                      )}
                      <div className="min-w-0 flex-1 text-sm">
                        <div className="font-bold text-amber-800 dark:text-amber-400">{pending.payment_type} claimed — {formatIDR(pending.amount_idr)}</div>
                        <div className="text-xs text-amber-800/70 dark:text-amber-400/70">Check the bank mutation before verifying.</div>
                      </div>
                      {nextStatus && (
                        <Button className="h-9 flex-none" onClick={() => verifyPayment(pending.id, o.id, nextStatus)}>
                          <Icon name="badge-check" size={15} color="#fff" /> Verify & Advance → {nextStatus}
                        </Button>
                      )}
                    </div>
                  );
                })()}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="mb-2 text-sm font-bold">Line items</div>
                    {o.items.map((it) => (
                      <div key={it.id} className="flex items-center justify-between py-1 text-sm">
                        <span>{it.item_name} <span className="text-faint">×{it.quantity}</span></span>
                        <StatusBadge status={it.item_status} />
                      </div>
                    ))}
                  </div>
                  <div className="text-sm">
                    <div className="mb-2 font-bold">Payment</div>
                    <Row label="Total" value={formatIDR(o.total_price_idr)} />
                    <Row label="DP required" value={formatIDR(o.total_dp_required_idr)} />
                    <Row label="Balance" value={formatIDR(o.total_price_idr - o.total_dp_required_idr)} />
                    <div className="mt-3 flex flex-wrap gap-2">
                      {NEXT[o.status] && <Button variant="outline" className="h-9" onClick={() => setOrderStatus(o.id, NEXT[o.status]!)}>Advance → {NEXT[o.status]}</Button>}
                      {o.status !== "Cancelled" && o.status !== "Completed" && <Button variant="outline" className="h-9" onClick={() => setOrderStatus(o.id, "Cancelled")}>Cancel</Button>}
                      {o.customer_whatsapp && (
                        <a href={waLinkTo(o.customer_whatsapp, waMessage(o))} target="_blank" rel="noreferrer">
                          <Button variant="outline" className="h-9"><Icon name="message-circle" size={15} /> Chat WA</Button>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between text-muted"><span>{label}</span><span className="font-semibold text-ink">{value}</span></div>;
}

function waMessage(o: Order): string {
  const header = `Hi ${o.customer_name}, soal order #${shortId(o.id)} kamu`;
  if (o.status === "Waiting DP") {
    return `${header} — total ${formatIDR(o.total_price_idr)}, DP yang perlu ditransfer: ${formatIDR(o.total_dp_required_idr)} ke ${BANK_ACCOUNT_INFO}. Setelah transfer, upload bukti di halaman order ya. Terima kasih!`;
  }
  if (o.status === "Awaiting Final Payment") {
    const balance = o.total_price_idr - o.total_dp_required_idr + (o.local_shipping_fee_idr ?? 0);
    return `${header} — barang sudah siap dikirim. Sisa pelunasan: ${formatIDR(balance)} ke ${BANK_ACCOUNT_INFO}. Setelah transfer, upload bukti di halaman order ya. Terima kasih!`;
  }
  return `${header} — `;
}

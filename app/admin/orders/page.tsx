"use client";
import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { formatIDR, formatDate, shortId } from "@/lib/format";
import type { OrderStatus } from "@/types/database.types";

const NEXT: Partial<Record<OrderStatus, OrderStatus>> = {
  "Waiting DP": "DP Paid", "DP Paid": "Purchased Overseas", "Purchased Overseas": "Shipped to ID",
  "Shipped to ID": "Awaiting Final Payment", "Awaiting Final Payment": "Completed"
};

export default function AdminOrders() {
  const { orders, setOrderStatus } = useStore();
  const [open, setOpen] = useState<string | null>(orders[0]?.id ?? null);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold tracking-tight">Orders</h1>
      <p className="mb-6 text-sm text-muted">Manage active orders, verify payments, and advance each order through the pipeline.</p>
      <div className="flex flex-col gap-3">
        {orders.map((o) => (
          <Card key={o.id} className="p-4">
            <button className="flex w-full items-center gap-4 text-left" onClick={() => setOpen(open === o.id ? null : o.id)}>
              <div className="flex -space-x-3">
                {o.items.slice(0, 3).map((it) => /* eslint-disable-next-line @next/next/no-img-element */ (
                  <img key={it.id} src={it.image_url} alt="" className="h-10 w-10 rounded-lg border-2 border-white object-cover" />
                ))}
              </div>
              <div className="flex-1">
                <div className="font-bold">#{shortId(o.id)} · {o.items.length} item(s)</div>
                <div className="text-xs text-muted">{formatDate(o.created_at)}</div>
              </div>
              <span className={`hidden rounded-full px-2.5 py-1 text-[11px] font-bold sm:inline-block ${o.delivery_method === "GoSend" ? "bg-blue-50 text-blue-700" : "bg-black/[.05] text-muted"}`}>
                {o.delivery_method === "GoSend" ? "GoSend" : "Pickup"}
              </span>
              <StatusBadge status={o.status} />
              <div className="w-28 text-right font-extrabold">{formatIDR(o.total_price_idr)}</div>
              <Icon name={open === o.id ? "chevron-up" : "chevron-down"} size={18} className="text-faint" />
            </button>
            {open === o.id && (
              <div className="mt-4 border-t border-black/[.06] pt-4">
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
                      {NEXT[o.status] && <Button className="h-9" onClick={() => setOrderStatus(o.id, NEXT[o.status]!)}>Advance → {NEXT[o.status]}</Button>}
                      {o.status !== "Cancelled" && o.status !== "Completed" && <Button variant="outline" className="h-9" onClick={() => setOrderStatus(o.id, "Cancelled")}>Cancel</Button>}
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

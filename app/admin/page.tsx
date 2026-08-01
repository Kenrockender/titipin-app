"use client";
import Link from "next/link";
import React from "react";
import { useStore } from "@/lib/store";
import { Icon } from "@/components/ui/Icon";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { formatIDR, formatDate, shortId } from "@/lib/format";
import type { OrderStatus } from "@/types/database.types";

const PIPELINE: OrderStatus[] = ["Waiting DP", "DP Paid", "Purchased Overseas", "Shipped to ID", "Awaiting Final Payment", "Completed"];

export default function AdminOverview() {
  const { orders, requests, products } = useStore();
  const revenue = orders.filter((o) => o.status !== "Cancelled").reduce((s, o) => s + o.total_price_idr, 0);
  const pendingReq = requests.filter((r) => r.status === "Pending Review").length;
  const activeOrders = orders.filter((o) => !["Completed", "Cancelled"].includes(o.status)).length;

  const stat = (icon: string, label: string, value: string) => (
    <Card className="flex items-center gap-3 p-4">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50"><Icon name={icon} size={20} className="text-brand" /></span>
      <div><div className="text-xl font-extrabold">{value}</div><div className="text-xs text-muted">{label}</div></div>
    </Card>
  );

  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold tracking-tight">Overview</h1>
      <p className="mb-6 text-sm text-muted">Your whole jastip operation at a glance.</p>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stat("wallet", "Pipeline value", formatIDR(revenue))}
        {stat("clipboard-list", "Active orders", String(activeOrders))}
        {stat("inbox", "Requests to review", String(pendingReq))}
        {stat("package", "Catalog items", String(products.length))}
      </div>

      <h2 className="mb-3 text-lg font-extrabold">Order Pipeline</h2>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {PIPELINE.map((stage) => {
          const list = orders.filter((o) => o.status === stage);
          return (
            <div key={stage} className="rounded-2xl bg-surface p-3 shadow-card">
              <div className="mb-2 flex items-center justify-between px-1">
                <StatusBadge status={stage} />
                <span className="text-xs font-bold text-faint">{list.length}</span>
              </div>
              <div className="flex flex-col gap-2">
                {list.map((o) => (
                  <Link key={o.id} href={`/admin/orders?focus=${o.id}`}>
                    <div className="rounded-xl border border-edge/[.06] p-2.5 text-sm transition hover:border-brand">
                      <div className="font-bold">#{shortId(o.id)}</div>
                      <div className="flex justify-between text-xs text-muted"><span>{o.items.length} item(s)</span><span>{formatIDR(o.total_price_idr)}</span></div>
                    </div>
                  </Link>
                ))}
                {list.length === 0 && <div className="px-1 py-2 text-xs text-faint">Empty</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

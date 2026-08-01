"use client";
import React, { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatIDR, shortId } from "@/lib/format";
import { waLinkTo } from "@/components/layout/WhatsAppWidget";
import type { ItemStatus, OrderItem } from "@/types/database.types";

interface Line extends OrderItem { orderShort: string; customerWhatsapp: string; }

export default function ShopperMode() {
  const { orders, setItemStatus } = useStore();
  const [toast, setToast] = useState<string | null>(null);

  // Group all purchasable line items by physical store.
  const byStore = useMemo(() => {
    const map = new Map<string, Line[]>();
    orders.filter((o) => ["DP Paid", "Purchased Overseas"].includes(o.status)).forEach((o) => {
      o.items.forEach((it) => {
        const arr = map.get(it.store_location) ?? [];
        arr.push({ ...it, orderShort: shortId(o.id), customerWhatsapp: o.customer_whatsapp });
        map.set(it.store_location, arr);
      });
    });
    return Array.from(map.entries());
  }, [orders]);

  const secure = (orderId: string, item: Line) => {
    setItemStatus(orderId, item.id, "Secured");
    if (item.customerWhatsapp) {
      window.open(waLinkTo(item.customerWhatsapp, `Hi! Good news, I just secured your "${item.item_name}"! It's on its way home soon.`), "_blank", "noopener,noreferrer");
      setToast(`WhatsApp opened: "Good news! I just secured your ${item.item_name}!"`);
    } else {
      setToast(`Secured — no WhatsApp number on file for this customer.`);
    }
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-5">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight"><Icon name="shopping-bag" size={22} className="text-brand" /> Shopper Mode</h1>
        <p className="text-sm text-muted">Your in-store checklist, grouped by shop. Tap <b>Secured</b> the moment you buy — the customer gets an instant WhatsApp.</p>
      </div>

      {byStore.length === 0 && <div className="rounded-2xl bg-surface p-8 text-center text-muted shadow-card">No items to buy right now. Items appear here once a customer&apos;s DP is paid.</div>}

      <div className="flex flex-col gap-5">
        {byStore.map(([store, items]) => {
          const done = items.filter((i) => i.item_status === "Secured").length;
          return (
            <div key={store} className="overflow-hidden rounded-2xl bg-surface shadow-card">
              <div className="flex items-center gap-2 border-b border-edge/[.06] bg-brand-50 dark:bg-brand/15 px-4 py-3">
                <Icon name="store" size={18} className="text-brand" />
                <span className="font-extrabold">{store}</span>
                <Badge tone="brand">{done}/{items.length}</Badge>
              </div>
              <div className="divide-y divide-edge/[.05]">
                {items.map((it) => (
                  <div key={it.id} className="flex items-center gap-3 p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={it.image_url} alt="" className="h-14 w-14 flex-none rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold leading-tight">{it.item_name}</div>
                      <div className="text-xs text-muted">Qty {it.quantity} · #{it.orderShort} · {formatIDR(it.locked_price_idr)}</div>
                    </div>
                    <StatusButtons item={it} customerWhatsapp={it.customerWhatsapp} onSecure={() => secure(it.order_id, it)} onOOS={() => setItemStatus(it.order_id, it.id, "Out of Stock")} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-lg">
          <Icon name="check-check" size={18} color="#fff" /> {toast}
        </div>
      )}
    </div>
  );
}

function StatusButtons({ item, customerWhatsapp, onSecure, onOOS }: { item: OrderItem; customerWhatsapp: string; onSecure: () => void; onOOS: () => void }) {
  if (item.item_status === "Secured") return <Badge tone="green"><Icon name="check" size={13} /> Secured</Badge>;
  if (item.item_status === "Out of Stock") return (
    <div className="flex flex-col items-end gap-1">
      <Badge tone="red">Out of Stock</Badge>
      <a href={waLinkTo(customerWhatsapp, `Hi! Sadly your item "${item.item_name}" was sold out. Would you like a cash refund or store credit?`)} target="_blank" rel="noreferrer" className="text-[11px] font-bold text-brand hover:underline">Notify customer →</a>
    </div>
  );
  return (
    <div className="flex flex-none flex-col gap-1.5">
      <Button className="h-9 px-3" onClick={onSecure}><Icon name="check" size={15} color="#fff" /> Secured</Button>
      <Button variant="outline" className="h-8 px-3 text-xs" onClick={onOOS}>Out of stock</Button>
    </div>
  );
}

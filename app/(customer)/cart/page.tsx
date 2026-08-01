"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatIDR } from "@/lib/format";
import { calculateDP } from "@/lib/pricing";
import type { DeliveryMethod } from "@/types/database.types";

export default function CartPage() {
  const { cart, addOns, removeFromCart, placeOrder, currentUser } = useStore();
  const router = useRouter();
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [dpRatio, setDpRatio] = useState(0.6);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("Pickup");

  if (cart.length === 0) return (
    <main className="mx-auto max-w-md px-5 py-24 text-center">
      <Icon name="shopping-cart" size={40} className="mx-auto mb-4 text-faint" />
      <h1 className="text-2xl font-extrabold">Your cart is empty</h1>
      <p className="mt-1 text-muted">Add items from the catalog or request a custom item.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/catalog"><Button>Browse Catalog</Button></Link>
        <Link href="/request"><Button variant="outline">Request an Item</Button></Link>
      </div>
    </main>
  );

  const itemsTotal = cart.reduce((s, l) => s + l.product.final_price_idr * l.quantity, 0);
  const addonTotal = selectedAddons.reduce((s, id) => s + (addOns.find((a) => a.id === id)?.price_idr ?? 0), 0);
  const total = itemsTotal + addonTotal;
  const dp = calculateDP(total, dpRatio);

  const checkout = () => {
    if (!currentUser) { router.push("/login?next=/cart"); return; }
    if (!currentUser.shipping_address.trim()) { router.push("/profile?next=/cart&needAddress=1"); return; }
    const id = placeOrder({ addonIds: selectedAddons, dpRatio, deliveryMethod });
    router.push(`/dashboard/${id}`);
  };

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight">Checkout</h1>
      <div className="grid gap-6 md:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-3">
          {cart.map((l) => (
            <Card key={l.product.id} className="flex items-center gap-4 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={l.product.image_url} alt="" className="h-16 w-16 rounded-lg object-cover" />
              <div className="flex-1">
                <div className="font-bold">{l.product.name}</div>
                <div className="text-sm text-muted">Qty {l.quantity} · {l.product.store_location}</div>
              </div>
              <div className="text-right font-extrabold">{formatIDR(l.product.final_price_idr * l.quantity)}</div>
              <button onClick={() => removeFromCart(l.product.id)} className="text-faint hover:text-red-600"><Icon name="trash-2" size={18} /></button>
            </Card>
          ))}

          <Card className="p-4">
            <div className="mb-3 flex items-center gap-2 font-bold"><Icon name="sparkles" size={16} className="text-brand" /> Add-ons</div>
            <div className="flex flex-col gap-2">
              {addOns.map((a) => (
                <label key={a.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-black/10 p-3 text-sm hover:border-brand">
                  <input type="checkbox" checked={selectedAddons.includes(a.id)}
                    onChange={(e) => setSelectedAddons(e.target.checked ? [...selectedAddons, a.id] : selectedAddons.filter((x) => x !== a.id))} />
                  <span className="flex-1 font-semibold">{a.name}</span>
                  <span className="font-bold text-brand-700">+{formatIDR(a.price_idr)}</span>
                </label>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <div className="mb-3 flex items-center gap-2 font-bold"><Icon name="package" size={16} className="text-brand" /> Delivery method</div>
            <div className="grid grid-cols-2 gap-2">
              {([
                { value: "Pickup", label: "Ambil Sendiri", desc: "Pickup di lokasi, tanpa ongkir" },
                { value: "GoSend", label: "Dikirim GoSend", desc: "Ongkir ditentukan admin setelah barang tiba" },
              ] as const).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDeliveryMethod(opt.value)}
                  className={`rounded-lg border p-3 text-left text-sm transition ${deliveryMethod === opt.value ? "border-brand bg-brand-50" : "border-black/10 hover:border-brand/40"}`}
                >
                  <div className={`font-bold ${deliveryMethod === opt.value ? "text-brand-700" : "text-ink"}`}>{opt.label}</div>
                  <div className="mt-0.5 text-xs text-muted">{opt.desc}</div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div>
          <Card className="sticky top-20 flex flex-col gap-3 p-5">
            <div className="text-lg font-extrabold">Order Summary</div>
            <Row label="Items" value={formatIDR(itemsTotal)} />
            <Row label="Add-ons" value={formatIDR(addonTotal)} />
            <div className="flex justify-between border-t border-black/10 pt-2 text-lg font-extrabold"><span>Total</span><span>{formatIDR(total)}</span></div>
            <div className="mt-2 rounded-xl bg-brand-50 p-3">
              <div className="mb-2 text-sm font-bold text-brand-700">Down payment</div>
              <div className="mb-2 flex gap-2">
                {[0.5, 0.6, 0.7].map((r) => (
                  <button key={r} onClick={() => setDpRatio(r)} className={`flex-1 rounded-lg py-1.5 text-sm font-bold ${dpRatio === r ? "bg-brand text-white" : "bg-white text-brand-700 border border-brand-100"}`}>{r * 100}%</button>
                ))}
              </div>
              <div className="flex justify-between text-sm"><span className="text-muted">Pay now (DP)</span><span className="font-extrabold text-brand-700">{formatIDR(dp)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted">Pay on arrival</span><span className="font-bold">{formatIDR(total - dp)}</span></div>
            </div>
            {currentUser && !currentUser.shipping_address.trim() && (
              <p className="rounded-lg bg-amber-50 p-2 text-center text-xs font-semibold text-amber-800">Isi alamat pengiriman di Profile dulu sebelum checkout.</p>
            )}
            <Button className="h-12" onClick={checkout}>Place Order & Pay DP</Button>
            <p className="text-center text-xs text-faint">Manual transfer / QRIS · upload proof after ordering</p>
          </Card>
        </div>
      </div>
    </main>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between text-muted"><span>{label}</span><span className="font-semibold text-ink">{value}</span></div>;
}

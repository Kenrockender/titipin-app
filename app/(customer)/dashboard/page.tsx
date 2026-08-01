"use client";
import Link from "next/link";
import React from "react";
import { useStore } from "@/lib/store";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { formatIDR, formatDate, shortId } from "@/lib/format";

export default function DashboardPage() {
  const { currentUser, orders, requests } = useStore();
  if (!currentUser) return <NeedLogin />;
  const myOrders = orders.filter((o) => o.user_id === currentUser.id);
  const myRequests = requests.filter((r) => r.user_id === currentUser.id);

  return (
    <main className="mx-auto max-w-4xl px-5 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">My Orders</h1>
          <p className="text-sm text-muted">Welcome back, {currentUser.full_name.split(" ")[0]}.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-brand-50 dark:bg-brand/15 px-4 py-2 text-sm"><span className="text-muted">Store credit: </span><b className="text-brand-700 dark:text-blue-300">{formatIDR(currentUser.store_credit_balance)}</b></div>
          <Link href="/profile"><Button variant="outline" className="h-10">Profile</Button></Link>
        </div>
      </div>

      <h2 className="mb-3 text-lg font-extrabold">Active & Past Orders</h2>
      <div className="flex flex-col gap-3">
        {myOrders.length === 0 && <Card className="p-6 text-center text-muted">No orders yet. <Link href="/catalog" className="text-brand">Browse the catalog →</Link></Card>}
        {myOrders.map((o) => (
          <Link key={o.id} href={`/dashboard/${o.id}`}>
            <Card className="flex items-center gap-4 p-4 transition hover:shadow-lg">
              <div className="flex -space-x-3">
                {o.items.slice(0, 3).map((it) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={it.id} src={it.image_url} alt="" className="h-11 w-11 rounded-lg border-2 border-surface object-cover" />
                ))}
              </div>
              <div className="flex-1">
                <div className="font-bold">Order #{shortId(o.id)}</div>
                <div className="text-sm text-muted">{o.items.length} item(s) · {formatDate(o.created_at)}</div>
              </div>
              <div className="text-right">
                <StatusBadge status={o.status} />
                <div className="mt-1 font-extrabold">{formatIDR(o.total_price_idr)}</div>
              </div>
              <Icon name="chevron-right" size={18} className="text-faint" />
            </Card>
          </Link>
        ))}
      </div>

      <h2 className="mb-3 mt-8 text-lg font-extrabold">Custom Requests</h2>
      <div className="flex flex-col gap-3">
        {myRequests.length === 0 && <Card className="p-6 text-center text-muted">No requests yet. <Link href="/request" className="text-brand">Request an item →</Link></Card>}
        {myRequests.map((r) => (
          <Card key={r.id} className="flex items-center gap-4 p-4">
            {r.uploaded_image_urls?.[0] && /* eslint-disable-next-line @next/next/no-img-element */ (
              <img src={r.uploaded_image_urls[0]} alt="" className="h-12 w-12 rounded-lg object-cover" />
            )}
            <div className="flex-1">
              <div className="font-bold">{r.product_name_or_desc}</div>
              <div className="text-sm text-muted">Qty {r.quantity}{r.variations && ` · ${r.variations}`}</div>
            </div>
            <div className="text-right">
              <StatusBadge status={r.status} />
              {r.quoted_price_idr && <div className="mt-1 text-sm">Quote: <b>{formatIDR(r.quoted_price_idr)}</b></div>}
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}

function NeedLogin() {
  return (
    <main className="mx-auto max-w-md px-5 py-24 text-center">
      <Icon name="lock" size={36} className="mx-auto mb-4 text-faint" />
      <h1 className="text-2xl font-extrabold">Track your order</h1>
      <p className="mt-1 text-muted">Log in to see your orders, requests, and live status updates. You&apos;ll be brought right back here.</p>
      <div className="mt-5 flex justify-center gap-3">
        <Link href="/login?next=/dashboard"><Button>Log In</Button></Link>
        <Link href="/register"><Button variant="outline">Sign Up</Button></Link>
      </div>
    </main>
  );
}

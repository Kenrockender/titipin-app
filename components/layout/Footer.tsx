"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { Icon } from "@/components/ui/Icon";

export function Footer() {
  const path = usePathname();
  if (path.startsWith("/admin")) return null;
  return (
    <footer className="mt-16 border-t border-edge/[.07] bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-brand"><Icon name="package" size={18} color="#fff" /></span>
            <span className="text-lg font-extrabold">Titipin</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted">Your trusted personal shopper. We hand-carry anything from overseas, straight to your door in Indonesia.</p>
        </div>
        <div className="text-sm">
          <div className="mb-3 font-bold">Explore</div>
          <ul className="space-y-2 text-muted">
            <li><Link href="/catalog" className="hover:text-brand">Catalog</Link></li>
            <li><Link href="/request" className="hover:text-brand">Request an Item</Link></li>
            <li><Link href="/dashboard" className="hover:text-brand">Track My Order</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <div className="mb-3 font-bold">Trust</div>
          <ul className="space-y-2 text-muted">
            <li className="flex items-center gap-2"><Icon name="badge-check" size={15} className="text-brand" /> 500+ orders delivered</li>
            <li className="flex items-center gap-2"><Icon name="shield-check" size={15} className="text-brand" /> DP protected · store credit</li>
            <li className="flex items-center gap-2"><Icon name="plane" size={15} className="text-brand" /> Real trips, real hauls</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-edge/[.06] py-5 text-center text-xs text-faint">© 2026 Titipin · Jasa Titip Platform</div>
    </footer>
  );
}

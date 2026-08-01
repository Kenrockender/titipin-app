"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { useStore } from "@/lib/store";
import { useTheme } from "@/lib/theme";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";

const NAV = [
  { href: "/admin", icon: "layout-dashboard", label: "Overview" },
  { href: "/admin/requests", icon: "inbox", label: "Request Inbox" },
  { href: "/admin/orders", icon: "clipboard-list", label: "Orders" },
  { href: "/admin/catalog", icon: "package", label: "Catalog" },
  { href: "/admin/shopper-mode", icon: "shopping-bag", label: "Shopper Mode" },
  { href: "/admin/pricing", icon: "sliders-horizontal", label: "Pricing Engine" }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, logout } = useStore();
  const { theme, toggleTheme } = useTheme();
  const path = usePathname();
  const router = useRouter();

  if (!isAdmin) return (
    <main className="mx-auto max-w-md px-5 py-24 text-center">
      <Icon name="shield-alert" size={40} className="mx-auto mb-4 text-faint" />
      <h1 className="text-2xl font-extrabold">Admin access required</h1>
      <p className="mt-1 text-muted">This area is restricted to the shop owner.</p>
      <Button className="mt-5" onClick={() => router.push("/login")}>Log in as Admin</Button>
    </main>
  );

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-60 flex-col border-r border-edge/[.07] bg-surface p-4 md:flex">
        <Link href="/admin" className="mb-6 flex items-center gap-2.5 px-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-brand"><Icon name="package" size={18} color="#fff" /></span>
          <span className="text-lg font-extrabold">Titipin <span className="text-xs font-bold text-brand">Admin</span></span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((n) => {
            const active = n.href === "/admin" ? path === "/admin" : path.startsWith(n.href);
            return (
              <Link key={n.href} href={n.href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition ${active ? "bg-brand-50 dark:bg-brand/15 text-brand-700 dark:text-blue-300" : "text-muted hover:bg-edge/5"}`}>
                <Icon name={n.icon} size={18} /> {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-4 flex flex-col gap-2 border-t border-edge/[.06] pt-4">
          <button onClick={toggleTheme} className="flex items-center gap-2 px-3 text-sm font-semibold text-muted hover:text-ink">
            <Icon name={theme === "dark" ? "sun" : "moon"} size={15} /> {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
          <Link href="/" className="flex items-center gap-2 px-3 text-sm font-semibold text-muted hover:text-ink"><Icon name="external-link" size={15} /> View storefront</Link>
          <button onClick={() => { logout(); router.push("/"); }} className="flex items-center gap-2 px-3 text-sm font-semibold text-muted hover:text-ink"><Icon name="log-out" size={15} /> Logout</button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-edge/[.07] bg-surface px-4 py-3 md:hidden">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand"><Icon name="package" size={16} color="#fff" /></span>
          <span className="font-extrabold">Titipin Admin</span>
          <button onClick={toggleTheme} aria-label="Toggle theme" className="ml-auto flex h-8 w-8 flex-none items-center justify-center rounded-lg border border-edge/15">
            <Icon name={theme === "dark" ? "sun" : "moon"} size={15} />
          </button>
          <div className="flex gap-1 overflow-x-auto">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className={`flex-none rounded-lg p-2 ${path === n.href ? "bg-brand-50 dark:bg-brand/15 text-brand-700 dark:text-blue-300" : "text-muted"}`}><Icon name={n.icon} size={18} /></Link>
            ))}
          </div>
        </header>
        <main className="flex-1 bg-cream p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}

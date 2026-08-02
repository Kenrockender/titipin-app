"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { useTheme } from "@/lib/theme";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";

const NAV = [
  { href: "/admin", icon: "layout-dashboard", label: "Overview", shortLabel: "Overview" },
  { href: "/admin/requests", icon: "inbox", label: "Request Inbox", shortLabel: "Requests" },
  { href: "/admin/orders", icon: "clipboard-list", label: "Orders", shortLabel: "Orders" },
  { href: "/admin/catalog", icon: "package", label: "Catalog", shortLabel: "Catalog" },
  { href: "/admin/shopper-mode", icon: "shopping-bag", label: "Shopper Mode", shortLabel: "Shopper" },
  { href: "/admin/pricing", icon: "sliders-horizontal", label: "Pricing Engine", shortLabel: "Pricing" }
];

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function useInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) setInstalled(true);
    const onPrompt = (e: Event) => { e.preventDefault(); setDeferred(e as BeforeInstallPromptEvent); };
    const onInstalled = () => { setInstalled(true); setDeferred(null); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  };

  return { canInstall: !!deferred && !installed, promptInstall };
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { isAdmin, logout } = useStore();
  const { theme, toggleTheme } = useTheme();
  const path = usePathname();
  const router = useRouter();
  const { canInstall, promptInstall } = useInstallPrompt();

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/admin-sw.js", { scope: "/admin" }).catch(() => {});
    }
  }, []);

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
          {canInstall && (
            <button onClick={promptInstall} className="flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-2 text-sm font-bold text-brand-700 dark:bg-brand/15 dark:text-blue-300">
              <Icon name="download" size={15} /> Install app
            </button>
          )}
          <button onClick={toggleTheme} className="flex items-center gap-2 px-3 text-sm font-semibold text-muted hover:text-ink">
            <Icon name={theme === "dark" ? "sun" : "moon"} size={15} /> {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
          <Link href="/" className="flex items-center gap-2 px-3 text-sm font-semibold text-muted hover:text-ink"><Icon name="external-link" size={15} /> View storefront</Link>
          <button onClick={() => { logout(); router.push("/"); }} className="flex items-center gap-2 px-3 text-sm font-semibold text-muted hover:text-ink"><Icon name="log-out" size={15} /> Logout</button>
        </div>
      </aside>

      {/* Mobile top bar — fixed so it stays put while the page scrolls */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className="fixed inset-x-0 top-0 z-40 flex items-center gap-3 border-b border-edge/[.07] bg-surface px-4 py-3 md:hidden"
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand"><Icon name="package" size={16} color="#fff" /></span>
          <span className="font-extrabold">Titipin Admin</span>
          <div className="ml-auto flex items-center gap-1">
            {canInstall && (
              <button onClick={promptInstall} aria-label="Install app" className="flex h-8 w-8 flex-none items-center justify-center rounded-lg border border-edge/15">
                <Icon name="download" size={15} />
              </button>
            )}
            <button onClick={toggleTheme} aria-label="Toggle theme" className="flex h-8 w-8 flex-none items-center justify-center rounded-lg border border-edge/15">
              <Icon name={theme === "dark" ? "sun" : "moon"} size={15} />
            </button>
          </div>
        </header>
        <main className="flex-1 bg-cream p-5 pt-24 pb-32 md:p-8">{children}</main>
      </div>

      {/* Mobile bottom tab bar */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex border-t border-edge/[.07] bg-surface px-1 md:hidden"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 10px)" }}
      >
        {NAV.map((n) => {
          const active = n.href === "/admin" ? path === "/admin" : path.startsWith(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`flex flex-1 flex-col items-center gap-0.5 px-0.5 pt-2.5 pb-1 text-center text-[10px] font-bold leading-tight ${active ? "text-brand-700 dark:text-blue-300" : "text-muted"}`}
            >
              <Icon name={n.icon} size={20} />
              {n.shortLabel}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

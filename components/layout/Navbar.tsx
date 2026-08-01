"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useStore } from "@/lib/store";

export function Navbar() {
  const { cart, currentUser, isAdmin, logout } = useStore();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const cartCount = cart.reduce((s, l) => s + l.quantity, 0);

  // Close the mobile menu on navigation
  useEffect(() => { setOpen(false); }, [path]);

  const link = (href: string, label: string, mobile = false) => (
    <Link
      href={href}
      className={
        mobile
          ? `block rounded-lg px-3 py-2.5 text-[15px] font-semibold ${path === href ? "bg-brand-50 text-brand-700" : "text-muted hover:bg-black/[.04] hover:text-ink"}`
          : `text-sm font-semibold ${path === href ? "text-ink" : "text-muted hover:text-ink"}`
      }
    >
      {label}
    </Link>
  );

  if (path.startsWith("/admin")) return null;

  const cartLink = (
    <Link href="/cart" className="relative flex items-center" aria-label={`Cart, ${cartCount} items`}>
      <Icon name="shopping-cart" size={20} className="text-ink" />
      {cartCount > 0 && (
        <span className="absolute -right-2.5 -top-2 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-brand px-1 text-[10.5px] font-bold text-white">{cartCount}</span>
      )}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-black/[.07] bg-cream/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5">
        <Link href="/" className="flex flex-none items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-brand">
            <Icon name="package" size={18} color="#fff" />
          </span>
          <span className="text-lg font-extrabold tracking-tight">Titipin</span>
        </Link>

        {/* Desktop nav */}
        <nav className="ml-auto hidden items-center gap-5 md:flex">
          {link("/catalog", "Catalog")}
          {link("/request", "Request")}
          {currentUser && link("/dashboard", "My Orders")}
          {isAdmin && link("/admin", "Admin")}
          {cartLink}
          {currentUser ? (
            <div className="flex items-center gap-2.5">
              <Link href="/profile" aria-label="Profile" className="flex-none">
                {currentUser.photo_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={currentUser.photo_url} alt={currentUser.full_name} className="h-8 w-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-xs font-extrabold text-brand-700">{currentUser.full_name[0]}</span>
                )}
              </Link>
              <button onClick={logout} className="h-9 rounded-[10px] border border-black/15 bg-white px-4 text-sm font-bold hover:border-ink">Logout</button>
            </div>
          ) : (
            <Link href="/login" className="h-9 rounded-[10px] border border-black/15 bg-white px-4 text-sm font-bold leading-9 hover:border-ink">Login</Link>
          )}
        </nav>

        {/* Mobile: cart + hamburger */}
        <div className="ml-auto flex items-center gap-4 md:hidden">
          {cartLink}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-black/15 bg-white"
          >
            <Icon name={open ? "x" : "menu"} size={18} className="text-ink" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="border-t border-black/[.06] bg-cream px-5 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {link("/catalog", "Catalog", true)}
            {link("/request", "Request", true)}
            {currentUser && link("/dashboard", "My Orders", true)}
            {isAdmin && link("/admin", "Admin", true)}
          </div>
          <div className="mt-3 border-t border-black/[.06] pt-3">
            {currentUser ? (
              <>
                <Link href="/profile" className="mb-3 flex items-center gap-2.5 px-1">
                  {currentUser.photo_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={currentUser.photo_url} alt={currentUser.full_name} className="h-9 w-9 rounded-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-sm font-extrabold text-brand-700">{currentUser.full_name[0]}</span>
                  )}
                  <span className="text-sm font-bold">{currentUser.full_name}</span>
                </Link>
                <button onClick={logout} className="h-10 w-full rounded-[10px] border border-black/15 bg-white text-sm font-bold hover:border-ink">Logout</button>
              </>
            ) : (
              <Link href="/login" className="block h-10 w-full rounded-[10px] border border-black/15 bg-white text-center text-sm font-bold leading-10 hover:border-ink">Login</Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}

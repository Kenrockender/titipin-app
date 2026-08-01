"use client";
import React from "react";

type Variant = "primary" | "outline" | "ghost" | "danger" | "subtle";
const styles: Record<Variant, string> = {
  primary: "bg-brand text-white hover:brightness-95 shadow-sm",
  outline: "bg-surface text-ink border border-edge/15 hover:border-ink",
  ghost: "bg-transparent text-ink hover:bg-edge/5",
  danger: "bg-red-600 text-white hover:brightness-95",
  subtle: "bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand/15 dark:text-blue-300 dark:hover:bg-brand/25"
};

export function Button({
  variant = "primary", className = "", children, ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 h-11 text-sm font-bold transition disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

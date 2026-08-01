import React from "react";
export function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`rounded-2xl border border-black/[.07] bg-white shadow-card ${className}`}>{children}</div>;
}

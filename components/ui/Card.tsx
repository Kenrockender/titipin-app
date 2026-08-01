import React from "react";
export function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`rounded-2xl border border-edge/[.07] bg-surface shadow-card ${className}`}>{children}</div>;
}

import React from "react";
export function Badge({ tone = "neutral", children }: {
  tone?: "neutral" | "brand" | "green" | "amber" | "blue" | "red" | "purple";
  children: React.ReactNode;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-black/[.06] text-muted",
    brand: "bg-brand-50 text-brand-700",
    green: "bg-green-100 text-green-700",
    amber: "bg-amber-100 text-amber-700",
    blue: "bg-blue-100 text-blue-700",
    red: "bg-red-100 text-red-700",
    purple: "bg-purple-100 text-purple-700"
  };
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${tones[tone]}`}>{children}</span>;
}

import React from "react";
export function Badge({ tone = "neutral", children }: {
  tone?: "neutral" | "brand" | "green" | "amber" | "blue" | "red" | "purple";
  children: React.ReactNode;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-edge/[.06] text-muted",
    brand: "bg-brand-50 text-brand-700 dark:bg-brand/15 dark:text-blue-300",
    green: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
    red: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
    purple: "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400"
  };
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${tones[tone]}`}>{children}</span>;
}

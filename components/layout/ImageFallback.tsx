"use client";
import { useEffect } from "react";

// Global safety net: if a local image (/products/* or /hauls/*) fails to load —
// e.g. the owner hasn't dropped that photo in yet — swap it for the Titipin
// placeholder so the UI never shows a broken image. Covers every <img> in the app.
export function ImageFallback() {
  useEffect(() => {
    const PLACEHOLDER = "/products/_placeholder.svg";
    const handler = (e: Event) => {
      const t = e.target as HTMLImageElement | null;
      if (!t || t.tagName !== "IMG") return;
      if (!t.src.includes("/products/") && !t.src.includes("/hauls/")) return;
      if (t.dataset.fallback === "1" || t.src.endsWith(PLACEHOLDER)) return;
      t.dataset.fallback = "1";
      t.src = PLACEHOLDER;
    };
    document.addEventListener("error", handler, true); // capture phase catches img errors
    return () => document.removeEventListener("error", handler, true);
  }, []);
  return null;
}

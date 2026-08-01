import React from "react";
// Lightweight icon using lucide SVG masks, self-hosted in /public/icons
// (copied from lucide-static@0.462.0). No CDN dependency — works offline.
// To add a new icon: drop its SVG from https://lucide.dev into public/icons/.
export function Icon({ name, size = 18, className = "", color }: {
  name: string; size?: number; className?: string; color?: string;
}) {
  return (
    <span
      aria-hidden
      className={className}
      style={{
        display: "inline-block", width: size, height: size, flex: "none",
        background: color ?? "currentColor",
        WebkitMask: `url(/icons/${name}.svg) center / contain no-repeat`,
        mask: `url(/icons/${name}.svg) center / contain no-repeat`
      }}
    />
  );
}

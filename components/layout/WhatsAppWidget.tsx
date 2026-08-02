"use client";
import React from "react";
import { Icon } from "@/components/ui/Icon";
import { useStore } from "@/lib/store";

const WA = process.env.NEXT_PUBLIC_WA_NUMBER || "6281234567890";

// wa.me requires the full international number with no leading 0 or symbols.
// Customers type their number in profile settings in whatever format they like
// (e.g. "0811-9135-966" or "+62 811 9135 966"), so normalize before building the link.
function normalizePhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0")) return "62" + digits.slice(1);
  if (digits.startsWith("62")) return digits;
  return "62" + digits;
}

export function waLink(message: string) {
  return `https://wa.me/${normalizePhone(WA)}?text=${encodeURIComponent(message)}`;
}
// For admin -> customer messages, targeting the customer's own WhatsApp number.
export function waLinkTo(phone: string, message: string) {
  return `https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(message)}`;
}

export function WhatsAppWidget({ context }: { context?: string }) {
  const { isAdmin } = useStore();
  const msg = context ? `Hi Titipin! ${context}` : "Hi Titipin! I have a question about jastip.";
  if (isAdmin) return null;
  return (
    <a
      href={waLink(msg)} target="_blank" rel="noreferrer"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105"
      aria-label="Chat on WhatsApp"
    >
      <Icon name="message-circle" size={26} color="#fff" />
    </a>
  );
}

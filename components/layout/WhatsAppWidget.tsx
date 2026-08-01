"use client";
import React from "react";
import { Icon } from "@/components/ui/Icon";

const WA = process.env.NEXT_PUBLIC_WA_NUMBER || "6281234567890";
export function waLink(message: string) {
  return `https://wa.me/${WA}?text=${encodeURIComponent(message)}`;
}
// For admin -> customer messages, targeting the customer's own WhatsApp number.
export function waLinkTo(phone: string, message: string) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function WhatsAppWidget({ context }: { context?: string }) {
  const msg = context ? `Hi Titipin! ${context}` : "Hi Titipin! I have a question about jastip.";
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

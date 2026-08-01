"use client";
import React from "react";
import { StoreProvider } from "@/lib/store";
import { ThemeProvider } from "@/lib/theme";
export function Providers({ children }: { children: React.ReactNode }) {
  return <ThemeProvider><StoreProvider>{children}</StoreProvider></ThemeProvider>;
}

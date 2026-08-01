import type { Metadata, Viewport } from "next";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "Titipin Admin",
  manifest: "/admin-manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Titipin Admin"
  },
  icons: {
    apple: "/icons-pwa/admin-apple-touch-icon.png"
  }
};

export const viewport: Viewport = {
  themeColor: "#2563EB"
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}

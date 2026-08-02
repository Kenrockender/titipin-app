import type { NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";

export interface AuthedUser {
  uid: string;
  email: string | null;
  isAdmin: boolean;
}

const ADMIN_EMAIL = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@titipin.id").toLowerCase();

/** Verifies the Firebase ID token in the Authorization header. Returns null if missing/invalid. */
export async function requireUser(req: NextRequest): Promise<AuthedUser | null> {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;
  const auth = adminAuth();
  if (!auth) return null;
  try {
    const decoded = await auth.verifyIdToken(token);
    const email = decoded.email ?? null;
    return { uid: decoded.uid, email, isAdmin: !!email && email.toLowerCase() === ADMIN_EMAIL };
  } catch {
    return null;
  }
}

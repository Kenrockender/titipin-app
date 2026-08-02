import type { NextRequest } from "next/server";
import { createRemoteJWKSet, jwtVerify } from "jose";

export interface AuthedUser {
  uid: string;
  email: string | null;
  isAdmin: boolean;
}

const ADMIN_EMAIL = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@titipin.id").toLowerCase();
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

// Verified directly against Google's public keys rather than via
// firebase-admin/auth's verifyIdToken() — that path pulls in jwks-rsa, which
// crashes with ERR_REQUIRE_ESM in Vercel's Node serverless runtime. This is
// Google's own documented way to verify Firebase ID tokens without the Admin
// SDK (the same approach used in edge runtimes that can't run it at all).
const JWKS = PROJECT_ID
  ? createRemoteJWKSet(new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"))
  : null;

/** Verifies the Firebase ID token in the Authorization header. Returns null if missing/invalid. */
export async function requireUser(req: NextRequest): Promise<AuthedUser | null> {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token || !JWKS || !PROJECT_ID) return null;
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${PROJECT_ID}`,
      audience: PROJECT_ID
    });
    if (!payload.sub) return null;
    const email = typeof payload.email === "string" ? payload.email : null;
    return { uid: payload.sub, email, isAdmin: !!email && email.toLowerCase() === ADMIN_EMAIL };
  } catch {
    return null;
  }
}

// Server-only Firebase Admin SDK. Used by API routes to perform trusted writes
// (order pricing, payment verification, store-credit) that must never be
// computed from client-supplied values. Never import this from a "use client" file.
//
// Credentials come from (in order): FIREBASE_SERVICE_ACCOUNT_BASE64 (a
// base64-encoded copy of the service account JSON — the only option that
// survives serverless deploys like Vercel, since there's no local file
// there), FIREBASE_SERVICE_ACCOUNT_PATH (a local file path, for dev).
import { cert, getApps, initializeApp, type App, type ServiceAccount } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import fs from "node:fs";

const DATABASE_ID = process.env.FIRESTORE_DATABASE_ID || "(default)";

function loadServiceAccount(): ServiceAccount | null {
  const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (base64) {
    try {
      return JSON.parse(Buffer.from(base64, "base64").toString("utf8"));
    } catch {
      return null;
    }
  }
  const path = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (path && fs.existsSync(path)) {
    return JSON.parse(fs.readFileSync(path, "utf8"));
  }
  return null;
}

function getAdminApp(): App | null {
  if (getApps().length) return getApps()[0];
  const serviceAccount = loadServiceAccount();
  if (!serviceAccount) return null;
  return initializeApp({ credential: cert(serviceAccount) });
}

export function adminDb(): Firestore | null {
  const app = getAdminApp();
  return app ? getFirestore(app, DATABASE_ID) : null;
}

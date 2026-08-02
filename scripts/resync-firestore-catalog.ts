// resync-firestore-catalog.ts — one-off: syncs trips/products/addOns in Firestore
// with the current lib/mock-data.ts (deletes stale docs, upserts current ones).
// Does NOT touch requests/orders/payments/users — those hold real operational data.
// Run: npx tsx scripts/resync-firestore-catalog.ts
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { trips, products, addOns } from "../lib/mock-data";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadEnv({ path: path.join(__dirname, "..", ".env.local") });

const serviceAccountPath = path.resolve(
  path.join(__dirname, ".."),
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "./service-account.json"
);
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));

const app = initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore(app, process.env.FIRESTORE_DATABASE_ID || "(default)");

async function resync<T extends { id: string }>(name: string, docs: T[]) {
  const currentIds = new Set(docs.map((d) => d.id));
  const existing = await db.collection(name).listDocuments();
  const staleIds = existing.map((d) => d.id).filter((id) => !currentIds.has(id));

  const CHUNK = 400;
  for (let i = 0; i < staleIds.length; i += CHUNK) {
    const batch = db.batch();
    for (const id of staleIds.slice(i, i + CHUNK)) batch.delete(db.collection(name).doc(id));
    await batch.commit();
  }
  for (let i = 0; i < docs.length; i += CHUNK) {
    const batch = db.batch();
    for (const item of docs.slice(i, i + CHUNK)) batch.set(db.collection(name).doc(item.id), item);
    await batch.commit();
  }
  console.log(`  ${name}: deleted ${staleIds.length} stale, upserted ${docs.length} current`);
}

async function main() {
  console.log(`Resyncing catalog data in Firestore project "${serviceAccount.project_id}"...`);
  await resync("trips", trips);
  await resync("products", products);
  await resync("addOns", addOns);
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

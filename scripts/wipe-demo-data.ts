// wipe-demo-data.ts — clears out demo/seed transactional data before going live.
// Deletes ALL docs in: orders, requests, payments, users.
// Does NOT touch: products, trips, addOns, config/pricing (your real catalog/pricing).
// Run: npx tsx scripts/wipe-demo-data.ts
// This is IRREVERSIBLE. Review the collection list above before running.
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadEnv({ path: path.join(__dirname, "..", ".env.local") });

const serviceAccountPath = path.resolve(
  path.join(__dirname, ".."),
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "./service-account.json"
);
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));

const app = initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore(app, process.env.FIRESTORE_DATABASE_ID || "(default)");

const COLLECTIONS_TO_WIPE = ["orders", "requests", "payments", "users"];

async function wipe(name: string) {
  const docs = await db.collection(name).listDocuments();
  const CHUNK = 400;
  for (let i = 0; i < docs.length; i += CHUNK) {
    const batch = db.batch();
    for (const d of docs.slice(i, i + CHUNK)) batch.delete(d);
    await batch.commit();
  }
  console.log(`  ${name}: deleted ${docs.length} docs`);
}

async function main() {
  console.log(`Wiping demo data in Firestore project "${serviceAccount.project_id}"...`);
  console.log(`Collections: ${COLLECTIONS_TO_WIPE.join(", ")}`);
  console.log(`NOT touching: products, trips, addOns, config/pricing`);
  for (const name of COLLECTIONS_TO_WIPE) await wipe(name);
  console.log("Done. The app is now empty of demo orders/requests/payments/users.");
  console.log("Note: this does NOT delete anyone's Firebase Auth account, only their Firestore profile doc — it'll be recreated blank the next time they log in.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

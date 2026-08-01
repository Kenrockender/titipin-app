// scripts/seed-firestore.ts — pushes lib/mock-data.ts into Firestore.
// Run: npx tsx scripts/seed-firestore.ts
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { trips, products, addOns, requests, orders, payments, CURRENT_USER } from "../lib/mock-data";
import { DEFAULT_PRICING } from "../lib/pricing";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadEnv({ path: path.join(__dirname, "..", ".env.local") });

const serviceAccountPath = path.resolve(
  path.join(__dirname, ".."),
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "./service-account.json"
);
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));

const app = initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore(app, process.env.FIRESTORE_DATABASE_ID || "(default)");

async function seedCollection<T extends { id: string }>(name: string, docs: T[]) {
  const CHUNK = 400;
  for (let i = 0; i < docs.length; i += CHUNK) {
    const batch = db.batch();
    for (const item of docs.slice(i, i + CHUNK)) {
      batch.set(db.collection(name).doc(item.id), item);
    }
    await batch.commit();
  }
  console.log(`  ${name}: ${docs.length} docs`);
}

async function main() {
  console.log(`Seeding Firestore project "${serviceAccount.project_id}"...`);
  await seedCollection("trips", trips);
  await seedCollection("products", products);
  await seedCollection("addOns", addOns);
  await seedCollection("requests", requests);
  await seedCollection("orders", orders);
  await seedCollection("payments", payments);
  await seedCollection("users", [CURRENT_USER]);
  await db.collection("config").doc("pricing").set(DEFAULT_PRICING);
  console.log("  config/pricing: 1 doc");
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

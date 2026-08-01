// generate-catalog.mjs — expand catalog-data.mjs menjadi lib/generated-products.ts
// Jalankan: node scripts/generate-catalog.mjs
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { BASES } from "./catalog-data.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RATE = { tokyo: 112, seoul: 12.1 };
const TRIP = { tokyo: "trip-tokyo", seoul: "trip-seoul" };

const DEFAULT_MARKUP = {
  Snacks: 25, Beverages: 25, Skincare: 22, Fragrance: 25, Fashion: 22,
  Shoes: 18, Electronics: 15, Toys: 25, Collectibles: 25, Luxury: 18,
  "Home & Kitchen": 22, Lifestyle: 22,
};

function defaultFlat(raw) {
  if (raw < 150000) return 30000;
  if (raw < 400000) return 40000;
  if (raw < 1200000) return 50000;
  if (raw < 3000000) return 60000;
  if (raw < 8000000) return 80000;
  return 120000;
}

const slug = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const round500 = (x) => Math.round(x / 500) * 500;

export function expandProducts() {
  const out = [];
  const seen = new Set();
  for (const b of BASES) {
    if (b.skip) continue;
    const rate = RATE[b.t];
    const mkDefault = b.mk ?? DEFAULT_MARKUP[b.c] ?? 22;
    const variants = b.v && b.v.length ? b.v : [null];
    for (const rawV of variants) {
      const v = rawV == null ? null : typeof rawV === "string" ? { n: rawV } : rawV;
      const price = v?.p ?? b.p;
      const mk = mkDefault;
      const rawIdr = price * rate * (1 + mk / 100);
      const flat = b.f ?? defaultFlat(rawIdr);
      const final = round500(rawIdr + flat);
      const id = v ? `prod-${b.id}-${slug(v.n)}` : `prod-${b.id}`;
      if (seen.has(id)) throw new Error("Duplicate id: " + id);
      seen.add(id);
      // gambar: varian punya gambar sendiri kalau base pakai vq atau varian punya q; selain itu share gambar base
      const ownImage = v && (b.vq || v.q);
      const imageId = ownImage ? id : `prod-${b.id}`;
      out.push({
        id,
        trip_id: TRIP[b.t],
        name: v ? `${b.n} — ${v.n}` : b.n,
        description: b.d,
        base_price_foreign: price,
        markup_percentage: mk,
        flat_jastip_fee: flat,
        final_price_idr: final,
        image_url: `/products/${imageId}.jpg`,
        is_active: true,
        category: b.c,
        store_location: b.s,
        ...(b.colors && v ? {
          color_variants: b.colors.map(cv => ({
            color_name: cv.n,
            hex: cv.h,
            product_id: `prod-${b.id}-${slug(cv.n)}`,
          }))
        } : {}),
        _imageId: imageId,
        _imageQuery: v?.q ?? (b.vq && v ? `${b.q ?? b.n} ${v.n}` : b.q ?? b.n),
      });
    }
  }
  return out;
}

// Manifest gambar unik untuk fetch-product-images.mjs: [{ id, q }]
export function imageManifest() {
  const map = new Map();
  for (const p of expandProducts()) {
    if (!map.has(p._imageId)) map.set(p._imageId, p._imageQuery);
  }
  return [...map.entries()].map(([id, q]) => ({ id, q, pages: [] }));
}

async function main() {
  const products = expandProducts().map(({ _imageId, _imageQuery, ...p }) => p);
  const byCat = {};
  for (const p of products) byCat[p.category] = (byCat[p.category] ?? 0) + 1;

  const ts = `// FILE INI DI-GENERATE OTOMATIS oleh scripts/generate-catalog.mjs — jangan edit manual.
// Sumber data: scripts/catalog-data.mjs
import type { CatalogProduct } from "@/types/database.types";

export const generatedProducts: CatalogProduct[] = ${JSON.stringify(products, null, 1)};
`;
  const outPath = path.resolve(__dirname, "..", "lib", "generated-products.ts");
  await writeFile(outPath, ts);
  console.log(`OK: ${products.length} produk -> lib/generated-products.ts`);
  console.log("Per kategori:", byCat);
  console.log(`Gambar unik dibutuhkan: ${imageManifest().length}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => { console.error(e); process.exit(1); });
}

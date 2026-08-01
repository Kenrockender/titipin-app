// fetch-product-images.mjs
// Download foto produk otomatis ke public/products/<id>.jpg
// Jalankan dari folder titipin-app:  node scripts/fetch-product-images.mjs
// Butuh Node 18+ (fetch bawaan). Rerun aman: file yang sudah ada di-skip.

import { writeFile, mkdir } from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { imageManifest } from "./generate-catalog.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "..", "public", "products");

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

// pages: halaman produk (diambil og:image-nya). q: fallback query Bing Images.
const PRODUCTS = [
  { id: "prod-shuuemura", q: "Shu Uemura ultime8 cleansing oil 450ml bottle", pages: [
    "https://japanesetaste.com/products/shu-uemura-ultime8-sublime-cleansing-oil-450ml",
    "https://www.shuuemura-usa.com/ultime8-sublime-beauty-cleansing-oil-450ml/14944201.html",
  ]},
  { id: "prod-kitkat", q: "Japan KitKat matcha green tea box", pages: [
    "https://www.akazuki.com/products/kit-kat-deep-matcha",
    "https://www.japancandystore.com/products/kit-kat-chocolate-jumbo-pack-matcha-green-tea",
  ]},
  { id: "prod-uniqlo", q: "Uniqlo Heattech Ultra Warm crew neck long sleeve", pages: [
    "https://www.uniqlo.com/us/en/products/E450701-000/00",
    "https://www.uniqlo.com/us/en/products/E450738-000/00",
  ]},
  { id: "prod-hadalabo", q: "Hada Labo Gokujyun hyaluronic lotion bottle", pages: [
    "https://japanesetaste.com/products/rohto-hada-labo-gokujyun-super-hyaluronic-acid-lotion-170ml",
    "https://theyokuglow.com/products/hada-labo-gokujyun-hyaluronic-acid-lotion",
  ]},
  { id: "prod-labubu", q: "Labubu Big Into Energy blind box Pop Mart", pages: [
    "https://www.popmart.com/us/products/2155/the-monsters-big-into-energy-series-vinyl-plush-pendant-blind-box",
  ]},
  { id: "prod-crybaby", q: "Pop Mart Crybaby blind box", pages: [
    "https://www.popmart.com/us/products/1681/crybaby-crying-again-series-vinyl-face-plush-blind-box",
  ]},
  { id: "prod-haku", q: "Shiseido HAKU Melanofocus serum white pump bottle", pages: [
    "https://japanesetaste.com/products/shiseido-haku-melanofocus-z-brightening-beauty-serum-45g",
    "https://dokodemo.world/en/item/1955900/",
  ]},
  { id: "prod-fm-socks", q: "FamilyMart line socks Japan green blue stripe", pages: [
    "https://japanhaul.com/products/familymart-konbini-striped-socks",
  ]},
  { id: "prod-milkcheese", q: "Tokyo Milk Cheese Factory salt camembert cookies box", pages: [
    "https://gojapanned.com/products/tokyo-milk-cheese-factory-cookie-assortment-20-pieces",
    "https://www.sayweee.com/en/product/TOKYO-CHEESE-FACTORY-Salt-Camembert-Cookie-20-pcs/2114310",
  ]},
  { id: "prod-nb1906r", q: "New Balance 1906R silver metallic sneaker", pages: [
    "https://www.activeathlete88.com/products/new-balance-1906r-silver-metallic",
    "https://www.newbalance.com/pd/1906r/M1906RV1-47448-PMG-NA.html",
  ]},
  { id: "prod-cdg-converse", q: "CDG Play Converse Chuck Taylor red heart sneaker", pages: [
    "https://feature.com/products/converse-x-comme-des-garcons-play-all-star-chuck-70-high-blue",
    "https://commonwealth-ftgg.com/products/comme-des-garcons-play-t280-051-play-cdg-logo-t-shirt-with-red-heart-white",
  ]},
  { id: "prod-cdg-tee", q: "Comme des Garcons Play red heart t-shirt white", pages: [
    "https://www.solefly.com/products/play-comme-des-garcons-logo-t-shirt-with-red-heart",
    "https://commonwealth-ftgg.com/products/comme-des-garcons-play-t280-051-play-cdg-logo-t-shirt-with-red-heart-white",
  ]},
  { id: "prod-cdg-stripe", q: "CDG Play striped long sleeve t-shirt", pages: [
    "https://shop-us.doverstreetmarket.com/products/cdg3-ls-striped-t-shirt-red-sz-t004-051-2-carry-over",
    "https://shop-us.doverstreetmarket.com/products/cdg3-ls-striped-t-shirt-navy-sz-t004-051-1-carry-over",
  ]},
  { id: "prod-x100vi", q: "Fujifilm X100VI camera silver", pages: [
    "https://thepixelconnection.com/products/fujifilm-x100vi-digital-camera-black",
    "https://www.nuzira.com/products/fujifilm-x100vi-digital-camera",
    "https://www.fujifilm-x.com/en-us/products/cameras/x100vi/",
  ]},
  { id: "prod-switch2", q: "Nintendo Switch 2 console", pages: [
    "https://www.nintendo.com/us/store/products/nintendo-switch-2-system-123669/",
    "https://www.abt.com/Nintendo-Switch-2-Gaming-Console-045496885816/p/221273.html",
  ]},
  { id: "prod-sonyxm5", q: "Sony WF-1000XM5 earbuds black", pages: [
    "https://headphones.com/products/sony-wf-1000xm5-wireless-in-ear-headphones",
    "https://www.sony.co.uk/headphones/products/wf-1000xm5",
  ]},
  { id: "prod-panasonic-dryer", q: "Panasonic nanocare EH-NA0J hair dryer", pages: [
    "https://wafuu.com/en-us/products/panasonic-nanocare-eh-na0j-a-hair-dryer-high-penetration-nanoe-minerals",
    "https://imyshopjapan.com/en-us/products/panasonic-hair-dryer-nano-care-eh-na0j",
  ]},
  { id: "prod-onitsuka66", q: "Onitsuka Tiger Mexico 66 Nippon Made sneaker", pages: [
    "https://www.kickscrew.com/products/onitsuka-tiger-x-nippon-made-mexico-66-deluxe-black-1181a119-001",
    "https://www.onitsukatiger.com/jp/en-gl/product/mexico-66-deluxe/1181a119_101.html",
  ]},
  { id: "prod-asics-kayano", q: "Asics Gel-Kayano 14 white silver sneaker", pages: [
    "https://www.asics.com/us/en-us/gel-kayano-14/p/ANA_1203A537-025.html",
    "https://www.asics.com/us/en-us/gel-kayano-14/p/ANA_1203A537-107.html",
  ]},
  { id: "prod-humanmade-tee", q: "Human Made heart badge t-shirt", pages: [
    "https://humanmade.jp/en/products/hm29cs040",
    "https://www.socialstatuspgh.com/products/human-made-heart-badge-t-shirt",
  ]},
  { id: "prod-beams-tee", q: "BEAMS Japan logo t-shirt", pages: [
    "https://www.beams.co.jp/en/item/beams_japan/t-shirt/11080900156/",
  ]},
  { id: "prod-porter-tanker", q: "Porter Yoshida Tanker shoulder bag black", pages: [
    "https://sonofastag.com/products/porter-yoshida-co-tanker-shoulder-bag-s-black",
    "https://www.yoshidakaban.com/en/product/105782.html",
  ]},
  { id: "prod-onitsuka-mini", q: "Onitsuka Tiger small shoulder bag official", pages: [
    "https://www.onitsukatiger.com/gb/en-gb/small-shoulder-bag/p/3183b147-001.html",
    "https://www.onitsukatiger.com/sg/en-sg/product/small-shoulder-bag/3183b147.001",
  ]},
  { id: "prod-shiro-savon", q: "SHIRO Savon eau de parfum bottle white", pages: [
    "https://www.imomoko.com/shiro-savon-eau-de-parfum.html",
  ]},
  { id: "prod-cdg-wonderwood", q: "Comme des Garcons Wonderwood eau de parfum bottle", pages: [
    "https://comme-des-garcons-parfum.com/products/wonderwood",
    "https://www.luckyscent.com/products/wonderwood-by-comme-des-garcons",
  ]},
  { id: "prod-sony-zve10", q: "Sony ZV-E10 II camera", pages: [
    "https://electronics.sony.ca/imaging/interchangeable-lens-cameras/aps-c/p/zve10m2b",
    "https://www.precision-camera.com/sony-zv-e10-ii-mirrorless-camera-black/",
  ]},
  { id: "prod-gshock", q: "Casio G-Shock GA-B2100 watch", pages: [
    "https://www.casio.com/us/watches/gshock/product.GA-B2100-1A/",
  ]},
  { id: "prod-mariokart", q: "Mario Kart World Switch 2 box art", pages: [
    "https://www.nintendo.com/us/store/products/mario-kart-world-switch-2/",
  ]},
  { id: "prod-zojirushi", q: "Zojirushi Micom rice cooker NS-LGC05", pages: [
    "https://store.zojirushi.com/products/nslgc",
    "https://www.everythingkitchens.com/zojirushi-micom-3-cup-rice-cooker-and-warmer-stainless-black-ns-lgc05xb.html",
  ]},
  { id: "prod-santoku", q: "Japanese santoku kitchen knife", pages: [
    "https://jikkocutlery.com/collections/santoku-multi-purpose-knife",
  ]},
  { id: "prod-hibiki", q: "Hibiki Japanese Harmony whisky bottle 700ml", pages: [
    "https://internetwines.com/products/suntory-hibiki-harmony",
    "https://fineliquors.com/products/suntory-hibiki",
  ]},
  { id: "prod-royce", q: "Royce Nama chocolate Au Lait box", pages: [
    "https://roycechocolate.com/products/nama-chocolate-au-lait",
  ]},
  { id: "prod-pokemontcg", q: "Pokemon TCG japanese booster box sealed", pages: [] },
  { id: "prod-gundam-rg", q: "Bandai RG RX-78-2 Gundam model kit box", pages: [
    "https://www.usagundamstore.com/products/rg-1-144-01-rx-78-2-gundam",
    "https://global.bandai-hobby.net/en-us/item/01_5261/",
  ]},
  { id: "prod-sanrio", q: "Sanrio Hello Kitty plush", pages: [
    "https://www.sanrio.com/products/hello-kitty-10-standard-plush",
  ]},
  { id: "prod-skii", q: "SK-II Facial Treatment Essence 230ml bottle", pages: [
    "https://www.sk-ii.com/product/essence/facial-treatment-essence/230ml",
    "https://beautyboxkorea.com/product/sk-ii-facial-treatment-essence-230ml/53350/",
  ]},
  { id: "prod-pokemon", q: "Pokemon Center Pikachu plush official", pages: [
    "https://www.pokemoncenter.com/product/701E12210/sitting-pikachu-poke-plush-8-in",
  ]},
  // --- batch 2: fragrance, luxury, makanan unik ---
  { id: "prod-shiro-lily", q: "SHIRO White Lily perfume bottle white background", pages: [] },
  { id: "prod-jscent-tea", q: "J-Scent Roasted Green Tea hojicha eau de parfum bottle", pages: [] },
  { id: "prod-auxparadis", q: "Aux Paradis Osmanthus eau de parfum bottle", pages: [] },
  { id: "prod-baobao", q: "BAO BAO Issey Miyake Lucent tote bag 6x6", pages: [] },
  { id: "prod-seiko-presage", q: "Seiko Presage Cocktail Time SRPB43 watch", pages: [] },
  { id: "prod-cdg-wallet", q: "Comme des Garcons classic leather wallet black SA5100", pages: [] },
  { id: "prod-pilot823", q: "Pilot Custom 823 fountain pen amber", pages: [] },
  { id: "prod-dassai45", q: "Dassai 45 junmai daiginjo 720ml sake bottle", pages: [] },
  { id: "prod-choya", q: "Choya The Kishu umeshu bottle plum", pages: [] },
  { id: "prod-ramune-set", q: "ramune soda weird flavors takoyaki wasabi curry bottle", pages: [] },
  { id: "prod-kitkat-sake", q: "KitKat japanese sake flavor box Japan", pages: [] },
  { id: "prod-kitkat-wasabi", q: "KitKat wasabi flavor box Japan", pages: [] },
  { id: "prod-ichiran", q: "Ichiran ramen box 5 pack takeaway", pages: [] },
  { id: "prod-jagapokkuru", q: "Calbee Jaga Pokkuru Hokkaido potato snack box", pages: [] },
  { id: "prod-shiroikoibito", q: "Shiroi Koibito 18 pieces box Ishiya", pages: [] },
  { id: "prod-umaibo", q: "Umaibo snack sticks assorted flavors", pages: [] },
];

// override query untuk gambar generator yang hasil pertamanya kurang pas
PRODUCTS.push(
  { id: "prod-molly", q: "Pop Mart Molly classic figure blind box", pages: [] },
  { id: "prod-kitkat-jp-rum-raisin", q: "KitKat rum raisin Japan box packaging", pages: [] },
  { id: "prod-hakkaisan", q: "Hakkaisan junmai ginjo sake bottle 720ml", pages: [] },
  { id: "prod-gu-basics", q: "GU Japan wide jeans product photo", pages: [] },
  { id: "prod-aderror", q: "Ader Error logo t-shirt white background", pages: [] },
  { id: "prod-cezanne", q: "Cezanne pearl glow highlighter compact", pages: [] },
  { id: "prod-lupicia-momo-oolong-super-grade", q: "Lupicia momo oolong tea tin", pages: [] },
  { id: "prod-pressbutter", q: "Press Butter Sand box product", pages: [] },
  { id: "prod-sigma-lens", q: "Sigma 18-50mm f2.8 DC DN Contemporary lens product", pages: [] },
  { id: "prod-shiro-mist", q: "SHIRO body mist bottle product", pages: [] },
);

// produk hasil generator (scripts/catalog-data.mjs) — otomatis ikut terdownload
for (const item of imageManifest()) {
  if (!PRODUCTS.some((p) => p.id === item.id)) PRODUCTS.push(item);
}

const decodeEntities = (s) =>
  s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'");

async function get(url, type = "text") {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 20000);
  try {
    const res = await fetch(url, {
      headers: {
        "user-agent": UA,
        "accept-language": "en-US,en;q=0.9",
        accept:
          type === "text"
            ? "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
            : "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      },
      redirect: "follow",
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    if (type === "text") return await res.text();
    return {
      buf: Buffer.from(await res.arrayBuffer()),
      ct: res.headers.get("content-type") || "",
    };
  } finally {
    clearTimeout(t);
  }
}

function looksLikeImage(buf, ct) {
  if (!buf || buf.length < 8000) return false; // tolak icon/placeholder mini
  const jpeg = buf[0] === 0xff && buf[1] === 0xd8;
  const png = buf[0] === 0x89 && buf[1] === 0x50;
  const webp =
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP";
  return jpeg || png || webp || ct.startsWith("image/");
}

function extractOgImage(html) {
  const patterns = [
    /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]*content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:image(?::secure_url)?["']/i,
    /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]*content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]*name=["']twitter:image(?::src)?["']/i,
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m) {
      let u = decodeEntities(m[1]);
      if (u.startsWith("//")) u = "https:" + u;
      if (/^https?:/.test(u)) return u;
    }
  }
  return null;
}

function unescapeJsonUrl(u) {
  return u.replace(/\\u002f/gi, "/").replace(/\\\//g, "/");
}

async function bingImageUrls(query) {
  const html = await get(
    "https://www.bing.com/images/search?q=" +
      encodeURIComponent(query) +
      "&form=HDRSC2&first=1"
  );
  const urls = [];
  let m;
  const reAttr = /murl&quot;:&quot;(https?:.+?)&quot;/g;
  while ((m = reAttr.exec(html)) && urls.length < 6)
    urls.push(unescapeJsonUrl(decodeEntities(m[1])));
  if (!urls.length) {
    const reJson = /"murl":"(https?:[^"]+)"/g;
    while ((m = reJson.exec(html)) && urls.length < 6)
      urls.push(unescapeJsonUrl(m[1]));
  }
  return urls;
}

async function tryDownload(url, outFile) {
  const { buf, ct } = await get(url, "bin");
  if (!looksLikeImage(buf, ct)) throw new Error("bukan gambar (" + ct + ", " + buf.length + "B)");
  await writeFile(outFile, buf);
  return buf.length;
}

async function processProduct(p) {
  const outFile = path.join(OUT_DIR, p.id + ".jpg");
  // skip kalau sudah ada DAN bukan file kosong (file kosong = minta download ulang)
  if (existsSync(outFile) && statSync(outFile).size > 1000)
    return { id: p.id, status: "skip (sudah ada)" };

  // 1) og:image dari halaman produk
  for (const page of p.pages) {
    try {
      const html = await get(page);
      const img = extractOgImage(html);
      if (!img) throw new Error("og:image tidak ketemu");
      const size = await tryDownload(img, outFile);
      return { id: p.id, status: "OK", source: new URL(page).hostname, bytes: size };
    } catch (e) {
      console.log(`   ~ ${p.id}: ${new URL(page).hostname} gagal (${e.message})`);
    }
  }

  // 2) fallback: Bing Images
  try {
    const candidates = await bingImageUrls(p.q);
    for (const u of candidates) {
      try {
        const size = await tryDownload(u, outFile);
        return { id: p.id, status: "OK (bing)", source: new URL(u).hostname, bytes: size };
      } catch {}
    }
  } catch (e) {
    console.log(`   ~ ${p.id}: bing gagal (${e.message})`);
  }

  return { id: p.id, status: "GAGAL" };
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  console.log(`Menyimpan ke: ${OUT_DIR}\n`);
  const results = [];
  for (const p of PRODUCTS) {
    process.stdout.write(`[${results.length + 1}/${PRODUCTS.length}] ${p.id} ... \n`);
    const r = await processProduct(p);
    console.log(`   -> ${r.status}${r.source ? " dari " + r.source : ""}`);
    results.push(r);
  }
  const ok = results.filter((r) => r.status.startsWith("OK")).length;
  const skip = results.filter((r) => r.status.startsWith("skip")).length;
  const fail = results.filter((r) => r.status === "GAGAL");
  console.log(`\n===== SELESAI: ${ok} berhasil, ${skip} di-skip, ${fail.length} gagal =====`);
  if (fail.length) {
    console.log("Yang gagal (masih pakai placeholder, bisa diisi manual):");
    for (const f of fail) console.log("  - " + f.id + ".jpg");
  }
}

main().catch((e) => {
  console.error("Error fatal:", e);
  process.exit(1);
});

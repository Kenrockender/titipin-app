# Perbaikan Katalog: Gambar Unik, Warna Sepatu & Pending Luxury

## Ringkasan

Ada 3 permintaan:
1. **Banyak produk pakai gambar yang sama** — varian tanpa `vq: 1` share gambar base, perlu dibuat unik semua
2. **Sepatu: tampilkan warna yang tersedia** — biar customer mudah lihat pilihan warna
3. **Luxury dipending** — kategori Luxury akan di-hide dari katalog (nanti web terpisah hitam-gold)

---

## Analisis Masalah Gambar

Produk yang **punya varian tapi TIDAK punya `vq: 1`** akan share gambar yang sama. Ini terjadi pada:

| Produk | Varian | Masalah |
|--------|--------|---------|
| Pocky Premium | Almond Crush, Uji Matcha, dll | Semua pakai `prod-pocky-premium.jpg` |
| Jagariko | Salad, Cheese, dll | Semua pakai `prod-jagariko.jpg` |
| Jagabee | Lightly Salted, Butter Soy Sauce | Semua pakai `prod-jagabee.jpg` |
| Country Ma'am | Vanilla & Cocoa, Matcha | Semua pakai `prod-countrymaam.jpg` |
| Hi-Chew | White Peach, Muscat, Yuzu | Semua pakai `prod-hichew.jpg` |
| Babystar | Chicken, Mentaiko | Semua pakai `prod-babystar.jpg` |
| Kaki no Tane | Original, Wasabi, Umeboshi | Semua pakai `prod-kakinotane.jpg` |
| Yokumoku | 20 pcs, 30 pcs | Sama |
| Sugar Butter | 14 pcs, 24 pcs | Sama |
| Meltykiss | Premium Chocolate, Matcha | Sama |
| Tirol | — | Tidak ada varian |
| Royce Potato | Original, Mild Bitter | Sama |
| Alfort | Milk, Matcha | Sama |
| Kanro Gummy | Lemon, Grape, Yuzu | Sama |
| Kororo | Grape, Muscat | Sama |
| Cupnoodle JP | Seafood, Curry, Chili Tomato | Sama |
| Calpico | Original, White Peach | Sama |
| Yatsuhashi | Cinnamon, Matcha | Sama |
| Koyamaen | Isuzu, Wako | Sama |
| Osulloc | Sejak, Honey Pearl | Sama |
| Curel | Foaming Wash, Cream | Sama |
| Minon | Charged Lotion, Milky Cream | Sama |
| Obagi | C10, C25 | Sama |
| Transino | White C Clear Serum, Clear Wash | Sama |
| Mediheal | Tea Tree, Collagen, Madecassoside | Sama |
| Torriden | Serum, Toner | Sama |
| Skin1004 | Ampoule, Hyalu-Cica Sun Serum | Sama |
| Numbuzin | No.3 Glow, No.5 Vitamin | Sama |
| Drjart | Tiger Grass, Color Correcting | Sama |
| Rom&nd | Fig Fig, Apple Brown, Bare Grape | Sama |
| Shiro Mist | Savon, White Lily, White Tea | Sama |
| Shiro Hand | Savon, Kinmokusei | Sama |
| Issey Miyake | Pour Homme, Pour Femme | Sama |
| Uka Nail | 7:15, 24:45 | Sama |
| Forment | Cotton Hug, Cotton Kiss | Sama |
| Satori | Satori, Iris Homme, Hyouge | Sama |
| Diser | Kyara, Sora | Sama |
| **Dan masih banyak lagi di Fashion, Shoes, Beverages, dll** | | |

**Total ~60+ produk share gambar dengan varian lain.**

---

## Proposed Changes

### 1. Gambar Unik untuk Semua Varian

#### [MODIFY] [catalog-data.mjs](file:///c:/Users/kenro/Downloads/JASTIP/titipin-app/scripts/catalog-data.mjs)
- Tambahkan `vq: 1` ke **semua produk yang punya varian** tapi belum punya flag ini
- Ini akan membuat setiap varian dapat gambar unik berdasarkan nama variannya

#### [MODIFY] [fetch-product-images.mjs](file:///c:/Users/kenro/Downloads/JASTIP/titipin-app/scripts/fetch-product-images.mjs)
- Update PRODUCTS manifest untuk include semua varian baru yang perlu gambar unik
- Tambahkan search query yang spesifik untuk setiap varian

#### Generate ulang
- Jalankan `node scripts/generate-catalog.mjs` untuk re-generate `lib/generated-products.ts`
- Jalankan `node scripts/fetch-product-images.mjs` untuk download gambar baru

---

### 2. Warna Sepatu — Color Swatches di Product Card

#### [MODIFY] [database.types.ts](file:///c:/Users/kenro/Downloads/JASTIP/titipin-app/types/database.types.ts)
- Tambahkan field `color_variants?: ColorVariant[]` pada `CatalogProduct`
- Type: `{ color: string; hex: string; product_id: string }`

#### [MODIFY] [catalog-data.mjs](file:///c:/Users/kenro/Downloads/JASTIP/titipin-app/scripts/catalog-data.mjs)
- Tambahkan data `colors` di setiap produk Shoes, contoh:
  ```js
  { id: "mexico66-var", ..., colors: [
    { n: "Yellow/Black", hex: "#F5D30F" },
    { n: "White/Blue", hex: "#4A90D9" },
    ...
  ]}
  ```

#### [MODIFY] [generate-catalog.mjs](file:///c:/Users/kenro/Downloads/JASTIP/titipin-app/scripts/generate-catalog.mjs)
- Generate `color_variants` field yang menghubungkan setiap varian warna ke `product_id` varian lain, beserta `hex` code
- Ini memungkinkan saat user melihat satu warna sepatu, mereka bisa klik warna lain dan langsung navigate ke varian itu

#### [MODIFY] [ProductCard.tsx](file:///c:/Users/kenro/Downloads/JASTIP/titipin-app/components/catalog/ProductCard.tsx)
- Tampilkan color swatches (lingkaran kecil berwarna) di bawah nama produk untuk sepatu
- Klik swatch → navigate ke halaman varian tersebut
- Swatch warna aktif diberi ring/border

#### [MODIFY] [ProductDetail page.tsx](file:///c:/Users/kenro/Downloads/JASTIP/titipin-app/app/(public)/catalog/[productId]/page.tsx)
- Tampilkan color picker (swatches besar) di halaman detail
- Active color di-highlight

---

### 3. Pending Kategori Luxury

#### [MODIFY] [catalog-data.mjs](file:///c:/Users/kenro/Downloads/JASTIP/titipin-app/scripts/catalog-data.mjs)
- Tambahkan `skip: true` ke **semua produk dengan `c: "Luxury"`**
- Ini akan membuat mereka di-skip saat generate (sudah ada mekanisme `if (b.skip) continue;` di generate script)

#### [MODIFY] [mock-data.ts](file:///c:/Users/kenro/Downloads/JASTIP/titipin-app/lib/mock-data.ts)
- Hapus curated products yang berkategori Luxury (porter-tanker, dll) atau ubah kategorinya

---

## User Review Required

> [!IMPORTANT]
> **Luxury Products** — Semua 26 produk Luxury akan di-hide dari katalog:
> Seiko Presage, Prospex, King Seiko, Grand Seiko, Citizen, Oceanus, G-Shock Full Metal, Porter (semua), BAO BAO, Pleats Please, Vintage LV, Vintage Gucci, CDG Wallet, Gentle Monster, Kaneko, Eyevan, Sailor Pen, Platinum Pen, Hobonichi, 4°C, ete, agete, Mikimoto, Ganzo
> 
> Apakah ada produk di atas yang ingin tetap ditampilkan di katalog utama (bukan luxury)?

> [!IMPORTANT]  
> **Gambar Download** — Perlu menjalankan `fetch-product-images.mjs` untuk download ~100+ gambar baru dari internet. Proses ini butuh koneksi internet dan waktu beberapa menit. Boleh saya jalankan?

## Open Questions

1. **Hobonichi, Porter, Hobonichi** — Beberapa produk "Luxury" sebenarnya affordable (Hobonichi ~Rp500rb, Porter bags). Mau dipindah ke kategori lain (Fashion/Lifestyle) atau tetap di-pending?

2. **Color mapping sepatu** — Saya akan mapping warna ke hex codes untuk swatches. Contoh:
   - Yellow/Black → 🟡 `#F5D30F`  
   - White/Blue → 🔵 `#4A90D9`
   - Rain Cloud → ⚪ `#B8BFC6`
   
   Apakah style ini OK, atau mau pakai gambar mini (thumbnail) sebagai swatch?

---

## Verification Plan

### Automated
```bash
node scripts/generate-catalog.mjs
# Memastikan produk di-generate benar, luxury di-skip, dan semua varian punya gambar unik
```

### Manual
- Buka catalog page → pastikan kategori "Luxury" tidak muncul
- Buka produk sepatu → pastikan ada color swatches
- Klik swatch → navigate ke varian warna lain
- Cek semua varian punya gambar berbeda (tidak ada duplikat)

# Plan: Titipin Luxury — Sub-route Hitam + Gold

## Ringkasan
Bikin sub-section `/luxury` di dalam app Titipin yang sudah ada, dengan tema hitam (onyx) + gold klasik. Mencakup 3 halaman: **Landing showcase**, **Katalog luxury**, dan **Jasa titip premium (request)**. Tema terisolasi penuh dari app biru utama — tidak mengubah satu pun komponen/page yang sudah ada.

## Temuan kunci (mempengaruhi desain)
- **Data luxury sudah lengkap & aktif**: 53 produk `category:"Luxury"` di `generated-products.ts` + 5 produk curated di `mock-data.ts`, semua `is_active:true`, gambar sudah ada di `public/products/`. **Tidak perlu bikin mock data baru** — cukup filter `category === "Luxury"` dari store.
- **Tema tidak boleh override token `brand` global** karena itu akan mengubah seluruh app. Solusi: tambah token `gold`/`onyx` baru + komponen luxury variants sendiri.
- **Pola sub-section chrome sudah ada** di `app/admin/layout.tsx` + path-gate `if (path.startsWith("/admin")) return null` di Navbar/Footer. Tinggal tiru pola ini untuk `/luxury`.
- **Tidak sentuh schema/types/store** untuk MVP — request luxury tetap pakai `submitRequest` yang ada (isolate risk). Tagging `tier` bisa Phase 2.

## Palet warna (Onyx + Gold Klasik)
```
onyx    #0A0A0A   bg utama
onyx-2  #141414   bg card/surface
onyx-3  #1F1F1F   bg elevated / border halus
gold    #D4AF37   aksen utama (gold klasik)
gold-2  #BF953F   gold gelap (gradient/hover)
gold-3  #FCF6BA   gold terang (gradient shimmer)
text    #F5F5F0   off-white
muted   #9A9A95   abu hangat
```
Font: tambah **Cormorant Garamond** (serif display, untuk judul mewah) + pakai **Plus Jakarta Sans** yang sudah ada untuk body. Dimuat via Google Fonts `<link>` di root layout `<head>`.

## Struktur file baru

```
app/
  luxury/
    layout.tsx                    # Chrome luxury: navbar + footer hitam-gold, path-gated
    page.tsx                      # Landing showcase
    catalog/
      page.tsx                    # Grid katalog luxury (filter category=Luxury)
      [productId]/page.tsx        # Detail produk luxury
    request/page.tsx              # Jasa titip premium (form request mewah)
components/
  luxury/
    LuxuryNavbar.tsx              # Navbar hitam-gold (logo gold, link, cart badge)
    LuxuryFooter.tsx              # Footer hitam-gold
    LuxuryProductCard.tsx         # Card produk dengan border gold, hover gold glow
    LuxuryProductGrid.tsx         # Grid wrapper
    GoldButton.tsx                # Button dengan gold gradient / outline gold
    GoldBadge.tsx                 # Badge gold tone
    LuxurySection.tsx             # Section wrapper dengan ornament divider gold
lib/
  luxury-data.ts                  # Helper: getLuxuryProducts() filter + metadata (brands, trip)
```

## Modifikasi file yang sudah ada (minimal, surgical)

1. **`tailwind.config.ts`** — extend `colors` dengan `gold`/`onyx` tokens + `fontFamily.serif`. **Tidak mengubah** `brand`/`ink`/`cream` yang dipakai app utama.
2. **`components/layout/Navbar.tsx`** — tambah `if (path.startsWith("/luxury")) return null;` (1 baris, di sebelah gate `/admin` yang sudah ada).
3. **`components/layout/Footer.tsx`** — tambah path-gate `if (path.startsWith("/luxury")) return null;` (saat ini hanya gate `/admin`).
4. **`components/layout/WhatsAppWidget.tsx`** — tambah path-gate supaya tidak tampil di `/luxury` (luxury punya contact style sendiri). *Atau* biarkan — opsional, saya akan gate supaya luxury punya styling sendiri.
5. **`app/layout.tsx`** — tambah `<link>` Google Fonts untuk Cormorant Garamond di `<head>` (sebelah link Jakarta Sans yang sudah ada). Tidak ubah struktur layout.

> Tidak ada perubahan ke: `lib/store.tsx`, `lib/pricing.ts`, `lib/format.ts`, `types/database.types.ts`, `supabase/schema.sql`, `middleware.ts`, atau page manapun di `(public)`/`(customer)`/`admin`.

## Detail tiap halaman

### 1. `/luxury` — Landing Showcase (`app/luxury/page.tsx`)
- **Hero**: bg onyx, judul serif besar "Titipin Luxury" + tagline gold, CTA gold gradient → Browse Collection / Concierge Request. Foto produk luxury besar (Grand Seiko / BAO BAO) dengan gold border frame.
- **Marquee brand**: row nama brand luxury yang bisa dititipin (Grand Seiko, Issey Miyake, Porter, Gentle Monster, Seiko Presage, dll) — gold text on onyx, scroll halus.
- **Featured collection**: 4 produk luxury unggulan (Grand Seiko Snowflake, BAO BAO, Vintage LV, King Seiko) pakai `LuxuryProductCard` besar.
- **"White-glove service" section**: 3-4 keunggulan jasa titip premium (personal concierge, DP protected, authenticated sourcing, hand-carried) dengan ikon gold.
- **How it works**: 4 langkah (Request → Quote → We source overseas → Delivered) versi mewah.
- **Testimonial/quote** (opsional, 1 quote elegan).
- **CTA akhir**: "Request a grail" → `/luxury/request`.

### 2. `/luxury/catalog` — Katalog Luxury (`app/luxury/catalog/page.tsx`)
- Header serif "The Collection" + subtext gold.
- Filter pill by brand/sub-category (ambil dari `store_location`/name: Watches, Bags, Eyewear, Fragrance, dll) — pill onyx, active = gold border + gold text.
- `LuxuryProductGrid` (2-3 kolom di desktop, gap besar, foto premium besar).
- Pakai `useStore().products.filter(p => p.is_active && p.category === "Luxury")`.

### 3. `/luxury/catalog/[productId]` — Detail Produk Luxury
- Mirror struktur `app/(public)/catalog/[productId]/page.tsx` tapi tema onyx-gold.
- Layout 2 kolom: foto besar (aspect-square, gold border, shadow gold glow) + info.
- Judul serif, harga gold besar (`formatIDR`), deskripsi, store location.
- Price breakdown card (onyx-2 surface, gold divider) pakai `calculateQuote` dari `lib/pricing`.
- CTA: `GoldButton` "Add to Collection" (add to cart pakai `addToCart` store yang sama) + WhatsApp concierge.
- Related: 4 produk luxury lain dari brand/kategori sama.

### 4. `/luxury/request` — Jasa Titip Premium
- Mirror `app/(public)/request/page.tsx` tapi tema mewah.
- Headline serif "Concierge Request" + copy premium ("Hunting grail items — paste a link, upload a photo, we source it").
- Form sama (name, url, photos, qty, variations) + field "Target budget" opsional.
- Submit pakai `submitRequest` store yang sama (no schema change).
- Success screen mewah (gold check, "Your request is with our concierge").

### 5. `app/luxury/layout.tsx` — Chrome
- `"use client"`, render `<LuxuryNavbar />` + `{children}` + `<LuxuryFooter />`.
- Main wrapper `min-h-screen bg-onyx text-[#F5F5F0] font-sans`.
- Tidak render Navbar/Footer/WhatsApp global (mereka sudah self-hide via path-gate).

## Komponen luxury (detail styling)

- **`GoldButton`**: variant `primary` = gold gradient (`bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#BF953F] text-onyx`), `outline` = border gold + text gold on transparent, `ghost` = text gold hover bg gold/10. Base `rounded-lg px-6 h-12 font-bold tracking-wide`.
- **`LuxuryProductCard`**: outer `bg-onyx-2 border border-gold/20 hover:border-gold/60 hover:shadow-[0_0_30px_-8px_rgba(212,175,55,.4)]`, image `aspect-[4/5]` (premium portrait), category `GoldBadge` top-left, body padding generous, price gold serif.
- **`LuxuryNavbar`**: sticky, `bg-onyx/95 backdrop-blur border-b border-gold/20`, logo "TITIPIN" + "LUXURY" gold kecil, links (Collection, Concierge, My Orders), cart badge gold.
- **`GoldBadge`**: `bg-gold/10 text-gold border border-gold/30 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider`.
- **`LuxurySection`**: wrapper `max-w-6xl mx-auto px-6 py-20` + optional gold ornament divider (thin gold line + diamond ◆).

## Yang TIDAK ikut scope ini (Phase 2, sengaja)
- Admin panel luxury terpisah (`/admin/luxury`) — pakai admin catalog yang ada, filter category=Luxury.
- Tagging `tier`/`is_luxury` di `CustomRequest`/schema.
- Checkout/cart flow khusus luxury — pakai `/cart` yang ada (cart di-share via store).
- Login/register luxury terpisah.
- Integrasi Supabase untuk luxury (sekarang mock mode, sama dengan app utama).

## Urutan implementasi
1. `tailwind.config.ts` — tambah token `gold`/`onyx` + `fontFamily.serif`.
2. `app/layout.tsx` — tambah link font Cormorant Garamond.
3. Path-gate di `Navbar.tsx`, `Footer.tsx`, `WhatsAppWidget.tsx` untuk `/luxury`.
4. Komponen UI luxury: `GoldButton`, `GoldBadge`, `LuxurySection`.
5. `LuxuryNavbar`, `LuxuryFooter`, `LuxuryProductCard`, `LuxuryProductGrid`.
6. `lib/luxury-data.ts` helper.
7. `app/luxury/layout.tsx`.
8. `app/luxury/page.tsx` (landing showcase).
9. `app/luxury/catalog/page.tsx` + `[productId]/page.tsx`.
10. `app/luxury/request/page.tsx`.
11. Jalankan `npm run build` untuk verifikasi tidak ada error TypeScript/build.

## Verifikasi
- `npm run build` lolos tanpa error.
- Buka `/luxury` → tema hitam-gold muncul, Navbar biru global tidak tampil.
- Buka `/` (landing utama) → tetap biru-cream, tidak terpengaruh.
- Katalog luxury menampilkan 53+ produk luxury dengan gambar.
- Add to cart dari luxury → muncul di `/cart` (shared store).
- Request luxury → masuk ke store (cek di `/dashboard` atau admin requests).

## Catatan
- Proses ini membuat ~14 file baru + edit 5 file existing (semua minimal/surgical).
- Tidak ada dependency baru yang perlu install (Cormorant via Google Fonts CDN, sama seperti Jakarta Sans yang sudah dipakai).
- Risiko rendah: semua perubahan existing hanyalah menambah 1 baris path-gate + 1 link font + extend config (additive, tidak modify yang ada).
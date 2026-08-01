// Seed data used when Supabase env vars are absent. Mirrors supabase/seed.sql.
import type {
  AddOn, CatalogProduct, CustomRequest, Order, Payment, Trip, User
} from "@/types/database.types";
import { generatedProducts } from "./generated-products";

const IMG = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=640&q=70`;

export const CURRENT_USER: User = {
  id: "user-001",
  full_name: "Rani Pratiwi",
  email: "rani@example.com",
  whatsapp_number: "6281200001111",
  shipping_address: "Jl. Melati No. 12, Kebayoran Baru, Jakarta Selatan 12160",
  store_credit_balance: 0,
  created_at: "2026-05-02T09:00:00Z"
};

export const trips: Trip[] = [
  { id: "trip-tokyo", name: "Tokyo Trip — Aug 2026", destination_country: "Japan", system_exchange_rate: 112, status: "Active Shopping" },
  { id: "trip-seoul", name: "Seoul Trip — Oct 2026", destination_country: "South Korea", system_exchange_rate: 12.1, status: "Planning" }
];

const curatedProducts: CatalogProduct[] = [
  { id: "prod-tokyobanana", trip_id: "trip-tokyo", name: "Tokyo Banana (8 pcs)", description: "Iconic Tokyo souvenir sponge cake with custard filling. Fresh from Tokyo Station.", base_price_foreign: 1180, markup_percentage: 20, flat_jastip_fee: 50000, final_price_idr: 208500, image_url: "/products/prod-tokyobanana.jpg", is_active: true, category: "Snacks", store_location: "Tokyo Station" },
  { id: "prod-shuuemura", trip_id: "trip-tokyo", name: "Shu Uemura Cleansing Oil 450ml", description: "Cult-favourite Japanese cleansing oil, jumbo size. Cheaper than any local reseller.", base_price_foreign: 9900, markup_percentage: 20, flat_jastip_fee: 50000, final_price_idr: 1381500, image_url: "/products/prod-shuuemura.jpg", is_active: true, category: "Skincare", store_location: "Don Quijote Shinjuku" },
  { id: "prod-kitkat", trip_id: "trip-tokyo", name: "KitKat Matcha Box (12 mini)", description: "Japan-exclusive uji matcha KitKat. Perfect gift or hoard for yourself.", base_price_foreign: 800, markup_percentage: 25, flat_jastip_fee: 40000, final_price_idr: 152000, image_url: "/products/prod-kitkat.jpg", is_active: true, category: "Snacks", store_location: "Don Quijote Shinjuku" },
  { id: "prod-uniqlo", trip_id: "trip-tokyo", name: "Uniqlo Heattech Ultra Warm", description: "The warmest Heattech tier, hard to find in Indonesia. Unisex sizing S–XL.", base_price_foreign: 2990, markup_percentage: 18, flat_jastip_fee: 45000, final_price_idr: 441500, image_url: "/products/prod-uniqlo.jpg", is_active: true, category: "Fashion", store_location: "Uniqlo Ginza" },
  { id: "prod-hadalabo", trip_id: "trip-tokyo", name: "Hada Labo Gokujyun Lotion", description: "Best-selling hydrating lotion, original Japan formula.", base_price_foreign: 1200, markup_percentage: 22, flat_jastip_fee: 40000, final_price_idr: 204000, image_url: "/products/prod-hadalabo.jpg", is_active: true, category: "Skincare", store_location: "Matsumoto Kiyoshi" },
  { id: "prod-labubu", trip_id: "trip-tokyo", name: "Labubu 'Big Into Energy' Blind Box", description: "The viral Pop Mart blind box everyone is hunting. Sealed, authentic — chase the secret variant.", base_price_foreign: 1980, markup_percentage: 25, flat_jastip_fee: 55000, final_price_idr: 332500, image_url: "/products/prod-labubu.jpg", is_active: true, category: "Collectibles", store_location: "Pop Mart Shibuya" },
  { id: "prod-crybaby", trip_id: "trip-tokyo", name: "Pop Mart CRYBABY Blind Box", description: "Fast-rising Pop Mart series gaining on Labubu. Authentic sealed box, single blind pull.", base_price_foreign: 2200, markup_percentage: 25, flat_jastip_fee: 55000, final_price_idr: 363000, image_url: "/products/prod-crybaby.jpg", is_active: true, category: "Collectibles", store_location: "Pop Mart Shibuya" },
  { id: "prod-medicube-pdrn", trip_id: "trip-seoul", name: "Medicube PDRN Pink Peptide Serum 30ml", description: "2026 breakout K-beauty hit. Salmon-derived PDRN to firm and brighten — the 'glass skin' serum.", base_price_foreign: 28000, markup_percentage: 22, flat_jastip_fee: 50000, final_price_idr: 463500, image_url: "/products/prod-medicube-pdrn.jpg", is_active: true, category: "Skincare", store_location: "Olive Young Myeongdong" },
  { id: "prod-anua-oil", trip_id: "trip-seoul", name: "Anua Heartleaf Cleansing Oil 200ml", description: "Over 10 million sold in Korea. 82% heartleaf extract, melts makeup + SPF without irritation.", base_price_foreign: 22000, markup_percentage: 22, flat_jastip_fee: 45000, final_price_idr: 370000, image_url: "/products/prod-anua-oil.jpg", is_active: true, category: "Skincare", store_location: "Olive Young Myeongdong" },
  { id: "prod-biodance-mask", trip_id: "trip-seoul", name: "Biodance Bio-Collagen Real Deep Mask (4pcs)", description: "The overnight collagen mask that went viral on TikTok. Peels off clear by morning.", base_price_foreign: 30000, markup_percentage: 22, flat_jastip_fee: 45000, final_price_idr: 488000, image_url: "/products/prod-biodance-mask.jpg", is_active: true, category: "Skincare", store_location: "Olive Young Myeongdong" },
  { id: "prod-haku", trip_id: "trip-tokyo", name: "Shiseido HAKU Melanofocus EV Essence 45g", description: "Japan's cult brightening essence with patented anti-hyperpigmentation actives. Pharmacy-exclusive.", base_price_foreign: 11000, markup_percentage: 20, flat_jastip_fee: 50000, final_price_idr: 1528500, image_url: "/products/prod-haku.jpg", is_active: true, category: "Skincare", store_location: "Matsumoto Kiyoshi" },
  { id: "prod-fm-socks", trip_id: "trip-tokyo", name: "FamilyMart Line Socks (Limited)", description: "The viral konbini socks in FamilyMart green/blue/white. A cheap, instantly recognisable souvenir.", base_price_foreign: 429, markup_percentage: 30, flat_jastip_fee: 20000, final_price_idr: 82500, image_url: "/products/prod-fm-socks.jpg", is_active: true, category: "Fashion", store_location: "FamilyMart" },
  { id: "prod-milkcheese", trip_id: "trip-tokyo", name: "Tokyo Milk Cheese Factory Cookies (20pcs)", description: "Salt & Camembert cheese cookies — a top Tokyo Station souvenir that always sells out.", base_price_foreign: 1080, markup_percentage: 25, flat_jastip_fee: 40000, final_price_idr: 191500, image_url: "/products/prod-milkcheese.jpg", is_active: true, category: "Snacks", store_location: "Tokyo Station" },
  { id: "prod-nb1906r", trip_id: "trip-tokyo", name: "New Balance 1906R", description: "The Y2K runner revival everyone wants. Silver/white with ABZORB cushioning — pairs with any streetwear fit.", base_price_foreign: 23100, markup_percentage: 18, flat_jastip_fee: 60000, final_price_idr: 3113000, image_url: "/products/prod-nb1906r.jpg", is_active: true, category: "Shoes", store_location: "ABC Mart Harajuku" },
  { id: "prod-cdg-converse", trip_id: "trip-tokyo", name: "CDG PLAY x Converse Chuck Taylor", description: "The iconic red-heart Chuck Taylor collab. Made in Japan stock, hard to find in size locally.", base_price_foreign: 14300, markup_percentage: 20, flat_jastip_fee: 60000, final_price_idr: 1982000, image_url: "/products/prod-cdg-converse.jpg", is_active: true, category: "Shoes", store_location: "Dover Street Market Ginza" },
  { id: "prod-cdg-tee", trip_id: "trip-tokyo", name: "CDG PLAY Red Heart Tee (White)", description: "Signature Comme des Garcons PLAY heart logo tee. Made in Japan — cheaper at the source than any reseller.", base_price_foreign: 9000, markup_percentage: 25, flat_jastip_fee: 45000, final_price_idr: 1305000, image_url: "/products/prod-cdg-tee.jpg", is_active: true, category: "Fashion", store_location: "Dover Street Market Ginza" },
  { id: "prod-cdg-stripe", trip_id: "trip-tokyo", name: "CDG PLAY Striped L/S Tee", description: "Play Comme des Garcons striped long-sleeve, made in Japan. A wardrobe staple with the heart patch.", base_price_foreign: 14300, markup_percentage: 22, flat_jastip_fee: 45000, final_price_idr: 1999000, image_url: "/products/prod-cdg-stripe.jpg", is_active: true, category: "Fashion", store_location: "Dover Street Market Ginza" },
  { id: "prod-x100vi", trip_id: "trip-tokyo", name: "Fujifilm X100VI Camera", description: "The viral fixed-lens compact that sells out worldwide. Japan stock at Bic Camera, tax-free at source.", base_price_foreign: 280000, markup_percentage: 12, flat_jastip_fee: 150000, final_price_idr: 35273500, image_url: "/products/prod-x100vi.jpg", is_active: true, category: "Electronics", store_location: "Bic Camera Shinjuku" },
  { id: "prod-switch2", trip_id: "trip-tokyo", name: "Nintendo Switch 2 (Multi-language)", description: "Multi-language edition via My Nintendo — works outside Japan. The must-have 2026 console.", base_price_foreign: 69980, markup_percentage: 15, flat_jastip_fee: 100000, final_price_idr: 9113500, image_url: "/products/prod-switch2.jpg", is_active: true, category: "Electronics", store_location: "Yodobashi Akihabara" },
  { id: "prod-sonyxm5", trip_id: "trip-tokyo", name: "Sony WF-1000XM5 Earbuds", description: "Flagship noise-cancelling earbuds, noticeably cheaper in Japan than the Indonesian retail price.", base_price_foreign: 33000, markup_percentage: 15, flat_jastip_fee: 60000, final_price_idr: 4310500, image_url: "/products/prod-sonyxm5.jpg", is_active: true, category: "Electronics", store_location: "Bic Camera Shinjuku" },
  { id: "prod-panasonic-dryer", trip_id: "trip-tokyo", name: "Panasonic Nanoe EH-NA0J Hair Dryer", description: "Cult Japanese hair dryer with nanoe moisture tech. A top jastip electronic — Japan voltage note included.", base_price_foreign: 30800, markup_percentage: 18, flat_jastip_fee: 60000, final_price_idr: 4131000, image_url: "/products/prod-panasonic-dryer.jpg", is_active: true, category: "Electronics", store_location: "Bic Camera Shinjuku" },
  { id: "prod-onitsuka66", trip_id: "trip-tokyo", name: "Onitsuka Tiger Mexico 66 (Nippon Made)", description: "Hand-crafted premium-leather 'Nippon Made' line, exclusive to Japan and almost half the overseas price.", base_price_foreign: 30000, markup_percentage: 18, flat_jastip_fee: 60000, final_price_idr: 4025000, image_url: "/products/prod-onitsuka66.jpg", is_active: true, category: "Shoes", store_location: "Onitsuka Tiger Ginza" },
  { id: "prod-asics-kayano", trip_id: "trip-tokyo", name: "Asics Gel-Kayano 14", description: "The retro-tech running silhouette that blew up on TikTok. Cheaper at the Japanese source.", base_price_foreign: 17600, markup_percentage: 18, flat_jastip_fee: 60000, final_price_idr: 2386500, image_url: "/products/prod-asics-kayano.jpg", is_active: true, category: "Shoes", store_location: "ABC Mart Harajuku" },
  { id: "prod-humanmade-tee", trip_id: "trip-tokyo", name: "Human Made Heart Tee", description: "NIGO's cult Tokyo streetwear label. The red-heart graphic tee resells well and sells out fast.", base_price_foreign: 13200, markup_percentage: 22, flat_jastip_fee: 45000, final_price_idr: 1849000, image_url: "/products/prod-humanmade-tee.jpg", is_active: true, category: "Fashion", store_location: "Human Made Shibuya" },
  { id: "prod-beams-tee", trip_id: "trip-tokyo", name: "BEAMS Japan Graphic Tee", description: "Iconic BEAMS Japan souvenir tee — a Tokyo staple you can only get locally.", base_price_foreign: 6600, markup_percentage: 25, flat_jastip_fee: 45000, final_price_idr: 969000, image_url: "/products/prod-beams-tee.jpg", is_active: true, category: "Fashion", store_location: "BEAMS Harajuku" },
  { id: "prod-porter-tanker", trip_id: "trip-tokyo", name: "Porter Tanker Shoulder Bag", description: "The legendary Yoshida & Co. nylon bag. Made in Japan, notably cheaper than importing.", base_price_foreign: 18700, markup_percentage: 20, flat_jastip_fee: 70000, final_price_idr: 2583500, image_url: "/products/prod-porter-tanker.jpg", is_active: true, category: "Bags", store_location: "Porter Ginza" },
  { id: "prod-onitsuka-mini", trip_id: "trip-tokyo", name: "Onitsuka Tiger Round Mini Shoulder Bag", description: "The viral round mini bag — perfect everyday size, Japan-exclusive colorways.", base_price_foreign: 11000, markup_percentage: 22, flat_jastip_fee: 55000, final_price_idr: 1558500, image_url: "/products/prod-onitsuka-mini.jpg", is_active: true, category: "Bags", store_location: "Onitsuka Tiger Ginza" },
  { id: "prod-shiro-savon", trip_id: "trip-tokyo", name: "SHIRO Savon Eau de Parfum 40ml", description: "Japan's beloved clean-soap fragrance. A cult SHIRO scent that's pricey to import.", base_price_foreign: 4700, markup_percentage: 25, flat_jastip_fee: 45000, final_price_idr: 703000, image_url: "/products/prod-shiro-savon.jpg", is_active: true, category: "Fragrance", store_location: "SHIRO Aoyama" },
  { id: "prod-cdg-wonderwood", trip_id: "trip-tokyo", name: "CDG Wonderwood Eau de Parfum", description: "Comme des Garcons' woody signature scent. Best price at Dover Street Market Ginza.", base_price_foreign: 13000, markup_percentage: 22, flat_jastip_fee: 50000, final_price_idr: 1826500, image_url: "/products/prod-cdg-wonderwood.jpg", is_active: true, category: "Fragrance", store_location: "Dover Street Market Ginza" },
  { id: "prod-sony-zve10", trip_id: "trip-tokyo", name: "Sony ZV-E10 II Vlog Camera", description: "The go-to interchangeable-lens vlog camera. Japan stock, tax-free at Bic Camera.", base_price_foreign: 110000, markup_percentage: 13, flat_jastip_fee: 100000, final_price_idr: 14022000, image_url: "/products/prod-sony-zve10.jpg", is_active: true, category: "Electronics", store_location: "Bic Camera Shinjuku" },
  { id: "prod-gshock", trip_id: "trip-tokyo", name: "Casio G-Shock (Japan Model)", description: "Japan-domestic G-Shock references not sold in Indonesia. Solar + Bluetooth options.", base_price_foreign: 22000, markup_percentage: 18, flat_jastip_fee: 60000, final_price_idr: 2968000, image_url: "/products/prod-gshock.jpg", is_active: true, category: "Electronics", store_location: "Bic Camera Shinjuku" },
  { id: "prod-mariokart", trip_id: "trip-tokyo", name: "Mario Kart World (Switch 2)", description: "The launch must-have Switch 2 title. Japanese cart plays multi-language.", base_price_foreign: 8980, markup_percentage: 18, flat_jastip_fee: 40000, final_price_idr: 1227000, image_url: "/products/prod-mariokart.jpg", is_active: true, category: "Electronics", store_location: "Yodobashi Akihabara" },
  { id: "prod-zojirushi", trip_id: "trip-tokyo", name: "Zojirushi Micom Rice Cooker (3-cup)", description: "Cult Japanese rice cooker with Micom fuzzy logic. A top kitchen jastip pick.", base_price_foreign: 25000, markup_percentage: 18, flat_jastip_fee: 90000, final_price_idr: 3394000, image_url: "/products/prod-zojirushi.jpg", is_active: true, category: "Home & Kitchen", store_location: "Bic Camera Shinjuku" },
  { id: "prod-santoku", trip_id: "trip-tokyo", name: "Japanese Santoku Knife (Stainless)", description: "Kappabashi-street chef knife. Razor-sharp, a fraction of overseas boutique prices.", base_price_foreign: 8800, markup_percentage: 22, flat_jastip_fee: 50000, final_price_idr: 1252500, image_url: "/products/prod-santoku.jpg", is_active: true, category: "Home & Kitchen", store_location: "Kappabashi Street" },
  { id: "prod-hibiki", trip_id: "trip-tokyo", name: "Hibiki Japanese Harmony Whisky 700ml", description: "Suntory's award-winning blend, far more affordable at the source in Japan.", base_price_foreign: 8800, markup_percentage: 25, flat_jastip_fee: 70000, final_price_idr: 1302000, image_url: "/products/prod-hibiki.jpg", is_active: true, category: "Beverages", store_location: "Isetan Liquor" },
  { id: "prod-royce", trip_id: "trip-tokyo", name: "Royce' Nama Chocolate (Au Lait)", description: "The melt-in-your-mouth Hokkaido chocolate everyone brings home. Keep chilled.", base_price_foreign: 800, markup_percentage: 25, flat_jastip_fee: 40000, final_price_idr: 152000, image_url: "/products/prod-royce.jpg", is_active: true, category: "Snacks", store_location: "Royce' Shinjuku" },
  { id: "prod-buldak", trip_id: "trip-seoul", name: "Buldak Ramen Variety Pack (Korea)", description: "The viral Samyang fire-noodle line, including Korea-exclusive flavors.", base_price_foreign: 12000, markup_percentage: 25, flat_jastip_fee: 40000, final_price_idr: 221500, image_url: "/products/prod-buldak.jpg", is_active: true, category: "Snacks", store_location: "Emart Seoul" },
  { id: "prod-pokemontcg", trip_id: "trip-tokyo", name: "Pokemon TCG Booster Box (Japanese)", description: "Sealed Japanese booster box — better pull rates and cheaper than English sets.", base_price_foreign: 5500, markup_percentage: 30, flat_jastip_fee: 50000, final_price_idr: 851000, image_url: "/products/prod-pokemontcg.jpg", is_active: true, category: "Collectibles", store_location: "Pokemon Center Shibuya" },
  { id: "prod-gundam-rg", trip_id: "trip-tokyo", name: "Bandai RG Gundam Model Kit", description: "Real Grade Gunpla, Japan-domestic pricing. A must for builders.", base_price_foreign: 3300, markup_percentage: 25, flat_jastip_fee: 45000, final_price_idr: 507000, image_url: "/products/prod-gundam-rg.jpg", is_active: true, category: "Toys", store_location: "Yodobashi Akihabara" },
  { id: "prod-sanrio", trip_id: "trip-tokyo", name: "Sanrio Hello Kitty Plush (Japan)", description: "Official Sanrio plush with Japan-exclusive outfits. Authentic tag included.", base_price_foreign: 3850, markup_percentage: 25, flat_jastip_fee: 45000, final_price_idr: 584000, image_url: "/products/prod-sanrio.jpg", is_active: true, category: "Toys", store_location: "Sanrio Gift Gate" },
  { id: "prod-skii", trip_id: "trip-tokyo", name: "SK-II Facial Treatment Essence 230ml", description: "The legendary Pitera essence. Japan pricing beats every Indonesian counter.", base_price_foreign: 17600, markup_percentage: 18, flat_jastip_fee: 55000, final_price_idr: 2381500, image_url: "/products/prod-skii.jpg", is_active: true, category: "Skincare", store_location: "Matsumoto Kiyoshi" },
  { id: "prod-laneige-lip", trip_id: "trip-seoul", name: "Laneige Lip Sleeping Mask", description: "The overnight lip mask that went mega-viral. Korea price is unbeatable.", base_price_foreign: 17000, markup_percentage: 22, flat_jastip_fee: 40000, final_price_idr: 291000, image_url: "/products/prod-laneige-lip.jpg", is_active: true, category: "Skincare", store_location: "Olive Young Myeongdong" },
  { id: "prod-pokemon", trip_id: "trip-tokyo", name: "Pokémon Center Plush (Pikachu)", description: "Official Pokémon Center exclusive plush. Authentic tag included.", base_price_foreign: 2200, markup_percentage: 25, flat_jastip_fee: 55000, final_price_idr: 363500, image_url: "/products/prod-pokemon.jpg", is_active: true, category: "Lifestyle", store_location: "Pokémon Center Shibuya" },

  // --- Fragrance ---
  { id: "prod-shiro-lily", trip_id: "trip-tokyo", name: "SHIRO White Lily Eau de Parfum 40ml", description: "SHIRO's clean floral bestseller alongside Savon. Japan-only pricing at the source.", base_price_foreign: 5280, markup_percentage: 25, flat_jastip_fee: 45000, final_price_idr: 784000, image_url: "/products/prod-shiro-lily.jpg", is_active: true, category: "Fragrance", store_location: "SHIRO Aoyama" },
  { id: "prod-jscent-tea", trip_id: "trip-tokyo", name: "J-Scent Roasted Green Tea EDP 50ml", description: "Japanese niche perfumery — smells like fresh hojicha. Practically impossible to find outside Japan.", base_price_foreign: 4950, markup_percentage: 25, flat_jastip_fee: 45000, final_price_idr: 738000, image_url: "/products/prod-jscent-tea.jpg", is_active: true, category: "Fragrance", store_location: "@cosme TOKYO Harajuku" },
  { id: "prod-auxparadis", trip_id: "trip-tokyo", name: "Aux Paradis Osmanthus EDP 30ml", description: "Minimalist Japanese fragrance house. The osmanthus scent that quietly went viral.", base_price_foreign: 3300, markup_percentage: 25, flat_jastip_fee: 40000, final_price_idr: 502000, image_url: "/products/prod-auxparadis.jpg", is_active: true, category: "Fragrance", store_location: "Aux Paradis Omotesando" },
  { id: "prod-tamburins", trip_id: "trip-seoul", name: "Tamburins Egg Perfume", description: "The sculptural K-beauty perfume everyone photographs. Flagship-store exclusive vibes from Seoul.", base_price_foreign: 42000, markup_percentage: 25, flat_jastip_fee: 45000, final_price_idr: 680500, image_url: "/products/prod-tamburins.jpg", is_active: true, category: "Fragrance", store_location: "Tamburins Hannam Seoul" },

  // --- Luxury (PENDING — akan punya web terpisah) ---
  { id: "prod-baobao", trip_id: "trip-tokyo", name: "BAO BAO Issey Miyake Lucent Tote (6x6)", description: "The iconic geometric tote, made in Japan. Significantly cheaper than Indonesian boutiques.", base_price_foreign: 60500, markup_percentage: 15, flat_jastip_fee: 80000, final_price_idr: 7872500, image_url: "/products/prod-baobao.jpg", is_active: false, category: "Luxury", store_location: "Issey Miyake Ginza" },
  { id: "prod-seiko-presage", trip_id: "trip-tokyo", name: "Seiko Presage Cocktail Time", description: "The 'Cocktail Time' automatic with the sunburst dial. JDM stock, tax-free at Bic Camera.", base_price_foreign: 48400, markup_percentage: 15, flat_jastip_fee: 80000, final_price_idr: 6314000, image_url: "/products/prod-seiko-presage.jpg", is_active: false, category: "Luxury", store_location: "Bic Camera Shinjuku" },
  { id: "prod-cdg-wallet", trip_id: "trip-tokyo", name: "CDG Classic Leather Wallet (Black)", description: "Comme des Garçons' signature leather wallet. A quiet-luxury staple, cheapest in Japan.", base_price_foreign: 26400, markup_percentage: 20, flat_jastip_fee: 60000, final_price_idr: 3608000, image_url: "/products/prod-cdg-wallet.jpg", is_active: false, category: "Luxury", store_location: "Dover Street Market Ginza" },
  { id: "prod-gentlemonster", trip_id: "trip-seoul", name: "Gentle Monster Sunglasses", description: "Korea's cult eyewear label. Flagship-exclusive colorways you won't find in Jakarta.", base_price_foreign: 280000, markup_percentage: 18, flat_jastip_fee: 70000, final_price_idr: 4068000, image_url: "/products/prod-gentlemonster.jpg", is_active: false, category: "Luxury", store_location: "Gentle Monster Hongdae" },
  { id: "prod-pilot823", trip_id: "trip-tokyo", name: "Pilot Custom 823 Fountain Pen", description: "Grail-tier Japanese fountain pen with vacuum filler. Itoya Ginza pricing beats every importer.", base_price_foreign: 33000, markup_percentage: 18, flat_jastip_fee: 60000, final_price_idr: 4421500, image_url: "/products/prod-pilot823.jpg", is_active: false, category: "Luxury", store_location: "Itoya Ginza" },

  // --- Japan-only food & drinks ---
  { id: "prod-dassai45", trip_id: "trip-tokyo", name: "Dassai 45 Junmai Daiginjo 720ml", description: "Japan's most famous premium sake, polished to 45%. Far cheaper at the source than any importer.", base_price_foreign: 1760, markup_percentage: 25, flat_jastip_fee: 70000, final_price_idr: 316500, image_url: "/products/prod-dassai45.jpg", is_active: true, category: "Beverages", store_location: "Isetan Liquor" },
  { id: "prod-choya", trip_id: "trip-tokyo", name: "Choya The Kishu Umeshu 700ml", description: "Premium plum liqueur with whole ume fruit in the bottle. A smooth, sweet Japan-only classic.", base_price_foreign: 1628, markup_percentage: 25, flat_jastip_fee: 60000, final_price_idr: 288000, image_url: "/products/prod-choya.jpg", is_active: true, category: "Beverages", store_location: "Isetan Liquor" },
  { id: "prod-ramune-set", trip_id: "trip-tokyo", name: "Weird Ramune Soda Set (6 Flavors)", description: "Takoyaki, wasabi, curry, chili oil — the infamous weird ramune flavors, all in one set. Dare your friends.", base_price_foreign: 1200, markup_percentage: 30, flat_jastip_fee: 45000, final_price_idr: 219500, image_url: "/products/prod-ramune-set.jpg", is_active: true, category: "Beverages", store_location: "Don Quijote Shinjuku" },
  { id: "prod-kitkat-sake", trip_id: "trip-tokyo", name: "KitKat Japanese Sake (9 mini)", description: "White chocolate KitKat with real sake powder — genuinely tastes like nihonshu. Japan exclusive.", base_price_foreign: 864, markup_percentage: 25, flat_jastip_fee: 40000, final_price_idr: 161000, image_url: "/products/prod-kitkat-sake.jpg", is_active: true, category: "Snacks", store_location: "Don Quijote Shinjuku" },
  { id: "prod-kitkat-wasabi", trip_id: "trip-tokyo", name: "KitKat Wasabi (10 mini)", description: "The legendary weird flavor: sweet white chocolate with a real wasabi kick. Regional Japan exclusive.", base_price_foreign: 972, markup_percentage: 25, flat_jastip_fee: 40000, final_price_idr: 176000, image_url: "/products/prod-kitkat-wasabi.jpg", is_active: true, category: "Snacks", store_location: "Don Quijote Shinjuku" },
  { id: "prod-ichiran", trip_id: "trip-tokyo", name: "Ichiran Ramen Box (5 servings)", description: "The famous tonkotsu ramen you queued for in Tokyo — take-home kit with Ichiran's secret red sauce.", base_price_foreign: 2000, markup_percentage: 25, flat_jastip_fee: 45000, final_price_idr: 325000, image_url: "/products/prod-ichiran.jpg", is_active: true, category: "Snacks", store_location: "Ichiran Shibuya" },
  { id: "prod-jagapokkuru", trip_id: "trip-tokyo", name: "Calbee Jaga Pokkuru (10 packs)", description: "Hokkaido-only potato sticks that never leave Japan officially. The snack locals hoard as gifts.", base_price_foreign: 885, markup_percentage: 30, flat_jastip_fee: 40000, final_price_idr: 169000, image_url: "/products/prod-jagapokkuru.jpg", is_active: true, category: "Snacks", store_location: "Hokkaido Dosanko Plaza" },
  { id: "prod-shiroikoibito", trip_id: "trip-tokyo", name: "Shiroi Koibito (18 pcs)", description: "Hokkaido's legendary white chocolate langue de chat — the most gifted omiyage in Japan.", base_price_foreign: 1296, markup_percentage: 25, flat_jastip_fee: 40000, final_price_idr: 221500, image_url: "/products/prod-shiroikoibito.jpg", is_active: true, category: "Snacks", store_location: "Tokyo Station" },
  { id: "prod-umaibo", trip_id: "trip-tokyo", name: "Umaibo Party Mix (30 sticks)", description: "Japan's 12-yen legend in weird flavors: mentaiko, natto, corn potage, takoyaki. Ultimate oleh-oleh murah.", base_price_foreign: 390, markup_percentage: 35, flat_jastip_fee: 25000, final_price_idr: 84000, image_url: "/products/prod-umaibo.jpg", is_active: true, category: "Snacks", store_location: "Don Quijote Shinjuku" }
];

export const products: CatalogProduct[] = [...curatedProducts, ...generatedProducts];

export const addOns: AddOn[] = [
  { id: "addon-bubblewrap", name: "Extra Thick Bubble Wrap", price_idr: 15000 },
  { id: "addon-giftbox", name: "Gift Box + Ribbon", price_idr: 25000 },
  { id: "addon-priority", name: "Priority Hand-Carry", price_idr: 40000 }
];

export const requests: CustomRequest[] = [
  {
    id: "req-1001", user_id: "user-001", customer_name: "Rani Pratiwi", customer_whatsapp: "6281200001111",
    product_name_or_desc: "Nike Air Max 1 'Patta' — from SNKRS JP",
    product_url: "https://www.nike.com/jp/", uploaded_image_urls: [IMG("photo-1542291026-7eec264c27ff")],
    quantity: 1, variations: "US 8.5, Red/White", status: "Pending Review",
    quoted_price_idr: null, required_dp_idr: null, created_at: "2026-07-10T04:20:00Z"
  },
  {
    id: "req-1002", user_id: "user-002", customer_name: "Dewi Anggraini", customer_whatsapp: "6281200002222",
    product_name_or_desc: "Muji Aroma Diffuser (large)",
    product_url: "https://www.muji.com/jp/", uploaded_image_urls: [IMG("photo-1602874801007-bd458bb1b8b6")],
    quantity: 2, variations: "White", status: "Quote Sent",
    quoted_price_idr: 890000, required_dp_idr: 534000, created_at: "2026-07-08T02:00:00Z"
  }
];

export const orders: Order[] = [
  {
    id: "order-5001", user_id: "user-001", customer_name: "Rani Pratiwi", customer_whatsapp: "6281200001111", trip_id: "trip-tokyo",
    total_price_idr: 570500, total_dp_required_idr: 342000, local_shipping_fee_idr: null,
    delivery_method: "GoSend",
    status: "DP Paid", created_at: "2026-07-06T08:30:00Z", addon_ids: ["addon-bubblewrap"],
    items: [
      { id: "oi-1", order_id: "order-5001", product_id: "prod-tokyobanana", request_id: null, item_name: "Tokyo Banana (8 pcs)", quantity: 1, locked_price_idr: 208500, store_location: "Tokyo Station", item_status: "Pending Purchase", admin_receipt_url: null, image_url: "/products/prod-tokyobanana.jpg" },
      { id: "oi-2", order_id: "order-5001", product_id: "prod-kitkat", request_id: null, item_name: "KitKat Matcha Box (12 mini)", quantity: 1, locked_price_idr: 152000, store_location: "Don Quijote Shinjuku", item_status: "Secured", admin_receipt_url: null, image_url: "/products/prod-kitkat.jpg" },
      { id: "oi-3", order_id: "order-5001", product_id: "prod-hadalabo", request_id: null, item_name: "Hada Labo Gokujyun Lotion", quantity: 1, locked_price_idr: 204000, store_location: "Matsumoto Kiyoshi", item_status: "Pending Purchase", admin_receipt_url: null, image_url: "/products/prod-hadalabo.jpg" }
    ]
  },
  {
    id: "order-5002", user_id: "user-003", customer_name: "Budi Santoso", customer_whatsapp: "6281200003333", trip_id: "trip-tokyo",
    total_price_idr: 1381500, total_dp_required_idr: 828900, local_shipping_fee_idr: null,
    delivery_method: "Pickup",
    status: "Waiting DP", created_at: "2026-07-11T10:00:00Z", addon_ids: [],
    items: [
      { id: "oi-4", order_id: "order-5002", product_id: "prod-shuuemura", request_id: null, item_name: "Shu Uemura Cleansing Oil 450ml", quantity: 1, locked_price_idr: 1381500, store_location: "Don Quijote Shinjuku", item_status: "Pending Purchase", admin_receipt_url: null, image_url: "/products/prod-shuuemura.jpg" }
    ]
  },
  {
    id: "order-5003", user_id: "user-001", customer_name: "Rani Pratiwi", customer_whatsapp: "6281200001111", trip_id: "trip-tokyo",
    total_price_idr: 805000, total_dp_required_idr: 483000, local_shipping_fee_idr: 35000,
    delivery_method: "GoSend",
    status: "Awaiting Final Payment", created_at: "2026-06-20T06:00:00Z", addon_ids: ["addon-giftbox"],
    items: [
      { id: "oi-5", order_id: "order-5003", product_id: "prod-pokemon", request_id: null, item_name: "Pokémon Center Plush (Pikachu)", quantity: 2, locked_price_idr: 363500, store_location: "Pokémon Center Shibuya", item_status: "Secured", admin_receipt_url: null, image_url: "/products/prod-pokemon.jpg" }
    ]
  }
];

export const payments: Payment[] = [
  { id: "pay-1", order_id: "order-5001", payment_type: "Down Payment", amount_idr: 342000, payment_method: "BCA Transfer", receipt_image_url: null, status: "Verified", created_at: "2026-07-06T09:00:00Z" },
  { id: "pay-2", order_id: "order-5003", payment_type: "Down Payment", amount_idr: 483000, payment_method: "QRIS", receipt_image_url: null, status: "Verified", created_at: "2026-06-20T06:30:00Z" }
];

// Local AI-generated haul photos (drop files into public/hauls/).
// haul-01..04 → hero collage (02 & 04 are 3:4 portrait), haul-05..10 → Recent Hauls.
export const heroHauls = [
  { src: "/hauls/haul-01.jpg", alt: "Tumpukan paper bag belanja dari Jepang" },
  { src: "/hauls/haul-02.jpg", alt: "Koper terbuka penuh snack dan skincare Jepang" },
  { src: "/hauls/haul-03.jpg", alt: "Flat-lay haul skincare Korea dan Jepang" },
  { src: "/hauls/haul-04.jpg", alt: "Tumpukan kotak sneakers dan shopping bag" }
];

export const hauls = [
  { src: "/hauls/haul-05.jpg", alt: "Kardus packing berisi barang dibungkus bubble wrap" },
  { src: "/hauls/haul-06.jpg", alt: "Haul snack Jepang: KitKat, Tokyo Banana, Royce" },
  { src: "/hauls/haul-07.jpg", alt: "Koleksi blind box dan art toy tersusun rapi" },
  { src: "/hauls/haul-08.jpg", alt: "Paket terbungkus rapi dengan label pengiriman" },
  { src: "/hauls/haul-09.jpg", alt: "Shopping bag bertumpuk di troli bandara" },
  { src: "/hauls/haul-10.jpg", alt: "Haul elektronik: kamera dan earbuds dalam kemasan" }
];

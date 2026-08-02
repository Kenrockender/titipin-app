"use client";
// Client-side data store. When Firebase is configured, trips/products/addOns/
// pricing/requests/orders all live in Firestore and stay synced in real time via
// onSnapshot; otherwise it falls back to the in-memory seed data in lib/mock-data.ts
// so the app still runs standalone in demo mode.
import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from "react";
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { collection, doc, getDoc, onSnapshot, query, setDoc, updateDoc, where } from "firebase/firestore";
import type {
  AddOn, CatalogProduct, CustomRequest, DeliveryMethod, ItemStatus, Order, OrderItem,
  OrderStatus, Payment, PricingConfig, RequestStatus, Trip, User
} from "@/types/database.types";
import { DEFAULT_PRICING, calculateDP } from "@/lib/pricing";
import * as seed from "@/lib/mock-data";
import { auth, db, googleProvider, isFirebaseConfigured } from "@/lib/firebase/client";
import { notifyTelegram } from "@/lib/telegram";
import { formatIDR, shortId } from "@/lib/format";
import { BANK_ACCOUNT_INFO } from "@/lib/constants";

export interface CartLine { product: CatalogProduct; quantity: number; }

interface StoreState {
  currentUser: User | null;
  isAdmin: boolean;
  authLoading: boolean;
  trips: Trip[];
  products: CatalogProduct[];
  requests: CustomRequest[];
  orders: Order[];
  addOns: AddOn[];
  payments: Payment[];
  pricing: PricingConfig;
  cart: CartLine[];
  hauls: HaulImage[];
  heroHauls: HaulImage[];
}

export interface HaulImage { src: string; alt: string; }

interface StoreActions {
  signInWithGoogle: () => Promise<boolean>; // returns true if the signed-in email is an admin
  logout: () => void;
  updateProfile: (patch: Partial<Pick<User, "full_name" | "whatsapp_number" | "shipping_address">>) => void;
  addToCart: (product: CatalogProduct, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  decrementCartItem: (productId: string) => void;
  clearCart: () => void;
  submitRequest: (r: Partial<CustomRequest>) => string;
  placeOrder: (opts: { addonIds: string[]; dpRatio: number; deliveryMethod: DeliveryMethod }) => Promise<string>;
  submitPayment: (orderId: string, type: "Down Payment" | "Final Payment", receiptUrl: string) => Promise<void>;
  quoteRequest: (id: string, quotedIdr: number, dpIdr: number) => void;
  acceptQuote: (requestId: string) => Promise<string>;
  setRequestStatus: (id: string, status: RequestStatus) => void;
  setItemStatus: (orderId: string, itemId: string, status: ItemStatus) => void;
  setOrderStatus: (orderId: string, status: OrderStatus) => void;
  refundAsStoreCredit: (orderId: string, itemId: string) => Promise<void>;
  verifyPayment: (paymentId: string, orderId: string, nextStatus: OrderStatus) => void;
  upsertProduct: (p: CatalogProduct) => void;
  toggleProductActive: (id: string) => void;
  updatePricing: (p: PricingConfig) => void;
  updateTripRate: (tripId: string, rate: number) => void;
}

const Ctx = createContext<(StoreState & StoreActions) | null>(null);

const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}`;
const CART_STORAGE_KEY = "titipin-cart";

// Admin email. Configurable via NEXT_PUBLIC_ADMIN_EMAIL; falls back to the brand address.
export const ADMIN_EMAIL = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@titipin.id").toLowerCase();
export function isAdminEmail(email: string) {
  return email.trim().toLowerCase() === ADMIN_EMAIL;
}

// Calls a trusted server API route (order pricing, payment, store-credit) with
// the signed-in user's Firebase ID token, so the server can verify who's
// asking instead of trusting whatever the client claims.
async function callApi<T>(path: string, body: unknown): Promise<T> {
  if (!auth?.currentUser) throw new Error("You need to be signed in to do that.");
  const token = await auth.currentUser.getIdToken();
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data as T;
}

// Subscribes to a Firestore collection and mirrors it into local state; falls
// back to the given seed array (with a plain local setter) when Firebase isn't
// configured, so the store keeps working standalone in demo mode.
function useFirestoreCollection<T>(name: string, seedValue: T[]) {
  const [items, setItems] = useState<T[]>(seedValue);
  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(collection(db, name), (snap) => {
      setItems(snap.docs.map((d) => d.data() as T));
    }, () => {});
    return unsub;
  }, [name]);
  return [items, setItems] as const;
}

// Orders/requests are only readable by their owner or the admin (Firestore
// rules), so an unscoped collection listener gets rejected for a regular
// customer. Scope the query by user_id once we know who's signed in, and
// sort client-side to avoid needing a composite (user_id + created_at) index.
function useOwnedCollection<T>(
  name: string, seedValue: T[], currentUser: User | null, isAdmin: boolean, authLoading: boolean
) {
  const [items, setItems] = useState<T[]>(seedValue);
  useEffect(() => {
    if (!db || authLoading) return;
    if (!currentUser) { setItems([]); return; }
    const ref = isAdmin ? collection(db, name) : query(collection(db, name), where("user_id", "==", currentUser.id));
    const unsub = onSnapshot(ref, (snap) => {
      const rows = snap.docs.map((d) => d.data() as T);
      rows.sort((a, b) => String((b as { created_at?: string }).created_at ?? "").localeCompare(String((a as { created_at?: string }).created_at ?? "")));
      setItems(rows);
    }, () => {});
    return unsub;
  }, [name, currentUser?.id, isAdmin, authLoading]);
  return [items, setItems] as const;
}

function useFirestoreDoc<T>(path: [string, string], seedValue: T) {
  const [value, setValue] = useState<T>(seedValue);
  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(doc(db, ...path), (snap) => {
      if (snap.exists()) setValue(snap.data() as T);
    }, () => {});
    return unsub;
  }, [path[0], path[1]]);
  return [value, setValue] as const;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [trips, setTripsFallback] = useFirestoreCollection<Trip>("trips", seed.trips);
  const [products, setProductsFallback] = useFirestoreCollection<CatalogProduct>("products", seed.products);
  const [addOns] = useFirestoreCollection<AddOn>("addOns", seed.addOns);
  const [requests, setRequestsFallback] = useOwnedCollection<CustomRequest>("requests", seed.requests, currentUser, isAdmin, authLoading);
  const [orders, setOrdersFallback] = useOwnedCollection<Order>("orders", seed.orders, currentUser, isAdmin, authLoading);
  const [payments, setPaymentsFallback] = useOwnedCollection<Payment>("payments", seed.payments, currentUser, isAdmin, authLoading);
  const [pricing, setPricingFallback] = useFirestoreDoc<PricingConfig>(["config", "pricing"], DEFAULT_PRICING);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartHydrated, setCartHydrated] = useState(false);

  // The cart stores a product snapshot per line (for offline/instant display),
  // but prices must always reflect the live catalog — otherwise a customer's
  // cart keeps charging a stale price after the admin changes markup/FX/price.
  // Every external read of the cart goes through this re-hydrated version.
  const liveCart = useMemo(() => cart.map((l) => {
    const live = products.find((p) => p.id === l.product.id);
    return live ? { ...l, product: live } : l;
  }), [cart, products]);

  // Persist the cart in localStorage so it survives refreshes/navigation
  // (e.g. the login/profile round-trip during checkout).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CART_STORAGE_KEY);
      if (raw) setCart(JSON.parse(raw));
    } catch { /* ignore corrupt storage */ }
    setCartHydrated(true);
  }, []);
  useEffect(() => {
    if (!cartHydrated) return;
    try { window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart)); } catch { /* ignore quota errors */ }
  }, [cart, cartHydrated]);

  // Google sign-in via Firebase Auth. On sign-in, load (or create) the user's
  // profile document in Firestore so their address/whatsapp/store credit persist.
  useEffect(() => {
    const firestore = db;
    if (!auth || !firestore) { setAuthLoading(false); return; }
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setCurrentUser(null);
        setIsAdmin(false);
        setAuthLoading(false);
        return;
      }
      const ref = doc(firestore, "users", fbUser.uid);
      const snap = await getDoc(ref);
      let profile: User;
      if (snap.exists()) {
        profile = { ...(snap.data() as User), photo_url: fbUser.photoURL };
      } else {
        profile = {
          id: fbUser.uid,
          full_name: fbUser.displayName || fbUser.email || "Customer",
          email: fbUser.email || "",
          photo_url: fbUser.photoURL,
          whatsapp_number: "",
          shipping_address: "",
          store_credit_balance: 0,
          created_at: new Date().toISOString()
        };
      }
      await setDoc(ref, profile, { merge: true });
      setCurrentUser(profile);
      setIsAdmin(isAdminEmail(profile.email));
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  const signInWithGoogle = useCallback<StoreActions["signInWithGoogle"]>(async () => {
    if (!auth || !googleProvider) throw new Error("Firebase is not configured");
    const result = await signInWithPopup(auth, googleProvider);
    return isAdminEmail(result.user.email ?? "");
  }, []);

  const logout = useCallback(() => {
    if (auth) firebaseSignOut(auth);
    setCurrentUser(null);
    setIsAdmin(false);
  }, []);

  const updateProfile = useCallback<StoreActions["updateProfile"]>((patch) => {
    setCurrentUser((u) => {
      if (!u) return u;
      // Write only the changed fields — never re-send the full local snapshot,
      // which could clobber a server-computed field (like store_credit_balance)
      // with a stale value if it changed elsewhere in this session.
      if (db) updateDoc(doc(db, "users", u.id), patch).catch(() => {});
      return { ...u, ...patch };
    });
  }, []);

  const addToCart = useCallback((product: CatalogProduct, quantity = 1) => {
    setCart((c) => {
      const found = c.find((l) => l.product.id === product.id);
      if (found) return c.map((l) => l.product.id === product.id ? { ...l, quantity: l.quantity + quantity } : l);
      return [...c, { product, quantity }];
    });
  }, []);
  const removeFromCart = useCallback((id: string) => setCart((c) => c.filter((l) => l.product.id !== id)), []);
  const decrementCartItem = useCallback((productId: string) => {
    setCart((c) => {
      const found = c.find((l) => l.product.id === productId);
      if (!found) return c;
      if (found.quantity <= 1) return c.filter((l) => l.product.id !== productId);
      return c.map((l) => l.product.id === productId ? { ...l, quantity: l.quantity - 1 } : l);
    });
  }, []);
  const clearCart = useCallback(() => setCart([]), []);

  const submitRequest = useCallback<StoreActions["submitRequest"]>((r) => {
    const id = uid("req");
    const row: CustomRequest = {
      id, user_id: currentUser?.id ?? "guest",
      customer_name: currentUser?.full_name ?? "Guest",
      customer_whatsapp: currentUser?.whatsapp_number ?? "",
      product_name_or_desc: r.product_name_or_desc ?? "",
      product_url: r.product_url ?? null,
      uploaded_image_urls: r.uploaded_image_urls ?? null,
      quantity: r.quantity ?? 1, variations: r.variations ?? "",
      status: "Pending Review", quoted_price_idr: null, required_dp_idr: null,
      created_at: new Date().toISOString()
    };
    if (db) setDoc(doc(db, "requests", id), row).catch(() => {});
    else setRequestsFallback((rs) => [row, ...rs]);
    notifyTelegram(
      `🆕 Request baru dari ${currentUser?.full_name ?? "Guest"} (${currentUser?.email ?? "-"})\n` +
      `Produk: ${row.product_name_or_desc}\n` +
      `Qty: ${row.quantity}${row.variations ? ` · ${row.variations}` : ""}\n` +
      (row.product_url ? `Link: ${row.product_url}\n` : "") +
      `\nBuka Request Inbox di admin untuk kirim quote.`
    );
    return id;
  }, [currentUser]);

  // When Firebase is configured, order creation is delegated to a server API
  // route that re-prices everything from the live catalog — the client only
  // ever says *what* it wants, never *how much* it costs. In mock mode there's
  // no backend to trust, so pricing happens locally like before.
  const placeOrder = useCallback<StoreActions["placeOrder"]>(async ({ addonIds, dpRatio, deliveryMethod }) => {
    if (db) {
      const { orderId } = await callApi<{ orderId: string }>("/api/orders/place", {
        items: liveCart.map((l) => ({ productId: l.product.id, quantity: l.quantity })),
        addonIds, dpRatio, deliveryMethod
      });
      setCart([]);
      return orderId;
    }
    const id = uid("order");
    const items: OrderItem[] = liveCart.map((l) => ({
      id: uid("oi"), order_id: id, product_id: l.product.id, request_id: null,
      item_name: l.product.name, quantity: l.quantity, locked_price_idr: l.product.final_price_idr,
      store_location: l.product.store_location ?? "TBD", item_status: "Pending Purchase",
      admin_receipt_url: null, image_url: l.product.image_url
    }));
    const addonTotal = addonIds.reduce((s, aid) => s + (addOns.find((a) => a.id === aid)?.price_idr ?? 0), 0);
    const total = items.reduce((s, i) => s + i.locked_price_idr * i.quantity, 0) + addonTotal;
    const order: Order = {
      id, user_id: currentUser?.id ?? "guest",
      customer_name: currentUser?.full_name ?? "Guest",
      customer_whatsapp: currentUser?.whatsapp_number ?? "",
      trip_id: products[0]?.trip_id ?? "trip-tokyo",
      total_price_idr: total, total_dp_required_idr: calculateDP(total, dpRatio),
      local_shipping_fee_idr: null, delivery_method: deliveryMethod, status: "Waiting DP",
      created_at: new Date().toISOString(), items, addon_ids: addonIds
    };
    setOrdersFallback((os) => [order, ...os]);
    setCart([]);
    notifyTelegram(
      `🛒 Order baru #${shortId(id)} dari ${currentUser?.full_name ?? "Guest"} (${currentUser?.email ?? "-"})\n` +
      `${items.map((it) => `• ${it.item_name} ×${it.quantity}`).join("\n")}\n` +
      `Total: ${formatIDR(total)} · DP: ${formatIDR(order.total_dp_required_idr)}\n` +
      `Delivery: ${deliveryMethod}`
    );
    return id;
  }, [liveCart, currentUser, products, addOns]);

  // Customer claims a payment. This only records a pending-verification
  // Payment doc via the server (or, in mock mode, flips status locally) — it
  // never lets the client itself flip the order to "paid".
  const submitPayment = useCallback<StoreActions["submitPayment"]>(async (orderId, type, receiptUrl) => {
    if (db) {
      await callApi(`/api/orders/${orderId}/payment`, { type, receiptUrl });
      return;
    }
    const order = orders.find((o) => o.id === orderId);
    const newStatus: OrderStatus = type === "Down Payment" ? "DP Paid" : "Completed";
    setOrdersFallback((os) => os.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
    if (order) {
      const amount = type === "Down Payment"
        ? order.total_dp_required_idr
        : order.total_price_idr - order.total_dp_required_idr + (order.local_shipping_fee_idr ?? 0);
      notifyTelegram(
        `💸 ${order.customer_name} bilang sudah transfer ${type === "Down Payment" ? "DP" : "pelunasan"} untuk order #${shortId(order.id)}\n` +
        `Jumlah: ${formatIDR(amount)}\n\n` +
        `Tolong cek mutasi rekening ${BANK_ACCOUNT_INFO}, lalu verifikasi di admin panel.`
      );
    }
  }, [orders]);

  const quoteRequest = useCallback<StoreActions["quoteRequest"]>((id, quotedIdr, dpIdr) => {
    const patch = { status: "Quote Sent" as RequestStatus, quoted_price_idr: quotedIdr, required_dp_idr: dpIdr };
    if (db) updateDoc(doc(db, "requests", id), patch).catch(() => {});
    else setRequestsFallback((rs) => rs.map((r) => r.id === id ? { ...r, ...patch } : r));
  }, []);

  // Turns a quoted custom request into a real Order, so it goes through the
  // same DP -> receipt-upload -> pipeline flow as a catalog order. When
  // Firebase is configured this is delegated server-side so the price used is
  // always whatever the admin actually quoted, never something the client sends.
  const acceptQuote = useCallback<StoreActions["acceptQuote"]>(async (requestId) => {
    if (db) {
      const { orderId } = await callApi<{ orderId: string }>(`/api/requests/${requestId}/accept`, {});
      return orderId;
    }
    const req = requests.find((r) => r.id === requestId);
    if (!req || req.quoted_price_idr == null || req.required_dp_idr == null) {
      throw new Error("This request doesn't have a quote yet");
    }
    const orderId = uid("order");
    const item: OrderItem = {
      id: uid("oi"), order_id: orderId, product_id: null, request_id: req.id,
      item_name: req.product_name_or_desc, quantity: req.quantity,
      locked_price_idr: Math.round(req.quoted_price_idr / req.quantity),
      store_location: "Custom Request", item_status: "Pending Purchase",
      admin_receipt_url: null, image_url: req.uploaded_image_urls?.[0] ?? "/products/_placeholder.svg"
    };
    const order: Order = {
      id: orderId, user_id: req.user_id, customer_name: req.customer_name, customer_whatsapp: req.customer_whatsapp,
      trip_id: trips[0]?.id ?? "trip-tokyo",
      total_price_idr: req.quoted_price_idr, total_dp_required_idr: req.required_dp_idr,
      local_shipping_fee_idr: null, delivery_method: "Pickup", status: "Waiting DP",
      created_at: new Date().toISOString(), items: [item], addon_ids: []
    };
    setOrdersFallback((os) => [order, ...os]);
    setRequestsFallback((rs) => rs.map((r) => r.id === requestId ? { ...r, status: "Accepted" } : r));
    notifyTelegram(
      `✅ ${req.customer_name} terima quote buat "${req.product_name_or_desc}"\n` +
      `Order baru #${shortId(orderId)} otomatis dibuat — Total: ${formatIDR(req.quoted_price_idr)} · DP: ${formatIDR(req.required_dp_idr)}`
    );
    return orderId;
  }, [requests, trips]);

  const setRequestStatus = useCallback<StoreActions["setRequestStatus"]>((id, status) => {
    if (db) updateDoc(doc(db, "requests", id), { status }).catch(() => {});
    else setRequestsFallback((rs) => rs.map((r) => r.id === id ? { ...r, status } : r));
  }, []);

  const setItemStatus = useCallback<StoreActions["setItemStatus"]>((orderId, itemId, status) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    const items = order.items.map((it) => it.id === itemId ? { ...it, item_status: status } : it);
    if (db) updateDoc(doc(db, "orders", orderId), { items }).catch(() => {});
    else setOrdersFallback((os) => os.map((o) => o.id === orderId ? { ...o, items } : o));
  }, [orders]);

  const setOrderStatus = useCallback<StoreActions["setOrderStatus"]>((orderId, status) => {
    if (db) updateDoc(doc(db, "orders", orderId), { status }).catch(() => {});
    else setOrdersFallback((os) => os.map((o) => o.id === orderId ? { ...o, status } : o));
  }, []);

  // Converts an out-of-stock item into store credit. Runs as a server-side
  // transaction when Firebase is configured (validates the item is actually
  // out of stock and credits the exact locked price) so a customer can't
  // self-grant credit by writing to their own user doc directly.
  const refundAsStoreCredit = useCallback<StoreActions["refundAsStoreCredit"]>(async (orderId, itemId) => {
    if (db) {
      const { newBalance } = await callApi<{ newBalance: number }>(`/api/orders/${orderId}/store-credit`, { itemId });
      setCurrentUser((u) => u ? { ...u, store_credit_balance: newBalance } : u);
      return;
    }
    const order = orders.find((o) => o.id === orderId);
    const item = order?.items.find((i) => i.id === itemId);
    if (!order || !item) return;
    const items = order.items.map((i) => i.id === itemId ? { ...i, item_status: "Refunded as Credit" as ItemStatus } : i);
    setOrdersFallback((os) => os.map((o) => o.id === orderId ? { ...o, items } : o));
    setCurrentUser((u) => u ? { ...u, store_credit_balance: u.store_credit_balance + item.locked_price_idr * item.quantity } : u);
  }, [orders]);

  // Admin-only: marks a claimed payment as verified and advances the order.
  // Safe as a direct client write — Firestore rules check the caller's
  // server-verified auth token email, which the client can't forge.
  const verifyPayment = useCallback<StoreActions["verifyPayment"]>((paymentId, orderId, nextStatus) => {
    if (db) {
      updateDoc(doc(db, "payments", paymentId), { status: "Verified" }).catch(() => {});
      updateDoc(doc(db, "orders", orderId), { status: nextStatus }).catch(() => {});
    } else {
      setPaymentsFallback((ps) => ps.map((p) => p.id === paymentId ? { ...p, status: "Verified" } : p));
      setOrdersFallback((os) => os.map((o) => o.id === orderId ? { ...o, status: nextStatus } : o));
    }
  }, []);

  const upsertProduct = useCallback<StoreActions["upsertProduct"]>((p) => {
    if (db) setDoc(doc(db, "products", p.id), p).catch(() => {});
    else setProductsFallback((ps) => ps.some((x) => x.id === p.id) ? ps.map((x) => x.id === p.id ? p : x) : [p, ...ps]);
  }, []);
  const toggleProductActive = useCallback<StoreActions["toggleProductActive"]>((id) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    if (db) updateDoc(doc(db, "products", id), { is_active: !product.is_active }).catch(() => {});
    else setProductsFallback((ps) => ps.map((p) => p.id === id ? { ...p, is_active: !p.is_active } : p));
  }, [products]);
  const updatePricing = useCallback<StoreActions["updatePricing"]>((p) => {
    if (db) setDoc(doc(db, "config", "pricing"), p).catch(() => {});
    else setPricingFallback(p);
  }, []);
  const updateTripRate = useCallback<StoreActions["updateTripRate"]>((tripId, rate) => {
    if (db) updateDoc(doc(db, "trips", tripId), { system_exchange_rate: rate }).catch(() => {});
    else setTripsFallback((ts) => ts.map((t) => t.id === tripId ? { ...t, system_exchange_rate: rate } : t));
  }, []);

  const value = useMemo(() => ({
    currentUser, isAdmin, authLoading, trips, products, requests, orders, addOns, payments, pricing, cart: liveCart, hauls: seed.hauls, heroHauls: seed.heroHauls,
    signInWithGoogle, logout, updateProfile, addToCart, removeFromCart, decrementCartItem, clearCart, submitRequest,
    placeOrder, submitPayment, quoteRequest, acceptQuote, setRequestStatus, setItemStatus, setOrderStatus,
    refundAsStoreCredit, verifyPayment, upsertProduct, toggleProductActive, updatePricing, updateTripRate
  }), [currentUser, isAdmin, authLoading, trips, products, requests, orders, addOns, payments, pricing, liveCart,
    signInWithGoogle, logout, updateProfile, addToCart, removeFromCart, decrementCartItem, clearCart, submitRequest,
    placeOrder, submitPayment, quoteRequest, acceptQuote, setRequestStatus, setItemStatus, setOrderStatus,
    refundAsStoreCredit, verifyPayment, upsertProduct, toggleProductActive, updatePricing, updateTripRate]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

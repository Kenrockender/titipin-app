"use client";
// Client-side data store. In mock mode it holds all app state in React context so
// the whole flow (cart -> checkout -> DP -> Secured -> OOS -> store credit) works
// end-to-end in the browser. Swap these actions for Supabase queries later.
import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from "react";
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import type {
  AddOn, CatalogProduct, CustomRequest, DeliveryMethod, ItemStatus, Order, OrderItem,
  OrderStatus, PricingConfig, RequestStatus, Trip, User
} from "@/types/database.types";
import { DEFAULT_PRICING, calculateDP } from "@/lib/pricing";
import * as seed from "@/lib/mock-data";
import { auth, db, googleProvider } from "@/lib/firebase/client";
import { notifyTelegram } from "@/lib/telegram";
import { formatIDR, shortId } from "@/lib/format";

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
  clearCart: () => void;
  submitRequest: (r: Partial<CustomRequest>) => string;
  placeOrder: (opts: { addonIds: string[]; dpRatio: number; deliveryMethod: DeliveryMethod }) => string;
  markPayment: (orderId: string, type: "Down Payment" | "Final Payment") => void;
  quoteRequest: (id: string, quotedIdr: number, dpIdr: number) => void;
  setRequestStatus: (id: string, status: RequestStatus) => void;
  setItemStatus: (orderId: string, itemId: string, status: ItemStatus) => void;
  setOrderStatus: (orderId: string, status: OrderStatus) => void;
  refundAsStoreCredit: (orderId: string, itemId: string) => void;
  upsertProduct: (p: CatalogProduct) => void;
  toggleProductActive: (id: string) => void;
  updatePricing: (p: PricingConfig) => void;
}

const Ctx = createContext<(StoreState & StoreActions) | null>(null);

const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}`;

// Admin email. Configurable via NEXT_PUBLIC_ADMIN_EMAIL; falls back to the brand address.
export const ADMIN_EMAIL = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@titipin.id").toLowerCase();
export function isAdminEmail(email: string) {
  return email.trim().toLowerCase() === ADMIN_EMAIL;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [products, setProducts] = useState<CatalogProduct[]>(seed.products);
  const [requests, setRequests] = useState<CustomRequest[]>(seed.requests);
  const [orders, setOrders] = useState<Order[]>(seed.orders);
  const [pricing, setPricing] = useState<PricingConfig>(DEFAULT_PRICING);
  const [cart, setCart] = useState<CartLine[]>([]);

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
        profile = snap.data() as User;
      } else {
        profile = {
          id: fbUser.uid,
          full_name: fbUser.displayName || fbUser.email || "Customer",
          email: fbUser.email || "",
          whatsapp_number: "",
          shipping_address: "",
          store_credit_balance: 0,
          created_at: new Date().toISOString()
        };
        await setDoc(ref, profile);
      }
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
      const updated = { ...u, ...patch };
      if (db) setDoc(doc(db, "users", updated.id), updated, { merge: true }).catch(() => {});
      return updated;
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
    setRequests((rs) => [row, ...rs]);
    notifyTelegram(
      `🆕 Request baru dari ${currentUser?.full_name ?? "Guest"} (${currentUser?.email ?? "-"})\n` +
      `Produk: ${row.product_name_or_desc}\n` +
      `Qty: ${row.quantity}${row.variations ? ` · ${row.variations}` : ""}\n` +
      (row.product_url ? `Link: ${row.product_url}\n` : "") +
      `\nBuka Request Inbox di admin untuk kirim quote.`
    );
    return id;
  }, [currentUser]);

  const placeOrder = useCallback<StoreActions["placeOrder"]>(({ addonIds, dpRatio, deliveryMethod }) => {
    const id = uid("order");
    const items: OrderItem[] = cart.map((l) => ({
      id: uid("oi"), order_id: id, product_id: l.product.id, request_id: null,
      item_name: l.product.name, quantity: l.quantity, locked_price_idr: l.product.final_price_idr,
      store_location: l.product.store_location ?? "TBD", item_status: "Pending Purchase",
      admin_receipt_url: null, image_url: l.product.image_url
    }));
    const addonTotal = addonIds.reduce((s, aid) => s + (seed.addOns.find((a) => a.id === aid)?.price_idr ?? 0), 0);
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
    setOrders((os) => [order, ...os]);
    setCart([]);
    notifyTelegram(
      `🛒 Order baru #${shortId(id)} dari ${currentUser?.full_name ?? "Guest"} (${currentUser?.email ?? "-"})\n` +
      `${items.map((it) => `• ${it.item_name} ×${it.quantity}`).join("\n")}\n` +
      `Total: ${formatIDR(total)} · DP: ${formatIDR(order.total_dp_required_idr)}\n` +
      `Delivery: ${deliveryMethod}`
    );
    return id;
  }, [cart, currentUser, products]);

  const markPayment = useCallback<StoreActions["markPayment"]>((orderId, type) => {
    setOrders((os) => os.map((o) => o.id === orderId
      ? { ...o, status: type === "Down Payment" ? "DP Paid" : "Completed" } : o));
  }, []);

  const quoteRequest = useCallback<StoreActions["quoteRequest"]>((id, quotedIdr, dpIdr) => {
    setRequests((rs) => rs.map((r) => r.id === id
      ? { ...r, status: "Quote Sent", quoted_price_idr: quotedIdr, required_dp_idr: dpIdr } : r));
  }, []);
  const setRequestStatus = useCallback<StoreActions["setRequestStatus"]>((id, status) => {
    setRequests((rs) => rs.map((r) => r.id === id ? { ...r, status } : r));
  }, []);

  const setItemStatus = useCallback<StoreActions["setItemStatus"]>((orderId, itemId, status) => {
    setOrders((os) => os.map((o) => o.id !== orderId ? o : {
      ...o, items: o.items.map((it) => it.id === itemId ? { ...it, item_status: status } : it)
    }));
  }, []);
  const setOrderStatus = useCallback<StoreActions["setOrderStatus"]>((orderId, status) => {
    setOrders((os) => os.map((o) => o.id === orderId ? { ...o, status } : o));
  }, []);

  const refundAsStoreCredit = useCallback<StoreActions["refundAsStoreCredit"]>((orderId, itemId) => {
    setOrders((os) => os.map((o) => {
      if (o.id !== orderId) return o;
      return { ...o, items: o.items.map((i) => i.id === itemId ? { ...i, item_status: "Out of Stock" } : i) };
    }));
    const item = orders.find((o) => o.id === orderId)?.items.find((i) => i.id === itemId);
    if (item) setCurrentUser((u) => {
      if (!u) return u;
      const updated = { ...u, store_credit_balance: u.store_credit_balance + item.locked_price_idr * item.quantity };
      if (db) setDoc(doc(db, "users", updated.id), updated, { merge: true }).catch(() => {});
      return updated;
    });
  }, [orders]);

  const upsertProduct = useCallback<StoreActions["upsertProduct"]>((p) => {
    setProducts((ps) => ps.some((x) => x.id === p.id) ? ps.map((x) => x.id === p.id ? p : x) : [p, ...ps]);
  }, []);
  const toggleProductActive = useCallback((id: string) => {
    setProducts((ps) => ps.map((p) => p.id === id ? { ...p, is_active: !p.is_active } : p));
  }, []);
  const updatePricing = useCallback((p: PricingConfig) => setPricing(p), []);

  const value = useMemo(() => ({
    currentUser, isAdmin, authLoading, trips: seed.trips, products, requests, orders, addOns: seed.addOns, pricing, cart, hauls: seed.hauls, heroHauls: seed.heroHauls,
    signInWithGoogle, logout, updateProfile, addToCart, removeFromCart, clearCart, submitRequest,
    placeOrder, markPayment, quoteRequest, setRequestStatus, setItemStatus, setOrderStatus,
    refundAsStoreCredit, upsertProduct, toggleProductActive, updatePricing
  }), [currentUser, isAdmin, authLoading, products, requests, orders, pricing, cart,
    signInWithGoogle, logout, updateProfile, addToCart, removeFromCart, clearCart, submitRequest,
    placeOrder, markPayment, quoteRequest, setRequestStatus, setItemStatus, setOrderStatus,
    refundAsStoreCredit, upsertProduct, toggleProductActive, updatePricing]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

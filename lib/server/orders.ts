// Trusted, server-side order creation. Every price here is re-read from
// Firestore (the live catalog / a quote the admin already set) — never taken
// from client-supplied numbers — so a customer can't forge an order total.
import type { Firestore } from "firebase-admin/firestore";
import { calculateDP } from "@/lib/pricing";
import { formatIDR, shortId } from "@/lib/format";
import { sendTelegram } from "@/lib/server/telegram";
import type { AddOn, CatalogProduct, CustomRequest, DeliveryMethod, Order, OrderItem, User } from "@/types/database.types";

const newId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}${Math.random().toString(36).slice(2, 5)}`;

export class OrderCreationError extends Error {}

interface Customer {
  id: string;
  full_name: string;
  email: string;
  whatsapp_number: string;
}

async function loadCustomer(db: Firestore, uid: string): Promise<Customer> {
  const snap = await db.collection("users").doc(uid).get();
  const data = snap.exists ? (snap.data() as User) : null;
  return {
    id: uid,
    full_name: data?.full_name ?? "Customer",
    email: data?.email ?? "",
    whatsapp_number: data?.whatsapp_number ?? ""
  };
}

/** Places an order from cart line item ids/quantities, pricing everything from the live catalog. */
export async function createOrderFromCart(
  db: Firestore,
  uid: string,
  input: { items: { productId: string; quantity: number }[]; addonIds: string[]; dpRatio: number; deliveryMethod: DeliveryMethod }
): Promise<Order> {
  if (!input.items.length) throw new OrderCreationError("Cart is empty");
  const dpRatio = [0.5, 0.6, 0.7].includes(input.dpRatio) ? input.dpRatio : 0.6;

  const customer = await loadCustomer(db, uid);
  const productIds = [...new Set(input.items.map((i) => i.productId))];
  const productSnaps = await db.getAll(...productIds.map((id) => db.collection("products").doc(id)));
  const productsById = new Map<string, CatalogProduct>();
  productSnaps.forEach((s) => { if (s.exists) productsById.set(s.id, s.data() as CatalogProduct); });

  const items: OrderItem[] = input.items.map((line) => {
    const product = productsById.get(line.productId);
    if (!product || !product.is_active) throw new OrderCreationError(`Product ${line.productId} is not available`);
    const quantity = Math.max(1, Math.floor(line.quantity) || 1);
    return {
      id: newId("oi"), order_id: "", product_id: product.id, request_id: null,
      item_name: product.name, quantity, locked_price_idr: product.final_price_idr,
      store_location: product.store_location ?? "TBD", item_status: "Pending Purchase",
      admin_receipt_url: null, image_url: product.image_url
    };
  });

  const addonIds = [...new Set(input.addonIds ?? [])];
  let addonTotal = 0;
  if (addonIds.length) {
    const addonSnaps = await db.getAll(...addonIds.map((id) => db.collection("addOns").doc(id)));
    addonTotal = addonSnaps.reduce((s, snap) => s + (snap.exists ? (snap.data() as AddOn).price_idr : 0), 0);
  }

  const total = items.reduce((s, i) => s + i.locked_price_idr * i.quantity, 0) + addonTotal;
  const firstProduct = productsById.get(input.items[0].productId);

  const id = newId("order");
  items.forEach((it) => { it.order_id = id; });
  const order: Order = {
    id, user_id: customer.id, customer_name: customer.full_name, customer_whatsapp: customer.whatsapp_number,
    trip_id: firstProduct?.trip_id ?? "trip-tokyo",
    total_price_idr: total, total_dp_required_idr: calculateDP(total, dpRatio),
    local_shipping_fee_idr: null, delivery_method: input.deliveryMethod, status: "Waiting DP",
    created_at: new Date().toISOString(), items, addon_ids: addonIds
  };

  await db.collection("orders").doc(id).set(order);
  await sendTelegram(
    `🛒 Order baru #${shortId(id)} dari ${customer.full_name} (${customer.email || "-"})\n` +
    `${items.map((it) => `• ${it.item_name} ×${it.quantity}`).join("\n")}\n` +
    `Total: ${formatIDR(total)} · DP: ${formatIDR(order.total_dp_required_idr)}\n` +
    `Delivery: ${input.deliveryMethod}`
  );
  return order;
}

/** Turns an already-quoted custom request into an order, trusting only the admin-set quote already in Firestore. */
export async function createOrderFromRequest(db: Firestore, uid: string, requestId: string): Promise<Order> {
  const reqSnap = await db.collection("requests").doc(requestId).get();
  if (!reqSnap.exists) throw new OrderCreationError("Request not found");
  const req = reqSnap.data() as CustomRequest;
  if (req.user_id !== uid) throw new OrderCreationError("Not your request");
  if (req.status !== "Quote Sent" || req.quoted_price_idr == null || req.required_dp_idr == null) {
    throw new OrderCreationError("This request doesn't have an open quote");
  }

  const tripSnap = await db.collection("trips").limit(1).get();
  const tripId = tripSnap.empty ? "trip-tokyo" : tripSnap.docs[0].id;

  const orderId = newId("order");
  const item: OrderItem = {
    id: newId("oi"), order_id: orderId, product_id: null, request_id: req.id,
    item_name: req.product_name_or_desc, quantity: req.quantity,
    locked_price_idr: Math.round(req.quoted_price_idr / req.quantity),
    store_location: "Custom Request", item_status: "Pending Purchase",
    admin_receipt_url: null, image_url: req.uploaded_image_urls?.[0] ?? "/products/_placeholder.svg"
  };
  const order: Order = {
    id: orderId, user_id: req.user_id, customer_name: req.customer_name, customer_whatsapp: req.customer_whatsapp,
    trip_id: tripId,
    total_price_idr: req.quoted_price_idr, total_dp_required_idr: req.required_dp_idr,
    local_shipping_fee_idr: null, delivery_method: "Pickup", status: "Waiting DP",
    created_at: new Date().toISOString(), items: [item], addon_ids: []
  };

  await db.collection("orders").doc(orderId).set(order);
  await db.collection("requests").doc(requestId).update({ status: "Accepted" });
  await sendTelegram(
    `✅ ${req.customer_name} terima quote buat "${req.product_name_or_desc}"\n` +
    `Order baru #${shortId(orderId)} otomatis dibuat — Total: ${formatIDR(req.quoted_price_idr)} · DP: ${formatIDR(req.required_dp_idr)}`
  );
  return order;
}

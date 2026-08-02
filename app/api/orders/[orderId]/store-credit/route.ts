import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireUser } from "@/lib/server/auth";
import type { Order, User } from "@/types/database.types";

// Converts a genuinely out-of-stock item into store credit. Runs as a
// transaction so the item can't be double-claimed and the credited amount is
// always the item's locked price — never a client-supplied number.
export async function POST(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const db = adminDb();
  if (!db) return NextResponse.json({ error: "not configured" }, { status: 501 });

  const user = await requireUser(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { orderId } = await params;
  let body: { itemId: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  if (!body.itemId) return NextResponse.json({ error: "missing itemId" }, { status: 400 });

  try {
    const result = await db.runTransaction(async (tx) => {
      const orderRef = db.collection("orders").doc(orderId);
      const orderSnap = await tx.get(orderRef);
      if (!orderSnap.exists) throw new Error("Order not found");
      const order = orderSnap.data() as Order;
      if (order.user_id !== user.uid) throw new Error("Not your order");

      const item = order.items.find((i) => i.id === body.itemId);
      if (!item) throw new Error("Item not found");
      if (item.item_status !== "Out of Stock") throw new Error("Item isn't marked out of stock");

      const userRef = db.collection("users").doc(user.uid);
      const userSnap = await tx.get(userRef);
      const currentBalance = userSnap.exists ? (userSnap.data() as User).store_credit_balance ?? 0 : 0;
      const credit = item.locked_price_idr * item.quantity;

      const items = order.items.map((i) => i.id === body.itemId ? { ...i, item_status: "Refunded as Credit" as const } : i);
      tx.update(orderRef, { items });
      tx.set(userRef, { store_credit_balance: currentBalance + credit }, { merge: true });

      return { newBalance: currentBalance + credit };
    });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireUser } from "@/lib/server/auth";
import { createOrderFromCart, OrderCreationError } from "@/lib/server/orders";
import type { DeliveryMethod } from "@/types/database.types";

interface PlaceOrderBody {
  items: { productId: string; quantity: number }[];
  addonIds: string[];
  dpRatio: number;
  deliveryMethod: DeliveryMethod;
}

// Creates an order. Prices are always recomputed here from the live catalog —
// the client only ever tells us *which* products and quantities, never prices.
export async function POST(req: NextRequest) {
  const db = adminDb();
  if (!db) return NextResponse.json({ error: "not configured" }, { status: 501 });

  const user = await requireUser(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: PlaceOrderBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "cart is empty" }, { status: 400 });
  }

  try {
    const order = await createOrderFromCart(db, user.uid, {
      items: body.items.map((i) => ({ productId: String(i.productId), quantity: Number(i.quantity) })),
      addonIds: Array.isArray(body.addonIds) ? body.addonIds.map(String) : [],
      dpRatio: Number(body.dpRatio) || 0.6,
      deliveryMethod: body.deliveryMethod === "GoSend" ? "GoSend" : "Pickup"
    });
    return NextResponse.json({ orderId: order.id });
  } catch (err) {
    if (err instanceof OrderCreationError) return NextResponse.json({ error: err.message }, { status: 400 });
    return NextResponse.json({ error: "failed to place order" }, { status: 500 });
  }
}

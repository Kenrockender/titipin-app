import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireUser } from "@/lib/server/auth";
import { createOrderFromRequest, OrderCreationError } from "@/lib/server/orders";

// Accepts a custom-request quote and spawns an order from it. The price used
// is whatever the admin already wrote to the request doc — never anything
// the client sends — so a customer can't self-quote a cheaper price.
export async function POST(req: NextRequest, { params }: { params: Promise<{ requestId: string }> }) {
  const db = adminDb();
  if (!db) return NextResponse.json({ error: "not configured" }, { status: 501 });

  const user = await requireUser(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { requestId } = await params;
  try {
    const order = await createOrderFromRequest(db, user.uid, requestId);
    return NextResponse.json({ orderId: order.id });
  } catch (err) {
    if (err instanceof OrderCreationError) return NextResponse.json({ error: err.message }, { status: 400 });
    return NextResponse.json({ error: "failed to accept quote" }, { status: 500 });
  }
}

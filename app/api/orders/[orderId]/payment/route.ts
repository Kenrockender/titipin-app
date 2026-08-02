import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireUser } from "@/lib/server/auth";
import { formatIDR, shortId } from "@/lib/format";
import { sendTelegram } from "@/lib/server/telegram";
import { BANK_ACCOUNT_INFO } from "@/lib/constants";
import type { Order, Payment, PaymentType } from "@/types/database.types";

const newId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

// Customer claims they've paid. This only records a Payment doc pending admin
// verification — it never advances the order's status itself. Letting the
// client flip the order straight to "DP Paid" would mean anyone could skip
// paying by just calling this endpoint (or the old direct Firestore write).
export async function POST(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const db = adminDb();
  if (!db) return NextResponse.json({ error: "not configured" }, { status: 501 });

  const user = await requireUser(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { orderId } = await params;
  let body: { type: PaymentType; receiptUrl: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  if (body.type !== "Down Payment" && body.type !== "Final Payment") {
    return NextResponse.json({ error: "invalid payment type" }, { status: 400 });
  }
  if (!body.receiptUrl || typeof body.receiptUrl !== "string") {
    return NextResponse.json({ error: "missing receipt" }, { status: 400 });
  }
  // Receipts are embedded as base64 (no Storage on this project's plan) — Firestore
  // caps documents at 1MB, so reject anything that would blow past that.
  if (body.receiptUrl.length > 900_000) {
    return NextResponse.json({ error: "receipt image is too large" }, { status: 413 });
  }

  const orderSnap = await db.collection("orders").doc(orderId).get();
  if (!orderSnap.exists) return NextResponse.json({ error: "order not found" }, { status: 404 });
  const order = orderSnap.data() as Order;
  if (order.user_id !== user.uid) return NextResponse.json({ error: "not your order" }, { status: 403 });

  const expectedStatus = body.type === "Down Payment" ? "Waiting DP" : "Awaiting Final Payment";
  if (order.status !== expectedStatus) {
    return NextResponse.json({ error: `Order isn't awaiting a ${body.type.toLowerCase()} right now` }, { status: 409 });
  }

  const amount = body.type === "Down Payment"
    ? order.total_dp_required_idr
    : order.total_price_idr - order.total_dp_required_idr + (order.local_shipping_fee_idr ?? 0);

  const paymentId = newId("pay");
  const payment: Payment = {
    id: paymentId, order_id: orderId, user_id: user.uid, payment_type: body.type,
    amount_idr: amount, payment_method: "Bank Transfer / QRIS", receipt_image_url: body.receiptUrl,
    status: "Pending Verification", created_at: new Date().toISOString()
  };
  await db.collection("payments").doc(paymentId).set(payment);

  await sendTelegram(
    `💸 ${order.customer_name} bilang sudah transfer ${body.type === "Down Payment" ? "DP" : "pelunasan"} untuk order #${shortId(order.id)}\n` +
    `Jumlah: ${formatIDR(amount)}\n\n` +
    `Tolong cek mutasi rekening ${BANK_ACCOUNT_INFO}, lalu verifikasi di admin panel.`
  );

  return NextResponse.json({ paymentId });
}

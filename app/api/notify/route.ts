import { NextRequest, NextResponse } from "next/server";

// Sends a plain-text message to the admin's Telegram via the bot API.
// Server-only route so TELEGRAM_BOT_TOKEN never reaches the client.
// TELEGRAM_CHAT_ID may be a single id or a comma-separated list (e.g. multiple devices).
export async function POST(req: NextRequest) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatIds = (process.env.TELEGRAM_CHAT_ID || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!token || chatIds.length === 0) return NextResponse.json({ skipped: true });

  const { text } = await req.json();
  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "missing text" }, { status: 400 });
  }

  const results = await Promise.all(chatIds.map((chatId) =>
    fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text })
    })
  ));

  const failed = results.filter((r) => !r.ok);
  if (failed.length > 0) {
    return NextResponse.json({ error: "one or more sends failed", failedCount: failed.length }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}

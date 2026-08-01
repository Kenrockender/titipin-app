import { NextRequest, NextResponse } from "next/server";

// Sends a plain-text message to the admin's Telegram via the bot API.
// Server-only route so TELEGRAM_BOT_TOKEN never reaches the client.
export async function POST(req: NextRequest) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return NextResponse.json({ skipped: true });

  const { text } = await req.json();
  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "missing text" }, { status: 400 });
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text })
  });

  if (!res.ok) {
    return NextResponse.json({ error: await res.text() }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}

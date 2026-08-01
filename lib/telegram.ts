// Fire-and-forget notification to the admin's Telegram. Safe to call from
// client components — the bot token lives server-side in app/api/notify.
export function notifyTelegram(text: string) {
  fetch("/api/notify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  }).catch(() => {});
}

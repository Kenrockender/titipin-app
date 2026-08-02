// Set via NEXT_PUBLIC_BANK_ACCOUNT_INFO — used in customer-facing payment
// instructions and in the admin's prefilled WhatsApp messages.
export const BANK_ACCOUNT_INFO = process.env.NEXT_PUBLIC_BANK_ACCOUNT_INFO || "Bank transfer (set NEXT_PUBLIC_BANK_ACCOUNT_INFO)";

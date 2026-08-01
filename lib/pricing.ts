// The pricing brain. Change your markup here and every quote updates instantly.
import type { PricingConfig } from "@/types/database.types";

export const DEFAULT_PRICING: PricingConfig = {
  default_markup_percentage: 20, // 20% upside
  default_flat_fee_idr: 50000, // flat jastip fee per item
  exchange_rate_buffer_pct: 4 // pad the real FX rate by 4%
};

/** Round up to the nearest 500 IDR so quotes look clean. */
export function roundIDR(value: number): number {
  return Math.ceil(value / 500) * 500;
}

/** Apply the padded exchange rate buffer on top of the real rate. */
export function paddedRate(realRate: number, bufferPct = DEFAULT_PRICING.exchange_rate_buffer_pct): number {
  return realRate * (1 + bufferPct / 100);
}

export interface QuoteInput {
  basePriceForeign: number;
  exchangeRate: number; // system (already padded) rate: foreign -> IDR
  markupPercentage?: number;
  flatJastipFee?: number;
  quantity?: number;
}

export interface QuoteBreakdown {
  baseIdr: number;
  markupIdr: number;
  flatFeeIdr: number;
  unitPriceIdr: number;
  quantity: number;
  totalIdr: number;
}

/** Core formula: (base * FX) + markup% + flat fee, per unit, times quantity. */
export function calculateQuote(input: QuoteInput): QuoteBreakdown {
  const markup = input.markupPercentage ?? DEFAULT_PRICING.default_markup_percentage;
  const flatFee = input.flatJastipFee ?? DEFAULT_PRICING.default_flat_fee_idr;
  const qty = input.quantity ?? 1;

  const baseIdr = input.basePriceForeign * input.exchangeRate;
  const markupIdr = baseIdr * (markup / 100);
  const unitPriceIdr = roundIDR(baseIdr + markupIdr + flatFee);

  return {
    baseIdr: roundIDR(baseIdr),
    markupIdr: roundIDR(markupIdr),
    flatFeeIdr: flatFee,
    unitPriceIdr,
    quantity: qty,
    totalIdr: unitPriceIdr * qty
  };
}

/** Down payment amount from a total, given a DP ratio (default 60%). */
export function calculateDP(total: number, ratio = 0.6): number {
  return roundIDR(total * ratio);
}

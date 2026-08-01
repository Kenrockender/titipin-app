// TypeScript definitions mirroring supabase/schema.sql (the 9-table Jastip schema).
// When you connect Supabase you can regenerate this via `supabase gen types typescript`.

export type TripStatus = "Planning" | "Active Shopping" | "In Transit to ID" | "Completed";
export type RequestStatus = "Pending Review" | "Quote Sent" | "Accepted" | "Rejected";
export type OrderStatus =
  | "Waiting DP"
  | "DP Paid"
  | "Purchased Overseas"
  | "Shipped to ID"
  | "Awaiting Final Payment"
  | "Completed"
  | "Cancelled";
export type ItemStatus = "Pending Purchase" | "Secured" | "Out of Stock";
export type DeliveryMethod = "Pickup" | "GoSend";
export type PaymentType = "Down Payment" | "Final Payment";
export type PaymentStatus = "Pending Verification" | "Verified" | "Failed";

export interface User {
  id: string;
  full_name: string;
  email: string;
  whatsapp_number: string;
  shipping_address: string;
  store_credit_balance: number;
  created_at: string;
}

export interface Trip {
  id: string;
  name: string;
  destination_country: string;
  system_exchange_rate: number; // padded rate, e.g. 1 JPY = 110 IDR
  status: TripStatus;
}

export interface ColorVariant {
  color_name: string;
  hex: string;
  product_id: string;
}

export interface CatalogProduct {
  id: string;
  trip_id: string;
  name: string;
  description: string;
  base_price_foreign: number;
  markup_percentage: number;
  flat_jastip_fee: number;
  final_price_idr: number; // calculated
  image_url: string;
  is_active: boolean;
  category?: string;
  store_location?: string;
  color_variants?: ColorVariant[];
}

export interface CustomRequest {
  id: string;
  user_id: string;
  product_name_or_desc: string;
  product_url: string | null;
  uploaded_image_urls: string[] | null;
  quantity: number;
  variations: string;
  status: RequestStatus;
  quoted_price_idr: number | null;
  required_dp_idr: number | null;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  request_id: string | null;
  item_name: string;
  quantity: number;
  locked_price_idr: number;
  store_location: string;
  item_status: ItemStatus;
  admin_receipt_url: string | null;
  image_url?: string;
}

export interface Order {
  id: string;
  user_id: string;
  trip_id: string;
  total_price_idr: number;
  total_dp_required_idr: number;
  local_shipping_fee_idr: number | null;
  delivery_method: DeliveryMethod;
  status: OrderStatus;
  created_at: string;
  items: OrderItem[];
  addon_ids: string[];
}

export interface AddOn {
  id: string;
  name: string;
  price_idr: number;
}

export interface Payment {
  id: string;
  order_id: string;
  payment_type: PaymentType;
  amount_idr: number;
  payment_method: string;
  receipt_image_url: string | null;
  status: PaymentStatus;
  created_at: string;
}

export interface PricingConfig {
  default_markup_percentage: number;
  default_flat_fee_idr: number;
  exchange_rate_buffer_pct: number; // extra % padded onto the real FX rate
}

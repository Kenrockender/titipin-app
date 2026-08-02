import React from "react";
import { Badge } from "@/components/ui/Badge";
import type { OrderStatus, ItemStatus, RequestStatus } from "@/types/database.types";

const map: Record<string, "neutral" | "brand" | "green" | "amber" | "blue" | "red" | "purple"> = {
  "Waiting DP": "amber", "DP Paid": "blue", "Purchased Overseas": "purple",
  "Shipped to ID": "blue", "Awaiting Final Payment": "amber", "Completed": "green", "Cancelled": "red",
  "Pending Purchase": "amber", "Secured": "green", "Out of Stock": "red", "Refunded as Credit": "purple",
  "Pending Review": "amber", "Quote Sent": "blue", "Accepted": "green", "Rejected": "red"
};
export function StatusBadge({ status }: { status: OrderStatus | ItemStatus | RequestStatus }) {
  return <Badge tone={map[status] ?? "neutral"}>{status}</Badge>;
}

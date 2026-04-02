import { Badge } from "@/components/ui/badge"
import type { ProductStatus } from "@/api/catalog/products"

const statusConfig: Record<
  ProductStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  Draft: { label: "Szkic", variant: "secondary" },
  Active: { label: "Aktywny", variant: "default" },
  Inactive: { label: "Nieaktywny", variant: "outline" },
  Archived: { label: "Zarchiwizowany", variant: "destructive" },
}

export function StatusBadge({ status }: { status: ProductStatus }) {
  const config = statusConfig[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}

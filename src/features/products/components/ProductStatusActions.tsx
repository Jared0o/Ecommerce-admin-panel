import { toast } from "sonner"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { useUpdateProductStatus } from "../hooks/useProductMutations"
import type { ProductStatus } from "@/api/catalog/products"
import type { ApiError } from "@/api/client"

const statusOptions: { value: ProductStatus; label: string }[] = [
  { value: "Draft", label: "Ustaw jako Szkic" },
  { value: "Active", label: "Aktywuj" },
  { value: "Inactive", label: "Dezaktywuj" },
  { value: "Archived", label: "Zarchiwizuj" },
]

interface ProductStatusActionsProps {
  productId: string
  currentStatus: ProductStatus
}

export function ProductStatusActions({
  productId,
  currentStatus,
}: ProductStatusActionsProps) {
  const updateStatus = useUpdateProductStatus()

  async function handleStatusChange(newStatus: ProductStatus) {
    try {
      await updateStatus.mutateAsync({ id: productId, status: newStatus })
      toast.success("Status zmieniony")
    } catch (err: unknown) {
      const e = err as ApiError
      toast.error(e?.message ?? "Nie można zmienić statusu")
    }
  }

  return (
    <div className="flex items-center gap-2">
      <StatusBadge status={currentStatus} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={updateStatus.isPending}
          >
            Zmień status <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {statusOptions
            .filter((s) => s.value !== currentStatus)
            .map((s) => (
              <DropdownMenuItem
                key={s.value}
                onClick={() => handleStatusChange(s.value)}
              >
                {s.label}
              </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

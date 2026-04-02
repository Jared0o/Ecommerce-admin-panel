import { useState } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { VariantForm, type VariantFormValues } from "./VariantForm"
import {
  useAddVariant,
  useUpdateVariant,
  useDeleteVariant,
} from "../hooks/useProductMutations"
import { formatPrice } from "@/lib/utils"
import type { ProductDto, ProductVariantDto } from "@/api/catalog/products"
import type { ApiError } from "@/api/client"

interface ProductVariantsTabProps {
  product: ProductDto
}

export function ProductVariantsTab({ product }: ProductVariantsTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingVariant, setEditingVariant] =
    useState<ProductVariantDto | null>(null)
  const [deletingVariant, setDeletingVariant] =
    useState<ProductVariantDto | null>(null)

  const addVariant = useAddVariant()
  const updateVariant = useUpdateVariant()
  const deleteVariant = useDeleteVariant()

  const isOnlyVariant = product.variants.length === 1

  function openAdd() {
    setEditingVariant(null)
    setDialogOpen(true)
  }

  function openEdit(variant: ProductVariantDto) {
    setEditingVariant(variant)
    setDialogOpen(true)
  }

  async function handleSubmit(values: VariantFormValues) {
    try {
      const body = {
        sku: values.sku,
        name: values.name || null,
        price: values.price,
        compareAtPrice: values.compareAtPrice ?? null,
        isDefault: values.isDefault,
        attributes: values.attributes,
      }

      if (editingVariant) {
        await updateVariant.mutateAsync({
          productId: product.id,
          variantId: editingVariant.id,
          body,
        })
        toast.success("Wariant zaktualizowany")
      } else {
        await addVariant.mutateAsync({ productId: product.id, body })
        toast.success("Wariant dodany")
      }
      setDialogOpen(false)
    } catch (err: unknown) {
      const e = err as ApiError
      toast.error(e?.message ?? "Wystąpił błąd")
    }
  }

  async function handleDelete() {
    if (!deletingVariant) return
    try {
      await deleteVariant.mutateAsync({
        productId: product.id,
        variantId: deletingVariant.id,
      })
      toast.success("Wariant usunięty")
      setDeletingVariant(null)
    } catch (err: unknown) {
      const e = err as ApiError
      toast.error(e?.message ?? "Nie można usunąć wariantu")
      setDeletingVariant(null)
    }
  }

  const isSubmitting = addVariant.isPending || updateVariant.isPending

  return (
    <div className="space-y-4">
      {product.variants.length === 0 && (
        <div className="rounded-md border bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 px-4 py-3 text-sm text-yellow-800 dark:text-yellow-200">
          Dodanie pierwszego wariantu spowoduje usunięcie ceny produktu. Cena będzie zarządzana na poziomie wariantów.
        </div>
      )}

      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          {product.variants.length} wariant(ów)
        </span>
        <Button onClick={openAdd} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Dodaj wariant
        </Button>
      </div>

      {product.variants.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">Brak wariantów</p>
      ) : (
        <div className="space-y-2">
          {product.variants.map((variant) => (
            <div
              key={variant.id}
              className="flex items-center gap-4 rounded-md border bg-card px-4 py-3"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{variant.sku}</span>
                  {variant.name && (
                    <span className="text-muted-foreground text-sm">
                      — {variant.name}
                    </span>
                  )}
                  {variant.isDefault && (
                    <Badge variant="secondary" className="text-xs">
                      Domyślny
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground mt-0.5">
                  {formatPrice(variant.price)}
                  {variant.attributes.length > 0 && (
                    <span className="ml-2">
                      {variant.attributes
                        .map((a) => `${a.key}: ${a.value}`)
                        .join(", ")}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEdit(variant)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isOnlyVariant}
                  title={isOnlyVariant ? "Nie można usunąć ostatniego wariantu" : ""}
                  onClick={() => setDeletingVariant(variant)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingVariant ? "Edytuj wariant" : "Nowy wariant"}
            </DialogTitle>
          </DialogHeader>
          <VariantForm
            key={editingVariant?.id ?? "new"}
            defaultValues={editingVariant ?? undefined}
            onSubmit={handleSubmit}
            onCancel={() => setDialogOpen(false)}
            isLoading={isSubmitting}
            forceDefault={product.variants.length === 0}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deletingVariant}
        onOpenChange={(open) => !open && setDeletingVariant(null)}
        title="Usuń wariant"
        description={`Usunąć wariant "${deletingVariant?.sku}"?`}
        onConfirm={handleDelete}
        loading={deleteVariant.isPending}
      />
    </div>
  )
}

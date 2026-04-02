import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAttributesByCategoryId } from "@/features/attributes/hooks/useAttributes"
import { useSetProductAttributes } from "../hooks/useProductMutations"
import type { ProductDto } from "@/api/catalog/products"
import type { ApiError } from "@/api/client"

interface ProductAttributesTabProps {
  product: ProductDto
}

export function ProductAttributesTab({ product }: ProductAttributesTabProps) {
  const { data: availableAttrs } = useAttributesByCategoryId(
    product.mainCategoryId
  )
  const setAttributes = useSetProductAttributes()

  const [selectedAttrId, setSelectedAttrId] = useState("")
  const [attrValue, setAttrValue] = useState("")

  const currentAttributes = product.attributes

  const availableToAdd =
    availableAttrs?.filter(
      (a) =>
        !currentAttributes.some(
          (ca) => ca.attributeDefinitionId === a.id
        )
    ) ?? []

  async function handleAdd() {
    if (!selectedAttrId || !attrValue.trim()) return
    const newAttrs = [
      ...currentAttributes.map((a) => ({
        attributeDefinitionId: a.attributeDefinitionId,
        value: a.value,
      })),
      { attributeDefinitionId: selectedAttrId, value: attrValue.trim() },
    ]
    try {
      await setAttributes.mutateAsync({
        productId: product.id,
        body: { attributes: newAttrs },
      })
      toast.success("Atrybut dodany")
      setSelectedAttrId("")
      setAttrValue("")
    } catch (err: unknown) {
      const e = err as ApiError
      toast.error(e?.message ?? "Nie można dodać atrybutu")
    }
  }

  async function handleRemove(attrDefId: string) {
    const newAttrs = currentAttributes
      .filter((a) => a.attributeDefinitionId !== attrDefId)
      .map((a) => ({
        attributeDefinitionId: a.attributeDefinitionId,
        value: a.value,
      }))
    try {
      await setAttributes.mutateAsync({
        productId: product.id,
        body: { attributes: newAttrs },
      })
      toast.success("Atrybut usunięty")
    } catch (err: unknown) {
      const e = err as ApiError
      toast.error(e?.message ?? "Nie można usunąć atrybutu")
    }
  }

  return (
    <div className="space-y-6">
      {/* Current attributes */}
      {currentAttributes.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          Brak atrybutów
        </p>
      ) : (
        <div className="space-y-2">
          {currentAttributes.map((attr) => (
            <div
              key={attr.attributeDefinitionId}
              className="flex items-center gap-3 rounded-md border bg-card px-3 py-2"
            >
              <span className="text-sm font-medium w-36 shrink-0">{attr.name}</span>
              <span className="text-sm text-muted-foreground flex-1">{attr.value}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemove(attr.attributeDefinitionId)}
                disabled={setAttributes.isPending}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add attribute */}
      {availableToAdd.length > 0 && (
        <div className="rounded-md border bg-card p-4">
          <h3 className="text-sm font-medium mb-3">Dodaj atrybut</h3>
          <div className="flex gap-2">
            <Select value={selectedAttrId} onValueChange={setSelectedAttrId}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Wybierz atrybut" />
              </SelectTrigger>
              <SelectContent>
                {availableToAdd.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Wartość"
              value={attrValue}
              onChange={(e) => setAttrValue(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAdd()
                }
              }}
            />
            <Button
              onClick={handleAdd}
              disabled={!selectedAttrId || !attrValue.trim() || setAttributes.isPending}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" /> Dodaj
            </Button>
          </div>
        </div>
      )}

      {!product.mainCategoryId && (
        <p className="text-sm text-muted-foreground">
          Najpierw przypisz kategorię główną, aby móc dodawać atrybuty.
        </p>
      )}
    </div>
  )
}

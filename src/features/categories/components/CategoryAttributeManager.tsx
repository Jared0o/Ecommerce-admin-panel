import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useAttributes } from "@/features/attributes/hooks/useAttributes"
import { useAttributesByCategoryId } from "@/features/attributes/hooks/useAttributes"
import {
  useAddCategoryAttribute,
  useRemoveCategoryAttribute,
} from "../hooks/useCategories"
import type { CategoryDto } from "@/api/catalog/categories"
import type { ApiError } from "@/api/client"

interface CategoryAttributeManagerProps {
  category: CategoryDto
}

export function CategoryAttributeManager({
  category,
}: CategoryAttributeManagerProps) {
  const [selectedAttrId, setSelectedAttrId] = useState("")

  const { data: assigned, isLoading } = useAttributesByCategoryId(category.id)
  const { data: allAttrs } = useAttributes({ page: 1, pageSize: 200 })
  const addAttr = useAddCategoryAttribute()
  const removeAttr = useRemoveCategoryAttribute()

  const assignedIds = new Set(assigned?.map((a) => a.id) ?? [])
  const available =
    allAttrs?.items.filter((a) => !assignedIds.has(a.id)) ?? []

  async function handleAdd() {
    if (!selectedAttrId) return
    try {
      await addAttr.mutateAsync({
        categoryId: category.id,
        attributeId: selectedAttrId,
      })
      toast.success("Atrybut przypisany do kategorii")
      setSelectedAttrId("")
    } catch (err: unknown) {
      toast.error((err as ApiError)?.message ?? "Błąd")
    }
  }

  async function handleRemove(attributeId: string) {
    try {
      await removeAttr.mutateAsync({
        categoryId: category.id,
        attributeId,
      })
      toast.success("Atrybut usunięty z kategorii")
    } catch (err: unknown) {
      toast.error((err as ApiError)?.message ?? "Błąd")
    }
  }

  return (
    <div className="mt-6">
      <Separator className="mb-4" />
      <h3 className="text-sm font-semibold mb-3">Atrybuty kategorii</h3>
      <p className="text-xs text-muted-foreground mb-3">
        Atrybuty przypisane tutaj będą dostępne w zakładce „Atrybuty" produktów z tą kategorią.
      </p>

      {/* Assigned list */}
      {isLoading ? (
        <p className="text-xs text-muted-foreground">Ładowanie...</p>
      ) : assigned?.length === 0 ? (
        <p className="text-xs text-muted-foreground mb-3">Brak przypisanych atrybutów</p>
      ) : (
        <ul className="space-y-1 mb-3">
          {assigned?.map((attr) => (
            <li
              key={attr.id}
              className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-1.5 text-sm"
            >
              <span>{attr.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleRemove(attr.id)}
                disabled={removeAttr.isPending}
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {/* Add attribute */}
      {available.length > 0 && (
        <div className="flex gap-2">
          <Select value={selectedAttrId} onValueChange={setSelectedAttrId}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Wybierz atrybut..." />
            </SelectTrigger>
            <SelectContent>
              {available.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            onClick={handleAdd}
            disabled={!selectedAttrId || addAttr.isPending}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}

      {available.length === 0 && !isLoading && (
        <p className="text-xs text-muted-foreground">
          Wszystkie atrybuty są już przypisane lub brak zdefiniowanych atrybutów.
        </p>
      )}
    </div>
  )
}

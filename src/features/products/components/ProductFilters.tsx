import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import type { ProductStatus } from "@/api/catalog/products"
import { useCategories } from "@/features/categories/hooks/useCategories"
import { useAllBrands } from "@/features/brands/hooks/useBrands"

interface ProductFiltersProps {
  status?: ProductStatus | ""
  categoryId?: string
  brandId?: string
  onStatusChange: (v: ProductStatus | "") => void
  onCategoryChange: (v: string) => void
  onBrandChange: (v: string) => void
  onReset: () => void
}

const statuses: { value: ProductStatus; label: string }[] = [
  { value: "Draft", label: "Szkic" },
  { value: "Active", label: "Aktywny" },
  { value: "Inactive", label: "Nieaktywny" },
  { value: "Archived", label: "Zarchiwizowany" },
]

export function ProductFilters({
  status,
  categoryId,
  brandId,
  onStatusChange,
  onCategoryChange,
  onBrandChange,
  onReset,
}: ProductFiltersProps) {
  const { data: categories } = useCategories()
  const { data: brands } = useAllBrands()

  const flatCategories: { id: string; name: string; level: number }[] = []
  function flatten(nodes: typeof categories) {
    nodes?.forEach((n) => {
      flatCategories.push({ id: n.id, name: n.name, level: n.level })
      if (n.children.length) flatten(n.children)
    })
  }
  flatten(categories)

  const hasFilters = !!(status || categoryId || brandId)

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <Select
        value={status || "all"}
        onValueChange={(v) => onStatusChange(v === "all" ? "" : v as ProductStatus)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Wszystkie statusy</SelectItem>
          {statuses.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={categoryId || "all"}
        onValueChange={(v) => onCategoryChange(v === "all" ? "" : v)}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Kategoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Wszystkie kategorie</SelectItem>
          {flatCategories.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              <span style={{ paddingLeft: `${(c.level - 1) * 12}px` }}>
                {c.name}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={brandId || "all"}
        onValueChange={(v) => onBrandChange(v === "all" ? "" : v)}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Marka" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Wszystkie marki</SelectItem>
          {brands?.map((b) => (
            <SelectItem key={b.id} value={b.id}>
              {b.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onReset}>
          <X className="h-4 w-4 mr-1" /> Wyczyść
        </Button>
      )}
    </div>
  )
}

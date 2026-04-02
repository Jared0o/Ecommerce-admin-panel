import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { Plus, Pencil } from "lucide-react"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { PaginationControls } from "@/components/shared/PaginationControls"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { ProductFilters } from "../components/ProductFilters"
import { useProducts } from "../hooks/useProducts"
import { formatPrice, formatDateShort } from "@/lib/utils"
import type { ProductStatus } from "@/api/catalog/products"

export function ProductsListPage() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<ProductStatus | "">("")
  const [categoryId, setCategoryId] = useState("")
  const [brandId, setBrandId] = useState("")

  const { data, isLoading } = useProducts({
    page,
    pageSize: 20,
    status: status || undefined,
    categoryId: categoryId || undefined,
    brandId: brandId || undefined,
  })

  function resetFilters() {
    setStatus("")
    setCategoryId("")
    setBrandId("")
    setPage(1)
  }

  return (
    <div>
      <PageHeader
        title="Produkty"
        description="Zarządzaj katalogiem produktów"
        action={
          <Button asChild size="sm">
            <Link to="/admin/products/new">
              <Plus className="h-4 w-4 mr-1" /> Dodaj produkt
            </Link>
          </Button>
        }
      />

      <div className="p-6 space-y-4">
        <ProductFilters
          status={status}
          categoryId={categoryId}
          brandId={brandId}
          onStatusChange={(v) => { setStatus(v); setPage(1) }}
          onCategoryChange={(v) => { setCategoryId(v); setPage(1) }}
          onBrandChange={(v) => { setBrandId(v); setPage(1) }}
          onReset={resetFilters}
        />

        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nazwa</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cena</TableHead>
                <TableHead>Wyróżniony</TableHead>
                <TableHead>Utworzony</TableHead>
                <TableHead className="w-16" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data?.items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-10"
                  >
                    Brak produktów
                  </TableCell>
                </TableRow>
              ) : (
                data?.items.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {product.slug}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={product.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {product.price !== null
                        ? formatPrice(product.price)
                        : "Warianty"}
                    </TableCell>
                    <TableCell>
                      {product.isFeatured ? "✓" : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateShort(product.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" asChild>
                        <Link to="/admin/products/$productId" params={{ productId: product.id }}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {data && (
            <PaginationControls
              page={data.page}
              totalPages={data.totalPages}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>
    </div>
  )
}

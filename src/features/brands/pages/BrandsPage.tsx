import { useState } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { PaginationControls } from "@/components/shared/PaginationControls"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { BrandForm, type BrandFormValues } from "../components/BrandForm"
import {
  useBrands,
  useCreateBrand,
  useUpdateBrand,
  useDeleteBrand,
} from "../hooks/useBrands"
import type { BrandDto } from "@/api/catalog/brands"
import type { ApiError } from "@/api/client"
import { formatDateShort } from "@/lib/utils"

export function BrandsPage() {
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState<BrandDto | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { data, isLoading } = useBrands({ page, pageSize: 20 })
  const createBrand = useCreateBrand()
  const updateBrand = useUpdateBrand()
  const deleteBrand = useDeleteBrand()

  function openCreate() {
    setEditingBrand(null)
    setDialogOpen(true)
  }

  function openEdit(brand: BrandDto) {
    setEditingBrand(brand)
    setDialogOpen(true)
  }

  async function handleSubmit(values: BrandFormValues) {
    try {
      if (editingBrand) {
        await updateBrand.mutateAsync({
          id: editingBrand.id,
          body: {
            name: values.name,
            logoUrl: values.logoUrl || null,
            isActive: values.isActive ?? true,
          },
        })
        toast.success("Marka zaktualizowana")
      } else {
        await createBrand.mutateAsync({
          name: values.name,
          logoUrl: values.logoUrl || null,
        })
        toast.success("Marka utworzona")
      }
      setDialogOpen(false)
    } catch (err: unknown) {
      const e = err as ApiError
      toast.error(e?.message ?? "Wystąpił błąd")
    }
  }

  async function handleDelete() {
    if (!deletingId) return
    try {
      await deleteBrand.mutateAsync(deletingId)
      toast.success("Marka usunięta")
      setDeletingId(null)
    } catch (err: unknown) {
      const e = err as ApiError
      toast.error(e?.message ?? "Nie można usunąć marki")
      setDeletingId(null)
    }
  }

  const isSubmitting = createBrand.isPending || updateBrand.isPending

  return (
    <div>
      <PageHeader
        title="Marki"
        description="Zarządzaj markami produktów"
        action={
          <Button onClick={openCreate} size="sm">
            <Plus className="h-4 w-4 mr-1" /> Dodaj markę
          </Button>
        }
      />

      <div className="p-6">
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nazwa</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Utworzona</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell />
                  </TableRow>
                ))
              ) : data?.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                    Brak marek
                  </TableCell>
                </TableRow>
              ) : (
                data?.items.map((brand) => (
                  <TableRow key={brand.id}>
                    <TableCell className="font-medium">{brand.name}</TableCell>
                    <TableCell>
                      <Badge variant={brand.isActive ? "default" : "secondary"}>
                        {brand.isActive ? "Aktywna" : "Nieaktywna"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateShort(brand.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(brand)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingId(brand.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingBrand ? "Edytuj markę" : "Nowa marka"}
            </DialogTitle>
          </DialogHeader>
          <BrandForm
            defaultValues={editingBrand ?? undefined}
            isEdit={!!editingBrand}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Usuń markę"
        description="Nie można usunąć marki przypisanej do produktów."
        onConfirm={handleDelete}
        loading={deleteBrand.isPending}
      />
    </div>
  )
}

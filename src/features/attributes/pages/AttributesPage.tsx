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
import { Skeleton } from "@/components/ui/skeleton"
import { PaginationControls } from "@/components/shared/PaginationControls"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import {
  AttributeForm,
  type AttributeFormValues,
} from "../components/AttributeForm"
import {
  useAttributes,
  useCreateAttribute,
  useUpdateAttribute,
  useDeleteAttribute,
} from "../hooks/useAttributes"
import type { AttributeDefinitionDto } from "@/api/catalog/attributes"
import type { ApiError } from "@/api/client"

export function AttributesPage() {
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAttr, setEditingAttr] =
    useState<AttributeDefinitionDto | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { data, isLoading } = useAttributes({ page, pageSize: 20 })
  const createAttribute = useCreateAttribute()
  const updateAttribute = useUpdateAttribute()
  const deleteAttribute = useDeleteAttribute()

  function openCreate() {
    setEditingAttr(null)
    setDialogOpen(true)
  }

  function openEdit(attr: AttributeDefinitionDto) {
    setEditingAttr(attr)
    setDialogOpen(true)
  }

  async function handleSubmit(values: AttributeFormValues) {
    try {
      if (editingAttr) {
        await updateAttribute.mutateAsync({ id: editingAttr.id, body: values })
        toast.success("Atrybut zaktualizowany")
      } else {
        await createAttribute.mutateAsync(values)
        toast.success("Atrybut utworzony")
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
      await deleteAttribute.mutateAsync(deletingId)
      toast.success("Atrybut usunięty")
      setDeletingId(null)
    } catch (err: unknown) {
      const e = err as ApiError
      toast.error(e?.message ?? "Nie można usunąć atrybutu")
      setDeletingId(null)
    }
  }

  const isSubmitting = createAttribute.isPending || updateAttribute.isPending

  return (
    <div>
      <PageHeader
        title="Atrybuty"
        description="Definicje atrybutów przypisywanych do kategorii"
        action={
          <Button onClick={openCreate} size="sm">
            <Plus className="h-4 w-4 mr-1" /> Dodaj atrybut
          </Button>
        }
      />

      <div className="p-6">
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nazwa</TableHead>
                <TableHead>Kolejność</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    <TableCell />
                  </TableRow>
                ))
              ) : data?.items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-muted-foreground py-10"
                  >
                    Brak atrybutów
                  </TableCell>
                </TableRow>
              ) : (
                data?.items.map((attr) => (
                  <TableRow key={attr.id}>
                    <TableCell className="font-medium">{attr.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {attr.sortOrder}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(attr)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingId(attr.id)}
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
              {editingAttr ? "Edytuj atrybut" : "Nowy atrybut"}
            </DialogTitle>
          </DialogHeader>
          <AttributeForm
            key={editingAttr?.id ?? "new"}
            defaultValues={editingAttr ?? undefined}
            isEdit={!!editingAttr}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Usuń atrybut"
        description="Nie można usunąć atrybutu przypisanego do kategorii."
        onConfirm={handleDelete}
        loading={deleteAttribute.isPending}
      />
    </div>
  )
}

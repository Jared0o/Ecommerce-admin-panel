import { useState } from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { CategoryTree } from "../components/CategoryTree"
import {
  CategoryForm,
  type CategoryFormValues,
} from "../components/CategoryForm"
import { CategoryAttributeManager } from "../components/CategoryAttributeManager"
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "../hooks/useCategories"
import type { CategoryDto } from "@/api/catalog/categories"
import type { ApiError } from "@/api/client"

type Mode = "view" | "create" | "edit"

function findCategoryById(nodes: CategoryDto[], id: string): CategoryDto | null {
  for (const node of nodes) {
    if (node.id === id) return node
    const found = findCategoryById(node.children, id)
    if (found) return found
  }
  return null
}

export function CategoriesPage() {
  const { data: categories, isLoading } = useCategories()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [mode, setMode] = useState<Mode>("view")
  const [parentForNew, setParentForNew] = useState<CategoryDto | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<CategoryDto | null>(null)

  const selected = selectedId ? findCategoryById(categories ?? [], selectedId) : null

  function handleSelect(cat: CategoryDto) {
    setSelectedId(cat.id)
    setMode("edit")
    setParentForNew(null)
  }

  function handleAddRoot() {
    setSelectedId(null)
    setParentForNew(null)
    setMode("create")
  }

  function handleAddChild(parent: CategoryDto) {
    setSelectedId(null)
    setParentForNew(parent)
    setMode("create")
  }

  async function handleSubmit(values: CategoryFormValues) {
    try {
      if (mode === "create") {
        await createCategory.mutateAsync({
          name: values.name,
          parentId: parentForNew?.id ?? null,
          description: values.description || null,
          imageUrl: values.imageUrl || null,
          sortOrder: values.sortOrder,
        })
        toast.success("Kategoria utworzona")
      } else if (mode === "edit" && selected) {
        await updateCategory.mutateAsync({
          id: selected.id,
          body: {
            name: values.name,
            description: values.description || null,
            imageUrl: values.imageUrl || null,
            sortOrder: values.sortOrder,
            isActive: values.isActive,
          },
        })
        toast.success("Kategoria zaktualizowana")
      }
      setMode("view")
      setSelectedId(null)
    } catch (err: unknown) {
      const e = err as ApiError
      toast.error(e?.message ?? "Wystąpił błąd")
    }
  }

  async function handleDelete() {
    if (!deletingCategory) return
    try {
      await deleteCategory.mutateAsync(deletingCategory.id)
      toast.success("Kategoria usunięta")
      setDeletingCategory(null)
      if (selectedId === deletingCategory.id) {
        setSelectedId(null)
        setMode("view")
      }
    } catch (err: unknown) {
      const e = err as ApiError
      toast.error(e?.message ?? "Nie można usunąć kategorii")
      setDeletingCategory(null)
    }
  }

  const isSubmitting = createCategory.isPending || updateCategory.isPending

  return (
    <div>
      <PageHeader
        title="Kategorie"
        description="Drzewo kategorii produktów (max 3 poziomy)"
        action={
          <Button onClick={handleAddRoot} size="sm">
            <Plus className="h-4 w-4 mr-1" /> Dodaj kategorię
          </Button>
        }
      />

      <div className="flex gap-0 h-[calc(100vh-73px)]">
        {/* Tree panel */}
        <div className="w-72 border-r overflow-y-auto p-4">
          {isLoading ? (
            <LoadingSpinner />
          ) : categories?.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Brak kategorii
            </p>
          ) : (
            <CategoryTree
              nodes={categories ?? []}
              selectedId={selected?.id}
              onSelect={handleSelect}
              onAddChild={handleAddChild}
              onDelete={setDeletingCategory}
            />
          )}
        </div>

        {/* Form panel */}
        <div className="flex-1 overflow-y-auto p-6">
          {mode === "view" && (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Wybierz kategorię z drzewa lub kliknij &ldquo;Dodaj kategorię&rdquo;
            </div>
          )}
          {(mode === "create" || mode === "edit") && (
            <div className="max-w-lg">
              <h2 className="text-lg font-semibold mb-4">
                {mode === "create" ? "Nowa kategoria" : `Edytuj: ${selected?.name}`}
              </h2>
              <CategoryForm
                key={selected?.id ?? "new"}
                defaultValues={mode === "edit" ? selected ?? undefined : undefined}
                isEdit={mode === "edit"}
                onSubmit={handleSubmit}
                isLoading={isSubmitting}
                parentName={parentForNew?.name}
              />
              {mode === "edit" && selected && (
                <CategoryAttributeManager category={selected} />
              )}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!deletingCategory}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
        title={`Usuń kategorię "${deletingCategory?.name}"`}
        description="Nie można usunąć kategorii posiadającej podkategorie lub produkty."
        onConfirm={handleDelete}
        loading={deleteCategory.isPending}
      />
    </div>
  )
}

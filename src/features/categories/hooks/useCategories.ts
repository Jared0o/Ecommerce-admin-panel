import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  addCategoryAttribute,
  removeCategoryAttribute,
  type UpdateCategoryRequest,
} from "@/api/catalog/categories"

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateCategoryRequest }) =>
      updateCategory(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  })
}

export function useAddCategoryAttribute() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      categoryId,
      attributeId,
    }: {
      categoryId: string
      attributeId: string
    }) => addCategoryAttribute(categoryId, attributeId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  })
}

export function useRemoveCategoryAttribute() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      categoryId,
      attributeId,
    }: {
      categoryId: string
      attributeId: string
    }) => removeCategoryAttribute(categoryId, attributeId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  })
}

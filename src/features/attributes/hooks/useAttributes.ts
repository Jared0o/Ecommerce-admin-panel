import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getAttributes,
  getAttributesByCategoryId,
  createAttribute,
  updateAttribute,
  deleteAttribute,
  type GetAttributesParams,
  type UpdateAttributeRequest,
} from "@/api/catalog/attributes"

export function useAttributes(params: GetAttributesParams = {}) {
  return useQuery({
    queryKey: ["attributes", params],
    queryFn: () => getAttributes(params),
  })
}

export function useAttributesByCategoryId(categoryId: string | undefined) {
  return useQuery({
    queryKey: ["attributes", "byCategory", categoryId],
    queryFn: () => getAttributesByCategoryId(categoryId!),
    enabled: !!categoryId,
  })
}

export function useCreateAttribute() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createAttribute,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attributes"] }),
  })
}

export function useUpdateAttribute() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateAttributeRequest }) =>
      updateAttribute(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attributes"] }),
  })
}

export function useDeleteAttribute() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteAttribute,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attributes"] }),
  })
}

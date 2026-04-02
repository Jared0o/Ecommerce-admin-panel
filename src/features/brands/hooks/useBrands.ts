import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getAdminBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  type GetBrandsParams,
  type UpdateBrandRequest,
} from "@/api/catalog/brands"

export function useBrands(params: GetBrandsParams = {}) {
  return useQuery({
    queryKey: ["brands", params],
    queryFn: () => getAdminBrands(params),
  })
}

export function useAllBrands() {
  return useQuery({
    queryKey: ["brands", "all"],
    queryFn: () => getAdminBrands({ page: 1, pageSize: 200 }),
    select: (data) => data.items,
  })
}

export function useCreateBrand() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createBrand,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["brands"] }),
  })
}

export function useUpdateBrand() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateBrandRequest }) =>
      updateBrand(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["brands"] }),
  })
}

export function useDeleteBrand() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteBrand,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["brands"] }),
  })
}

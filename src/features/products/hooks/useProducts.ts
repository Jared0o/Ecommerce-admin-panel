import { useQuery } from "@tanstack/react-query"
import {
  getProducts,
  getProduct,
  type GetProductsParams,
} from "@/api/catalog/products"

export function useProducts(params: GetProductsParams = {}) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => getProducts(params),
  })
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: () => getProduct(id!),
    enabled: !!id,
  })
}

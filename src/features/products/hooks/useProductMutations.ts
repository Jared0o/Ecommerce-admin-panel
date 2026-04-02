import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  createProduct,
  updateProduct,
  updateProductStatus,
  addProductCategory,
  removeProductCategory,
  setProductAttributes,
  addVariant,
  updateVariant,
  deleteVariant,
  addProductImage,
  deleteProductImage,
  reorderProductImages,
  type UpdateProductRequest,
  type ProductStatus,
  type CreateVariantRequest,
  type UpdateVariantRequest,
  type AddImageRequest,
  type ReorderImagesRequest,
  type SetProductAttributesRequest,
} from "@/api/catalog/products"

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  })
}

export function useUpdateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateProductRequest }) =>
      updateProduct(id, body),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["products"] })
      qc.invalidateQueries({ queryKey: ["products", id] })
    },
  })
}

export function useUpdateProductStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProductStatus }) =>
      updateProductStatus(id, status),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["products"] })
      qc.invalidateQueries({ queryKey: ["products", id] })
    },
  })
}

export function useAddProductCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      productId,
      categoryId,
    }: {
      productId: string
      categoryId: string
    }) => addProductCategory(productId, categoryId),
    onSuccess: (_data, { productId }) =>
      qc.invalidateQueries({ queryKey: ["products", productId] }),
  })
}

export function useRemoveProductCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      productId,
      categoryId,
    }: {
      productId: string
      categoryId: string
    }) => removeProductCategory(productId, categoryId),
    onSuccess: (_data, { productId }) =>
      qc.invalidateQueries({ queryKey: ["products", productId] }),
  })
}

export function useSetProductAttributes() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      productId,
      body,
    }: {
      productId: string
      body: SetProductAttributesRequest
    }) => setProductAttributes(productId, body),
    onSuccess: (_data, { productId }) =>
      qc.invalidateQueries({ queryKey: ["products", productId] }),
  })
}

export function useAddVariant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      productId,
      body,
    }: {
      productId: string
      body: CreateVariantRequest
    }) => addVariant(productId, body),
    onSuccess: (_data, { productId }) =>
      qc.invalidateQueries({ queryKey: ["products", productId] }),
  })
}

export function useUpdateVariant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      productId,
      variantId,
      body,
    }: {
      productId: string
      variantId: string
      body: UpdateVariantRequest
    }) => updateVariant(productId, variantId, body),
    onSuccess: (_data, { productId }) =>
      qc.invalidateQueries({ queryKey: ["products", productId] }),
  })
}

export function useDeleteVariant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      productId,
      variantId,
    }: {
      productId: string
      variantId: string
    }) => deleteVariant(productId, variantId),
    onSuccess: (_data, { productId }) => {
      qc.invalidateQueries({ queryKey: ["products"] })
      qc.invalidateQueries({ queryKey: ["products", productId] })
    },
  })
}

export function useAddProductImage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      productId,
      body,
    }: {
      productId: string
      body: AddImageRequest
    }) => addProductImage(productId, body),
    onSuccess: (_data, { productId }) =>
      qc.invalidateQueries({ queryKey: ["products", productId] }),
  })
}

export function useDeleteProductImage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      productId,
      imageId,
    }: {
      productId: string
      imageId: string
    }) => deleteProductImage(productId, imageId),
    onSuccess: (_data, { productId }) =>
      qc.invalidateQueries({ queryKey: ["products", productId] }),
  })
}

export function useReorderProductImages() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      productId,
      body,
    }: {
      productId: string
      body: ReorderImagesRequest
    }) => reorderProductImages(productId, body),
    onSuccess: (_data, { productId }) =>
      qc.invalidateQueries({ queryKey: ["products", productId] }),
  })
}

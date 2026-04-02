import { apiClient } from "@/api/client"
import type { PagedResult } from "./brands"

export type ProductStatus = "Draft" | "Active" | "Inactive" | "Archived"

export interface ProductListItemDto {
  id: string
  name: string
  slug: string
  mainCategoryId: string
  brandId: string | null
  price: number | null
  status: ProductStatus
  isFeatured: boolean
  tags: string[]
  createdAt: string
}

export interface ProductVariantDto {
  id: string
  sku: string
  name: string | null
  price: number
  compareAtPrice: number | null
  isDefault: boolean
  attributes: { key: string; value: string }[]
}

export interface ProductImageDto {
  id: string
  variantId: string | null
  url: string
  altText: string | null
  sortOrder: number
}

export interface ProductAttributeValueDto {
  attributeDefinitionId: string
  name: string
  value: string
}

export interface ProductDto {
  id: string
  name: string
  slug: string
  description: string | null
  shortDescription: string | null
  mainCategoryId: string
  brandId: string | null
  price: number | null
  compareAtPrice: number | null
  status: ProductStatus
  isFeatured: boolean
  tags: string[]
  createdAt: string
  updatedAt: string
  variants: ProductVariantDto[]
  images: ProductImageDto[]
  attributes: ProductAttributeValueDto[]
}

export interface GetProductsParams {
  page?: number
  pageSize?: number
  categoryId?: string
  brandId?: string
  status?: ProductStatus
  minPrice?: number
  maxPrice?: number
}

export interface CreateProductRequest {
  name: string
  description?: string | null
  shortDescription?: string | null
  mainCategoryId: string
  brandId?: string | null
  price?: number | null
  compareAtPrice?: number | null
  isFeatured?: boolean
  tags?: string[]
  additionalCategoryIds?: string[]
}

export interface UpdateProductRequest {
  name: string
  slug?: string | null
  description?: string | null
  shortDescription?: string | null
  mainCategoryId: string
  brandId?: string | null
  price?: number | null
  compareAtPrice?: number | null
  isFeatured?: boolean
  tags?: string[]
}

export interface CreateVariantRequest {
  sku: string
  name?: string | null
  price: number
  compareAtPrice?: number | null
  isDefault?: boolean
  attributes?: { key: string; value: string }[]
}

export interface UpdateVariantRequest extends CreateVariantRequest {}

export interface AddImageRequest {
  variantId?: string | null
  url: string
  altText?: string | null
  sortOrder?: number
}

export interface ReorderImagesRequest {
  entries: { imageId: string; sortOrder: number }[]
}

export interface SetProductAttributesRequest {
  attributes: { attributeDefinitionId: string; value: string }[]
}

export async function getProducts(
  params: GetProductsParams = {}
): Promise<PagedResult<ProductListItemDto>> {
  const { data } = await apiClient.get<PagedResult<ProductListItemDto>>(
    "/admin/catalog/products",
    { params }
  )
  return data
}

export async function getProduct(id: string): Promise<ProductDto> {
  const { data } = await apiClient.get<ProductDto>(
    `/admin/catalog/products/${id}`
  )
  return data
}

export async function createProduct(
  body: CreateProductRequest
): Promise<string> {
  const { data } = await apiClient.post<string>(
    "/admin/catalog/products",
    body
  )
  return data
}

export async function updateProduct(
  id: string,
  body: UpdateProductRequest
): Promise<void> {
  await apiClient.put(`/admin/catalog/products/${id}`, body)
}

export async function updateProductStatus(
  id: string,
  newStatus: ProductStatus
): Promise<void> {
  await apiClient.patch(`/admin/catalog/products/${id}/status`, { newStatus })
}

export async function addProductCategory(
  productId: string,
  categoryId: string
): Promise<void> {
  await apiClient.post(`/admin/catalog/products/${productId}/categories`, {
    categoryId,
  })
}

export async function removeProductCategory(
  productId: string,
  categoryId: string
): Promise<void> {
  await apiClient.delete(
    `/admin/catalog/products/${productId}/categories/${categoryId}`
  )
}

export async function setProductAttributes(
  productId: string,
  body: SetProductAttributesRequest
): Promise<void> {
  await apiClient.put(`/admin/catalog/products/${productId}/attributes`, body)
}

export async function addVariant(
  productId: string,
  body: CreateVariantRequest
): Promise<string> {
  const { data } = await apiClient.post<string>(
    `/admin/catalog/products/${productId}/variants`,
    body
  )
  return data
}

export async function updateVariant(
  productId: string,
  variantId: string,
  body: UpdateVariantRequest
): Promise<void> {
  await apiClient.put(
    `/admin/catalog/products/${productId}/variants/${variantId}`,
    body
  )
}

export async function deleteVariant(
  productId: string,
  variantId: string
): Promise<void> {
  await apiClient.delete(
    `/admin/catalog/products/${productId}/variants/${variantId}`
  )
}

export async function addProductImage(
  productId: string,
  body: AddImageRequest
): Promise<string> {
  const { data } = await apiClient.post<string>(
    `/admin/catalog/products/${productId}/images`,
    body
  )
  return data
}

export async function deleteProductImage(
  productId: string,
  imageId: string
): Promise<void> {
  await apiClient.delete(
    `/admin/catalog/products/${productId}/images/${imageId}`
  )
}

export async function reorderProductImages(
  productId: string,
  body: ReorderImagesRequest
): Promise<void> {
  await apiClient.patch(
    `/admin/catalog/products/${productId}/images/reorder`,
    body
  )
}

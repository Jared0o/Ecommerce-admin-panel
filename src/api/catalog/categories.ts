import { apiClient } from "@/api/client"

export interface CategoryDto {
  id: string
  name: string
  slug: string
  parentId: string | null
  level: 1 | 2 | 3
  description: string | null
  imageUrl: string | null
  sortOrder: number
  isActive: boolean
  createdAt: string
  children: CategoryDto[]
}

export interface CreateCategoryRequest {
  name: string
  parentId?: string | null
  description?: string | null
  imageUrl?: string | null
  sortOrder?: number
}

export interface UpdateCategoryRequest {
  name: string
  slug?: string | null
  description?: string | null
  imageUrl?: string | null
  sortOrder?: number
  isActive: boolean
}

export async function getCategories(): Promise<CategoryDto[]> {
  const { data } = await apiClient.get<CategoryDto[]>(
    "/admin/catalog/categories"
  )
  return data
}

export async function createCategory(
  body: CreateCategoryRequest
): Promise<string> {
  const { data } = await apiClient.post<string>(
    "/admin/catalog/categories",
    body
  )
  return data
}

export async function updateCategory(
  id: string,
  body: UpdateCategoryRequest
): Promise<void> {
  await apiClient.put(`/admin/catalog/categories/${id}`, body)
}

export async function deleteCategory(id: string): Promise<void> {
  await apiClient.delete(`/admin/catalog/categories/${id}`)
}

export async function addCategoryAttribute(
  categoryId: string,
  attributeId: string
): Promise<void> {
  await apiClient.post(
    `/admin/catalog/categories/${categoryId}/attributes/${attributeId}`
  )
}

export async function removeCategoryAttribute(
  categoryId: string,
  attributeId: string
): Promise<void> {
  await apiClient.delete(
    `/admin/catalog/categories/${categoryId}/attributes/${attributeId}`
  )
}

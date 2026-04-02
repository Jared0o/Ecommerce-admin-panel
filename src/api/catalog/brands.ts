import { apiClient } from "@/api/client"

export interface BrandDto {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  isActive: boolean
  createdAt: string
}

export interface PagedResult<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

export interface GetBrandsParams {
  page?: number
  pageSize?: number
}

export interface CreateBrandRequest {
  name: string
  logoUrl?: string | null
}

export interface UpdateBrandRequest {
  name: string
  slug?: string | null
  logoUrl?: string | null
  isActive: boolean
}

export async function getAdminBrands(
  params: GetBrandsParams = {}
): Promise<PagedResult<BrandDto>> {
  const { data } = await apiClient.get<PagedResult<BrandDto>>(
    "/admin/catalog/brands",
    { params }
  )
  return data
}

export async function createBrand(body: CreateBrandRequest): Promise<string> {
  const { data } = await apiClient.post<string>("/admin/catalog/brands", body)
  return data
}

export async function updateBrand(
  id: string,
  body: UpdateBrandRequest
): Promise<void> {
  await apiClient.put(`/admin/catalog/brands/${id}`, body)
}

export async function deleteBrand(id: string): Promise<void> {
  await apiClient.delete(`/admin/catalog/brands/${id}`)
}

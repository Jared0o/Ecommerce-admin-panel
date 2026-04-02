import { apiClient } from "@/api/client"
import type { PagedResult } from "./brands"

export interface AttributeDefinitionDto {
  id: string
  name: string
  sortOrder: number
}

export interface GetAttributesParams {
  page?: number
  pageSize?: number
}

export interface CreateAttributeRequest {
  name: string
  sortOrder?: number
}

export interface UpdateAttributeRequest {
  name: string
  sortOrder?: number
}

export async function getAttributes(
  params: GetAttributesParams = {}
): Promise<PagedResult<AttributeDefinitionDto>> {
  const { data } = await apiClient.get<PagedResult<AttributeDefinitionDto>>(
    "/admin/catalog/attributes",
    { params: { page: 1, pageSize: 20, ...params } }
  )
  return data
}

export async function getAttributesByCategoryId(
  categoryId: string
): Promise<AttributeDefinitionDto[]> {
  const { data } = await apiClient.get<PagedResult<AttributeDefinitionDto>>(
    "/admin/catalog/attributes",
    { params: { categoryId, page: 1, pageSize: 1000 } }
  )
  return data.items
}

export async function createAttribute(
  body: CreateAttributeRequest
): Promise<string> {
  const { data } = await apiClient.post<string>(
    "/admin/catalog/attributes",
    body
  )
  return data
}

export async function updateAttribute(
  id: string,
  body: UpdateAttributeRequest
): Promise<void> {
  await apiClient.put(`/admin/catalog/attributes/${id}`, body)
}

export async function deleteAttribute(id: string): Promise<void> {
  await apiClient.delete(`/admin/catalog/attributes/${id}`)
}

import { apiClient } from "@/api/client"
import type { PagedResult } from "@/api/catalog/brands"

export type UserRole = "Admin" | "Moderator" | "User"

export interface AdminUserDto {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  roles: UserRole[]
  isActive: boolean
  createdAt: string
}

export interface GetAdminUsersParams {
  page?: number
  pageSize?: number
  role?: UserRole
  isActive?: boolean
}

export async function getAdminUsers(
  params: GetAdminUsersParams = {}
): Promise<PagedResult<AdminUserDto>> {
  const { data } = await apiClient.get<PagedResult<AdminUserDto>>(
    "/admin/users",
    { params }
  )
  return data
}

export async function getAdminUser(id: string): Promise<AdminUserDto> {
  const { data } = await apiClient.get<AdminUserDto>(`/admin/users/${id}`)
  return data
}

export async function deactivateUser(id: string): Promise<void> {
  await apiClient.post(`/admin/users/${id}/deactivate`)
}

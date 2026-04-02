import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getAdminUsers,
  getAdminUser,
  deactivateUser,
  type GetAdminUsersParams,
} from "@/api/users/users"

export function useAdminUsers(params: GetAdminUsersParams = {}) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => getAdminUsers(params),
  })
}

export function useAdminUser(id: string | undefined) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => getAdminUser(id!),
    enabled: !!id,
  })
}

export function useDeactivateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deactivateUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  })
}

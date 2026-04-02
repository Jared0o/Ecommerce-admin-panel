import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { toast } from "sonner"
import { Eye, UserX } from "lucide-react"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { PaginationControls } from "@/components/shared/PaginationControls"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { useAdminUsers, useDeactivateUser } from "../hooks/useUsers"
import type { AdminUserDto, UserRole } from "@/api/users/users"
import type { ApiError } from "@/api/client"
import { formatDateShort } from "@/lib/utils"

export function UsersPage() {
  const [page, setPage] = useState(1)
  const [role, setRole] = useState<UserRole | "">("")
  const [deactivatingUser, setDeactivatingUser] =
    useState<AdminUserDto | null>(null)

  const { data, isLoading } = useAdminUsers({
    page,
    pageSize: 20,
    role: role || undefined,
  })
  const deactivate = useDeactivateUser()

  async function handleDeactivate() {
    if (!deactivatingUser) return
    try {
      await deactivate.mutateAsync(deactivatingUser.id)
      toast.success("Użytkownik dezaktywowany")
      setDeactivatingUser(null)
    } catch (err: unknown) {
      const e = err as ApiError
      toast.error(e?.message ?? "Nie można dezaktywować użytkownika")
      setDeactivatingUser(null)
    }
  }

  return (
    <div>
      <PageHeader
        title="Użytkownicy"
        description="Zarządzaj kontami użytkowników"
      />

      <div className="p-6 space-y-4">
        <div className="flex gap-2">
          <Select
            value={role || "all"}
            onValueChange={(v) => {
              setRole(v === "all" ? "" : v as UserRole)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Rola" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="Moderator">Moderator</SelectItem>
              <SelectItem value="User">User</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Imię i nazwisko</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dołączył</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data?.items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-10"
                  >
                    Brak użytkowników
                  </TableCell>
                </TableRow>
              ) : (
                data?.items.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {[user.firstName, user.lastName].filter(Boolean).join(" ") || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((r) => (
                          <Badge key={r} variant="outline" className="text-xs">
                            {r}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.isActive ? "default" : "secondary"}
                      >
                        {user.isActive ? "Aktywny" : "Nieaktywny"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateShort(user.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="icon" asChild>
                          <Link
                            to="/admin/users/$userId"
                            params={{ userId: user.id }}
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        {user.isActive && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeactivatingUser(user)}
                          >
                            <UserX className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {data && (
            <PaginationControls
              page={data.page}
              totalPages={data.totalPages}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!deactivatingUser}
        onOpenChange={(open) => !open && setDeactivatingUser(null)}
        title="Dezaktywuj użytkownika"
        description={`Dezaktywować konto ${deactivatingUser?.email}?`}
        confirmLabel="Dezaktywuj"
        onConfirm={handleDeactivate}
        loading={deactivate.isPending}
      />
    </div>
  )
}

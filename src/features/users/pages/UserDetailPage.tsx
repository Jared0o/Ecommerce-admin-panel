import { Link } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { useAdminUser } from "../hooks/useUsers"
import { formatDate } from "@/lib/utils"

interface UserDetailPageProps {
  userId: string
}

export function UserDetailPage({ userId }: UserDetailPageProps) {
  const { data: user, isLoading } = useAdminUser(userId)

  if (isLoading) return <LoadingSpinner />

  if (!user) return (
    <div className="p-6 text-muted-foreground">Użytkownik nie znaleziony</div>
  )

  return (
    <div>
      <PageHeader
        title={user.email}
        description={`ID: ${user.id}`}
        action={
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/users">
              <ArrowLeft className="h-4 w-4 mr-1" /> Wróć
            </Link>
          </Button>
        }
      />

      <div className="p-6 max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle>Szczegóły użytkownika</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <dt className="text-muted-foreground">Email</dt>
              <dd>{user.email}</dd>

              <dt className="text-muted-foreground">Imię</dt>
              <dd>{user.firstName ?? "—"}</dd>

              <dt className="text-muted-foreground">Nazwisko</dt>
              <dd>{user.lastName ?? "—"}</dd>

              <dt className="text-muted-foreground">Role</dt>
              <dd>
                <div className="flex flex-wrap gap-1">
                  {user.roles.map((r) => (
                    <Badge key={r} variant="outline">{r}</Badge>
                  ))}
                </div>
              </dd>

              <dt className="text-muted-foreground">Status</dt>
              <dd>
                <Badge variant={user.isActive ? "default" : "secondary"}>
                  {user.isActive ? "Aktywny" : "Nieaktywny"}
                </Badge>
              </dd>

              <dt className="text-muted-foreground">Data rejestracji</dt>
              <dd>{formatDate(user.createdAt)}</dd>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

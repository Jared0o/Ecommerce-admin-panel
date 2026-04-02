import { Link, useRouterState } from "@tanstack/react-router"
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tag,
  Sliders,
  Users,
  LogOut,
  ShoppingBag,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useLogout } from "@/features/auth/hooks/useAuth"
import { Button } from "@/components/ui/button"

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/products", label: "Produkty", icon: Package },
  { to: "/admin/categories", label: "Kategorie", icon: FolderTree },
  { to: "/admin/brands", label: "Marki", icon: Tag },
  { to: "/admin/attributes", label: "Atrybuty", icon: Sliders },
  { to: "/admin/users", label: "Użytkownicy", icon: Users },
]

export function Sidebar() {
  const logout = useLogout()
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  return (
    <aside className="flex h-screen w-60 flex-col border-r bg-card">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <ShoppingBag className="h-5 w-5 text-primary" />
        <span className="font-semibold text-sm">Admin Panel</span>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive =
              to === "/admin/dashboard"
                ? currentPath === to
                : currentPath.startsWith(to)
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      <Separator />
      <div className="p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground"
          onClick={() => logout()}
        >
          <LogOut className="h-4 w-4" />
          Wyloguj
        </Button>
      </div>
    </aside>
  )
}

import { Link } from "@tanstack/react-router"
import { Package, FolderTree, Tag, Sliders, Users } from "lucide-react"
import { PageHeader } from "@/components/layout/PageHeader"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const modules = [
  {
    to: "/admin/products",
    icon: Package,
    title: "Produkty",
    description: "Zarządzaj katalogiem produktów, wariantami i zdjęciami",
  },
  {
    to: "/admin/categories",
    icon: FolderTree,
    title: "Kategorie",
    description: "Struktura drzewa kategorii (max 3 poziomy)",
  },
  {
    to: "/admin/brands",
    icon: Tag,
    title: "Marki",
    description: "Zarządzaj markami produktów",
  },
  {
    to: "/admin/attributes",
    icon: Sliders,
    title: "Atrybuty",
    description: "Definicje atrybutów przypisywanych do kategorii",
  },
  {
    to: "/admin/users",
    icon: Users,
    title: "Użytkownicy",
    description: "Zarządzaj kontami i rolami użytkowników",
  },
]

export function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Witaj w panelu administracyjnym"
      />
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map(({ to, icon: Icon, title, description }) => (
            <Link key={to} to={to}>
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                <CardHeader>
                  <Icon className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-base">{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

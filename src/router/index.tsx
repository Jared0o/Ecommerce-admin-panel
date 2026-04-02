import {
  createRouter,
  createRoute,
  createRootRoute,
  redirect,
  Outlet,
} from "@tanstack/react-router"
import { getAccessToken } from "@/api/client"
import { AdminLayout } from "@/components/layout/AdminLayout"
import { LoginPage } from "@/features/auth/pages/LoginPage"
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage"
import { BrandsPage } from "@/features/brands/pages/BrandsPage"
import { AttributesPage } from "@/features/attributes/pages/AttributesPage"
import { CategoriesPage } from "@/features/categories/pages/CategoriesPage"
import { ProductsListPage } from "@/features/products/pages/ProductsListPage"
import { ProductFormPage } from "@/features/products/pages/ProductFormPage"
import { UsersPage } from "@/features/users/pages/UsersPage"
import { UserDetailPage } from "@/features/users/pages/UserDetailPage"

const rootRoute = createRootRoute({
  component: Outlet,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
})

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  beforeLoad: () => {
    if (!getAccessToken()) {
      throw redirect({ to: "/login" })
    }
  },
  component: AdminLayout,
})

const dashboardRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/dashboard",
  component: DashboardPage,
})

const productsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/products",
  component: ProductsListPage,
})

// IMPORTANT: /products/new must be declared BEFORE /products/$productId
const productsNewRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/products/new",
  component: () => <ProductFormPage />,
})

const productDetailRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/products/$productId",
  component: function ProductDetail() {
    const { productId } = productDetailRoute.useParams()
    return <ProductFormPage productId={productId} />
  },
})

const categoriesRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/categories",
  component: CategoriesPage,
})

const brandsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/brands",
  component: BrandsPage,
})

const attributesRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/attributes",
  component: AttributesPage,
})

const usersRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/users",
  component: UsersPage,
})

const userDetailRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/users/$userId",
  component: function UserDetail() {
    const { userId } = userDetailRoute.useParams()
    return <UserDetailPage userId={userId} />
  },
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: getAccessToken() ? "/admin/dashboard" : "/login" })
  },
  component: () => null,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  adminRoute.addChildren([
    dashboardRoute,
    productsRoute,
    productsNewRoute,
    productDetailRoute,
    categoriesRoute,
    brandsRoute,
    attributesRoute,
    usersRoute,
    userDetailRoute,
  ]),
])

export const router = createRouter({ routeTree })

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

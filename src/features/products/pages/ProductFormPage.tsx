import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { ProductGeneralForm, type ProductGeneralFormValues } from "../components/ProductGeneralForm"
import { ProductVariantsTab } from "../components/ProductVariantsTab"
import { ProductImagesTab } from "../components/ProductImagesTab"
import { ProductAttributesTab } from "../components/ProductAttributesTab"
import { ProductStatusActions } from "../components/ProductStatusActions"
import { useProduct } from "../hooks/useProducts"
import { useCreateProduct, useUpdateProduct } from "../hooks/useProductMutations"
import type { ApiError } from "@/api/client"

interface ProductFormPageProps {
  productId?: string
}

export function ProductFormPage({ productId }: ProductFormPageProps) {
  const navigate = useNavigate()
  const isEdit = !!productId

  const { data: product, isLoading } = useProduct(productId)
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()

  async function handleGeneralSubmit(values: ProductGeneralFormValues) {
    try {
      if (isEdit && product) {
        await updateProduct.mutateAsync({
          id: product.id,
          body: {
            name: values.name,
            slug: values.slug || null,
            description: values.description || null,
            shortDescription: values.shortDescription || null,
            mainCategoryId: values.mainCategoryId,
            brandId: values.brandId || null,
            isFeatured: values.isFeatured,
            tags: values.tags,
          },
        })
        toast.success("Produkt zaktualizowany")
      } else {
        const newId = await createProduct.mutateAsync({
          name: values.name,
          description: values.description || null,
          shortDescription: values.shortDescription || null,
          mainCategoryId: values.mainCategoryId,
          brandId: values.brandId || null,
          sku: values.sku || null,
          price: values.price ?? null,
          compareAtPrice: values.compareAtPrice ?? null,
          isFeatured: values.isFeatured,
          tags: values.tags,
        })
        toast.success("Produkt utworzony")
        navigate({ to: "/admin/products/$productId", params: { productId: newId } })
      }
    } catch (err: unknown) {
      const e = err as ApiError
      if (e?.type === "ValidationError" && e.errors) {
        toast.error("Błędy walidacji: " + e.errors.map(er => er.errorMessage).join(", "))
      } else {
        toast.error(e?.message ?? "Wystąpił błąd")
      }
    }
  }

  const isSubmitting = createProduct.isPending || updateProduct.isPending

  if (isEdit && isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div>
      <PageHeader
        title={isEdit ? (product?.name ?? "Edytuj produkt") : "Nowy produkt"}
        description={isEdit ? `Slug: ${product?.slug ?? ""}` : "Utwórz nowy produkt"}
        action={
          <div className="flex items-center gap-2">
            {isEdit && product && (
              <ProductStatusActions
                productId={product.id}
                currentStatus={product.status}
              />
            )}
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/products">
                <ArrowLeft className="h-4 w-4 mr-1" /> Wróć
              </Link>
            </Button>
          </div>
        }
      />

      <div className="p-6">
        {isEdit && product ? (
          <Tabs defaultValue="general">
            <TabsList className="mb-6">
              <TabsTrigger value="general">Ogólne</TabsTrigger>
              <TabsTrigger value="variants">
                Warianty ({product.variants.length})
              </TabsTrigger>
              <TabsTrigger value="images">
                Zdjęcia ({product.images.length})
              </TabsTrigger>
              <TabsTrigger value="attributes">
                Atrybuty ({product.attributes.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <div className="max-w-2xl">
                <ProductGeneralForm
                  key={product.id}
                  product={product}
                  onSubmit={handleGeneralSubmit}
                  isLoading={isSubmitting}
                />
              </div>
            </TabsContent>

            <TabsContent value="variants">
              <ProductVariantsTab product={product} />
            </TabsContent>

            <TabsContent value="images">
              <ProductImagesTab product={product} />
            </TabsContent>

            <TabsContent value="attributes">
              <ProductAttributesTab product={product} />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="max-w-2xl">
            <ProductGeneralForm
              onSubmit={handleGeneralSubmit}
              isLoading={isSubmitting}
            />
          </div>
        )}
      </div>
    </div>
  )
}

import { useState } from "react"
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import {
  useAddProductImage,
  useDeleteProductImage,
  useReorderProductImages,
} from "../hooks/useProductMutations"
import type { ProductDto, ProductImageDto } from "@/api/catalog/products"
import type { ApiError } from "@/api/client"

const addImageSchema = z.object({
  url: z.string().url("Podaj poprawny URL"),
  altText: z.string().optional(),
  variantId: z.string().optional(),
})

type AddImageValues = z.infer<typeof addImageSchema>

interface ProductImagesTabProps {
  product: ProductDto
}

export function ProductImagesTab({ product }: ProductImagesTabProps) {
  const [deletingImage, setDeletingImage] = useState<ProductImageDto | null>(
    null
  )

  const addImage = useAddProductImage()
  const deleteImage = useDeleteProductImage()
  const reorderImages = useReorderProductImages()

  const form = useForm<AddImageValues>({
    resolver: zodResolver(addImageSchema),
    defaultValues: { url: "", altText: "", variantId: "" },
  })

  const sorted = [...product.images].sort((a, b) => a.sortOrder - b.sortOrder)

  async function handleAddImage(values: AddImageValues) {
    try {
      await addImage.mutateAsync({
        productId: product.id,
        body: {
          url: values.url,
          altText: values.altText || null,
          variantId: values.variantId || null,
          sortOrder: product.images.length,
        },
      })
      toast.success("Zdjęcie dodane")
      form.reset()
    } catch (err: unknown) {
      const e = err as ApiError
      toast.error(e?.message ?? "Nie można dodać zdjęcia")
    }
  }

  async function handleDelete() {
    if (!deletingImage) return
    try {
      await deleteImage.mutateAsync({
        productId: product.id,
        imageId: deletingImage.id,
      })
      toast.success("Zdjęcie usunięte")
      setDeletingImage(null)
    } catch (err: unknown) {
      const e = err as ApiError
      toast.error(e?.message ?? "Nie można usunąć zdjęcia")
      setDeletingImage(null)
    }
  }

  async function moveImage(index: number, direction: -1 | 1) {
    const newSorted = [...sorted]
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= newSorted.length) return

    const entries = newSorted.map((img, i) => {
      if (i === index) return { imageId: img.id, sortOrder: targetIndex }
      if (i === targetIndex) return { imageId: img.id, sortOrder: index }
      return { imageId: img.id, sortOrder: i }
    })

    try {
      await reorderImages.mutateAsync({ productId: product.id, body: { entries } })
    } catch (err: unknown) {
      const e = err as ApiError
      toast.error(e?.message ?? "Nie można zmienić kolejności")
    }
  }

  return (
    <div className="space-y-6">
      {/* Add image form */}
      <div className="rounded-md border bg-card p-4">
        <h3 className="text-sm font-medium mb-3">Dodaj zdjęcie</h3>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleAddImage)}
            className="space-y-3"
          >
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL zdjęcia *</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="altText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alt text</FormLabel>
                    <FormControl>
                      <Input placeholder="Opis zdjęcia" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {product.variants.length > 0 && (
                <FormField
                  control={form.control}
                  name="variantId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wariant (opcjonalnie)</FormLabel>
                      <Select
                        onValueChange={(v) => field.onChange(v === "none" ? "" : v)}
                        value={field.value || "none"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Globalne" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Globalne</SelectItem>
                          {product.variants.map((v) => (
                            <SelectItem key={v.id} value={v.id}>
                              {v.sku}
                              {v.name ? ` — ${v.name}` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={addImage.isPending}
            >
              <Plus className="h-4 w-4 mr-1" />
              {addImage.isPending ? "Dodawanie..." : "Dodaj"}
            </Button>
          </form>
        </Form>
      </div>

      {/* Image list */}
      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          Brak zdjęć
        </p>
      ) : (
        <div className="space-y-2">
          {sorted.map((img, index) => (
            <div
              key={img.id}
              className="flex items-center gap-3 rounded-md border bg-card px-3 py-2"
            >
              <img
                src={img.url}
                alt={img.altText ?? ""}
                className="h-12 w-12 rounded object-cover"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect width='48' height='48' fill='%23f1f5f9'/%3E%3C/svg%3E"
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground truncate">
                  {img.url}
                </p>
                {img.altText && (
                  <p className="text-xs">{img.altText}</p>
                )}
                {img.variantId && (
                  <p className="text-xs text-muted-foreground">
                    Wariant:{" "}
                    {
                      product.variants.find((v) => v.id === img.variantId)
                        ?.sku
                    }
                  </p>
                )}
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => moveImage(index, -1)}
                  disabled={index === 0 || reorderImages.isPending}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => moveImage(index, 1)}
                  disabled={index === sorted.length - 1 || reorderImages.isPending}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeletingImage(img)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deletingImage}
        onOpenChange={(open) => !open && setDeletingImage(null)}
        title="Usuń zdjęcie"
        description="Usunąć to zdjęcie?"
        onConfirm={handleDelete}
        loading={deleteImage.isPending}
      />
    </div>
  )
}

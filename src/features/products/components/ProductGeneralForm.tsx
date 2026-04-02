import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState } from "react"
import { X } from "lucide-react"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCategories } from "@/features/categories/hooks/useCategories"
import { useAllBrands } from "@/features/brands/hooks/useBrands"
import type { ProductDto } from "@/api/catalog/products"
import type { CategoryDto } from "@/api/catalog/categories"

const productSchema = z.object({
  name: z.string().min(1, "Nazwa jest wymagana").max(300),
  slug: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  shortDescription: z.string().nullable().optional(),
  mainCategoryId: z.string().min(1, "Kategoria jest wymagana"),
  brandId: z.string().nullable().optional(),
  price: z.coerce.number().positive("Cena musi być większa od 0").nullable().optional(),
  compareAtPrice: z.coerce.number().positive().nullable().optional(),
  isFeatured: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
})

export type ProductGeneralFormValues = z.infer<typeof productSchema>

interface ProductGeneralFormProps {
  product?: ProductDto
  onSubmit: (values: ProductGeneralFormValues) => Promise<void>
  isLoading?: boolean
}

export function ProductGeneralForm({
  product,
  onSubmit,
  isLoading,
}: ProductGeneralFormProps) {
  const { data: categories } = useCategories()
  const { data: brands } = useAllBrands()
  const [tagInput, setTagInput] = useState("")

  const hasVariants = (product?.variants?.length ?? 0) > 0

  const flatCategories: { id: string; name: string; level: number }[] = []
  function flatten(nodes: CategoryDto[] | undefined) {
    nodes?.forEach((n) => {
      flatCategories.push({ id: n.id, name: n.name, level: n.level })
      if (n.children.length) flatten(n.children)
    })
  }
  flatten(categories)

  const form = useForm<ProductGeneralFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? "",
      slug: product?.slug ?? "",
      description: product?.description ?? "",
      shortDescription: product?.shortDescription ?? "",
      mainCategoryId: product?.mainCategoryId ?? "",
      brandId: product?.brandId ?? "",
      price: product?.price ?? undefined,
      compareAtPrice: product?.compareAtPrice ?? undefined,
      isFeatured: product?.isFeatured ?? false,
      tags: product?.tags ?? [],
    },
  })

  const tags = form.watch("tags")

  function addTag() {
    const t = tagInput.trim().toLowerCase()
    if (t && !tags.includes(t)) {
      form.setValue("tags", [...tags, t])
    }
    setTagInput("")
  }

  function removeTag(tag: string) {
    form.setValue("tags", tags.filter((t) => t !== tag))
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nazwa *</FormLabel>
              <FormControl>
                <Input placeholder="Nazwa produktu" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {product && (
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input
                    placeholder="nazwa-produktu"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="mainCategoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Główna kategoria *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz kategorię" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {flatCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        <span style={{ paddingLeft: `${(c.level - 1) * 12}px` }}>
                          {c.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="brandId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marka</FormLabel>
                <Select
                  onValueChange={(v) => field.onChange(v === "none" ? "" : v)}
                  value={field.value || "none"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Brak marki" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Brak</SelectItem>
                    {brands?.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {!hasVariants && (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cena (PLN)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? null : Number(e.target.value)
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="compareAtPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cena przekreślona (PLN)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? null : Number(e.target.value)
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {hasVariants && (
          <div className="rounded-md border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            Cena jest zarządzana na poziomie wariantów
          </div>
        )}

        <FormField
          control={form.control}
          name="shortDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Krótki opis</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Krótki opis produktu..."
                  rows={2}
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Opis</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Pełny opis produktu..."
                  rows={5}
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isFeatured"
          render={({ field }) => (
            <FormItem className="flex items-center gap-3">
              <FormLabel className="mt-0">Wyróżniony</FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Tags */}
        <div className="space-y-2">
          <Label>Tagi</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Dodaj tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addTag()
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addTag}>
              Dodaj
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Zapisywanie..." : product ? "Zaktualizuj" : "Utwórz produkt"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

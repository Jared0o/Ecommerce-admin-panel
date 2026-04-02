import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, Trash2 } from "lucide-react"
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
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import type { ProductVariantDto } from "@/api/catalog/products"

const variantSchema = z.object({
  sku: z.string().min(1, "SKU jest wymagane"),
  name: z.string().nullable().optional(),
  price: z.coerce.number().positive("Cena musi być większa od 0"),
  compareAtPrice: z.coerce.number().positive().nullable().optional(),
  isDefault: z.boolean().default(false),
  attributes: z
    .array(z.object({ key: z.string().min(1), value: z.string().min(1) }))
    .default([]),
})

export type VariantFormValues = z.infer<typeof variantSchema>

interface VariantFormProps {
  defaultValues?: Partial<ProductVariantDto>
  onSubmit: (values: VariantFormValues) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  forceDefault?: boolean
}

export function VariantForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading,
  forceDefault = false,
}: VariantFormProps) {
  const form = useForm<VariantFormValues>({
    resolver: zodResolver(variantSchema),
    defaultValues: {
      sku: defaultValues?.sku ?? "",
      name: defaultValues?.name ?? "",
      price: defaultValues?.price ?? (undefined as unknown as number),
      compareAtPrice: defaultValues?.compareAtPrice ?? undefined,
      isDefault: forceDefault || (defaultValues?.isDefault ?? false),
      attributes: defaultValues?.attributes ?? [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "attributes",
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU *</FormLabel>
                <FormControl>
                  <Input placeholder="PROD-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nazwa wariantu</FormLabel>
                <FormControl>
                  <Input
                    placeholder="np. Czerwony L"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cena (PLN) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
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
            name="compareAtPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cena przekreślona</FormLabel>
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

        {!forceDefault && (
          <FormField
            control={form.control}
            name="isDefault"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3">
                <FormLabel className="mt-0">Domyślny wariant</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        {/* Attributes */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Atrybuty wariantu</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ key: "", value: "" })}
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Dodaj
            </Button>
          </div>
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <FormField
                control={form.control}
                name={`attributes.${index}.key`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder="Klucz (np. Kolor)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`attributes.${index}.value`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder="Wartość (np. Czerwony)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Anuluj
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Zapisywanie..." : "Zapisz wariant"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

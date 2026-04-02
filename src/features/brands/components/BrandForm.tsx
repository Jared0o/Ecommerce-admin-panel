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
import { Switch } from "@/components/ui/switch"
import type { BrandDto } from "@/api/catalog/brands"

const brandSchema = z.object({
  name: z.string().min(1, "Nazwa jest wymagana").max(200),
  logoUrl: z.string().url("Podaj poprawny URL").or(z.literal("")).nullable().optional(),
  isActive: z.boolean().optional(),
})

export type BrandFormValues = z.infer<typeof brandSchema>

interface BrandFormProps {
  defaultValues?: Partial<BrandDto>
  isEdit?: boolean
  onSubmit: (values: BrandFormValues) => Promise<void>
  isLoading?: boolean
}

export function BrandForm({
  defaultValues,
  isEdit = false,
  onSubmit,
  isLoading,
}: BrandFormProps) {
  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      logoUrl: defaultValues?.logoUrl ?? "",
      isActive: defaultValues?.isActive ?? true,
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nazwa</FormLabel>
              <FormControl>
                <Input placeholder="Nike" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="logoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL logo</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://..."
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {isEdit && (
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3">
                <FormLabel className="mt-0">Aktywna</FormLabel>
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
        <div className="flex justify-end gap-2 pt-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Zapisywanie..." : isEdit ? "Zaktualizuj" : "Utwórz"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

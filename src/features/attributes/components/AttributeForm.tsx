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
import type { AttributeDefinitionDto } from "@/api/catalog/attributes"

const attributeSchema = z.object({
  name: z.string().min(1, "Nazwa jest wymagana").max(200),
  sortOrder: z.coerce.number().int().min(0).default(0),
})

export type AttributeFormValues = z.infer<typeof attributeSchema>

interface AttributeFormProps {
  defaultValues?: Partial<AttributeDefinitionDto>
  onSubmit: (values: AttributeFormValues) => Promise<void>
  isLoading?: boolean
  isEdit?: boolean
}

export function AttributeForm({
  defaultValues,
  onSubmit,
  isLoading,
  isEdit = false,
}: AttributeFormProps) {
  const form = useForm<AttributeFormValues>({
    resolver: zodResolver(attributeSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      sortOrder: defaultValues?.sortOrder ?? 0,
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
                <Input placeholder="Materiał" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="sortOrder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kolejność sortowania</FormLabel>
              <FormControl>
                <Input type="number" min={0} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Zapisywanie..." : isEdit ? "Zaktualizuj" : "Utwórz"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

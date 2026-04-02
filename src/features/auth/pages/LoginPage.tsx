import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ShoppingBag } from "lucide-react"
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useLogin } from "@/features/auth/hooks/useAuth"
import type { ApiError } from "@/api/client"
import { toast } from "sonner"

const loginSchema = z.object({
  email: z.string().email("Podaj poprawny adres email"),
  password: z.string().min(1, "Hasło jest wymagane"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const login = useLogin()
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(data: LoginFormValues) {
    try {
      await login.mutateAsync(data)
    } catch (err: unknown) {
      const e = err as ApiError
      if (e?.type === "ValidationError" && e.errors) {
        e.errors.forEach(({ propertyName, errorMessage }) =>
          form.setError(propertyName as keyof LoginFormValues, {
            message: errorMessage,
          })
        )
      } else {
        toast.error(e?.message ?? "Błąd logowania")
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <ShoppingBag className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Admin Panel</CardTitle>
          <CardDescription>Zaloguj się do panelu administracyjnego</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="admin@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hasło</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={login.isPending}>
                {login.isPending ? "Logowanie..." : "Zaloguj się"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

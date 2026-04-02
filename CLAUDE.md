# CLAUDE.md — Ecommerce Admin Panel (Frontend)

Kontekst backendu: `.claude/api-context.md`

---

## Stack

| Warstwa      | Biblioteka                               |
| ------------ | ---------------------------------------- |
| Framework    | React 19 + TypeScript + Vite             |
| Routing      | TanStack Router v1 (file-based)          |
| Server state | TanStack Query v5                        |
| Formularze   | React Hook Form + Zod                    |
| UI           | shadcn/ui (Radix + Tailwind CSS v4)      |
| HTTP         | axios (jedna instancja z interceptorami) |
| Ikony        | lucide-react                             |

---

## Struktura projektu

```
src/
  api/
    client.ts           ← axios instance + interceptory (auth, refresh, błędy)
    catalog/
      products.ts       ← typy + funkcje API dla produktów
      categories.ts
      brands.ts
      attributes.ts
    users/
      users.ts
    auth/
      auth.ts
  components/           ← współdzielone komponenty UI
    ui/                 ← shadcn/ui (generowane, nie edytować ręcznie)
    layout/
      AdminLayout.tsx
      Sidebar.tsx
  features/             ← moduły funkcjonalne
    products/
      components/
      hooks/            ← useProducts, useCreateProduct, itd.
      pages/
        ProductsListPage.tsx
        ProductDetailPage.tsx
        ProductFormPage.tsx
    categories/
    brands/
    attributes/
    users/
    auth/
  lib/
    utils.ts            ← cn(), formatPrice(), formatDate()
    validators.ts       ← wspólne schematy Zod
  router/
    index.tsx           ← definicja drzewa routingu
  main.tsx
```

---

## Konwencje

### Pliki API (`src/api/`)

Każdy plik eksportuje:

1. Typy TypeScript (zgodne z DTO backendu)
2. Funkcje async zwracające dane (nie React Query hooks)

```typescript
// src/api/catalog/products.ts
export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  status: "Draft" | "Active" | "Inactive" | "Archived";
  price: number | null;
  isFeatured: boolean;
  tags: string[];
  createdAt: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getProducts(
  params: GetProductsParams,
): Promise<PagedResult<ProductListItem>> {
  const { data } = await apiClient.get("/admin/catalog/products", { params });
  return data;
}
```

### Hooki TanStack Query (`features/*/hooks/`)

```typescript
// features/products/hooks/useProducts.ts
export function useProducts(params: GetProductsParams) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => getProducts(params),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
```

### Formularze (React Hook Form + Zod)

```typescript
const schema = z.object({
  name: z.string().min(1).max(300),
  price: z.number().positive().nullable(),
  // ...
});

function ProductForm() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });
  // ...
}
```

### Obsługa błędów API

Backend zawsze zwraca błędy w formacie `{ type, message, errors? }`.
Interceptor axios mapuje to na ustandaryzowany wyjątek:

```typescript
// src/api/client.ts — interceptor odpowiedzi
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const apiError = error.response?.data;
    // apiError.type, apiError.message, apiError.errors[]
    return Promise.reject(apiError ?? error);
  },
);
```

W komponentach:

```typescript
const mutation = useCreateProduct();

async function onSubmit(data) {
  try {
    await mutation.mutateAsync(data);
    toast.success("Produkt utworzony");
  } catch (err) {
    if (err.type === "ValidationError") {
      err.errors.forEach((e) =>
        form.setError(e.propertyName, { message: e.errorMessage }),
      );
    } else {
      toast.error(err.message);
    }
  }
}
```

---

## Autentykacja

- Access token: przechowywany w **pamięci** (zmienna modułu w `client.ts`)
- Refresh token: przechowywany w **localStorage** (lub httpOnly cookie jeśli SSR)
- Interceptor axios: przy 401 → próba odświeżenia → ponów żądanie
- Przy starcie aplikacji: sprawdź localStorage na refresh token → odśwież → inicjalizuj stan auth

```typescript
// src/api/client.ts
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

apiClient.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});
```

---

## Routing (TanStack Router)

Struktura routingu odzwierciedla sekcje admina:

```
/login
/admin
  /admin/dashboard
  /admin/products
  /admin/products/$productId
  /admin/products/new
  /admin/categories
  /admin/brands
  /admin/attributes
  /admin/users
```

Guard autoryzacji na layoucie `/admin` — przekierowanie do `/login` jeśli brak tokenu.

---

## Zmienne środowiskowe

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Polecenia

```bash
npm run dev          # dev server
npm run build        # produkcja
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
```

---

## Non-negotiable rules

- **Nigdy nie edytuj plików w `src/components/ui/`** — generowane przez shadcn CLI
- **Typy API trzymaj blisko funkcji API**, nie rozrzucaj po całym projekcie
- **Każda mutacja invaliduje odpowiedni queryKey**
- **Zod schema = single source of truth** dla walidacji formularzy
- Nie używaj `any` — jeśli typ jest nieznany, użyj `unknown` i zawęź

# CLAUDE.md — Ecommerce Admin Panel (Frontend)

Kontekst backendu: `.claude/api-context.md`

---

## Stack

| Warstwa      | Biblioteka                               |
| ------------ | ---------------------------------------- |
| Framework    | React 19 + TypeScript + Vite             |
| Routing      | TanStack Router v1 (file-based)          |
| Server state | TanStack Query v5                        |
| Formularze   | React Hook Form + Zod                    |
| UI           | shadcn/ui (Radix + Tailwind CSS v4)      |
| HTTP         | axios (jedna instancja z interceptorami) |
| Ikony        | lucide-react                             |

---

## Struktura projektu

```
src/
  api/
    client.ts           ← axios instance + interceptory (auth, refresh, błędy)
    catalog/
      products.ts       ← typy + funkcje API dla produktów
      categories.ts
      brands.ts
      attributes.ts
    users/
      users.ts
    auth/
      auth.ts
  components/           ← współdzielone komponenty UI
    ui/                 ← shadcn/ui (generowane, nie edytować ręcznie)
    layout/
      AdminLayout.tsx
      Sidebar.tsx
  features/             ← moduły funkcjonalne
    products/
      components/
      hooks/            ← useProducts, useCreateProduct, itd.
      pages/
        ProductsListPage.tsx
        ProductDetailPage.tsx
        ProductFormPage.tsx
    categories/
    brands/
    attributes/
    users/
    auth/
  lib/
    utils.ts            ← cn(), formatPrice(), formatDate()
    validators.ts       ← wspólne schematy Zod
  router/
    index.tsx           ← definicja drzewa routingu
  main.tsx
```

---

## Konwencje

### Pliki API (`src/api/`)

Każdy plik eksportuje:

1. Typy TypeScript (zgodne z DTO backendu)
2. Funkcje async zwracające dane (nie React Query hooks)

```typescript
// src/api/catalog/products.ts
export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  status: "Draft" | "Active" | "Inactive" | "Archived";
  price: number | null;
  isFeatured: boolean;
  tags: string[];
  createdAt: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getProducts(
  params: GetProductsParams,
): Promise<PagedResult<ProductListItem>> {
  const { data } = await apiClient.get("/admin/catalog/products", { params });
  return data;
}
```

### Hooki TanStack Query (`features/*/hooks/`)

```typescript
// features/products/hooks/useProducts.ts
export function useProducts(params: GetProductsParams) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => getProducts(params),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
```

### Formularze (React Hook Form + Zod)

```typescript
const schema = z.object({
  name: z.string().min(1).max(300),
  price: z.number().positive().nullable(),
  // ...
});

function ProductForm() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });
  // ...
}
```

### Obsługa błędów API

Backend zawsze zwraca błędy w formacie `{ type, message, errors? }`.
Interceptor axios mapuje to na ustandaryzowany wyjątek:

```typescript
// src/api/client.ts — interceptor odpowiedzi
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const apiError = error.response?.data;
    // apiError.type, apiError.message, apiError.errors[]
    return Promise.reject(apiError ?? error);
  },
);
```

W komponentach:

```typescript
const mutation = useCreateProduct();

async function onSubmit(data) {
  try {
    await mutation.mutateAsync(data);
    toast.success("Produkt utworzony");
  } catch (err) {
    if (err.type === "ValidationError") {
      err.errors.forEach((e) =>
        form.setError(e.propertyName, { message: e.errorMessage }),
      );
    } else {
      toast.error(err.message);
    }
  }
}
```

---

## Autentykacja

- Access token: przechowywany w **pamięci** (zmienna modułu w `client.ts`)
- Refresh token: przechowywany w **localStorage** (lub httpOnly cookie jeśli SSR)
- Interceptor axios: przy 401 → próba odświeżenia → ponów żądanie
- Przy starcie aplikacji: sprawdź localStorage na refresh token → odśwież → inicjalizuj stan auth

```typescript
// src/api/client.ts
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

apiClient.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});
```

---

## Routing (TanStack Router)

Struktura routingu odzwierciedla sekcje admina:

```
/login
/admin
  /admin/dashboard
  /admin/products
  /admin/products/$productId
  /admin/products/new
  /admin/categories
  /admin/brands
  /admin/attributes
  /admin/users
```

Guard autoryzacji na layoucie `/admin` — przekierowanie do `/login` jeśli brak tokenu.

---

## Zmienne środowiskowe

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Polecenia

```bash
npm run dev          # dev server
npm run build        # produkcja
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
```

---

## Non-negotiable rules

- **Nigdy nie edytuj plików w `src/components/ui/`** — generowane przez shadcn CLI
- **Typy API trzymaj blisko funkcji API**, nie rozrzucaj po całym projekcie
- **Każda mutacja invaliduje odpowiedni queryKey**
- **Zod schema = single source of truth** dla walidacji formularzy
- Nie używaj `any` — jeśli typ jest nieznany, użyj `unknown` i zawęź

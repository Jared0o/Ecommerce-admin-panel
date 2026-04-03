# API Context — Ecommerce Backend

Backend: .NET 10 Modular Monolith  
Base URL: `http://localhost:5000/api`  
Docs (Scalar UI): `http://localhost:5000/scalar`  
OpenAPI JSON: `https://localhost:7116/openapi/v1.json`

---

## Autentykacja

### Flow

```
POST /auth/register               → rejestracja
POST /auth/login                  → { accessToken, refreshToken, expiresAt }
POST /auth/refresh                → { accessToken, refreshToken, expiresAt }  (body: { token })
POST /auth/revoke                 → wylogowanie (body: { token })
POST /auth/password/reset-request → wyślij email z linkiem resetu
POST /auth/password/reset         → zresetuj hasło tokenem
POST /auth/password/change        → zmień hasło (wymaga JWT)
```

### Token

- **Access token**: JWT Bearer, wygasa po **15 minut**
- **Refresh token**: wygasa po **7 dni**
- Nagłówek: `Authorization: Bearer <accessToken>`
- Role: `"Admin"`, `"Moderator"`, `"User"`

**Odpowiedź logowania/odświeżenia (`TokenDto`):**

```typescript
interface TokenDto {
  accessToken: string;
  refreshToken: string;
  expiresAt: string; // ISO 8601 DateTimeOffset — moment wygaśnięcia refresh tokenu
}
```

### Dekodowany payload JWT

```json
{
  "sub": "guid użytkownika",
  "email": "user@example.com",
  "role": ["Admin"],
  "exp": 1234567890
}
```

---

## Format błędów

Wszystkie błędy mają spójny format:

```json
// Błąd domenowy (400)
{ "type": "ProductNotFoundError", "message": "Product with id ... was not found." }

// Błąd autoryzacji (401) — teraz zwraca body (wcześniej puste)
{ "type": "InvalidCredentialsError", "message": "Invalid email or password." }

// Błąd walidacji (400)
{
  "type": "ValidationError",
  "message": "Validation failed.",
  "errors": [
    { "propertyName": "Name", "errorMessage": "Name is required." },
    { "propertyName": "Price", "errorMessage": "Price must be greater than 0." }
  ]
}

// Nie znaleziono (404)
{ "type": "CategoryNotFoundError", "message": "..." }
```

**Kody HTTP:**

- `200` — OK (GET)
- `201` — Created (POST), body = Guid nowego zasobu
- `204` — NoContent (PUT, DELETE, PATCH)
- `400` — Bad Request (walidacja, błędy domenowe)
- `401` — Unauthorized
- `403` — Forbidden (brak roli)
- `404` — Not Found

---

## Paginacja

Parametry query: `?page=1&pageSize=20`

Odpowiedź:

```json
{
  "items": [...],
  "totalCount": 42,
  "page": 1,
  "pageSize": 20,
  "totalPages": 3
}
```

---

## Endpointy

### Auth — `/auth`

| Method | Path                           | Auth | Opis                              |
| ------ | ------------------------------ | ---- | --------------------------------- |
| POST   | `/auth/register`               | ❌   | Rejestracja                       |
| POST   | `/auth/login`                  | ❌   | Logowanie → tokeny                |
| POST   | `/auth/refresh`                | ❌   | Odśwież token (body: `{ token }`) |
| POST   | `/auth/revoke`                 | ✅   | Wyloguj (body: `{ token }`)       |
| POST   | `/auth/password/reset-request` | ❌   | Wyślij link reset hasła           |
| POST   | `/auth/password/reset`         | ❌   | Zresetuj hasło tokenem            |
| POST   | `/auth/password/change`        | ✅   | Zmień hasło                       |

### Profil użytkownika — `/users`

| Method | Path                               | Auth | Opis                      |
| ------ | ---------------------------------- | ---- | ------------------------- |
| GET    | `/users/me`                        | ✅   | Pobierz profil            |
| PUT    | `/users/me`                        | ✅   | Zaktualizuj profil        |
| GET    | `/users/me/addresses`              | ✅   | Lista adresów             |
| POST   | `/users/me/addresses`              | ✅   | Dodaj adres               |
| PUT    | `/users/me/addresses/{id}`         | ✅   | Zaktualizuj adres         |
| DELETE | `/users/me/addresses/{id}`         | ✅   | Usuń adres                |
| PATCH  | `/users/me/addresses/{id}/default` | ✅   | Ustaw adres jako domyślny |

**PUT `/users/me`** — body:

```json
{
  "firstName": "string",
  "lastName": "string",
  "phoneNumber": "string | null",
  "avatarUrl": "string | null"
}
```

**POST/PUT `/users/me/addresses`** — body:

```json
{
  "label": "string",
  "street": "string",
  "buildingNumber": "string",
  "apartmentNumber": "string | null",
  "city": "string",
  "postalCode": "string",
  "country": "string"
}
```

### Admin — Użytkownicy — `/admin/users`

| Method | Path                                       | Rola            | Opis                          |
| ------ | ------------------------------------------ | --------------- | ----------------------------- |
| GET    | `/admin/users?page&pageSize&role&isActive` | Admin/Moderator | Lista użytkowników            |
| GET    | `/admin/users/{id}`                        | Admin/Moderator | Szczegóły użytkownika         |
| PUT    | `/admin/users/{id}`                        | Admin/Moderator | Aktualizuj profil użytkownika |
| POST   | `/admin/users/{id}/roles`                  | Admin           | Przypisz rolę                 |
| DELETE | `/admin/users/{id}/roles/{role}`           | Admin           | Usuń rolę                     |
| POST   | `/admin/users/{id}/deactivate`             | Admin/Moderator | Dezaktywuj konto              |

**PUT `/admin/users/{id}`** — body:

```json
{
  "firstName": "string",
  "lastName": "string",
  "phoneNumber": "string | null",
  "avatarUrl": "string | null"
}
```

**POST `/admin/users/{id}/roles`** — body:

```json
{ "role": "User | Moderator | Admin" }
```

### Admin — Produkty — `/admin/catalog/products`

Wszystkie endpointy wymagają roli `Admin`.

| Method | Path                                                   | Opis                                | Response                          |
| ------ | ------------------------------------------------------ | ----------------------------------- | --------------------------------- |
| GET    | `/?page&pageSize&categoryId&brandId&minPrice&maxPrice` | Lista (wszystkie statusy)           | `PagedResult<ProductListItemDto>` |
| GET    | `/{id}`                                                | Szczegóły                           | `ProductDto`                      |
| POST   | `/`                                                    | Utwórz                              | `201` + Guid                      |
| PUT    | `/{id}`                                                | Aktualizuj                          | `204`                             |
| PATCH  | `/{id}/status`                                         | Zmień status                        | `204`                             |
| POST   | `/{id}/categories`                                     | Dodaj kategorię do produktu         | `204`                             |
| DELETE | `/{id}/categories/{categoryId}`                        | Usuń kategorię z produktu           | `204`                             |
| PUT    | `/{id}/attributes`                                     | Ustaw atrybuty (upsert całej listy) | `204`                             |
| POST   | `/{id}/variants`                                       | Dodaj wariant                       | `201` + Guid                      |
| PUT    | `/{id}/variants/{variantId}`                           | Aktualizuj wariant                  | `204`                             |
| DELETE | `/{id}/variants/{variantId}`                           | Usuń wariant                        | `204`                             |
| POST   | `/{id}/images`                                         | Dodaj zdjęcie                       | `201` + Guid                      |
| DELETE | `/{id}/images/{imageId}`                               | Usuń zdjęcie                        | `204`                             |
| PATCH  | `/{id}/images/reorder`                                 | Zmień kolejność zdjęć               | `204`                             |

**POST `/admin/catalog/products`** — body:

```json
{
  "name": "string",
  "description": "string | null",
  "shortDescription": "string | null",
  "mainCategoryId": "guid",
  "brandId": "guid | null",
  "sku": "string | null", // SKU domyślnego wariantu; jeśli null → fallback: slug produktu
  "price": "decimal | null", // jeśli podano → backend tworzy domyślny wariant z tą ceną
  "compareAtPrice": "decimal | null",
  "isFeatured": false,
  "tags": ["string"],
  "additionalCategoryIds": ["guid"]
}
```

**PUT `/admin/catalog/products/{id}`** — body:

```json
{
  "name": "string",
  "slug": "string | null",
  "description": "string | null",
  "shortDescription": "string | null",
  "mainCategoryId": "guid",
  "brandId": "guid | null",
  "isFeatured": false,
  "tags": ["string"]
}
```

> Cena nie jest edytowalna przez ten endpoint — zmiana ceny idzie przez `PUT /{id}/variants/{variantId}`.

**PATCH `/admin/catalog/products/{id}/status`** — body:

```json
{ "newStatus": "Draft | Active | Inactive | Archived" }
```

**POST `/admin/catalog/products/{id}/categories`** — body:

```json
{ "categoryId": "guid" }
```

**PUT `/admin/catalog/products/{id}/attributes`** — body (zastępuje całą listę):

```json
{
  "attributes": [{ "attributeDefinitionId": "guid", "value": "string" }]
}
```

**POST `/admin/catalog/products/{id}/variants`** — body:

```json
{
  "sku": "string",
  "name": "string | null",
  "price": 0.0,
  "compareAtPrice": "decimal | null",
  "isDefault": false,
  "attributes": [{ "key": "string", "value": "string" }]
}
```

**PUT `/admin/catalog/products/{id}/variants/{variantId}`** — body: identyczne jak POST variants.

**POST `/admin/catalog/products/{id}/images`** — body:

```json
{
  "variantId": "guid | null",
  "url": "string",
  "altText": "string | null",
  "sortOrder": 0
}
```

**PATCH `/admin/catalog/products/{id}/images/reorder`** — body:

```json
{
  "entries": [{ "imageId": "guid", "sortOrder": 0 }]
}
```

---

### Admin — Kategorie — `/admin/catalog/categories`

Wszystkie endpointy wymagają roli `Admin`.

| Method | Path                             | Opis                          | Response        |
| ------ | -------------------------------- | ----------------------------- | --------------- |
| GET    | `/`                              | Drzewo kategorii              | `CategoryDto[]` |
| POST   | `/`                              | Utwórz                        | `201` + Guid    |
| PUT    | `/{id}`                          | Aktualizuj                    | `204`           |
| DELETE | `/{id}`                          | Usuń                          | `204`           |
| POST   | `/{id}/attributes/{attributeId}` | Przypisz atrybut do kategorii | `204`           |
| DELETE | `/{id}/attributes/{attributeId}` | Usuń atrybut z kategorii      | `204`           |

**POST `/admin/catalog/categories`** — body:

```json
{
  "name": "string",
  "parentId": "guid | null",
  "description": "string | null",
  "imageUrl": "string | null",
  "sortOrder": 0
}
```

**PUT `/admin/catalog/categories/{id}`** — body:

```json
{
  "name": "string",
  "slug": "string | null",
  "description": "string | null",
  "imageUrl": "string | null",
  "sortOrder": 0,
  "isActive": true
}
```

---

### Admin — Marki — `/admin/catalog/brands`

Wszystkie endpointy wymagają roli `Admin`.

| Method | Path              | Opis       | Response                |
| ------ | ----------------- | ---------- | ----------------------- |
| GET    | `/?page&pageSize` | Lista      | `PagedResult<BrandDto>` |
| POST   | `/`               | Utwórz     | `201` + Guid            |
| PUT    | `/{id}`           | Aktualizuj | `204`                   |
| DELETE | `/{id}`           | Usuń       | `204`                   |

**POST `/admin/catalog/brands`** — body:

```json
{ "name": "string", "logoUrl": "string | null" }
```

**PUT `/admin/catalog/brands/{id}`** — body:

```json
{
  "name": "string",
  "slug": "string | null",
  "logoUrl": "string | null",
  "isActive": true
}
```

---

### Admin — Definicje atrybutów — `/admin/catalog/attributes`

Wszystkie endpointy wymagają roli `Admin`.

| Method | Path                  | Opis                               | Response                              |
| ------ | --------------------- | ---------------------------------- | ------------------------------------- |
| GET    | `/?page&pageSize`     | Lista paginowana                   | `PagedResult<AttributeDefinitionDto>` |
| GET    | `/?categoryId={guid}` | Filtr po kategorii (bez paginacji) | `AttributeDefinitionDto[]`            |
| POST   | `/`                   | Utwórz                             | `201` + Guid                          |
| PUT    | `/{id}`               | Aktualizuj                         | `204`                                 |
| DELETE | `/{id}`               | Usuń                               | `204`                                 |

> Uwaga: `?categoryId` i `?page&pageSize` to wzajemnie wykluczające się tryby tego samego endpointu GET.

**POST `/admin/catalog/attributes`** — body:

```json
{ "name": "string", "sortOrder": 0 }
```

**PUT `/admin/catalog/attributes/{id}`** — body:

```json
{ "name": "string", "sortOrder": 0 }
```

---

### Koszyk (użytkownik) — `/cart`

Wszystkie endpointy wymagają JWT (`Authorization: Bearer <token>`).

| Method | Path                   | Opis                                             | Response  |
| ------ | ---------------------- | ------------------------------------------------ | --------- |
| GET    | `/cart`                | Pobierz koszyk (tworzy pusty jeśli nie istnieje) | `CartDto` |
| POST   | `/cart/items`          | Dodaj produkt do koszyka                         | `200`     |
| PUT    | `/cart/items/{itemId}` | Zmień ilość (0 = usuń item)                      | `200`     |
| DELETE | `/cart/items/{itemId}` | Usuń item z koszyka                              | `204`     |
| DELETE | `/cart`                | Wyczyść cały koszyk                              | `204`     |
| POST   | `/cart/merge`          | Scal koszyk gościa po zalogowaniu                | `200`     |

**POST `/cart/items`** — body:

```json
{
  "productId": "guid",
  "variantId": "guid",
  "quantity": 1,
  "productName": "string",
  "variantName": "string | null",
  "imageUrl": "string | null"
}
```

> Jeśli `variantId` już w koszyku → `quantity` zostaje zsumowane.

**PUT `/cart/items/{itemId}`** — body:

```json
{ "quantity": 2 }
```

> `quantity = 0` → usuwa item (tożsame z DELETE).

**POST `/cart/merge`** — body (wysyłany po zalogowaniu z zawartością localStorage):

```json
{
  "items": [{ "productId": "guid", "variantId": "guid", "quantity": 1 }]
}
```

> Istniejące variantId → sumuje ilości; nowe → dodaje. Koszyk tworzony automatycznie jeśli nie istnieje.

---

### Admin — Koszyki — `/admin/cart`

Wszystkie endpointy wymagają roli `Admin`.

| Method | Path                       | Opis                              | Response                       |
| ------ | -------------------------- | --------------------------------- | ------------------------------ |
| GET    | `/?page&pageSize`          | Lista aktywnych koszyków          | `PagedResult<CartListItemDto>` |
| GET    | `/stats`                   | Statystyki koszyków               | `CartStatsDto`                 |
| GET    | `/{userId}`                | Koszyk konkretnego użytkownika    | `CartDto`                      |
| PUT    | `/{userId}/items/{itemId}` | Zmień ilość w koszyku użytkownika | `200`                          |
| DELETE | `/{userId}/items/{itemId}` | Usuń item z koszyka użytkownika   | `204`                          |
| DELETE | `/{userId}`                | Wyczyść koszyk użytkownika        | `204`                          |

**PUT `/admin/cart/{userId}/items/{itemId}`** — body:

```json
{ "quantity": 2 }
```

---

### Public — Katalog — `/catalog`

Brak autoryzacji. Zwracają tylko produkty ze statusem `Active`.

| Method | Path                                                                   | Opis                | Response                          |
| ------ | ---------------------------------------------------------------------- | ------------------- | --------------------------------- |
| GET    | `/catalog/products?page&pageSize&categoryId&brandId&minPrice&maxPrice` | Lista produktów     | `PagedResult<ProductListItemDto>` |
| GET    | `/catalog/products/featured`                                           | Wyróżnione produkty | `ProductListItemDto[]`            |
| GET    | `/catalog/products/{slug}`                                             | Szczegóły produktu  | `ProductDto`                      |
| GET    | `/catalog/categories`                                                  | Drzewo kategorii    | `CategoryDto[]`                   |
| GET    | `/catalog/categories/{slug}`                                           | Kategoria po slug   | `CategoryDto`                     |
| GET    | `/catalog/brands?page&pageSize`                                        | Lista marek         | `PagedResult<BrandDto>`           |
| GET    | `/catalog/brands/{slug}`                                               | Marka po slug       | `BrandDto`                        |

---

## Kluczowe typy

### ProductStatus (enum)

```typescript
type ProductStatus = "Draft" | "Active" | "Inactive" | "Archived";
```

**Reguły statusu:**

- Nowy produkt zawsze zaczyna jako `Draft`
- Tylko `Active` produkty są widoczne publicznie (`/catalog/*`)
- Przejście do `Active` publikuje event (indeksowanie w Search)
- `Archived` = nieodwracalne (w praktyce, nie ma blokady kodu)

---

### ProductListItemDto

```typescript
interface ProductListItemDto {
  id: string;
  name: string;
  slug: string;
  mainCategoryId: string;
  brandId: string | null;
  price: number | null; // zawsze null — cena pochodzi z wariantów; użyj GET /{id} i variants
  status: ProductStatus;
  isFeatured: boolean;
  tags: string[];
  createdAt: string;
}
```

### ProductDto (pełny — GET /{id} lub GET /{slug})

```typescript
interface ProductDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  mainCategoryId: string;
  brandId: string | null;
  price: number | null; // zawsze null — cena jest na wariantach
  compareAtPrice: number | null; // zawsze null
  status: ProductStatus;
  isFeatured: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  variants: ProductVariantDto[];
  images: ProductImageDto[];
  attributes: ProductAttributeValueDto[];
}

interface ProductVariantDto {
  id: string;
  sku: string;
  name: string | null;
  price: number;
  compareAtPrice: number | null;
  isDefault: boolean;
  attributes: { key: string; value: string }[];
}

interface ProductImageDto {
  id: string;
  variantId: string | null; // null = globalne zdjęcie produktu
  url: string;
  altText: string | null;
  sortOrder: number;
}

interface ProductAttributeValueDto {
  attributeDefinitionId: string;
  name: string; // nazwa atrybutu (np. "Materiał")
  value: string; // wartość (np. "Bawełna")
}
```

### CategoryDto (drzewo — rekurencyjne)

```typescript
interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  level: 1 | 2 | 3;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  attributes: AttributeDefinitionDto[]; // ← DODANE: atrybuty przypisane do tej kategorii
  children: CategoryDto[];
}
```

### BrandDto

```typescript
interface BrandDto {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  isActive: boolean;
  createdAt: string;
}
```

### AttributeDefinitionDto

```typescript
interface AttributeDefinitionDto {
  id: string;
  name: string;
  sortOrder: number;
}
```

### CartDto

```typescript
interface CartDto {
  userId: string;
  expiresAt: string; // ISO 8601 — koszyk wygasa po 7 dniach od ostatniej modyfikacji
  items: CartItemDto[];
  totalValue: number;
}

interface CartItemDto {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  variantName: string | null;
  imageUrl: string | null;
  quantity: number;
  currentPrice: number; // cena live z katalogu
  totalPrice: number; // currentPrice * quantity
  addedAt: string;
}
```

### CartListItemDto (admin lista)

```typescript
interface CartListItemDto {
  userId: string;
  itemCount: number;
  totalValue: number;
  updatedAt: string;
  expiresAt: string;
}
```

### CartStatsDto (admin statystyki)

```typescript
interface CartStatsDto {
  activeCartsCount: number;
  abandonedCartsCount: number;
  totalActiveCartsValue: number;
  averageCartValue: number;
  topProducts: CartTopProductDto[];
}

interface CartTopProductDto {
  productId: string;
  productName: string;
  totalQuantity: number;
  cartCount: number;
}
```

---

## Błędy domenowe — tabela

| Type                                 | HTTP | Kiedy                                                      |
| ------------------------------------ | ---- | ---------------------------------------------------------- |
| `ProductNotFoundError`               | 404  | Produkt o danym id/slug nie istnieje                       |
| `ProductSlugAlreadyExistsError`      | 400  | Slug produktu jest już zajęty                              |
| `CannotRemoveLastVariantError`       | 400  | Próba usunięcia jedynego wariantu                          |
| `VariantNotFoundError`               | 404  | Wariant nie istnieje                                       |
| `ImageNotFoundError`                 | 404  | Zdjęcie nie istnieje                                       |
| `AttributeNotAllowedForProductError` | 400  | Atrybut nie należy do żadnej kategorii produktu            |
| `CategoryNotFoundError`              | 404  | Kategoria nie istnieje                                     |
| `CategoryHasChildrenError`           | 400  | Próba usunięcia kategorii z podkategoriami                 |
| `CategoryHasProductsError`           | 400  | Próba usunięcia kategorii z przypisanymi produktami        |
| `CategoryMaxDepthExceededError`      | 400  | Próba stworzenia kategorii na poziomie > 3                 |
| `BrandNotFoundError`                 | 404  | Marka nie istnieje                                         |
| `BrandHasProductsError`              | 400  | Próba usunięcia marki z przypisanymi produktami            |
| `AttributeDefinitionNotFoundError`   | 404  | Definicja atrybutu nie istnieje                            |
| `AttributeDefinitionInUseError`      | 400  | Próba usunięcia atrybutu przypisanego do kategorii         |
| `CartItemNotFoundError`              | 404  | Item koszyka nie istnieje lub należy do innego użytkownika |
| `InvalidQuantityError`               | 400  | Nieprawidłowa ilość (≤ 0 lub > 999)                        |
| `ValidationError`                    | 400  | Błędy walidacji pól (zawiera `errors[]`)                   |

---

## Reguły biznesowe (ważne dla UX)

### Produkty

| Reguła                                                     | Zachowanie UI                                                                                                        |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Przy tworzeniu z `price` → backend tworzy domyślny wariant | Formularz tworzenia zawsze ma pole `sku` (opcjonalne) i `price`                                                      |
| `product.price` jest zawsze `null`                         | Cena zawsze pochodzi z wariantów — wyświetlaj `variants.find(v => v.isDefault)?.price`                               |
| Nie można usunąć ostatniego wariantu                       | Wyłącz przycisk usuń gdy tylko 1 wariant                                                                             |
| Tylko jeden wariant może być `isDefault`                   | Radio button lub auto-toggle w UI                                                                                    |
| Atrybuty produktu muszą należeć do jego kategorii          | Użyj `category.attributes` z `CategoryDto` zamiast osobnego `?categoryId` — już masz atrybuty w odpowiedzi kategorii |

### Kategorie

| Reguła                            | Zachowanie UI                                     |
| --------------------------------- | ------------------------------------------------- |
| Max 3 poziomy głębokości          | Wyłącz "Dodaj podkategorię" dla kategorii Level 3 |
| Nie można usunąć z podkategoriami | Pokaż błąd `CategoryHasChildrenError`             |
| Nie można usunąć z produktami     | Pokaż błąd `CategoryHasProductsError`             |
| Dezaktywacja nie kaskaduje        | Podkategorie pozostają aktywne                    |

### Marki i atrybuty

| Reguła                                              | Zachowanie UI                              |
| --------------------------------------------------- | ------------------------------------------ |
| Nie można usunąć marki z produktami                 | Pokaż błąd `BrandHasProductsError`         |
| Nie można usunąć atrybutu przypisanego do kategorii | Pokaż błąd `AttributeDefinitionInUseError` |

### Koszyk

| Reguła                                                                              | Zachowanie UI                                    |
| ----------------------------------------------------------------------------------- | ------------------------------------------------ |
| `GET /cart` zawsze zwraca koszyk (tworzy pusty)                                     | Brak obsługi 404 — zawsze bezpieczne wywołanie   |
| Koszyk wygasa po 7 dniach od ostatniej zmiany                                       | Pokaż ostrzeżenie jeśli `expiresAt < now + 24h`  |
| `PUT /cart/items/{id}` z `quantity=0` usuwa item                                    | Możesz używać zamiennie z DELETE                 |
| Dodanie tego samego `variantId` → suma Quantity                                     | Nie dubluj itemów lokalnie — odśwież GET po POST |
| Ceny w `currentPrice` są live                                                       | Nie cachuj cen — mogą się zmienić między sesjami |
| Limit: max 999 sztuk jednego wariantu                                               | `InvalidQuantityError` przy przekroczeniu        |
| Po złożeniu zamówienia koszyk jest automatycznie czyszczony                         | Wymuś re-fetch po powrocie z płatności           |
| Koszyk gościa: trzymaj w localStorage, scal przez `POST /cart/merge` po zalogowaniu | Klucz: `guestCart` lub podobny                   |

---

## Slug

- Generowany automatycznie z nazwy (backend robi to przy tworzeniu)
- Można ręcznie zmienić przez pole `slug` w PUT
- Musi być unikalny globalnie w obrębie encji
- Format: `moja-nazwa-produktu` (lowercase, myślniki)

---

## CORS

Backend podczas developmentu akceptuje wszystkie originy.  
Produkcja: skonfigurować whitelist dla domeny frontendu.

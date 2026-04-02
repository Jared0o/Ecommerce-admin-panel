# API Context — Ecommerce Backend

Backend: .NET 10 Modular Monolith  
Base URL: `http://localhost:5000/api`  
Docs (Scalar UI): `http://localhost:5000/scalar`  
OpenAPI JSON: `http://localhost:5000/openapi.json`

---

## Autentykacja

### Flow

```
POST /auth/register      → rejestracja
POST /auth/login         → { accessToken, refreshToken, expiresIn }
POST /auth/refresh       → { accessToken, refreshToken }  (body: { refreshToken })
POST /auth/revoke        → wylogowanie (body: { refreshToken })
```

### Token

- **Access token**: JWT Bearer, wygasa po **15 minut**
- **Refresh token**: wygasa po **7 dni**
- Nagłówek: `Authorization: Bearer <accessToken>`
- Role: `"Admin"`, `"Moderator"`, `"User"`

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

| Method | Path                           | Auth | Opis               |
| ------ | ------------------------------ | ---- | ------------------ |
| POST   | `/auth/register`               | ❌   | Rejestracja        |
| POST   | `/auth/login`                  | ❌   | Logowanie → tokeny |
| POST   | `/auth/refresh`                | ❌   | Odśwież token      |
| POST   | `/auth/revoke`                 | ✅   | Wyloguj            |
| POST   | `/auth/request-password-reset` | ❌   | Wyślij link reset  |
| POST   | `/auth/reset-password`         | ❌   | Zresetuj hasło     |
| POST   | `/auth/change-password`        | ✅   | Zmień hasło        |

### Profil użytkownika — `/users`

| Method | Path                       | Auth    |
| ------ | -------------------------- | ------- |
| GET    | `/users/me`                | ✅ User |
| PUT    | `/users/me`                | ✅ User |
| GET    | `/users/me/addresses`      | ✅ User |
| POST   | `/users/me/addresses`      | ✅ User |
| PUT    | `/users/me/addresses/{id}` | ✅ User |
| DELETE | `/users/me/addresses/{id}` | ✅ User |

### Admin — Użytkownicy — `/admin/users`

| Method | Path                                       | Rola            |
| ------ | ------------------------------------------ | --------------- |
| GET    | `/admin/users?page&pageSize&role&isActive` | Admin/Moderator |
| GET    | `/admin/users/{id}`                        | Admin/Moderator |
| PUT    | `/admin/users/{id}`                        | Admin/Moderator |
| POST   | `/admin/users/{id}/roles`                  | Admin           |
| DELETE | `/admin/users/{id}/roles/{role}`           | Admin           |
| POST   | `/admin/users/{id}/deactivate`             | Admin/Moderator |

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
  "price": "decimal | null",
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
  "price": "decimal | null",
  "compareAtPrice": "decimal | null",
  "isFeatured": false,
  "tags": ["string"]
}
```

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
  price: number | null; // null gdy produkt ma warianty
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
  price: number | null; // null gdy produkt ma warianty
  compareAtPrice: number | null;
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

---

## Błędy domenowe — tabela

| Type                                 | HTTP | Kiedy                                               |
| ------------------------------------ | ---- | --------------------------------------------------- |
| `ProductNotFoundError`               | 404  | Produkt o danym id/slug nie istnieje                |
| `ProductSlugAlreadyExistsError`      | 400  | Slug produktu jest już zajęty                       |
| `InvalidProductPriceStateError`      | 400  | Próba ustawienia ceny na produkcie z wariantami     |
| `CannotRemoveLastVariantError`       | 400  | Próba usunięcia jedynego wariantu                   |
| `VariantNotFoundError`               | 404  | Wariant nie istnieje                                |
| `ImageNotFoundError`                 | 404  | Zdjęcie nie istnieje                                |
| `AttributeNotAllowedForProductError` | 400  | Atrybut nie należy do żadnej kategorii produktu     |
| `CategoryNotFoundError`              | 404  | Kategoria nie istnieje                              |
| `CategoryHasChildrenError`           | 400  | Próba usunięcia kategorii z podkategoriami          |
| `CategoryHasProductsError`           | 400  | Próba usunięcia kategorii z przypisanymi produktami |
| `CategoryMaxDepthExceededError`      | 400  | Próba stworzenia kategorii na poziomie > 3          |
| `BrandNotFoundError`                 | 404  | Marka nie istnieje                                  |
| `BrandHasProductsError`              | 400  | Próba usunięcia marki z przypisanymi produktami     |
| `AttributeDefinitionNotFoundError`   | 404  | Definicja atrybutu nie istnieje                     |
| `AttributeDefinitionInUseError`      | 400  | Próba usunięcia atrybutu przypisanego do kategorii  |
| `ValidationError`                    | 400  | Błędy walidacji pól (zawiera `errors[]`)            |

---

## Reguły biznesowe (ważne dla UX)

### Produkty

| Reguła                                            | Zachowanie UI                                                           |
| ------------------------------------------------- | ----------------------------------------------------------------------- |
| Produkt ma warianty → `price = null`              | Ukryj pole ceny produktu, pokaż ceny wariantów                          |
| Produkt bez wariantów → cena na produkcie         | Pokaż pole ceny na formularzu produktu                                  |
| Dodanie pierwszego wariantu zeruje cenę           | Informuj użytkownika przed dodaniem                                     |
| Nie można usunąć ostatniego wariantu              | Wyłącz przycisk usuń gdy tylko 1 wariant                                |
| Tylko jeden wariant może być `isDefault`          | Radio button lub auto-toggle w UI                                       |
| Atrybuty produktu muszą należeć do jego kategorii | Filtruj `attributeDefinitionId` przez `?categoryId` przed wyświetleniem |

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

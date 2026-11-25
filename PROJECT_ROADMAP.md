# Dream Shops — Project Roadmap & Session Handoff Doc

> **Purpose:** This document tracks the project state, architecture, setup instructions, phases, and tasks so any AI tool or developer can seamlessly pick up from where the last session left off.

---

## Workspace Structure

```text
c:\Ecommerce backend\
├── Ecommerce-Backend\        # Friend's Spring Boot backend (DO NOT modify unless compulsory)
├── frontend\                 # Frontend app (To be created in Phase 3)
└── PROJECT_ROADMAP.md        # This tracking document
```

---

## Rules & Constraints

1. **Backend Code Integrity:** Do **NOT** modify `Ecommerce-Backend` source code unless it is strictly compulsory. If a backend change is required, explain why to the user first before making it.
2. **CORS Handling:** `ShopConfig.java` currently has no CORS configuration. Use a frontend dev-server proxy (e.g., Vite `server.proxy` for `/api`) so the backend does not need to be modified for local development.
3. **Keep This Doc Updated:** Update checkboxes, notes, and decisions here as phases progress.

---

## Backend Overview (`Ecommerce-Backend`)

- **Framework:** Spring Boot `4.0.1` (`dream-shops`), Java `21` (local machine has Java `22.0.1`, Docker uses `eclipse-temurin:21`).
- **Database:** MySQL / TiDB Cloud (`com.mysql:mysql-connector-j`, Hibernate `ddl-auto=update`).
- **Auth:** Spring Security + Stateless JWT (`jjwt 0.11.5`, `HS256`, Base64-encoded secret).
- **API Docs (Swagger):** `/swagger-ui.html` and `/v3/api-docs/**` (when running on port `8080`: `http://localhost:8080/swagger-ui.html`).
- **API Prefix:** `/api/v1`

### Required Environment Variables (Credentials)

Defined in `Ecommerce-Backend/src/main/resources/application.properties`:

| Variable | Required | Default | Notes |
| --- | --- | --- | --- |
| `TIDB_HOST` | Yes | — | TiDB Cloud host (or MySQL host) |
| `TIDB_PORT` | Yes | — | Usually `4000` (TiDB Cloud) or `3306` (MySQL) |
| `TIDB_DATABASE` | Yes | — | Database/schema name |
| `TIDB_USER` | Yes | — | Database username |
| `TIDB_PASSWORD` | Yes | — | Database password |
| `JWT_SECRET` | Yes | — | **Base64-encoded** string (>= 32 bytes / 256 bits decoded) for HS256 |
| `PORT` | No | `8080` | Server port |
| `JWT_EXPIRATION` | No | `3600000` | Token TTL in ms (default 1 hour) |

> **Local MySQL Note:** `application.properties` hardcodes `?sslMode=VERIFY_IDENTITY`. If using a local MySQL Docker container instead of TiDB Cloud, override via Spring Boot env var `SPRING_DATASOURCE_URL=jdbc:mysql://host.docker.internal:3306/<db>?useSSL=false&allowPublicKeyRetrieval=true` without editing `application.properties`.

### Seeded Accounts (`DataInitializer.java`)

On startup, if not already present, the backend creates:
- **Users (`ROLE_USER`):** `user1@email.com` .. `user5@email.com` | password: `123456`
- **Admins (`ROLE_ADMIN`):** `admin1@email.com` .. `admin2@email.com` | password: `123456`

### API Endpoints Reference (`/api/v1`)

- **Auth (`/api/v1/auth`):** `POST /signup`, `POST /login`
- **Products (`/api/v1/products`):**
  - `GET /all`
  - `GET /product/{productId}/product`
  - `GET /products/by/brand-and-name`
  - `GET /products/by/category-and-brand`
  - `GET /products/{name}/products`
  - `GET /product/by-brand`
  - `GET /product/{category}/products`
  - `GET /product/count/by-brand/and-name`
  - `POST /add` (`ROLE_ADMIN`)
  - `PUT /product/{productId}/update` (`ROLE_ADMIN`)
  - `DELETE /product/{productId}/delete` (`ROLE_ADMIN`)
- **Categories (`/api/v1/categories`):** `GET /all`, `POST /add`, `GET /category/{id}/category`, `GET /category/{name}/category`, `PUT /category/{id}/update`, `DELETE /category/{id}/delete`
- **Images (`/api/v1/images`):** `POST /upload`, `GET /images/image/download/{imageId}`, `PUT /image/{imageId}/update`, `DELETE /image/{imageId}/delete`
- **Cart (`/api/v1/carts` - Auth required):** `GET /{cartId}/my-cart`, `DELETE /{cartId}/clear`, `GET /{cartId}/cart/total-price`
- **Cart Items (`/api/v1/cartItems` - Auth required):** `POST /item/add`, `PUT /cart/{cartId}/item/{itemId}/update`, `DELETE /cart/{cartId}/item/{itemId}/remove`
- **Orders (`/api/v1/orders`):** `POST /order`, `GET /{orderId}/order`, `GET /{userId}/orders`
- **Users (`/api/v1/users`):** `GET /{id}/user`, `POST /add`, `PUT /{userId}/update`, `DELETE /{userId}/delete`

---

## Phases & Tasks

### Phase 1: Clone & Understand Backend (Completed)
- [x] Clone `https://github.com/AnkitPatel8140/Ecommerce-Backend.git` into `Ecommerce-Backend/`
- [x] Inspect `pom.xml`, `Dockerfile`, `application.properties`, `ShopConfig.java`, `JwtUtils.java`, `DataInitializer.java`, and all controllers
- [x] Identify required environment variables and seeded accounts
- [x] Create `PROJECT_ROADMAP.md`

### Phase 2: Backend Environment & Run Verification (Completed)
- [x] Start Docker Desktop
- [x] Create root `docker-compose.yml` & `.env` (MySQL 8 on host port `3307` -> container `3306`, `dream-shops-backend` on `8080`, generated Base64 `JWT_SECRET`)
- [x] Build and run `Ecommerce-Backend` via `docker compose up -d --build` without modifying backend code
- [x] Verify `/api/v1/products/all` and `/api/v1/auth/login` (`user1@email.com` / `123456`) return `200 OK` with JWT

### Phase 3: Frontend Setup & Architecture (Completed)
- [x] Scaffold `frontend/` with React 19 + Vite + TypeScript + Tailwind CSS v4
- [x] Configure `/api` dev proxy in `frontend/vite.config.ts` -> `http://localhost:8080` (no backend CORS edits needed)
- [x] Implement Warm Ivory & Deep Forest (`#F7F4EE`, `#FDFBF7`, `#0D2D23`, `#C94A35`) design system with `Cormorant Garamond` wordmark, `Newsreader` headings, `DM Sans` UI, and `JetBrains Mono` figures
- [x] Custom **DS** monogram SVG logo (`BrandLogo.tsx`) & `public/favicon.svg`
- [x] Integrate `Lenis` smooth scroll + `Framer Motion` + `unslop` audit & dead-code cleanup
- [x] Set up `AuthContext`, `CartContext`, `ToastContext`, and typed API layer (`src/lib/api.ts`)

### Phase 4: Core Frontend Features & Verification (Completed)
- [x] Storefront (`/`): Full-width category bar, gesture-navigated & auto-rotating full-bleed hero deal carousel, "Top picks for you", category spotlights, search & filterable catalog, newsletter banner, and service guarantees
- [x] Seeded 12 products in MySQL across `Gadgets`, `Watches`, `Shoes`, `Fashion`, `Bags`, `Home & Living`, and `Timepieces`, each with a real uploaded JPEG BLOB image
- [x] Auth page (`/auth`): Login & Signup + quick-fill demo accounts (`user1@email.com`, `admin1@email.com`)
- [x] Product detail (`/product/:id`): Gallery switcher, inventory status, quantity stepper, Add to cart
- [x] Slide-over Cart drawer: Live item count, quantity +/-, remove, clear cart, and Place order checkout
- [x] Orders & Profile (`/orders`): User details + order history ledger
- [x] Admin Studio (`/admin`): `ROLE_ADMIN` console for Product CRUD, Category CRUD, and multi-image upload/delete
- [x] Verified `tsc && vite build` (0 errors, `558.69 kB` JS bundle) and E2E Vite proxy API flow

> **Note:** Browser visual automation via Chrome DevTools MCP was blocked because Chrome remote debugging (`DevToolsActivePort`) is not enabled on the host. Everything is live at `http://localhost:5173/` for manual visual inspection.

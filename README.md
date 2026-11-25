# DreamShops — Full-Stack E-Commerce (Spring Boot + React)

A modern, full-stack B2C e-commerce storefront built on top of the **DreamShops Spring Boot backend** (`Ecommerce-Backend`).

> **Note for Ankit (`AnkitPatel8140`):** **Zero backend Java files were modified.** Everything runs against the original Spring Boot API using Docker Compose environment overrides and a Vite dev proxy.

---

## Project Structure

```text
├── src/                   # Original Spring Boot 4 / Java 21 backend (untouched)
├── pom.xml                # Maven configuration (untouched)
├── Dockerfile             # Backend Docker image (untouched)
├── frontend/              # React 19 + TypeScript + Vite + Tailwind CSS v4 storefront
├── docker-compose.yml     # Runs MySQL 8 + Spring Boot backend together
├── .env.example           # Template for required environment variables
├── PROJECT_ROADMAP.md     # Architecture, API endpoints, and session handoff notes
└── README.md              # This setup guide
```

---

## What Was Built

- **Storefront (`/`):** Full-width category bar, swipeable & auto-rotating hero deal carousel, *Top picks for you*, category spotlights, live search & filtering, newsletter banner, and service guarantees.
- **Product Detail (`/product/:id`):** Multi-image gallery, live inventory status, quantity stepper, and Add to Cart.
- **Slide-Over Cart Drawer:** Synced with the backend cart (`/api/v1/carts`, `/api/v1/cartItems`) with quantity `+/-`, item removal, clear cart, and one-click **Place Order**.
- **Auth (`/auth`) & Orders (`/orders`):** JWT login/signup, quick-fill demo buttons, customer profile, and order history ledger.
- **Admin Studio (`/admin`):** `ROLE_ADMIN` console for creating/editing/deleting products, managing categories, and uploading/deleting product images (stored as MySQL BLOBs).

---

## How Backend Integration Works (Without Touching Backend Code)

1. **Database & Credentials (`application.properties`):**
   - `Ecommerce-Backend/src/main/resources/application.properties` expects `TIDB_HOST`, `TIDB_PORT`, `TIDB_DATABASE`, `TIDB_USER`, `TIDB_PASSWORD`, and `JWT_SECRET`, and hardcodes `?sslMode=VERIFY_IDENTITY`.
   - `docker-compose.yml` spins up a local `mysql:8.0` container (mapped to host port **`3307`** to avoid conflicting with any local MySQL on `3306`) and passes `SPRING_DATASOURCE_URL` as an environment variable override (`?useSSL=false&allowPublicKeyRetrieval=true&createDatabaseIfNotExist=true`).
   - Hibernate (`ddl-auto=update`) automatically creates all tables on first startup.
2. **CORS:**
   - `ShopConfig.java` has no CORS configuration. `frontend/vite.config.ts` proxies `/api` requests to `http://localhost:8080`, so local development works with zero backend edits.
3. **Image Download Route:**
   - `ImageService.java` stores `downloadUrl` as `/api/v1/images/image/download/{id}`, while `ImageController.java` exposes `@GetMapping("/images/image/download/{imageId}")` under `/api/v1/images`. The frontend maps image URLs to `/api/v1/images/images/image/download/{id}` automatically.

---

## Prerequisites

- **Docker Desktop** (running)
- **Node.js** `v18+` (includes `npm`)

---

## Quick Start (After Cloning)

### 1. Configure Environment Variables
Copy `.env.example` to `.env` in the root folder and set a strong Base64 `JWT_SECRET`:

```powershell
Copy-Item .env.example .env
```

To generate a valid 256-bit Base64 `JWT_SECRET` in PowerShell:
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### 2. Start MySQL + Spring Boot Backend (Docker)
From the root directory:
```powershell
docker compose up -d --build
```

Wait ~15–30 seconds for MySQL to pass its healthcheck and Spring Boot to initialize. Verify:
- Backend API: `http://localhost:8080/api/v1/products/all`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- MySQL (host port): `localhost:3307` (database: `dream_shops`)

### 3. Start the Frontend
```powershell
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173/`** in your browser.

---

## Default Seeded Accounts (`DataInitializer.java`)

On first startup, the backend automatically creates:
- **Customer:** `user1@email.com` .. `user5@email.com` | Password: `123456`
- **Admin:** `admin1@email.com` .. `admin2@email.com` | Password: `123456`

Sign in with `admin1@email.com` and visit **`/admin`** to add products, categories, and upload product photos.

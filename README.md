## True Look Backend (NestJS)

Backend for the True Look system – a platform for managing users, products, and orders for eyewear (frames, prescription lenses, contact lenses, etc.) built with NestJS, PostgreSQL, and TypeORM.  
The application exposes a REST API with Swagger documentation, JWT authentication, email sending, and static file serving for uploads.

### 1. Tech stack

- **Runtime**: Node.js, TypeScript
- **Framework**: `NestJS`
- **Database**: PostgreSQL (`TypeORM`)
- **Authentication**: JWT, Passport (with Google OAuth2 support)
- **API Docs**: `@nestjs/swagger` (Swagger UI)
- **Mail**: `@nestjs-modules/mailer` (SMTP Gmail)
- **Realtime / Socket**: `@nestjs/websockets`, `socket.io`

---

### 2. Main structure

- **`src/main.ts`**: Nest application bootstrap file, configures:
  - Global `ValidationPipe`
  - Swagger at `/api`
  - CORS using `FRONTEND_URLS`
  - Static files for `src/uploads` served at `/uploads`
- **`src/app.module.ts`**:
  - Initializes `ConfigModule` (environment variables)
  - Configures `TypeOrmModule` (PostgreSQL, `synchronize: false`)
  - Configures `MailerModule` with Gmail SMTP
  - Imports business modules:
    - **Users & roles**: `UsersModule`, `RolesModule`, `UserRolesModule`, `AuthModule`
    - **Products & classification**: `BrandsModule`, `CategoriesModule`, `ProductsModule`, `ProductVariantsModule`, `ImagesModule`, `FeaturesModule`
    - **Promotion & categories**: `PromotionsModule`, `ProductCategoriesModule`, `ProductPromotionsModule`
    - **Cart & orders**: `CartsModule`, `CartItemsModule`, `OrdersModule`, `OrderDetailsModule`
    - **Shipping & payments**: `ShippingProvidersModule`, `ShippingServicesModule`, `ShippingModule`, `TransitionsModule`, `PaymentsModule`
    - **Frame / lens specs**: `FrameSpecsModule`, `RxLensSpecsModule`, `ContactLensSpecsModule`, `ContactLensAxisModule`
    - **Others**: `SupersetModule`, `SupportModule`
  - Registers `LoggerMiddleware` for all routes
- **`src/modules/**`**: Contains business modules, entities, controllers, services, etc.
- **`uploads/`**: Directory for uploaded files (served at `/uploads`).

---

### 3. Requirements

- **Node.js**: recommended `>= 20`
- **npm**: `>= 10`
- **PostgreSQL**: an empty database with connection info matching environment variables

---

### 4. Environment variables

Create a `.env` file in the project root (same level as `package.json`) with at least:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name

MAIL_USER=your_gmail_account
MAIL_PASS=your_gmail_app_password

FRONTEND_URLS=http://localhost:5173
```

- `FRONTEND_URLS`: if there are multiple frontend URLs, separate them with commas, for example  
  `http://localhost:5173,http://localhost:3000`.
- `synchronize` in TypeORM is **disabled** (`false`), so the DB schema must be created via migrations or external scripts (it will not auto-generate tables at runtime).

---

### 5. Install & run

#### 5.1. Install dependencies

```bash
npm install
```

#### 5.2. Run the application

```bash
# Development
npm run start

# Watch mode (auto reload)
npm run start:dev

# Production (using compiled build)
npm run start:prod
```

By default the app listens on `http://localhost:${PORT}` (if `PORT` is not set, it defaults to `3000`).

---

### 6. API documentation (Swagger)

- After the server is running, open:
  - **Swagger UI**: `http://localhost:${PORT}/api`
- JWT token is configured in Swagger using the `Bearer` scheme (header: `Authorization: Bearer <token>`).

---

### 7. File uploads

- Uploaded files are stored in `src/uploads`.
- Backend exposes a static route:
  - URL: `/uploads`
  - Physical path: `src/uploads`
- When storing file paths in the database, the frontend can access them via `http://<BACKEND_HOST>/uploads/<relative_path>`.

---

### 8. Helpful scripts

Defined in `package.json`:

- **`npm run build`**: Build the project using `nest build` (output in `dist`).
- **`npm run format`**: Format code using Prettier.
- **`npm run lint`**: Run ESLint and auto-fix where possible.
- **`npm test`**: Run unit tests with Jest.
- **`npm run test:e2e`**: Run e2e tests.
- **`npm run test:cov`**: Generate coverage report.

---

### 9. Deployment

For production deployment:

- Make sure:
  - DB and mail environment variables are correctly set.
  - `FRONTEND_URLS` contains all real frontend domains.
  - The project has been built: `npm run build`.
- Start the production server:

```bash
npm run start:prod
```

You can run it long-term using process managers such as `pm2`, Docker, or any cloud platform (Heroku, Render, AWS, etc.).

---

### 10. Docker deployment

This project includes a `dockerfile` for building a Node.js 20 multi-stage image.

#### 10.1. Build image

```bash
# From project root
docker build -t true-look-backend .
```

#### 10.2. Run container

```bash
docker run -d \
  --name true-look-be \
  -p 3000:3000 \
  --env-file .env \
  true-look-backend
```

- The container listens on port `3000` (as defined in the `dockerfile`); you can change the host port if needed (e.g. `-p 8080:3000`).
- The `.env` file is used to pass all configured environment variables (DB, mail, `FRONTEND_URLS`, etc.).

#### 10.3. PostgreSQL with Docker Compose (suggested)

You can create a `docker-compose.yml` (example) to run both backend and PostgreSQL:

```yaml
services:
  db:
    image: postgres:16
    container_name: true-look-db
    restart: always
    environment:
      POSTGRES_USER: your_db_user
      POSTGRES_PASSWORD: your_db_password
      POSTGRES_DB: your_db_name
    ports:
      - "5432:5432"
    volumes:
      - db_data:/var/lib/postgresql/data

  backend:
    build: .
    container_name: true-look-be
    restart: always
    depends_on:
      - db
    ports:
      - "3000:3000"
    env_file:
      - .env

volumes:
  db_data:
```

Remember to update DB-related environment variables in `.env` to point to the `db` service:

```env
DB_HOST=db
DB_PORT=5432
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
```

---

### 11. Future improvements

- Add detailed documentation for each module under `src/modules/**` (API, DTO, entities).
- Add DB migration guide (TypeORM CLI or your own tooling).
- Add ERD diagrams and business flow documentation (e.g. in a `docs/` directory).


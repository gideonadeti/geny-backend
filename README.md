# Geny-Backend

## Assumptions & Decisions

### Assumptions

- I assumed that **create requests** would be handled asynchronously via Redis.
- I assumed that **findAll** and **findOne** requests would be handled synchronously via gRPC.
- I assumed that **booking-related endpoints** are only for `PROVIDER`s.
- I assumed that **health** and **metrics** endpoints are only for `ADMIN`s.

### Decisions

- I decided to use **Redis** as a message broker for create requests.
- I decided to use **gRPC** for findAll and findOne requests.
- I added **role guards**:
  - Booking endpoints → only accessible by `PROVIDER`s
  - Health and metrics endpoints → only accessible by `ADMIN`s

---

## Setup Instructions

- Clone the repository:

```bash
git clone https://github.com/gideonadeti/geny-backend.git
```

- Install dependencies:

```bash
npm ci
```

---

## How to Run Locally and Test

### Running Locally

#### Development Environment

1. Create a `.env` file in the root directory with the following:
   - `AUTH_DB_USER` – any string, e.g., `gideon`
   - `AUTH_DB_PASSWORD` – any string, e.g., results from running `openssl rand-hex 16`
   - `AUTH_DB_NAME` – `auth_db`
   - `BOOKINGS_DB_USER` – similar to `AUTH_DB_USER`
   - `BOOKINGS_DB_PASSWORD` – similar to `AUTH_DB_PASSWORD`
   - `BOOKINGS_DB_NAME` – `bookings_db`

2. Comment out the `api-gateway`, `auth`, and `bookings` services in `compose.yaml`.

3. Start services:

```bash
docker compose up -d      # background
# or
docker compose up         # foreground
```

4. Set up `.env` for each app:

- **apps/auth/.env**

```env
AUTH_DATABASE_URL=postgresql://${AUTH_DB_USER}:${AUTH_DB_PASSWORD}@localhost:5432/auth_db
JWT_ACCESS_SECRET=<random_string>
JWT_REFRESH_SECRET=<random_string>
```

- **apps/bookings/.env**

```env
BOOKINGS_DATABASE_URL=postgresql://${BOOKINGS_DB_USER}:${BOOKINGS_DB_PASSWORD}@localhost:5433/bookings_db
REDIS_HOST=localhost
REDIS_PORT=6379
```

- **apps/api-gateway/.env**

```env
JWT_ACCESS_SECRET=<same_as_auth>
JWT_REFRESH_SECRET=<same_as_auth>
AUTH_SERVICE_URL=0.0.0.0:5000
BOOKINGS_SERVICE_URL=0.0.0.0:5001
REDIS_HOST=<same_as_bookings>
REDIS_PORT=<same_as_bookings>
```

5. Apply migrations and generate Prisma client:

```bash
cd apps/auth
npx prisma migrate dev

cd ../bookings
npx prisma migrate dev
```

6. Open the root directory in **3 separate terminals** and run:

```bash
# Terminal 1
npm run start:dev      # api-gateway

# Terminal 2
npm run start:dev auth # auth service

# Terminal 3
npm run start:dev bookings # bookings service
```

7. Access Swagger UI at:
   `http://localhost:3000/api-gateway/documentation`

---

#### Production Environment

1. Follow development steps up to `.env` setup.
2. Consolidate `.env` files into the root directory, avoiding duplicates.
3. Update values:

```env
AUTH_SERVICE_URL=auth:5000
BOOKINGS_SERVICE_URL=bookings:5001
AUTH_DATABASE_URL=postgresql://{AUTH_DB_USER}:{AUTH_DB_PASSWORD}@auth_db:5432/auth_db
BOOKINGS_DATABASE_URL=postgresql://{BOOKINGS_DB_USER}:{BOOKINGS_DB_PASSWORD}@bookings_db:5432/bookings_db
REDIS_HOST=redis
```

4. Uncomment `api-gateway`, `auth`, and `bookings` in `compose.yaml`.

5. Start services:

```bash
docker compose -f compose.yaml -f compose.prod.yaml up -d
# or foreground
docker compose -f compose.yaml -f compose.prod.yaml up
```

---

### Notes

- Access to `/health` and `/metrics/*` requires `ADMIN` role.

**Development:**

1. Run Prisma Studio:

```bash
cd apps/auth
npx prisma studio
```

2. Update the user’s role to `ADMIN`, save changes, and sign in again.

**Production:**

- Temporarily stop other services except `auth_db`, update `.env` and user role via Prisma Studio, restart services, and sign in again.

---

### Testing

**Unit Test**

```bash
npm run test -- apps/api-gateway/src/auth/auth.controller.spec.ts
```

**E2E Test**

1. Make sure services are running (development environment).
2. Run:

```bash
npm run test:e2e
```

---

## What I’d Improve with +4 Hours

The take-home test said **2–3 hours**, but I spent **several days** on this project.
Reasons: low-end laptop, internet issues, other responsibilities, and my lack of 5+ years of experience.

I didn’t stress myself. I treated this as a learning experience, and it was **really rewarding**.

With more time, I’d implement:

- Logging middlewares or interceptors
- Adding more tests
- Adding more features if necessary

---

## Bonus (Optional)

- I had a `Create` gRPC method before switching to async via Redis.
- To view it:

```bash
git checkout 38553df
```

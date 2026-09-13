<div align="center">

<img width="1913" height="937" alt="Self Test Exam Platform" src="https://github.com/user-attachments/assets/9fd0b3ca-4654-434e-baae-26321fdffe50" />

# Self Test — Exam & Self-Assessment Platform

An online examination and self-assessment platform for students, teachers, and administrators.

[![Frontend](https://img.shields.io/badge/frontend-Next.js%2016-black?logo=next.js)](https://nextjs.org)
[![Backend](https://img.shields.io/badge/backend-Go%201.26-00ADD8?logo=go)](https://go.dev)
[![Database](https://img.shields.io/badge/database-PostgreSQL-4169E1?logo=postgresql)](https://www.postgresql.org)
[![License](https://img.shields.io/badge/license-private-lightgrey)](#license)

</div>

---

## Overview

Self Test is a full-stack exam platform organized as a monorepo:

| App | Stack | Port |
| --- | --- | --- |
| `frontend/` | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 | `3000` |
| `backend/`  | Go 1.26 REST API, PostgreSQL | `8080` |

The backend follows a **Clean / Hexagonal architecture** (`domain`, `service`, `delivery/http`, `infrastructure`), while the frontend uses React Server Components with **Next.js Server Actions**.

### Key Features

- **Role-based access** — student, teacher, and admin workflows.
- **Exam packs & exams** — organized question banks with MCQ, passage, and picture question types.
- **Timed attempts** — countdown timer, auto-grading, and an anti-cheat signal engine (warning count / security messages).
- **Scoring engine** — configurable per-question marks, negative marking, pass threshold, and score floor.
- **Reporting & analytics** — student results, teacher class reports (highest/lowest/average), and admin exam analysis with charts.
- **Certificates** — printable certificate layout for passed attempts.
- **File uploads** — presigned S3 PUT URLs (Cloudflare R2 / IDrive e2 / AWS S3).
- **SEO-ready** — metadata, JSON-LD structured data, sitemap, robots, and OG/Twitter images.

---

## Architecture

```
self-test-exam-platform/
├── backend/                       # Go REST API
│   ├── main.go                    # Composition root / dependency wiring
│   ├── config/db.go               # Connection, schema migration, seeding
│   ├── middleware/                # JWT auth + request logging
│   └── internal/
│       ├── domain/                # Entities, repository interfaces, evaluator
│       ├── service/               # Business logic
│       ├── delivery/http/         # Handlers + router
│       └── infrastructure/        # Postgres repositories, S3 storage
└── frontend/                      # Next.js client
    └── src/
        ├── app/                   # App Router routes
        ├── components/            # UI, common, dashboard, home
        └── lib/                   # Server actions, auth, SEO, types, utils
```

---

## Getting Started

### Prerequisites

- **Node.js** 20+ (or Bun)
- **Go** 1.26+
- **PostgreSQL** 14+ (a hosted provider such as Neon works as well)

### 1. Clone the repository

```bash
git clone https://github.com/shaiadul/self-test-exam-platform.git
cd self-test-exam-platform
```

### 2. Configure the backend

```bash
cd backend
cp .env.example .env
```

Set the required values in `backend/.env`:

| Variable | Description |
| --- | --- |
| `PORT` | HTTP port (default `8080`) |
| `DATABASE_URL` | PostgreSQL / Neon connection string |
| `JWT_SECRET` | Secret used to sign JWTs |
| `NEXT_PUBLIC_ADMIN_EMAIL` | Seed admin email |
| `NEXT_PUBLIC_TEACHER_EMAIL` | Seed teacher email |
| `S3_ENDPOINT` | S3-compatible endpoint |
| `S3_REGION` | Storage region |
| `S3_BUCKET` | Storage bucket name |
| `S3_ACCESS_KEY_ID` | Storage access key |
| `S3_SECRET_ACCESS_KEY` | Storage secret key |
| `S3_PUBLIC_URL` | Public base URL for uploaded files |
| `S3_FORCE_PATH_STYLE` | `true` for path-style access (R2/IDrive) |

> The database schema is created automatically and demo data is seeded on first run.

Start the API:

```bash
go run main.go
```

The server listens on `http://localhost:8080`.

### 3. Configure the frontend

```bash
cd frontend
cp .env.example .env
```

Set the API base URL (and optional demo-login shortcuts):

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Backend base URL (default `http://localhost:8080/api`) |
| `NEXT_PUBLIC_STUDENT_EMAIL` / `_PASSWORD` | Demo student login |
| `NEXT_PUBLIC_TEACHER_EMAIL` / `_PASSWORD` | Demo teacher login |
| `NEXT_PUBLIC_ADMIN_EMAIL` / `_PASSWORD` | Demo admin login |

Start the dev server:

```bash
npm run dev      # or: yarn dev | pnpm dev | bun dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Available Scripts

Run from the `frontend/` directory:

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server with Turbopack |
| `npm run build` | Build for production |
| `npm run start` | Run the production build |
| `npm run lint` | Run ESLint |

Run backend tests from the `backend/` directory:

```bash
go test ./...
```

---

## API Reference

Base path: `/api`. All routes except authentication require a `Authorization: Bearer <token>` header.

### Public

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Authenticate and receive a JWT |

### Authenticated

| Area | Endpoints |
| --- | --- |
| Auth | `GET /auth/profile`, `POST /auth/complete-profile` |
| Exam Packs | `GET /exam-packs`, `GET /exam-packs/{id}`, `GET /exam-packs/{id}/exams` |
| Exams | `GET /exams/{id}`, `GET/POST/PUT/DELETE /exams/{id}/questions[/{qid}]`, `POST /exams/{id}/submit` |
| Attempts | `GET /attempts`, `GET /attempts/{id}` |
| Reports | `GET /dashboard/stats`, `GET /teacher/reports[/{examId}]`, `GET /admin/analysis` |
| Admin | `GET/POST/PUT/DELETE /admin/users[/{id}]`, `GET/PUT /admin/permissions[/{id}]` |
| Assets | `GET/POST/PUT/DELETE /assets[/{id}]`, `GET /transactions[/summary]` |
| Uploads | `POST /uploads/presign`, `POST /uploads/direct` |

---

## Deployment

The frontend is configured for **Vercel** via `frontend/vercel.json` (framework `nextjs`). Set the `NEXT_PUBLIC_*` variables in the project dashboard.

The backend is a standard Go binary and can be deployed to any container or VM host; provide the environment variables above at runtime.

---

## Security Notes

- Passwords are hashed with **bcrypt**; JWTs are HMAC-signed and validated on every protected route.
- Always set a strong, unique `JWT_SECRET` in production — the server falls back to an insecure default when unset.
- Demo credentials exposed via `NEXT_PUBLIC_*` environment variables are intended for development only and must not be enabled in production.

---

## License

Private and proprietary. All rights reserved.

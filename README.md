# Task Management API

A full-stack task management application with JWT authentication, ownership-scoped CRUD, and pagination. Built with FastAPI and React for a clear separation between API and client.

---

## Project Overview

The system exposes a REST API for creating, reading, updating, and deleting tasks. Each user sees only their own tasks. The backend uses raw SQL and a layered architecture (routes, service, database); the frontend is a single-page app with protected routes, inline editing, and paginated task lists.

---

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Backend** | FastAPI, PostgreSQL, psycopg2 (RealDictCursor), python-jose (JWT), passlib (bcrypt), pydantic, python-dotenv, uvicorn |
| **Frontend** | React (Vite), Axios, React Router, Tailwind CSS |
| **Database** | PostgreSQL (raw SQL, no ORM) |

---

## Architecture

**Backend:** Request flow is **routes → service → database**. Route handlers validate input and depend on `get_current_user` for protected endpoints. Service functions contain business logic and call the shared DB helper; all task queries filter by `user_id` so users cannot access or modify other users’ tasks.

**Frontend:** The app checks for a JWT in `localStorage` on load and sets the Axios default `Authorization` header. Unauthenticated users see only the login/register screen. Authenticated users can create tasks, view a paginated list, edit tasks inline, and delete them. All task and auth calls go through a single Axios instance with a configurable base URL.

---

## Authentication Flow

1. **Register:** `POST /auth/register` with `email` and `password`. Passwords are hashed with bcrypt and stored; response is the new user (e.g. `user_id`, `email`).
2. **Login:** `POST /auth/login` with the same credentials. The backend verifies the password and returns a JWT in `access_token` with `token_type: "bearer"`.
3. **Using the API:** The client stores the token (e.g. in `localStorage`) and sends it on every request as `Authorization: Bearer <token>`. A dependency decodes the JWT, validates signature and expiry, and injects `user_id` into route handlers. Invalid or missing tokens result in 401.

---

## API Documentation

The API documentation and testing resources are available below:

- **Swagger UI:** http://localhost:8000/docs
- **OpenAPI Specification:** [docs/openapi.json](docs/openapi.json)
- **Postman Collection:** [docs/task-api.postman_collection.json](docs/task-api.postman_collection.json)

The Postman collection can be imported directly to test all authentication and task endpoints.

---

## API Endpoints

Base URL (local): `http://localhost:8000`. All task endpoints require a valid JWT in the `Authorization` header.

### Auth

**POST /auth/register**

- Request: `{ "email": "user@example.com", "password": "password123" }`
- Response (201): `{ "user_id": 1, "email": "user@example.com" }`
- Errors: 400 if email already registered.

**POST /auth/login**

- Request: `{ "email": "user@example.com", "password": "password123" }`
- Response (200): `{ "access_token": "<jwt>", "token_type": "bearer" }`
- Errors: 401 for invalid credentials.

### Tasks

**POST /tasks** (auth required)

- Request: `{ "title": "My task", "priority": "medium", "due_date": "2025-03-01" }` (priority and due_date optional)
- Response (201): Single task object with `task_id`, `title`, `status`, `priority`, `due_date`, `created_at`, `updated_at`.

**GET /tasks** (auth required)

- Query: `limit` (default 10), `offset` (default 0).
- Response (200): `{ "total": 42, "limit": 10, "offset": 0, "data": [ ... ] }`. Only the current user’s tasks are returned.

**GET /tasks/{task_id}** (auth required)

- Response (200): Single task object. 404 if not found or not owned by the user.

**PATCH /tasks/{task_id}** (auth required)

- Request: Any subset of `title`, `status`, `priority`, `due_date` (PATCH uses `exclude_unset=True`).
- Response (200): Updated task object. 400 if no fields sent; 404 if task not found or not owned.

**DELETE /tasks/{task_id}** (auth required)

- Response: 204 No Content. 404 if task not found or not owned.

---

## Pagination

List tasks with `GET /tasks?limit=10&offset=0`. The response includes `total` (total count of the user’s tasks), `limit`, `offset`, and `data` (array of tasks for the current page). The frontend uses `limit=10` and computes `offset` as `page * 10` to show 10 tasks per page and renders Previous/Next plus page numbers using `total` and `limit`.

---

## Security Considerations

- Passwords are hashed with bcrypt via passlib; plaintext passwords are not stored.
- JWT secret and algorithm are configured via environment variables; tokens are signed and validated (e.g. HS256).
- All task operations are scoped by `user_id` from the JWT; no user can access or modify another user’s tasks.
- CORS is configured for the frontend origin (e.g. `http://localhost:5173`); credentials are allowed for cookie/auth if needed.
- Database credentials and JWT secret belong in environment variables (e.g. `.env`) and must not be committed.

---

## Running Locally

### Prerequisites

- Python 3.x, Node.js, PostgreSQL.

### Backend

1. Create a PostgreSQL database and run `schema.sql` to create `users` and `tasks` (and indexes).
2. From the project root, create a virtualenv, activate it, and install dependencies:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate   # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. Create a `.env` in `backend/` with:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=your_db_name
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   JWT_SECRET=your_secret
   JWT_ALGORITHM=HS256
   JWT_EXPIRE_MINUTES=60
   ```
4. Start the server:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
   API: `http://localhost:8000`.

### Frontend

1. From the project root:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. Ensure the frontend is configured to call the backend (e.g. Axios base URL `http://localhost:8000`). App: typically `http://localhost:5173`.

---

## Database Schema

**users**

| Column        | Type         | Constraints                    |
|---------------|--------------|--------------------------------|
| user_id       | SERIAL       | PRIMARY KEY                    |
| email         | VARCHAR(100) | NOT NULL, UNIQUE               |
| password_hash | TEXT         | NOT NULL                       |
| created_at    | TIMESTAMP    | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

**tasks**

| Column      | Type      | Constraints                                                                 |
|-------------|-----------|-----------------------------------------------------------------------------|
| task_id     | SERIAL    | PRIMARY KEY                                                                |
| user_id     | INTEGER   | NOT NULL, FK → users(user_id) ON DELETE CASCADE                            |
| title       | TEXT      | NOT NULL, CHECK(char_length(title) > 0)                                    |
| status      | VARCHAR   | NOT NULL, DEFAULT 'pending', CHECK IN ('pending','in_progress','completed') |
| priority    | VARCHAR   | NOT NULL, DEFAULT 'medium', CHECK IN ('low','medium','high')                |
| due_date    | DATE      | nullable                                                                   |
| created_at  | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP                                        |
| updated_at  | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP                                        |

Indexes: `(user_id, created_at DESC)`, `status`, `priority`.

---

## Key Backend Concepts Demonstrated

- **Layered design:** Routes handle HTTP and validation; services contain logic; a shared DB layer runs parameterized SQL with RealDictCursor.
- **Ownership:** Every task query includes `WHERE user_id = %s` using the authenticated user’s ID from the JWT.
- **Pagination:** `GET /tasks` accepts `limit` and `offset` and returns `total` plus a slice of rows for clear client-side paging.
- **Partial updates:** PATCH uses Pydantic’s `exclude_unset=True` so only sent fields are updated; empty body is rejected with 400.
- **HTTP semantics:** 201 for created resource, 204 for successful delete, 400 for bad request, 401 for auth failure, 404 for missing/forbidden resource.

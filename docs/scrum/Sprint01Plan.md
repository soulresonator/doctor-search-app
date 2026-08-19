# Sprint 1 Plan — Foundation + Authentication

## Sprint Goal

Set up the full project infrastructure (Django backend, Next.js frontend, PostgreSQL database, all MVP models) and deliver working user authentication (register, login, logout) end-to-end.

- **Duration**: 2 weeks
- **Focus**: Backend + Web only (mobile deferred)
- **Testing scope**: Backend tests only (pytest + pytest-django)
- **Token storage**: localStorage
- **Registration fields**: All PRD fields (username, password, full_name, phone_number, age, gender, occupation)
- **Admin bootstrap**: Django `createsuperuser` management command

---

## Git Tag Convention

Each completed task is committed and tagged to track sprint progress:

| Tag | After |
|-----|-------|
| `sprint-01/start` | Sprint kickoff (before any code changes) |
| `sprint-01/task-01` | Task 1: Django project scaffolding |
| `sprint-01/task-02` | Task 2: PostgreSQL database connection |
| `sprint-01/task-03` | Task 3: Database models & migrations |
| `sprint-01/task-04` | Task 4: Next.js frontend scaffolding |
| `sprint-01/task-05` | Task 5: CORS configuration |
| `sprint-01/task-06` | Task 6: User registration |
| `sprint-01/task-07` | Task 7: User login |
| `sprint-01/task-08` | Task 8: User logout |
| `sprint-01/done` | Sprint complete |

**Rule**: A task is only tagged after its tests pass.

---

## Sprint Backlog

Items pulled from [ProductBacklog.md](file:///Volumes/Data/Code/VibeCodeProject/DoctorApp/docs/scrum/ProductBacklog.md):

| # | PBI | Source Epic | Estimate |
|---|-----|-------------|----------|
| 1 | Django project scaffolded with proper config | Project Setup | 3 pts |
| 2 | Next.js project scaffolded with TailwindCSS | Project Setup | 3 pts |
| 3 | PostgreSQL database connected and configured | Project Setup | 2 pts |
| 4 | Database models created with proper migrations (User, Doctor, Specialty, Hospital, ClinicAddress) | Project Setup | 5 pts |
| 5 | CORS configured between frontend and backend | Project Setup | 1 pt |
| 6 | User Registration (backend API + frontend page) | User Account Access | 5 pts |
| 7 | User Login (backend API + frontend page) | User Account Access | 3 pts |
| 8 | User Logout (backend API + frontend action) | User Account Access | 2 pts |

**Total: 24 story points**

---

## Task Breakdown

### Task 1: Django Project Scaffolding

**Goal**: Create the Django project structure following the architecture doc.

#### Subtasks

1. **T1.1** — Create Django project at `src/backend/` with `config/` module (settings, urls, wsgi, asgi)
2. **T1.2** — Create Django apps: `users`, `doctors` (under `src/backend/apps/`)
3. **T1.3** — Configure `settings.py`:
   - `INSTALLED_APPS` with custom apps and DRF
   - `AUTH_USER_MODEL` pointing to custom User
   - Environment variable loading (python-dotenv)
   - Secret key from env var
4. **T1.4** — Create `requirements.txt` with:
   - Django 5.0+
   - djangorestframework
   - djangorestframework-simplejwt
   - django-cors-headers
   - psycopg2-binary
   - python-dotenv
   - pytest, pytest-django
5. **T1.5** — Create `.env.example` with required env vars
6. **T1.6** — Create `pytest.ini` or `pyproject.toml` test config

#### Tests (T1)

```
tests/backend/test_project_config.py
```

| Test | Verifies |
|------|----------|
| `test_django_settings_loads` | Settings module imports without error |
| `test_secret_key_not_default` | SECRET_KEY is not Django's default insecure key |
| `test_installed_apps_contains_custom_apps` | `users` and `doctors` are in INSTALLED_APPS |
| `test_rest_framework_in_installed_apps` | DRF is in INSTALLED_APPS |
| `test_auth_user_model_set` | AUTH_USER_MODEL points to custom user model |

---

### Task 2: PostgreSQL Database Connection

**Goal**: Connect Django to PostgreSQL and verify the connection works.

#### Subtasks

1. **T2.1** — Configure `DATABASES` in settings to read from env vars (`DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`)
2. **T2.2** — Document database setup instructions in `.env.example`

#### Tests (T2)

```
tests/backend/test_database.py
```

| Test | Verifies |
|------|----------|
| `test_database_engine_is_postgresql` | DATABASES default engine is `django.db.backends.postgresql` |
| `test_database_connection` | Django can connect to the configured database |

---

### Task 3: Database Models & Migrations

**Goal**: Implement all 5 MVP models per [DatabaseDesign.md](file:///Volumes/Data/Code/VibeCodeProject/DoctorApp/docs/architecture/DatabaseDesign.md) and generate initial migrations.

#### Subtasks

1. **T3.1** — Implement `User` model in `users` app:
   - Extend `AbstractUser`
   - Fields: username, full_name, phone_number, age, gender, occupation, insurance_info (nullable), role, is_active
   - UUID primary key
   - USERNAME_FIELD = 'username'
2. **T3.2** — Implement `Specialty` model in `doctors` app:
   - UUID PK, name (unique), description (nullable), timestamps
3. **T3.3** — Implement `Hospital` model in `doctors` app:
   - UUID PK, name (unique), location, address (nullable), timestamps
4. **T3.4** — Implement `ClinicAddress` model in `doctors` app:
   - UUID PK, address_line, city, region (nullable), postal_code (nullable), timestamps
5. **T3.5** — Implement `Doctor` model in `doctors` app:
   - UUID PK, full_name, phone_number (nullable), email (nullable), age (nullable), gender (nullable), years_of_experience (nullable)
   - FK → Specialty (PROTECT), FK → Hospital (PROTECT), FK → ClinicAddress (SET_NULL, nullable)
   - is_active, timestamps
6. **T3.6** — Generate and run migrations: `makemigrations` + `migrate`

#### Tests (T3)

```
tests/backend/test_models.py
```

**User model tests:**

| Test | Verifies |
|------|----------|
| `test_create_user` | User can be created with all required fields |
| `test_user_username_unique` | Duplicate usernames are rejected |
| `test_user_str_representation` | `__str__` returns a readable representation |
| `test_user_default_role` | Default role is 'user' (not admin) |
| `test_user_default_is_active` | New users are active by default |
| `test_user_uuid_primary_key` | PK is a UUID, not an integer |

**Specialty model tests:**

| Test | Verifies |
|------|----------|
| `test_create_specialty` | Specialty can be created with name |
| `test_specialty_name_unique` | Duplicate specialty names are rejected |
| `test_specialty_str` | `__str__` returns the specialty name |

**Hospital model tests:**

| Test | Verifies |
|------|----------|
| `test_create_hospital` | Hospital can be created with name and location |
| `test_hospital_name_unique` | Duplicate hospital names are rejected |
| `test_hospital_str` | `__str__` returns the hospital name |

**ClinicAddress model tests:**

| Test | Verifies |
|------|----------|
| `test_create_clinic_address` | ClinicAddress can be created with address_line and city |
| `test_clinic_address_str` | `__str__` returns a readable address |

**Doctor model tests:**

| Test | Verifies |
|------|----------|
| `test_create_doctor` | Doctor can be created with required fields (full_name, specialty, hospital) |
| `test_doctor_specialty_relationship` | Doctor links to a Specialty correctly |
| `test_doctor_hospital_relationship` | Doctor links to a Hospital correctly |
| `test_doctor_clinic_address_optional` | Doctor can be created without a clinic address |
| `test_doctor_soft_delete` | Setting is_active=False excludes from active filter |
| `test_doctor_str` | `__str__` returns the doctor's full name |
| `test_delete_specialty_with_doctor_prevented` | Deleting a Specialty with linked doctors raises ProtectedError |
| `test_delete_hospital_with_doctor_prevented` | Deleting a Hospital with linked doctors raises ProtectedError |

---

### Task 4: Next.js Frontend Scaffolding

**Goal**: Create the Next.js project with TailwindCSS, basic layout, and design system tokens.

#### Subtasks

1. **T4.1** — Initialize Next.js project at `src/frontend/` using App Router
2. **T4.2** — Install and configure TailwindCSS
3. **T4.3** — Set up global styles with design tokens from [Themes.md](file:///Volumes/Data/Code/VibeCodeProject/DoctorApp/docs/uiux/Themes.md):
   - Blue-based primary palette
   - Inter font
   - Spacing scale, border-radius tokens
4. **T4.4** — Create root layout with basic navigation placeholder
5. **T4.5** — Install Axios for API communication
6. **T4.6** — Create API client utility (`src/frontend/src/lib/api.ts`) with base URL config

#### Tests (T4)

No pytest tests for frontend scaffolding. Verification is manual: `npm run dev` starts without errors and the home page renders.

---

### Task 5: CORS Configuration

**Goal**: Backend accepts requests from the frontend origin.

#### Subtasks

1. **T5.1** — Add `corsheaders` to INSTALLED_APPS and MIDDLEWARE
2. **T5.2** — Configure `CORS_ALLOWED_ORIGINS` from env var (default: `http://localhost:3000`)

#### Tests (T5)

```
tests/backend/test_cors.py
```

| Test | Verifies |
|------|----------|
| `test_cors_middleware_installed` | CorsMiddleware is in MIDDLEWARE list |
| `test_cors_allows_frontend_origin` | CORS_ALLOWED_ORIGINS includes the frontend URL |

---

### Task 6: User Registration API + Page

**Goal**: Users can register with username, password, and all PRD-required personal info. Backend returns JWT tokens on success.

#### Registration Fields (All Required)

- username
- password
- full_name
- phone_number
- age
- gender
- occupation

#### Subtasks

1. **T6.1** — Create `RegisterSerializer` in `users` app:
   - All 7 fields above required
   - Password validation (min 8 chars)
   - Username uniqueness validation
   - Age must be a positive integer
2. **T6.2** — Create `RegisterView` (POST `/api/v1/auth/register/`):
   - Validate input via serializer
   - Create user with hashed password
   - Return user data + JWT tokens (access + refresh)
   - Return 201 on success
3. **T6.3** — Wire URL: `api/v1/auth/register/`
4. **T6.4** — Configure SimpleJWT settings in Django settings
5. **T6.5** — Create registration page in Next.js (`/register`):
   - Form with all 7 required fields
   - Client-side validation
   - API call on submit
   - Success → store tokens in localStorage → redirect to home
   - Error → show error messages

#### Tests (T6)

```
tests/backend/test_auth_register.py
```

| Test | Verifies |
|------|----------|
| `test_register_success` | POST with valid data returns 201 + user data + tokens |
| `test_register_returns_jwt_tokens` | Response contains `access` and `refresh` tokens |
| `test_register_password_is_hashed` | Stored password is not plain text |
| `test_register_missing_required_fields` | POST with missing fields returns 400 with field errors |
| `test_register_duplicate_username` | POST with existing username returns 400 |
| `test_register_short_password` | Password < 8 chars returns 400 |
| `test_register_invalid_age` | Non-integer or negative age returns 400 |
| `test_register_creates_user_in_database` | User record exists in DB after successful registration |
| `test_register_default_role_is_user` | Newly registered user has role='user' |

---

### Task 7: User Login API + Page

**Goal**: Users can log in with username and password to receive JWT tokens.

#### Subtasks

1. **T7.1** — Create `LoginSerializer` in `users` app:
   - Fields: username, password
   - Authenticate against Django auth backend
2. **T7.2** — Create `LoginView` (POST `/api/v1/auth/login/`):
   - Validate credentials
   - Return JWT tokens + basic user info on success
   - Return 401 on invalid credentials
3. **T7.3** — Wire URL: `api/v1/auth/login/`
4. **T7.4** — Create login page in Next.js (`/login`):
   - Form with username + password
   - Store tokens in localStorage on success
   - Success → redirect to home
   - Error → show error message

#### Tests (T7)

```
tests/backend/test_auth_login.py
```

| Test | Verifies |
|------|----------|
| `test_login_success` | POST with valid credentials returns 200 + tokens + user info |
| `test_login_returns_jwt_tokens` | Response contains `access` and `refresh` tokens |
| `test_login_returns_user_info` | Response includes user id, username, full_name |
| `test_login_wrong_password` | POST with wrong password returns 401 |
| `test_login_nonexistent_user` | POST with unknown username returns 401 |
| `test_login_missing_username` | POST without username returns 400 |
| `test_login_missing_password` | POST without password returns 400 |
| `test_login_inactive_user` | Login attempt for is_active=False user returns 401 |

---

### Task 8: User Logout API + Frontend Action

**Goal**: Users can log out, blacklisting their refresh token.

#### Subtasks

1. **T8.1** — Add `rest_framework_simplejwt.token_blacklist` to INSTALLED_APPS
2. **T8.2** — Create `LogoutView` (POST `/api/v1/auth/logout/`):
   - Requires authentication
   - Accepts refresh token in body
   - Blacklists the refresh token
   - Returns 205
3. **T8.3** — Wire URL: `api/v1/auth/logout/`
4. **T8.4** — Frontend: add logout button that calls API, clears localStorage tokens, and redirects to login

#### Tests (T8)

```
tests/backend/test_auth_logout.py
```

| Test | Verifies |
|------|----------|
| `test_logout_success` | POST with valid refresh token returns 205 |
| `test_logout_blacklists_token` | After logout, using the same refresh token to get a new access token fails |
| `test_logout_requires_authentication` | POST without access token returns 401 |
| `test_logout_invalid_refresh_token` | POST with invalid/expired refresh token returns 400 |

---

## Verification Plan

### Automated Tests

All backend tests run with:

```bash
cd src/backend
pytest tests/ -v --tb=short
```

Expected outcome: All tests pass, 0 failures.

### Manual Verification

| Check | How |
|-------|-----|
| Django dev server starts | `python manage.py runserver` → no errors |
| Migrations applied cleanly | `python manage.py migrate` → no errors |
| Next.js dev server starts | `cd src/frontend && npm run dev` → home page renders |
| Register flow works | Fill registration form (all 7 fields) → user created → tokens in localStorage |
| Login flow works | Login with registered user → tokens in localStorage |
| Logout flow works | Click logout → localStorage cleared → redirect to login |
| CORS working | Frontend can call backend API without CORS errors |

---

## Directory Structure After Sprint 1

```
DoctorApp/
├── src/
│   ├── backend/
│   │   ├── config/
│   │   │   ├── __init__.py
│   │   │   ├── settings.py
│   │   │   ├── urls.py
│   │   │   ├── wsgi.py
│   │   │   └── asgi.py
│   │   ├── apps/
│   │   │   ├── __init__.py
│   │   │   ├── users/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── models.py        # Custom User model
│   │   │   │   ├── serializers.py   # Register, Login serializers
│   │   │   │   ├── views.py         # Register, Login, Logout views
│   │   │   │   ├── urls.py          # Auth URL patterns
│   │   │   │   ├── admin.py
│   │   │   │   └── apps.py
│   │   │   └── doctors/
│   │   │       ├── __init__.py
│   │   │       ├── models.py        # Doctor, Specialty, Hospital, ClinicAddress
│   │   │       ├── admin.py
│   │   │       └── apps.py
│   │   ├── manage.py
│   │   ├── requirements.txt
│   │   └── .env.example
│   └── frontend/
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout.tsx
│       │   │   ├── page.tsx
│       │   │   ├── login/page.tsx
│       │   │   └── register/page.tsx
│       │   ├── components/
│       │   └── lib/
│       │       └── api.ts
│       ├── package.json
│       └── tailwind.config.ts
├── tests/
│   └── backend/
│       ├── conftest.py
│       ├── test_project_config.py
│       ├── test_database.py
│       ├── test_models.py
│       ├── test_cors.py
│       ├── test_auth_register.py
│       ├── test_auth_login.py
│       └── test_auth_logout.py
└── docs/
    └── scrum/
        ├── ProductBacklog.md
        ├── Sprint01Plan.md          # This file
        ├── Sprint01Backlog.md
        └── Sprint01Review.md
```

# Doctor Search App (Sprint 1 MVP)

A full-stack application connecting patients with doctors, featuring a Next.js frontend and a Django backend.

## Features Completed (Sprint 1)
- User Authentication (Register/Login via JWT)
- Doctor Directory with Search & Filtering (Name, Specialty, Location, Gender)
- Appointment Booking & Management (Patient/Doctor views)
- Admin Interface for managing directory data
- Responsive UI with Tailwind CSS

## Prerequisites
- Node.js 26+
- Python 3.9+
- PostgreSQL

## Quick Start

### 1. Database Setup
Ensure PostgreSQL is running. The default local development expects a user `nhat` with socket auth, and a database named `doctorapp_dev`.

```bash
# Or create it manually via psql
createdb doctorapp_dev
```

### 2. Backend Setup
```bash
cd src/backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Load seed data (hospitals, specialties, doctors)
python manage.py seed_data

# Create an admin user (if needed)
python manage.py createsuperuser

# Start the dev server (runs on :8000)
python manage.py runserver
```

### 3. Frontend Setup
```bash
cd src/frontend
npm install

# Start the dev server (runs on :3000)
npm run dev
```

## Testing
**Backend tests (pytest):**
```bash
cd src/backend
source .venv/bin/activate
pytest tests/backend/
```

**Frontend build check:**
```bash
cd src/frontend
npm run build
```

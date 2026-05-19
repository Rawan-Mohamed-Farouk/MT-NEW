# Database Scripts

## 📁 Structure

```
scripts/
├── migrations/    # Database migration scripts
└── seeds/         # Data seeding scripts
```

## 🔄 Migrations

### `migrations/migrate_disabilities.py`
Adds new columns to disabilities table:
- `description` (TEXT)
- `category` (VARCHAR)
- `icon` (VARCHAR)
- `created_at` (DATETIME)

**Usage:**
```bash
python backend/scripts/migrations/migrate_disabilities.py
```

### `migrations/migrate_tools.py`
Creates assistive tools tables:
- `assistive_tools` table
- `disability_tools` association table

**Usage:**
```bash
python backend/scripts/migrations/migrate_tools.py
```

### `migrations/migrate_applications_table.py`
Creates/updates applications table with new fields.

## 🌱 Seeds

### `seeds/seed_disabilities.py`
Adds 25+ common disabilities:
- Sensory disabilities (Deaf, Blind, etc.)
- Cognitive disabilities (ADHD, Autism, etc.)
- Physical disabilities (Mobility, etc.)
- Mental health conditions
- Other conditions

**Usage:**
```bash
python backend/scripts/seeds/seed_disabilities.py
```

### `seeds/seed_assistive_tools.py`
Adds 24+ assistive tools:
- Screen readers (NVDA, JAWS, VoiceOver)
- Speech-to-text (Otter.ai, Live Transcribe)
- Focus tools (Todoist, Forest)
- And more...

**Usage:**
```bash
python backend/scripts/seeds/seed_assistive_tools.py
```

### `seeds/seed_jobs.py`
Adds sample job listings with companies and locations.

**Usage:**
```bash
python backend/scripts/seeds/seed_jobs.py
```

## 🔧 Admin Scripts

### `create_admin_user.py`
Creates admin user account.

**Usage:**
```bash
python backend/scripts/create_admin_user.py <email> <password> [name]
```

**Example:**
```bash
python backend/scripts/create_admin_user.py admin@test.com admin123456 Admin
```

## 📝 Notes

- Run migrations before seeding
- Seeds are idempotent (safe to run multiple times)
- Check database connection before running scripts


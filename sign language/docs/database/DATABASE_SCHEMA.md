# EmpowerWork Database Schema Documentation

## Overview

The EmpowerWork database (`rag_jobs`) is a MySQL/MariaDB relational database designed to support a job assistance platform for people with disabilities. The schema includes 12 main tables and 4 association tables for many-to-many relationships.

**Database Name:** `rag_jobs`  
**Character Set:** `utf8mb4`  
**Collation:** `utf8mb4_unicode_ci`  
**Engine:** `InnoDB`

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USERS                                   │
├─────────────────────────────────────────────────────────────────┤
│ PK: id (INT)                                                     │
│     name (VARCHAR(100)) NOT NULL                                │
│     email (VARCHAR(255)) UNIQUE NOT NULL INDEX                  │
│     password (VARCHAR(255))                                     │
│     user_type (VARCHAR(20)) DEFAULT 'user'                      │
│     photo (VARCHAR(500))                                        │
│     phone (VARCHAR(50))                                         │
│     age (INT)                                                   │
│     gender (VARCHAR(20))                                        │
│     location (VARCHAR(255))                                      │
│     experience_level (VARCHAR(50))                              │
│     preferred_job_type (VARCHAR(50))                           │
│     created_at (DATETIME)                                       │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
         │                    │                    │
    ┌────┴────┐         ┌──────┴──────┐      ┌──────┴──────┐
    │         │         │             │      │             │
    ▼         ▼         ▼             ▼      ▼             ▼
┌─────────┐ ┌─────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│USER_    │ │USER_    │ │JOB_          │ │JOB_          │ │SECURITY_     │
│DISABIL- │ │SKILLS   │ │APPLICATIONS  │ │APPLICATIONS  │ │LOGS          │
│ITIES    │ │         │ │(as applicant)│ │(as reviewer) │ │              │
└─────────┘ └─────────┘ └──────────────┘ └──────────────┘ └──────────────┘
    │             │              │              │              │
    │             │              │              │              │
    ▼             ▼              │              │              │
┌─────────────────────────────────────────────────────────────────┐
│                    DISABILITIES                                 │
├─────────────────────────────────────────────────────────────────┤
│ PK: id (INT)                                                     │
│     name (VARCHAR(255)) UNIQUE NOT NULL                         │
│     description (TEXT)                                         │
│     category (VARCHAR(100))                                    │
│     icon (VARCHAR(100))                                         │
│     severity (VARCHAR(50))                                      │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
         │                    │                    │
    ┌────┴────┐         ┌──────┴──────┐      ┌──────┴──────┐
    │         │         │             │      │             │
    ▼         ▼         ▼             ▼      ▼             ▼
┌─────────┐ ┌─────────┐ ┌──────────────┐ ┌──────────────┐
│USER_    │ │JOB_     │ │DISABILITY_   │ │ASSISTIVE_    │
│DISABIL- │ │DISABIL- │ │TOOLS         │ │TOOLS         │
│ITIES    │ │ITY_     │ │              │ │              │
│         │ │SUPPORT  │ │              │ │              │
└─────────┘ └─────────┘ └──────────────┘ └──────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         SKILLS                                   │
├─────────────────────────────────────────────────────────────────┤
│ PK: id (INT)                                                     │
│     name (VARCHAR(255)) UNIQUE NOT NULL                         │
└─────────────────────────────────────────────────────────────────┘
         │
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────────┐
│USER_    │
│SKILLS   │
└─────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         JOBS                                    │
├─────────────────────────────────────────────────────────────────┤
│ PK: id (INT)                                                     │
│     title (VARCHAR(255)) NOT NULL                               │
│     description (TEXT)                                         │
│     employment_type (VARCHAR(50))                              │
│     remote_type (VARCHAR(50))                                   │
│ FK: company_id (INT) → companies.id                            │
│ FK: location_id (INT) → locations.id                           │
│     created_at (DATETIME)                                       │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
         │                    │                    │
    ┌────┴────┐         ┌──────┴──────┐      ┌──────┴──────┐
    │         │         │             │      │             │
    ▼         ▼         ▼             ▼      ▼             ▼
┌─────────┐ ┌─────────┐ ┌──────────────┐ ┌──────────────┐
│JOB_     │ │JOB_     │ │JOB_          │ │COMPANIES     │
│REQUIRE- │ │DISABIL- │ │APPLICATIONS  │ │              │
│MENTS    │ │ITY_     │ │              │ │              │
│         │ │SUPPORT  │ │              │ │              │
└─────────┘ └─────────┘ └──────────────┘ └──────────────┘
    │             │              │              │
    │             │              │              │
    ▼             ▼              │              │
┌─────────────────────────────────────────────────────────────────┐
│                    JOB_REQUIREMENTS                             │
├─────────────────────────────────────────────────────────────────┤
│ PK: id (INT)                                                     │
│ FK: job_id (INT) NOT NULL → jobs.id                            │
│     requirement (VARCHAR(500)) NOT NULL                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    JOB_APPLICATIONS                             │
├─────────────────────────────────────────────────────────────────┤
│ PK: id (INT)                                                     │
│ FK: job_id (INT) NOT NULL → jobs.id                            │
│ FK: user_id (INT) NOT NULL → users.id (applicant)             │
│ FK: reviewer_id (INT) → users.id (admin reviewer)             │
│     cover_letter (TEXT)                                         │
│     cv_path (VARCHAR(500))                                      │
│     cv_file_path (VARCHAR(500))                                │
│     cv_extracted_info (TEXT) [JSON string]                     │
│     manual_info (TEXT)                                         │
│     status (VARCHAR(50)) DEFAULT 'pending'                     │
│     admin_notes (TEXT)                                         │
│     applied_at (DATETIME)                                      │
│     reviewed_at (DATETIME)                                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       COMPANIES                                  │
├─────────────────────────────────────────────────────────────────┤
│ PK: id (INT)                                                     │
│     name (VARCHAR(255)) NOT NULL                               │
│     description (TEXT)                                         │
│     website (VARCHAR(500))                                      │
│     logo (VARCHAR(500))                                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       LOCATIONS                                 │
├─────────────────────────────────────────────────────────────────┤
│ PK: id (INT)                                                     │
│     city (VARCHAR(100))                                        │
│     state (VARCHAR(100))                                       │
│     country (VARCHAR(100))                                      │
│     address (VARCHAR(500))                                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    ASSISTIVE_TOOLS                              │
├─────────────────────────────────────────────────────────────────┤
│ PK: id (INT)                                                     │
│     name (VARCHAR(255)) NOT NULL                               │
│     description (TEXT)                                         │
│     category (VARCHAR(100))                                    │
│     tool_type (VARCHAR(100))                                   │
│     platform (VARCHAR(100))                                    │
│     cost (VARCHAR(50))                                         │
│     website_url (VARCHAR(500))                                 │
│     icon (VARCHAR(100))                                        │
│     features (TEXT)                                            │
└─────────────────────────────────────────────────────────────────┘
         │
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────────┐
│DISABIL- │
│ITY_     │
│TOOLS    │
└─────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    CONVERSATION_LOGS                            │
├─────────────────────────────────────────────────────────────────┤
│ PK: id (INT)                                                     │
│ FK: user_id (INT) → users.id                                   │
│     message (TEXT) NOT NULL                                    │
│     response (TEXT)                                            │
│     created_at (DATETIME)                                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       ACTIVITY_LOG                              │
├─────────────────────────────────────────────────────────────────┤
│ PK: id (INT)                                                     │
│ FK: user_id (INT) → users.id                                   │
│     action (VARCHAR(255)) NOT NULL                             │
│     detail (TEXT)                                              │
│     created_at (DATETIME)                                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       SECURITY_LOGS                             │
├─────────────────────────────────────────────────────────────────┤
│ PK: id (INT)                                                     │
│ FK: user_id (INT) → users.id                                   │
│     ip_address (VARCHAR(45)) NOT NULL [IPv6 support]          │
│     action (VARCHAR(255)) NOT NULL                            │
│     severity (VARCHAR(20)) DEFAULT 'info'                      │
│     threat_type (VARCHAR(100))                                 │
│     details (TEXT)                                             │
│     detected_by (VARCHAR(50)) DEFAULT 'system'                 │
│     blocked (BOOLEAN) DEFAULT FALSE                            │
│     created_at (DATETIME)                                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Table Descriptions

### Core Tables

#### 1. `users`
Stores user account information including profile details and preferences.

**Key Fields:**
- `id`: Primary key
- `email`: Unique identifier, indexed
- `password`: Hashed password (bcrypt)
- `user_type`: 'user' or 'admin'
- `created_at`: Account creation timestamp

**Relationships:**
- One-to-Many with `job_applications` (as applicant)
- One-to-Many with `job_applications` (as reviewer)
- Many-to-Many with `disabilities` via `user_disabilities`
- Many-to-Many with `skills` via `user_skills`
- One-to-Many with `conversation_logs`
- One-to-Many with `activity_log`
- One-to-Many with `security_logs`

#### 2. `disabilities`
Stores disability types and their metadata.

**Key Fields:**
- `id`: Primary key
- `name`: Unique disability name
- `category`: Category (Sensory, Cognitive, Physical, Mental Health, etc.)
- `icon`: Emoji or icon identifier
- `severity`: Optional severity level

**Relationships:**
- Many-to-Many with `users` via `user_disabilities`
- Many-to-Many with `jobs` via `job_disability_support`
- Many-to-Many with `assistive_tools` via `disability_tools`

#### 3. `skills`
Stores available skills that users can have.

**Key Fields:**
- `id`: Primary key
- `name`: Unique skill name

**Relationships:**
- Many-to-Many with `users` via `user_skills`

#### 4. `companies`
Stores company information.

**Key Fields:**
- `id`: Primary key
- `name`: Company name
- `description`: Company description
- `website`: Company website URL
- `logo`: Logo file path

**Relationships:**
- One-to-Many with `jobs`

#### 5. `locations`
Stores location information for jobs.

**Key Fields:**
- `id`: Primary key
- `city`: City name
- `state`: State/Province
- `country`: Country name
- `address`: Full address

**Relationships:**
- One-to-Many with `jobs`

### Job-Related Tables

#### 6. `jobs`
Stores job listings.

**Key Fields:**
- `id`: Primary key
- `title`: Job title
- `description`: Job description
- `employment_type`: full-time, part-time, contract, internship
- `remote_type`: remote, on-site, hybrid
- `company_id`: Foreign key to `companies`
- `location_id`: Foreign key to `locations`
- `created_at`: Job posting date

**Relationships:**
- Many-to-One with `companies`
- Many-to-One with `locations`
- One-to-Many with `job_requirements`
- One-to-Many with `job_applications`
- Many-to-Many with `disabilities` via `job_disability_support`

#### 7. `job_requirements`
Stores individual requirements for each job.

**Key Fields:**
- `id`: Primary key
- `job_id`: Foreign key to `jobs`
- `requirement`: Requirement text

**Relationships:**
- Many-to-One with `jobs`

#### 8. `job_applications`
Stores job applications submitted by users.

**Key Fields:**
- `id`: Primary key
- `job_id`: Foreign key to `jobs`
- `user_id`: Foreign key to `users` (applicant)
- `reviewer_id`: Foreign key to `users` (admin reviewer)
- `cover_letter`: Cover letter text
- `cv_path`: Path to uploaded CV file
- `cv_extracted_info`: JSON string with extracted CV data
- `manual_info`: Manual entry information
- `status`: pending, reviewing, approved, rejected
- `admin_notes`: Admin review notes
- `applied_at`: Application submission timestamp
- `reviewed_at`: Review completion timestamp

**Relationships:**
- Many-to-One with `jobs`
- Many-to-One with `users` (applicant)
- Many-to-One with `users` (reviewer)

### Association Tables (Many-to-Many)

#### 9. `user_disabilities`
Links users to their disabilities.

**Primary Key:** (`user_id`, `disability_id`)

#### 10. `user_skills`
Links users to their skills.

**Primary Key:** (`user_id`, `skill_id`)

#### 11. `job_disability_support`
Links jobs to supported disabilities.

**Primary Key:** (`job_id`, `disability_id`)

#### 12. `disability_tools`
Links disabilities to recommended assistive tools.

**Primary Key:** (`disability_id`, `tool_id`)

### Support Tables

#### 13. `assistive_tools`
Stores assistive tools and resources.

**Key Fields:**
- `id`: Primary key
- `name`: Tool name
- `description`: Tool description
- `category`: Tool category
- `tool_type`: Type of tool (Software, App, Hardware, Service)
- `platform`: Platform compatibility (Windows, Mac, Mobile, Web, All)
- `cost`: Cost information (Free, Paid, Freemium, Subscription)
- `website_url`: Tool website
- `icon`: Icon identifier
- `features`: Feature list

**Relationships:**
- Many-to-Many with `disabilities` via `disability_tools`

### Logging Tables

#### 14. `conversation_logs`
Stores chatbot conversation history.

**Key Fields:**
- `id`: Primary key
- `user_id`: Foreign key to `users`
- `message`: User message
- `response`: Bot response
- `created_at`: Conversation timestamp

**Relationships:**
- Many-to-One with `users`

#### 15. `activity_log`
Stores system activity logs.

**Key Fields:**
- `id`: Primary key
- `user_id`: Foreign key to `users`
- `action`: Action performed
- `detail`: Action details
- `created_at`: Activity timestamp

**Relationships:**
- Many-to-One with `users`

#### 16. `security_logs`
Stores security events and threat detection logs.

**Key Fields:**
- `id`: Primary key
- `user_id`: Foreign key to `users` (if applicable)
- `ip_address`: IP address (IPv6 support)
- `action`: Security action (login_attempt, suspicious_activity, etc.)
- `severity`: info, warning, critical
- `threat_type`: sql_injection, xss, brute_force, etc.
- `details`: Additional details
- `detected_by`: system, ids_model, manual
- `blocked`: Whether the threat was blocked
- `created_at`: Event timestamp

**Relationships:**
- Many-to-One with `users`

---

## Indexes

### Primary Indexes
- All tables have `id` as PRIMARY KEY with AUTO_INCREMENT

### Foreign Key Indexes
- `users.email` - UNIQUE INDEX
- `users.user_type` - INDEX
- `jobs.company_id` - INDEX
- `jobs.location_id` - INDEX
- `jobs.employment_type` - INDEX
- `jobs.remote_type` - INDEX
- `jobs.created_at` - INDEX
- `job_applications.status` - INDEX
- `job_applications.applied_at` - INDEX
- `disabilities.category` - INDEX
- `assistive_tools.category` - INDEX
- `assistive_tools.platform` - INDEX
- `security_logs.severity` - INDEX
- `security_logs.threat_type` - INDEX
- `security_logs.ip_address` - INDEX
- All foreign key columns are indexed

---

## Constraints

### Foreign Key Constraints
- All foreign keys use `ON DELETE CASCADE` for association tables
- Foreign keys to `users` use `ON DELETE SET NULL` for optional relationships
- Foreign keys to `companies` and `locations` use `ON DELETE SET NULL`

### Unique Constraints
- `users.email` - UNIQUE
- `disabilities.name` - UNIQUE
- `skills.name` - UNIQUE
- All association tables have composite PRIMARY KEYs

### Default Values
- `users.user_type` - DEFAULT 'user'
- `users.created_at` - DEFAULT CURRENT_TIMESTAMP
- `jobs.created_at` - DEFAULT CURRENT_TIMESTAMP
- `job_applications.status` - DEFAULT 'pending'
- `job_applications.applied_at` - DEFAULT CURRENT_TIMESTAMP
- `security_logs.severity` - DEFAULT 'info'
- `security_logs.detected_by` - DEFAULT 'system'
- `security_logs.blocked` - DEFAULT FALSE
- All logging tables have `created_at` DEFAULT CURRENT_TIMESTAMP

---

## Data Types

### String Types
- `VARCHAR(20-500)`: Variable-length strings for names, emails, URLs, etc.
- `TEXT`: Large text fields for descriptions, notes, JSON data

### Numeric Types
- `INT`: Integer primary keys and foreign keys
- `BOOLEAN`: Boolean flags (blocked status)

### Date/Time Types
- `DATETIME`: Timestamps for creation, application, review dates

---

## Usage Notes

1. **Password Storage**: Passwords should be hashed using Werkzeug/bcrypt before insertion
2. **JSON Storage**: `cv_extracted_info` stores JSON as TEXT - parse using JSON functions
3. **File Paths**: `cv_path` and `photo` store relative paths from `uploads/` directory
4. **Status Values**: `job_applications.status` should be: 'pending', 'reviewing', 'approved', 'rejected'
5. **User Types**: `users.user_type` should be: 'user' or 'admin'
6. **Severity Levels**: `security_logs.severity` should be: 'info', 'warning', 'critical'

---

## File Locations

- **DDL Script**: `docs/database/DDL.sql`
- **DML Script**: `docs/database/DML.sql`
- **Schema Documentation**: `docs/database/DATABASE_SCHEMA.md`


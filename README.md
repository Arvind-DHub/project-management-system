# Project Management System

A full-stack project management application built with **Next.js**, **PostgreSQL**, and **Tailwind CSS**. Manage projects and tasks with a clean Kanban-style board UI.

---

## Tech Stack

- **Frontend** — Next.js 14 (App Router), React, Tailwind CSS
- **Backend** — Next.js API Routes
- **Database** — PostgreSQL
- **Language** — JavaScript (ES Modules)

---

## Prerequisites

Make sure you have the following installed before you begin:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | v18 or higher | https://nodejs.org |
| npm | v9 or higher | Comes with Node.js |
| PostgreSQL | v14 or higher | https://www.postgresql.org/download |
| Git | Any recent version | https://git-scm.com |

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/project-management-system.git
cd project-management-system
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up PostgreSQL Database

Open **pgAdmin** or **psql** and run:

```sql
CREATE DATABASE project_management;
```

### 4. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
# .env.local
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/project_management
```

Replace `YOUR_PASSWORD` with your actual PostgreSQL password.  
Replace `postgres` with your PostgreSQL username if it is different.

> **Important:** Never commit `.env.local` to GitHub. It is already listed in `.gitignore`.

### 5. Run Database Migration

This creates the `projects` and `tasks` tables in your database. Run it once:

```bash
node lib/migrate.js
```

Expected output:
```
Running migrations...
✅ Migration successful — tables created
```

### 6. Start the Development Server

```bash
npm run dev
```

Open your browser and visit: **http://localhost:3000**

---

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Development server | `npm run dev` | Starts Next.js on http://localhost:3000 |
| Production build | `npm run build` | Builds the app for production |
| Production server | `npm start` | Runs the production build |
| Lint | `npm run lint` | Runs ESLint checks |
| Migrate | `node lib/migrate.js` | Creates database tables (run once) |

---

## Project Structure

```
project-management-system/
│
├── app/
│   ├── api/
│   │   ├── projects/
│   │   │   ├── route.js                  ← GET all projects, POST project
│   │   │   └── [id]/
│   │   │       ├── route.js              ← GET one project, DELETE project
│   │   │       └── tasks/
│   │   │           └── route.js          ← GET tasks, POST task
│   │   └── tasks/
│   │       └── [id]/
│   │           └── route.js              ← PUT task, DELETE task
│   ├── projects/
│   │   └── [id]/
│   │       └── page.js                   ← Project detail + Kanban board
│   ├── globals.css
│   ├── layout.js                         ← Root layout (navbar)
│   └── page.js                           ← Home page (projects list)
│
├── components/
│   ├── CreateProjectModal.js
│   ├── CreateTaskModal.js
│   ├── ProjectCard.js
│   └── TaskCard.js
│
├── lib/
│   ├── db.js                             ← PostgreSQL connection pool
│   └── migrate.js                        ← Database migration script
│
├── .env.local                            ← Environment variables (not in git)
├── .gitignore
├── next.config.js
├── package.json
└── README.md
```

---

## Database Schema

### projects

| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| name | VARCHAR(255) | NOT NULL |
| description | TEXT | nullable |
| created_at | TIMESTAMP | DEFAULT NOW() |

### tasks

| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| project_id | INTEGER | NOT NULL, FK → projects(id) ON DELETE CASCADE |
| title | VARCHAR(255) | NOT NULL |
| description | TEXT | nullable |
| status | VARCHAR(20) | DEFAULT 'todo', CHECK (todo / in-progress / done) |
| priority | VARCHAR(10) | DEFAULT 'medium', CHECK (low / medium / high) |
| due_date | DATE | nullable |
| created_at | TIMESTAMP | DEFAULT NOW() |

---

## Features

- Create, view, and delete projects
- Create, update, and delete tasks within projects
- Kanban board view (To Do / In Progress / Done columns)
- Filter tasks by status
- Sort tasks by due date, priority, or created date
- Pagination for projects list
- Overdue task highlighting
- Input validation on all forms
- Proper error handling on all API routes

---

## Troubleshooting

**`SASL: client password must be a string` error**  
Your `DATABASE_URL` is not loading. Check that `.env.local` exists in the project root and has no spaces around the `=` sign.

**`relation "projects" does not exist` error**  
You haven't run the migration yet. Run `node lib/migrate.js` from the project root.

**Port 3000 already in use**  
Run `npm run dev -- -p 3001` to use port 3001 instead.

**Database connection refused**  
Make sure PostgreSQL is running. On Windows, check Services. On Mac, run `brew services start postgresql`.

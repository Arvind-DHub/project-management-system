const path = require("path");
const dotenv = require("dotenv");

// Load .env.local BEFORE anything else — especially before new Pool()
const result = dotenv.config({
  path: path.resolve(__dirname, "../.env.local"),
});

if (result.error) {
  console.error("❌ Could not find .env.local file:", result.error.message);
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set in .env.local");
  console.error("Your .env.local should look like:");
  console.error(
    "DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/project_management",
  );
  process.exit(1);
}

console.log(
  "✅ DATABASE_URL loaded:",
  process.env.DATABASE_URL.replace(/:([^:@]+)@/, ":****@"),
);

const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  console.log("Running migrations...");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      status VARCHAR(20) NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'done')),
      priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
      due_date DATE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  console.log("✅ Migration successful");
  await pool.end();
}

migrate().catch((err) => {
  console.error("❌ Migration failed:", err.message);
  process.exit(1);
});

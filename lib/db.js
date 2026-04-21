// lib/db.js

import { Pool } from "pg";

// Pool maintains a set of reusable DB connections.
// Instead of opening/closing a connection on every request (slow),
// Pool keeps connections alive and reuses them. Much faster.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// A helper so every file can just call query(sql, params)
// instead of dealing with pool.connect() manually.
export async function query(text, params) {
  const result = await pool.query(text, params);
  return result;
}

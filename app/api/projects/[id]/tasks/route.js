import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const projectId = parseInt(params.id);

    if (isNaN(projectId)) {
      return NextResponse.json(
        { error: "Invalid project ID" },
        { status: 400 },
      );
    }

    // Check if the project exists first
    const projectCheck = await query(`SELECT id FROM projects WHERE id = $1`, [
      projectId,
    ]);
    if (projectCheck.rows.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const sort = searchParams.get("sort");
    const order = searchParams.get("order") || "asc";

    // Whitelist valid values — never trust user input for column names
    const validStatuses = ["todo", "in-progress", "done"];
    const validSortColumns = ["due_date", "created_at", "priority"];
    const validOrders = ["asc", "desc"];

    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `status must be one of: ${validStatuses.join(", ")}` },
        { status: 400 },
      );
    }

    if (sort && !validSortColumns.includes(sort)) {
      return NextResponse.json(
        { error: `sort must be one of: ${validSortColumns.join(", ")}` },
        { status: 400 },
      );
    }

    if (!validOrders.includes(order)) {
      return NextResponse.json(
        { error: "order must be asc or desc" },
        { status: 400 },
      );
    }

    // builds the query dynamically based on what filters were passed.
    // uses a values array and increment the placeholder counter ($1, $2...)
    // to keep parameterization safe.
    const values = [projectId];
    let sql = `SELECT * FROM tasks WHERE project_id = $1`;

    if (status) {
      values.push(status);
      sql += ` AND status = $${values.length}`;
    }

    // validate sort against a whitelist above, so it's safe to interpolate.
    const sortColumn = sort || "created_at";
    sql += ` ORDER BY ${sortColumn} ${order.toUpperCase()}`;

    // Nulls last — tasks with no due_date go to the end when sorting by due_date
    if (sort === "due_date") {
      sql += " NULLS LAST";
    }

    const result = await query(sql, values);

    return NextResponse.json({ data: result.rows });
  } catch (error) {
    console.error("GET /api/projects/[id]/tasks error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 },
    );
  }
}

export async function POST(request, { params }) {
  try {
    const projectId = parseInt(params.id);

    if (isNaN(projectId)) {
      return NextResponse.json(
        { error: "Invalid project ID" },
        { status: 400 },
      );
    }

    // Verify project exists before creating a task under it
    const projectCheck = await query(`SELECT id FROM projects WHERE id = $1`, [
      projectId,
    ]);
    if (projectCheck.rows.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const body = await request.json();
    const { title, description, status, priority, due_date } = body;

    // Validation
    const errors = [];

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      errors.push("title is required and must be a non-empty string");
    } else if (title.trim().length > 255) {
      errors.push("title must be 255 characters or fewer");
    }

    const validStatuses = ["todo", "in-progress", "done"];
    if (status && !validStatuses.includes(status)) {
      errors.push(`status must be one of: ${validStatuses.join(", ")}`);
    }

    const validPriorities = ["low", "medium", "high"];
    if (priority && !validPriorities.includes(priority)) {
      errors.push(`priority must be one of: ${validPriorities.join(", ")}`);
    }

    // Validate due_date is a real date if provided
    if (due_date && isNaN(Date.parse(due_date))) {
      errors.push("due_date must be a valid date string (e.g. 2025-12-31)");
    }

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO tasks (project_id, title, description, status, priority, due_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        projectId,
        title.trim(),
        description?.trim() || null,
        status || "todo",
        priority || "medium",
        due_date || null,
      ],
    );

    return NextResponse.json({ data: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error("POST /api/projects/[id]/tasks error:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 },
    );
  }
}

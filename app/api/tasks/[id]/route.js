import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    // Check task exists
    const taskCheck = await query(`SELECT * FROM tasks WHERE id = $1`, [id]);
    if (taskCheck.rows.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const body = await request.json();
    const { title, description, status, priority, due_date } = body;

    // Validation
    const errors = [];
    const validStatuses = ["todo", "in-progress", "done"];
    const validPriorities = ["low", "medium", "high"];

    if (title !== undefined) {
      if (typeof title !== "string" || title.trim().length === 0) {
        errors.push("title must be a non-empty string");
      } else if (title.trim().length > 255) {
        errors.push("title must be 255 characters or fewer");
      }
    }

    if (status !== undefined && !validStatuses.includes(status)) {
      errors.push(`status must be one of: ${validStatuses.join(", ")}`);
    }

    if (priority !== undefined && !validPriorities.includes(priority)) {
      errors.push(`priority must be one of: ${validPriorities.join(", ")}`);
    }

    if (
      due_date !== undefined &&
      due_date !== null &&
      isNaN(Date.parse(due_date))
    ) {
      errors.push("due_date must be a valid date string");
    }

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    // Merge incoming fields with the existing task values.
    // update just `status` without sending all other fields.
    const existing = taskCheck.rows[0];
    const updatedTitle = title !== undefined ? title.trim() : existing.title;
    const updatedDesc =
      description !== undefined ? description?.trim() : existing.description;
    const updatedStatus = status !== undefined ? status : existing.status;
    const updatedPriority =
      priority !== undefined ? priority : existing.priority;
    const updatedDueDate =
      due_date !== undefined ? due_date : existing.due_date;

    const result = await query(
      `UPDATE tasks
       SET title = $1, description = $2, status = $3, priority = $4, due_date = $5
       WHERE id = $6
       RETURNING *`,
      [
        updatedTitle,
        updatedDesc,
        updatedStatus,
        updatedPriority,
        updatedDueDate,
        id,
      ],
    );

    return NextResponse.json({ data: result.rows[0] });
  } catch (error) {
    console.error("PUT /api/tasks/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    const result = await query(`DELETE FROM tasks WHERE id = $1 RETURNING *`, [
      id,
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Task deleted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("DELETE /api/tasks/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 },
    );
  }
}

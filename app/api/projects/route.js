import { query } from "@/lib/db";
import { NextResponse } from "next/server";

// Returns a paginated list of all projects.
export async function GET(request) {
  try {
    // Extract query params from the URL
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Validate page and limit are positive numbers
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: "page must be >= 1 and limit must be between 1 and 100" },
        { status: 400 },
      );
    }

    const offset = (page - 1) * limit;

    // the total row count without a second query.
    const result = await query(
      `SELECT *, COUNT(*) OVER() AS total_count
       FROM projects
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`, // they prevent SQL injection
      [limit, offset],
    );

    const totalCount = result.rows[0]?.total_count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      data: result.rows,
      pagination: {
        page,
        limit,
        totalCount: parseInt(totalCount),
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("GET /api/projects error:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 },
    );
  }
}

// Creates a new project. Expects { name, description } in the request body.
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "name is required and must be a non-empty string" },
        { status: 400 },
      );
    }

    if (name.trim().length > 255) {
      return NextResponse.json(
        { error: "name must be 255 characters or fewer" },
        { status: 400 },
      );
    }

    const result = await query(
      `INSERT INTO projects (name, description)
       VALUES ($1, $2)
       RETURNING *`,
      [name.trim(), description?.trim() || null],
    );

    return NextResponse.json({ data: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error("POST /api/projects error:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 },
    );
  }
}

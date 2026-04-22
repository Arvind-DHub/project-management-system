# API Documentation

Base URL: `http://localhost:3000`

All requests and responses use **JSON**. All response bodies follow this structure:

```json
{ "data": { } }         // success — single item
{ "data": [ ] }         // success — list
{ "error": "..." }      // single error
{ "errors": [ ] }       // multiple validation errors
```

---

## Projects

### POST /api/projects

Creates a new project.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Project name, max 255 characters |
| description | string | No | Project description |

**Example Request**

```http
POST /api/projects
Content-Type: application/json

{
  "name": "Website Redesign",
  "description": "Redesign the company website with new branding"
}
```

**Example Response — 201 Created**

```json
{
  "data": {
    "id": 1,
    "name": "Website Redesign",
    "description": "Redesign the company website with new branding",
    "created_at": "2025-01-15T10:30:00.000Z"
  }
}
```

**Error Responses**

| Status | Reason |
|--------|--------|
| 400 | `name` is missing or empty |
| 400 | `name` exceeds 255 characters |
| 500 | Database error |

---

### GET /api/projects

Returns a paginated list of all projects, newest first.

**Query Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number (min 1) |
| limit | integer | 10 | Items per page (min 1, max 100) |

**Example Request**

```http
GET /api/projects?page=1&limit=6
```

**Example Response — 200 OK**

```json
{
  "data": [
    {
      "id": 2,
      "name": "Mobile App",
      "description": "Build the iOS and Android app",
      "created_at": "2025-01-16T09:00:00.000Z"
    },
    {
      "id": 1,
      "name": "Website Redesign",
      "description": "Redesign the company website",
      "created_at": "2025-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 6,
    "totalCount": 2,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

**Error Responses**

| Status | Reason |
|--------|--------|
| 500 | Database error |

---

### GET /api/projects/:id

Returns a single project by ID.

**URL Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | The project ID |

**Example Request**

```http
GET /api/projects/1
```

**Example Response — 200 OK**

```json
{
  "data": {
    "id": 1,
    "name": "Website Redesign",
    "description": "Redesign the company website with new branding",
    "created_at": "2025-01-15T10:30:00.000Z"
  }
}
```

**Error Responses**

| Status | Reason |
|--------|--------|
| 400 | `id` is not a valid number |
| 404 | Project not found |
| 500 | Database error |

---

### DELETE /api/projects/:id

Deletes a project and all its tasks.

> **Note:** Deleting a project permanently deletes all tasks belonging to it via `ON DELETE CASCADE`.

**URL Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | The project ID |

**Example Request**

```http
DELETE /api/projects/1
```

**Example Response — 200 OK**

```json
{
  "message": "Deleted successfully",
  "data": {
    "id": 1,
    "name": "Website Redesign",
    "description": "Redesign the company website with new branding",
    "created_at": "2025-01-15T10:30:00.000Z"
  }
}
```

**Error Responses**

| Status | Reason |
|--------|--------|
| 400 | `id` is not a valid number |
| 404 | Project not found |
| 500 | Database error |

---

## Tasks

### POST /api/projects/:id/tasks

Creates a new task under a project.

**URL Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | The project ID |

**Request Body**

| Field | Type | Required | Allowed Values | Default |
|-------|------|----------|----------------|---------|
| title | string | Yes | Any, max 255 chars | — |
| description | string | No | Any | null |
| status | string | No | `todo`, `in-progress`, `done` | `todo` |
| priority | string | No | `low`, `medium`, `high` | `medium` |
| due_date | string | No | ISO date e.g. `2025-12-31` | null |

**Example Request**

```http
POST /api/projects/1/tasks
Content-Type: application/json

{
  "title": "Design homepage mockup",
  "description": "Create wireframes in Figma",
  "status": "todo",
  "priority": "high",
  "due_date": "2025-02-01"
}
```

**Example Response — 201 Created**

```json
{
  "data": {
    "id": 1,
    "project_id": 1,
    "title": "Design homepage mockup",
    "description": "Create wireframes in Figma",
    "status": "todo",
    "priority": "high",
    "due_date": "2025-02-01",
    "created_at": "2025-01-15T11:00:00.000Z"
  }
}
```

**Error Responses**

| Status | Reason |
|--------|--------|
| 400 | `title` is missing or empty |
| 400 | `status` is not a valid value |
| 400 | `priority` is not a valid value |
| 400 | `due_date` is not a valid date string |
| 404 | Project not found |
| 500 | Database error |

**Validation Error Example — 400**

```json
{
  "errors": [
    "title is required",
    "status must be one of: todo, in-progress, done"
  ]
}
```

---

### GET /api/projects/:id/tasks

Returns all tasks for a project. Supports filtering by status and sorting.

**URL Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | The project ID |

**Query Parameters**

| Parameter | Type | Allowed Values | Description |
|-----------|------|----------------|-------------|
| status | string | `todo`, `in-progress`, `done` | Filter tasks by status |
| sort | string | `due_date`, `created_at`, `priority` | Column to sort by |
| order | string | `asc`, `desc` | Sort direction (default: `asc`) |

**Example Requests**

```http
# All tasks
GET /api/projects/1/tasks

# Only in-progress tasks
GET /api/projects/1/tasks?status=in-progress

# Sorted by due date ascending
GET /api/projects/1/tasks?sort=due_date&order=asc

# Filter + sort combined
GET /api/projects/1/tasks?status=todo&sort=priority&order=desc
```

**Example Response — 200 OK**

```json
{
  "data": [
    {
      "id": 2,
      "project_id": 1,
      "title": "Write copy for homepage",
      "description": null,
      "status": "todo",
      "priority": "medium",
      "due_date": "2025-02-10",
      "created_at": "2025-01-15T12:00:00.000Z"
    },
    {
      "id": 1,
      "project_id": 1,
      "title": "Design homepage mockup",
      "description": "Create wireframes in Figma",
      "status": "todo",
      "priority": "high",
      "due_date": "2025-02-01",
      "created_at": "2025-01-15T11:00:00.000Z"
    }
  ]
}
```

**Error Responses**

| Status | Reason |
|--------|--------|
| 400 | `status` filter is not a valid value |
| 400 | `sort` column is not a valid value |
| 400 | `order` is not `asc` or `desc` |
| 404 | Project not found |
| 500 | Database error |

---

### PUT /api/tasks/:id

Updates an existing task. Only the fields you send will be updated — all other fields keep their current values.

**URL Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | The task ID |

**Request Body**

All fields are optional. Send only the fields you want to update.

| Field | Type | Allowed Values |
|-------|------|----------------|
| title | string | Any, max 255 chars |
| description | string | Any |
| status | string | `todo`, `in-progress`, `done` |
| priority | string | `low`, `medium`, `high` |
| due_date | string | ISO date e.g. `2025-12-31`, or `null` to clear |

**Example Request — update status only**

```http
PUT /api/tasks/1
Content-Type: application/json

{
  "status": "in-progress"
}
```

**Example Request — update multiple fields**

```http
PUT /api/tasks/1
Content-Type: application/json

{
  "title": "Design homepage mockup v2",
  "priority": "medium",
  "due_date": "2025-02-15"
}
```

**Example Response — 200 OK**

```json
{
  "data": {
    "id": 1,
    "project_id": 1,
    "title": "Design homepage mockup v2",
    "description": "Create wireframes in Figma",
    "status": "in-progress",
    "priority": "medium",
    "due_date": "2025-02-15",
    "created_at": "2025-01-15T11:00:00.000Z"
  }
}
```

**Error Responses**

| Status | Reason |
|--------|--------|
| 400 | `id` is not a valid number |
| 400 | `title` is an empty string |
| 400 | `status` is not a valid value |
| 400 | `priority` is not a valid value |
| 400 | `due_date` is not a valid date string |
| 404 | Task not found |
| 500 | Database error |

---

### DELETE /api/tasks/:id

Deletes a single task by ID.

**URL Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | The task ID |

**Example Request**

```http
DELETE /api/tasks/1
```

**Example Response — 200 OK**

```json
{
  "message": "Task deleted successfully",
  "data": {
    "id": 1,
    "project_id": 1,
    "title": "Design homepage mockup",
    "description": "Create wireframes in Figma",
    "status": "in-progress",
    "priority": "high",
    "due_date": "2025-02-01",
    "created_at": "2025-01-15T11:00:00.000Z"
  }
}
```

**Error Responses**

| Status | Reason |
|--------|--------|
| 400 | `id` is not a valid number |
| 404 | Task not found |
| 500 | Database error |

---

## HTTP Status Code Reference

| Code | Meaning | When it's used |
|------|---------|----------------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST (new resource created) |
| 400 | Bad Request | Invalid input, failed validation |
| 404 | Not Found | Resource with given ID does not exist |
| 500 | Internal Server Error | Unexpected database or server error |

---

## Quick Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/projects` | Create a project |
| GET | `/api/projects?page=1&limit=10` | List all projects (paginated) |
| GET | `/api/projects/:id` | Get a single project |
| DELETE | `/api/projects/:id` | Delete a project + all its tasks |
| POST | `/api/projects/:id/tasks` | Create a task |
| GET | `/api/projects/:id/tasks` | List tasks (with filter + sort) |
| PUT | `/api/tasks/:id` | Update a task (partial) |
| DELETE | `/api/tasks/:id` | Delete a task |

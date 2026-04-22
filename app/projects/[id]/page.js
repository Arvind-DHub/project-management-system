// app/projects/[id]/page.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import TaskCard from "@/components/TaskCard";
import CreateTaskModal from "@/components/CreateTaskModal";

// Groups tasks into three columns for the Kanban-style view
const STATUSES = ["todo", "in-progress", "done"];
const STATUS_LABELS = {
  todo: "To Do",
  "in-progress": "In Progress",
  done: "Done",
};
const COLUMN_COLORS = {
  todo: "border-gray-300",
  "in-progress": "border-blue-400",
  done: "border-green-400",
};

export default function ProjectDetailPage() {
  const { id } = useParams(); // Gets the [id] from the URL
  const router = useRouter(); // For programmatic navigation

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);

  // Filter + Sort controls (all client-side state → they update the URL params sent to the API)
  const [filterStatus, setFilterStatus] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const fetchTasks = useCallback(async () => {
    const params = new URLSearchParams();
    if (filterStatus) params.set("status", filterStatus);
    if (sortBy) {
      params.set("sort", sortBy);
      params.set("order", sortOrder);
    }

    const res = await fetch(`/api/projects/${id}/tasks?${params.toString()}`);
    const data = await res.json();
    setTasks(data.data || []);
  }, [id, filterStatus, sortBy, sortOrder]);

  // Fetch both project info and tasks on load and when filters change
  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const [projectRes] = await Promise.all([
          fetch(`/api/projects/${id}`),
          fetchTasks(),
        ]);

        if (!projectRes.ok) {
          router.push("/"); // Project not found → go home
          return;
        }

        const projectData = await projectRes.json();
        setProject(projectData.data);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch tasks when filters/sort changes (not on first load — that's handled above)
  useEffect(() => {
    if (!loading) fetchTasks();
  }, [filterStatus, sortBy, sortOrder]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleDeleteTask(taskId) {
    if (!confirm("Delete this task?")) return;
    const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    if (res.ok) {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    }
  }

  async function handleStatusChange(taskId, newStatus) {
    // Optimistic update: update UI immediately, then sync with API
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
    );

    await fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  }

  function handleTaskCreated(newTask) {
    setTasks((prev) => [newTask, ...prev]);
  }

  // Filters tasks by status for each Kanban column
  function getTasksForStatus(status) {
    return tasks.filter((t) => t.status === status);
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-4 bg-gray-100 rounded w-1/2"></div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div>
      {/* Project header */}
      <div className="mb-8">
        <a href="/" className="text-sm text-indigo-600 hover:underline">
          ← All Projects
        </a>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">
          {project.name}
        </h1>
        {project.description && (
          <p className="text-gray-500 mt-1">{project.description}</p>
        )}
        <p className="text-xs text-gray-400 mt-2">
          Created {new Date(project.created_at).toLocaleDateString()}
          {" · "}
          {tasks.length} task{tasks.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Controls bar — filter + sort + new task button */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Filter by status */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All statuses</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        {/* Sort by */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Sort by: Default</option>
          <option value="due_date">Due Date</option>
          <option value="priority">Priority</option>
          <option value="created_at">Created</option>
        </select>

        {/* Sort order (only show if sort is selected) */}
        {sortBy && (
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        )}

        <div className="flex-1" />

        <button
          onClick={() => setShowTaskModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          + New Task
        </button>
      </div>

      {/* Kanban columns */}
      {tasks.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">✅</p>
          <h2 className="text-lg font-semibold text-gray-700">No tasks yet</h2>
          <p className="text-gray-500 mt-1 text-sm">
            Add your first task to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STATUSES.map((status) => {
            const columnTasks = getTasksForStatus(status);
            return (
              <div
                key={status}
                className={`bg-gray-50 rounded-xl p-4 border-t-4 ${COLUMN_COLORS[status]}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-700">
                    {STATUS_LABELS[status]}
                  </h2>
                  <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">
                    {columnTasks.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onDelete={handleDeleteTask}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                  {columnTasks.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-6">
                      No tasks here
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task creation modal */}
      {showTaskModal && (
        <CreateTaskModal
          projectId={id}
          onClose={() => setShowTaskModal(false)}
          onCreate={handleTaskCreated}
        />
      )}
    </div>
  );
}

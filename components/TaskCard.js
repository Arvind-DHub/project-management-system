// components/TaskCard.js
"use client";

// Maps each status to a Tailwind color combination
const STATUS_STYLES = {
  todo: "bg-gray-100 text-gray-700",
  "in-progress": "bg-blue-100 text-blue-700",
  done: "bg-green-100 text-green-700",
};

const PRIORITY_STYLES = {
  low: "bg-emerald-50 text-emerald-700",
  medium: "bg-amber-50 text-amber-700",
  high: "bg-red-50 text-red-700",
};

export default function TaskCard({ task, onDelete, onStatusChange }) {
  const dueDateFormatted = task.due_date
    ? new Date(task.due_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  // Is the task overdue? Compare today's date to due_date
  const isOverdue =
    task.due_date &&
    task.status !== "done" &&
    new Date(task.due_date) < new Date();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-gray-900 flex-1">{task.title}</h3>
        <button
          onClick={() => onDelete(task.id)}
          className="text-gray-300 hover:text-red-400 text-sm flex-shrink-0"
        >
          ✕
        </button>
      </div>

      {task.description && (
        <p className="text-sm text-gray-500 mt-1">{task.description}</p>
      )}

      <div className="flex flex-wrap gap-2 mt-3">
        {/* Status badge — clicking cycles through statuses */}
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value)}
          className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${STATUS_STYLES[task.status]}`}
        >
          <option value="todo">Todo</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${PRIORITY_STYLES[task.priority]}`}
        >
          {task.priority}
        </span>
      </div>

      {dueDateFormatted && (
        <p
          className={`text-xs mt-2 ${isOverdue ? "text-red-500 font-medium" : "text-gray-400"}`}
        >
          {isOverdue ? "⚠ Overdue: " : "Due: "}
          {dueDateFormatted}
        </p>
      )}
    </div>
  );
}

// components/ProjectCard.js
// A reusable card displayed in the projects list.
// "use client" — this runs in the browser, not on the server,
// because it uses onClick (an event handler).

"use client";

export default function ProjectCard({ project, onDelete }) {
  const formattedDate = new Date(project.created_at).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <a
            href={`/projects/${project.id}`}
            className="text-lg font-semibold text-gray-900 hover:text-indigo-600 transition-colors block truncate"
          >
            {project.name}
          </a>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {project.description || "No description provided"}
          </p>
        </div>
        <button
          onClick={() => onDelete(project.id)}
          className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 text-sm font-medium"
        >
          Delete
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-4">Created {formattedDate}</p>
    </div>
  );
}

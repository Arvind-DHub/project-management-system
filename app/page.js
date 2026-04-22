// app/page.js
// "use client" because this page has state (modal open/closed, list of projects)
// and makes fetch calls on user interaction.

"use client";

import { useState, useEffect, useCallback } from "react";
import ProjectCard from "@/components/ProjectCard";
import CreateProjectModal from "@/components/CreateProjectModal";

export default function HomePage() {
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // useCallback memoizes this function so it doesn't re-create on every render.
  // We pass it as a dependency to useEffect, which is why memoization matters.
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects?page=${page}&limit=6`);
      const data = await res.json();
      setProjects(data.data || []);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  // Runs whenever `page` changes (because fetchProjects depends on page)
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  async function handleDelete(id) {
    if (!confirm("Delete this project and all its tasks?")) return;

    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (res.ok) {
      // Re-fetch to keep pagination numbers accurate
      fetchProjects();
    }
  }

  function handleProjectCreated(newProject) {
    // Optimistic update — add the new project to the top of the list instantly
    // without waiting for a refetch. Better UX.
    setProjects((prev) => [newProject, ...prev]);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          {pagination && (
            <p className="text-sm text-gray-500 mt-1">
              {pagination.totalCount} project
              {pagination.totalCount !== 1 ? "s" : ""} total
            </p>
          )}
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + New Project
        </button>
      </div>

      {/* Projects grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Skeleton loaders */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-gray-100 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-100 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-5xl mb-4">📋</p>
          <h2 className="text-xl font-semibold text-gray-700">
            No projects yet
          </h2>
          <p className="text-gray-500 mt-2">
            Create your first project to get started
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-6 bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Pagination controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-10">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={!pagination.hasPrevPage}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!pagination.hasNextPage}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <CreateProjectModal
          onClose={() => setShowModal(false)}
          onCreate={handleProjectCreated}
        />
      )}
    </div>
  );
}

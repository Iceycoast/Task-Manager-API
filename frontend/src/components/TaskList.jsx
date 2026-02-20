import { useEffect, useState } from "react";
import API from "../api";

const LIMIT = 10;

const statusStyles = {
  pending: "bg-amber-50 text-amber-800 border-amber-200",
  in_progress: "bg-blue-50 text-blue-800 border-blue-200",
  completed: "bg-emerald-50 text-emerald-800 border-emerald-200",
};

const priorityStyles = {
  low: "bg-neutral-100 text-neutral-600 border-neutral-200",
  medium: "bg-neutral-200 text-neutral-800 border-neutral-300",
  high: "bg-red-50 text-red-700 border-red-200",
};

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const res = await API.get(
          `/tasks?limit=${LIMIT}&offset=${page * LIMIT}`
        );

        setTasks(res.data.data ?? []);
        setTotal(res.data.total);
      } catch (err) {
        alert(err.response?.data?.detail || "Failed to fetch tasks");
      }
    };

    loadTasks();
  }, [page]);

  const deleteTask = async (taskId) => {
    try {
      await API.delete(`/tasks/${taskId}`);

      setTasks((prev) => prev.filter((t) => t.task_id !== taskId));
      setTotal((prev) => prev - 1);

      if (tasks.length === 1 && page > 0) {
        setPage((prev) => prev - 1);
      }
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete task");
    }
  };

  const updateTask = async (taskId) => {
    if (Object.keys(editData).length === 0) {
      alert("No fields modified.");
      return;
    }

    try {
      const res = await API.patch(`/tasks/${taskId}`, editData);

      setTasks((prev) =>
        prev.map((task) =>
          task.task_id === taskId ? res.data : task
        )
      );

      setEditingTaskId(null);
      setEditData({});
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to update task");
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div>
      <h3 className="text-lg font-semibold text-neutral-800 mb-4">
        Your Tasks
      </h3>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.task_id}
            className="border border-neutral-200 rounded-lg bg-white p-4 shadow-sm"
          >
            {editingTaskId === task.task_id ? (
              <div className="space-y-3">
                <input
                  value={editData.title ?? task.title}
                  onChange={(e) =>
                    setEditData({ ...editData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
                />

                <div className="flex flex-wrap gap-3">
                  <select
                    value={editData.status ?? task.status}
                    onChange={(e) =>
                      setEditData({ ...editData, status: e.target.value })
                    }
                    className="px-3 py-2 border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>

                  <select
                    value={editData.priority ?? task.priority}
                    onChange={(e) =>
                      setEditData({ ...editData, priority: e.target.value })
                    }
                    className="px-3 py-2 border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>

                  <input
                    type="date"
                    value={editData.due_date ?? task.due_date ?? ""}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        due_date: e.target.value || null,
                      })
                    }
                    className="px-3 py-2 border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => updateTask(task.task_id)}
                    className="px-3 py-1.5 text-sm font-medium text-white bg-neutral-800 rounded-md hover:bg-neutral-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingTaskId(null);
                      setEditData({});
                    }}
                    className="px-3 py-1.5 text-sm font-medium text-neutral-600 bg-neutral-100 rounded-md hover:bg-neutral-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-medium text-neutral-800">{task.title}</h4>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setEditingTaskId(task.task_id);
                        setEditData({});
                      }}
                      className="text-xs font-medium text-neutral-600 hover:text-neutral-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteTask(task.task_id)}
                      className="text-xs font-medium text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-2 text-sm items-center">
                  <span className="text-neutral-500">Status:</span>
                  <span
                    className={`px-2 py-0.5 rounded border ${
                      statusStyles[task.status] ?? "bg-neutral-100 text-neutral-600 border-neutral-200"
                    }`}
                  >
                    {task.status.replace("_", " ")}
                  </span>
                  <span className="text-neutral-500">Priority:</span>
                  <span
                    className={`px-2 py-0.5 rounded border ${
                      priorityStyles[task.priority] ?? "bg-neutral-50 text-neutral-600 border-neutral-200"
                    }`}
                  >
                    {task.priority}
                  </span>
                  <span className="text-neutral-500">
                    Due: {task.due_date || "—"}
                  </span>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <p className="text-sm text-neutral-500 py-8 text-center">
          No tasks yet. Create one to get started.
        </p>
      )}

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          <button
            disabled={page === 0}
            onClick={() => setPage((prev) => prev - 1)}
            className="px-3 py-1.5 text-sm font-medium text-neutral-700 bg-white border border-neutral-200 rounded-md hover:bg-neutral-50 disabled:opacity-50 disabled:pointer-events-none"
          >
            Previous
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`min-w-[2rem] px-2 py-1.5 text-sm font-medium rounded-md ${
                  page === i
                    ? "bg-neutral-800 text-white"
                    : "bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            className="px-3 py-1.5 text-sm font-medium text-neutral-700 bg-white border border-neutral-200 rounded-md hover:bg-neutral-50 disabled:opacity-50 disabled:pointer-events-none"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

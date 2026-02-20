import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function TaskForm() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");

  const handleCreate = async () => {
    if (!title.trim()) {
      alert("Title cannot be empty");
      return;
    }

    try {
      await API.post("/tasks", {
        title,
        priority,
        due_date: dueDate || null,
      });

      navigate("/tasks");
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to create task");
    }
  };

  return (
    <div className="border border-neutral-200 rounded-lg bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-neutral-800 mb-4">
        Create Task
      </h3>

      <div className="space-y-4">
        <input
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-neutral-200 rounded-md text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 focus:border-neutral-400"
        />

        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[120px]">
            <label className="block text-xs text-neutral-500 mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs text-neutral-500 mb-1">
              Due date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={handleCreate}
          className="px-4 py-2 text-sm font-medium text-white bg-neutral-800 rounded-md hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-1"
        >
          Create
        </button>
        <button
          type="button"
          onClick={() => navigate("/tasks")}
          className="px-4 py-2 text-sm font-medium text-neutral-600 bg-neutral-100 rounded-md hover:bg-neutral-200 focus:outline-none"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

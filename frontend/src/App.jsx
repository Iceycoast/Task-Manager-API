import { useState } from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import Auth from "./components/Auth";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import { setAuthToken } from "./api";

function App() {
  const [loggedIn, setLoggedIn] = useState(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setAuthToken(token);
      return true;
    }
    return false;
  });

  if (!loggedIn) {
    return <Auth onLogin={() => setLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-neutral-200 bg-white">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-neutral-800">Task Manager</h1>
          <nav className="flex items-center gap-4">
            <Link
              to="/create"
              className="text-sm text-neutral-600 hover:text-neutral-900"
            >
              Create Task
            </Link>
            <Link
              to="/tasks"
              className="text-sm text-neutral-600 hover:text-neutral-900"
            >
              View Tasks
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                setAuthToken(null);
                setLoggedIn(false);
              }}
              className="text-sm text-neutral-500 hover:text-neutral-800"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Navigate to="/tasks" />} />
          <Route path="/create" element={<TaskForm />} />
          <Route path="/tasks" element={<TaskList />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

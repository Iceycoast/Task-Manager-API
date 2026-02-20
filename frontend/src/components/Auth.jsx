import { useState } from "react";
import API, { setAuthToken } from "../api";

export default function Auth({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const register = async () => {
    try {
      await API.post("/auth/register", { email, password });
      alert("Registered successfully. Now login.");
    } catch (err) {
      alert(err.response?.data?.detail || "Registration failed");
    }
  };

  const login = async () => {
    try {
      const res = await API.post("/auth/login", { email, password });
      const token = res.data.access_token;

      localStorage.setItem("token", token);
      setAuthToken(token);
      onLogin();
    } catch (err) {
      alert(err.response?.data?.detail || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm border border-neutral-200 rounded-lg bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-neutral-800 mb-6">
          Sign in
        </h2>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-200 rounded-md text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 focus:border-neutral-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-200 rounded-md text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 focus:border-neutral-400"
          />
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={login}
            className="flex-1 py-2 text-sm font-medium text-white bg-neutral-800 rounded-md hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-1"
          >
            Login
          </button>
          <button
            onClick={register}
            className="flex-1 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-md hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-1"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}

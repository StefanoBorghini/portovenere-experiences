"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function AdminGatePage() {

  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/admin";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {

    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {

      const response = await fetch("/api/admin-gate-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!data.success) {
        setError("Invalid credentials.");
        setIsSubmitting(false);
        return;
      }

      window.location.href = redirectTo;

    } catch (err) {
      console.error("admin-gate-login failed:", err);
      setError("Something went wrong — please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm flex flex-col gap-5"
      >

        <p className="uppercase tracking-[0.3em] text-zinc-500 text-xs text-center mb-2">
          Restricted Access
        </p>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full rounded-2xl px-6 py-4 text-white placeholder:text-zinc-500 outline-none border border-white/10 bg-white/5 focus:border-white/40 transition"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-2xl px-6 py-4 text-white placeholder:text-zinc-500 outline-none border border-white/10 bg-white/5 focus:border-white/40 transition"
        />

        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-white text-black py-4 rounded-full uppercase tracking-[0.25em] text-xs hover:scale-[1.02] transition-all duration-500 disabled:opacity-50"
        >
          {isSubmitting ? "Checking..." : "Enter"}
        </button>

      </form>
    </main>
  );
}
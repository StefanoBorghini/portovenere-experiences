"use client";

import { useState } from "react";

export default function PrivateAccessPage() {

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  async function handleLogin() {

    const response = await fetch(
      "/api/private-login",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          username,
          password,
        }),
      }
    );

    const data = await response.json();

    if (data.success) {

      window.location.href =
        data.redirect;

    } else {

      alert("Invalid credentials");

    }
  }

  return (

    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">

      <div className="w-full max-w-md space-y-6">

        <div className="space-y-2 text-center">
 <img
    src="/images/logo-white.png"
    alt="Portovenere Experiences"
    className="
      w-28
      md:w-36
      object-contain
      mb-6
      opacity-95
    "
  />
          <p className="uppercase tracking-[0.3em] text-sm opacity-60">
            Portovenere Experiences
          </p>

          <h1 className="text-4xl font-light">
            Private Guest Access
          </h1>

          <p className="opacity-70 text-sm">
            Enter your private credentials
            to access your curated proposal.
          </p>

        </div>

        <div className="space-y-4">

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) =>
              setUsername(
                e.target.value
              )
            }
            className="w-full bg-transparent border border-white/20 p-4 rounded-xl"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            className="w-full bg-transparent border border-white/20 p-4 rounded-xl"
          />

          <button
            onClick={handleLogin}
            className="w-full bg-white text-black rounded-xl p-4"
          >
            Enter Experience
          </button>

        </div>

      </div>

    </main>
  );
}
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {

  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  async function handleLogin() {

    if (!supabase) return;

    const { error } =
      await supabase.auth.signInWithPassword({

        email,

        password,

      });

    if (error) {

      alert(error.message);

      return;
    }

    router.push(
      "/admin/experiences"
    );
  }

  return (

    <div
      style={{
        maxWidth: "400px",
        margin: "100px auto",
      }}
    >

      <h1>
        Admin Login
      </h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) =>
          setEmail(
            e.target.value
          )
        }
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "10px",
        }}
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
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "10px",
        }}
      />

      <button
        onClick={handleLogin}
      >
        Login
      </button>

    </div>
  );
}
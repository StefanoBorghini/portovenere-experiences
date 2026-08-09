"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface HeaderProps {

  title: string;

  operator: string;

  category: string;

  active: boolean;

  experienceId: string;

  onLogout: () => void;



}

export default function Header({

  title,

  operator,

  category,

  active,

  experienceId,

  onLogout,



}: HeaderProps) {

  // =========================================================
  // TRADUCI ORA — sincronizza subito content+sections+facts+hero
  // titles su Lara per QUESTA esperienza, senza aspettare che
  // compaia in una proposal reale o dover lanciare lo script di
  // backfill da terminale. Idempotente per hash: rilanciarlo non
  // ritraduce (ne costa quota su) contenuto gia' tradotto e
  // invariato — stessa garanzia del backfill.
  // =========================================================

  const [translateStatus, setTranslateStatus] =
    useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleTranslateNow() {

    if (!supabase) return;

    setTranslateStatus("loading");

    try {

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch("/api/admin/translate-experience", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || ""}`,
        },
        body: JSON.stringify({ experienceId }),
      });

      const data = await response.json();

      setTranslateStatus(data.success ? "done" : "error");

    } catch (err) {

      console.error("translate-experience failed:", err);
      setTranslateStatus("error");
    }

    setTimeout(() => setTranslateStatus("idle"), 3000);
  }

  return (

    <header
      className="
        mb-12
      "
    >

      <button

        onClick={() =>

          window.location.href =
            "/admin/experiences"

        }

        className="
          text-sm
          text-white/40
          hover:text-white
          transition-colors
          mb-8
        "
      >

        ← Back to Dashboard

      </button>

      <div
        className="
          flex
          flex-col
          lg:flex-row
          lg:items-center
          lg:justify-between
          gap-8
        "
      >

        <div
          className="
            flex
            items-center
            gap-5
          "
        >

          <img
            src="/logo-white.png"
            alt="PV"
            className="
              h-14
              w-auto
            "
          />

          <div>

            <h1
              className="
                text-4xl
                md:text-5xl
                font-light
                tracking-tight
              "
            >

              {title}

            </h1>

            <div
              className="
                flex
                flex-wrap
                items-center
                gap-3
                mt-2
                text-white/50
              "
            >

              <span>

                {operator}

              </span>

              <span>•</span>

              <span>

                {category}

              </span>

              <span>•</span>

              <span
                className={`
                  ${
                    active

                      ? "text-emerald-400"

                      : "text-red-400"

                  }
                `}
              >

                {

                  active

                    ? "Active"

                    : "Inactive"

                }

              </span>

            </div>

          </div>

        </div>

        <div
          className="
            flex
            gap-3
          "
        >

          <button

            onClick={handleTranslateNow}

            disabled={translateStatus === "loading"}

            className="
              px-5
              py-3
              rounded-xl
              border
              border-white/10
              hover:bg-white/5
              transition-all
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >

            {translateStatus === "loading"
              ? "Translating…"
              : translateStatus === "done"
              ? "Translated ✓"
              : translateStatus === "error"
              ? "Failed — retry"
              : "Translate now"}

          </button>

          <button

            onClick={onLogout}

            className="
              px-5
              py-3
              rounded-xl
              border
              border-white/10
              hover:bg-white/5
              transition-all
            "
          >

            Logout

          </button>

        </div>

      </div>

    </header>

  );

}
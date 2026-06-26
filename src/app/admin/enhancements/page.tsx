"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  getEnhancements,
  createEnhancement,
} from "@/lib/supabase/experienceRepository";

export default function EnhancementsPage() {

  const [enhancements, setEnhancements] =
    useState<any[]>([]);

  async function load() {

    const data =
      await getEnhancements();

    setEnhancements(data);

  }

  useEffect(() => {

    load();

  }, []);

  return (

    <main
      className="
        min-h-screen
        bg-black
        text-white
        px-10
        py-12
      "
    >

      <div
        className="
          max-w-6xl
          mx-auto
        "
      >

        <div
          className="
            flex
            items-center
            justify-between
            mb-12
          "
        >

          <div>

            <p
              className="
                uppercase
                tracking-[0.3em]
                text-white/40
                text-xs
                mb-3
              "
            >

              Admin

            </p>

            <h1
              className="
                text-5xl
                font-light
              "
            >

              Enhancements

            </h1>

          </div>

         <button

  onClick={async () => {

    const enhancement =
      await createEnhancement();

    if (!enhancement) return;

    window.location.href =
      `/admin/enhancements/${enhancement.id}`;

  }}

  className="
    px-6
    py-4
    rounded-xl
    bg-white
    text-black
    font-medium
  "

>

  + New Enhancement

</button>

        </div>

        <div
          className="
            grid
            gap-5
          "
        >

          {enhancements.map(
            (item)=>(

              <Link

                key={item.id}

                href={`/admin/enhancements/${item.id}`}

                className="
                  flex
                  items-center
                  justify-between
                  rounded-2xl
                  border
                  border-white/10
                  bg-zinc-950
                  p-6
                  hover:border-white/30
                  transition
                "

              >

                <div>

                  <h2
                    className="
                      text-2xl
                    "
                  >

                    {item.title}

                  </h2>

                  <p
                    className="
                      text-white/40
                      mt-2
                    "
                  >

                    {item.description}

                  </p>

                </div>

                <div
                  className="
                    text-white/40
                  "
                >

                  →

                </div>

              </Link>

            )
          )}

        </div>

      </div>

    </main>

  );

}
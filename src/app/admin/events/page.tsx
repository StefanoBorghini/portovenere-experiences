"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface EventRow {
  id: string;
  title: string;
  active: boolean;
  image_url: string | null;
}

export default function EventsPage() {

  const [events, setEvents] = useState<EventRow[]>([]);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {

    if (!supabase) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const response = await fetch("/api/admin/events", {
      headers: { Authorization: `Bearer ${session?.access_token || ""}` },
    });

    const data = await response.json();

    if (data.success) {
      setEvents(data.events);
    }

    setLoading(false);
  }

  useEffect(() => {

    load();

  }, []);

  async function handleCreate() {

    if (!supabase) return;

    const title = window.prompt("Event title?");
    if (!title) return;

    setCreating(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const response = await fetch("/api/admin/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token || ""}`,
      },
      body: JSON.stringify({ title }),
    });

    const data = await response.json();

    setCreating(false);

    if (data.success) {
      window.location.href = `/admin/events/${data.event.id}`;
    } else {
      alert(data.error || "Could not create event");
    }
  }

  return (

    <main className="min-h-screen bg-black text-white px-10 py-12">

      <div className="max-w-6xl mx-auto">

        <div className="flex items-center justify-between mb-12">

          <div>
            <p className="uppercase tracking-[0.3em] text-white/40 text-xs mb-3">Admin</p>
            <h1 className="text-5xl font-light">Events</h1>
          </div>

          <button
            onClick={handleCreate}
            disabled={creating}
            className="px-6 py-4 rounded-xl bg-white text-black font-medium disabled:opacity-50"
          >
            {creating ? "Creating…" : "+ New Event"}
          </button>

        </div>

        <div className="grid gap-5">

          {events.map((event) => (

            <Link
              key={event.id}
              href={`/admin/events/${event.id}`}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-zinc-950 p-6 hover:border-white/30 transition"
            >

              <div className="flex items-center gap-4">
                {event.image_url && (
                  <img src={event.image_url} alt="" className="w-14 h-14 rounded-xl object-cover" />
                )}
                <h2 className="text-2xl">{event.title}</h2>
              </div>

              <div className={`text-sm ${event.active ? "text-emerald-400" : "text-white/40"}`}>
                {event.active ? "Active" : "Inactive"}
              </div>

            </Link>

          ))}

          {!loading && events.length === 0 && (
            <p className="text-white/40">No events yet.</p>
          )}

        </div>

      </div>

    </main>

  );
}

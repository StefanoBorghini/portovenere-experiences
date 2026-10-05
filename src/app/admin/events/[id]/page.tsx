"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/lib/supabase/experienceRepository";

interface EventDate {
  id: string;
  date: string;
  status: "scheduled" | "cancelled";
  link_override: string | null;
  note: string | null;
}

interface EventDetail {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link_default: string | null;
  active: boolean;
  weekdays: { weekday: number }[];
  dates: EventDate[];
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {

  const { id } = use(params);

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Campi del form, scollegati da `event` finche' non si salva —
  // stesso pattern gia' usato altrove in admin (es. AvailabilityCard),
  // cosi' si possono editare piu' campi prima di premere Save.
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkDefault, setLinkDefault] = useState("");
  const [active, setActive] = useState(true);
  const [weekdays, setWeekdays] = useState<number[]>([]);

  const [newDate, setNewDate] = useState("");
  const [newDateLink, setNewDateLink] = useState("");
  const [newDateNote, setNewDateNote] = useState("");

  async function authHeader(): Promise<Record<string, string>> {
    if (!supabase) return { Authorization: "" };
    const { data: { session } } = await supabase.auth.getSession();
    return { Authorization: `Bearer ${session?.access_token || ""}` };
  }

  async function load() {

    setLoading(true);

    const response = await fetch(`/api/admin/events/${id}`, {
      headers: await authHeader(),
    });

    const data = await response.json();

    if (data.success) {
      const e: EventDetail = data.event;
      setEvent(e);
      setTitle(e.title);
      setDescription(e.description || "");
      setImageUrl(e.image_url || "");
      setLinkDefault(e.link_default || "");
      setActive(e.active);
      setWeekdays(e.weekdays.map((w) => w.weekday));
    }

    setLoading(false);
  }

  useEffect(() => {

    load();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function toggleWeekday(day: number) {
    setWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  }

  async function handleSave() {

    setSaving(true);

    const response = await fetch(`/api/admin/events/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...(await authHeader()) },
      body: JSON.stringify({
        title,
        description: description || null,
        image_url: imageUrl || null,
        link_default: linkDefault || null,
        active,
        weekdays,
      }),
    });

    const data = await response.json();

    setSaving(false);

    if (data.success) {
      setEvent(data.event);
      alert("Saved");
    } else {
      alert(data.error || "Could not save");
    }
  }

  async function handleAddDate() {

    if (!newDate) return;

    const response = await fetch(`/api/admin/events/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...(await authHeader()) },
      body: JSON.stringify({
        upsertDate: {
          date: newDate,
          status: "scheduled",
          link_override: newDateLink || null,
          note: newDateNote || null,
        },
      }),
    });

    const data = await response.json();

    if (data.success) {
      setEvent(data.event);
      setNewDate("");
      setNewDateLink("");
      setNewDateNote("");
    } else {
      alert(data.error || "Could not add date");
    }
  }

  async function handleToggleCancelled(date: EventDate) {

    const response = await fetch(`/api/admin/events/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...(await authHeader()) },
      body: JSON.stringify({
        upsertDate: {
          date: date.date,
          status: date.status === "cancelled" ? "scheduled" : "cancelled",
          link_override: date.link_override,
          note: date.note,
        },
      }),
    });

    const data = await response.json();
    if (data.success) setEvent(data.event);
  }

  async function handleRemoveDate(date: string) {

    const response = await fetch(`/api/admin/events/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...(await authHeader()) },
      body: JSON.stringify({ deleteDate: date }),
    });

    const data = await response.json();
    if (data.success) setEvent(data.event);
  }

  async function handleDelete() {

    if (!window.confirm("Delete this event permanently?")) return;

    const response = await fetch(`/api/admin/events/${id}`, {
      method: "DELETE",
      headers: await authHeader(),
    });

    const data = await response.json();

    if (data.success) {
      window.location.href = "/admin/events";
    } else {
      alert(data.error || "Could not delete");
    }
  }

  if (loading) {
    return <main className="min-h-screen bg-black text-white px-10 py-12">Loading…</main>;
  }

  if (!event) {
    return <main className="min-h-screen bg-black text-white px-10 py-12">Event not found.</main>;
  }

  const isRecurring = weekdays.length > 0;

  return (

    <main className="min-h-screen bg-black text-white px-10 py-12">

      <div className="max-w-3xl mx-auto">

        <Link href="/admin/events" className="text-white/40 hover:text-white text-sm mb-6 inline-block">
          ← Events
        </Link>

        <h1 className="text-4xl font-light mb-10">{event.title}</h1>

        {/* BASE FIELDS */}
        <div className="grid gap-5 mb-10">

          <div>
            <label className="block text-xs uppercase tracking-[0.15em] text-white/40 mb-2">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.15em] text-white/40 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.15em] text-white/40 mb-2">Image</label>

            {imageUrl && (
              <div className="rounded-2xl overflow-hidden border border-white/10 bg-black mb-3">
                <img src={imageUrl} alt="" className="w-full h-[180px] object-cover" />
              </div>
            )}

            <div className="flex gap-3 items-center mb-3">
              <label className="px-5 py-3 rounded-xl bg-white text-black text-sm font-medium cursor-pointer hover:opacity-90 transition">
                {uploading ? "Uploading…" : "Upload image"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={async (e) => {

                    const file = e.target.files?.[0];
                    if (!file) return;

                    setUploading(true);

                    const uploadedUrl = await uploadImage(file, "events");

                    setUploading(false);

                    if (!uploadedUrl) {
                      alert("Upload failed");
                      return;
                    }

                    setImageUrl(uploadedUrl);
                  }}
                />
              </label>
            </div>

            {/* URL manuale, per chi vuole collegare un'immagine
                esterna gia' ospitata altrove invece di caricarne
                una nuova — stessa doppia via gia' disponibile per
                il link_default sotto (auto-generato o personalizzato). */}
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="or paste an image URL"
              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.15em] text-white/40 mb-2">
              Default link (empty = auto-generated event page)
            </label>
            <input
              value={linkDefault}
              onChange={(e) => setLinkDefault(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white outline-none"
            />
          </div>

          <label className="flex items-center gap-3 text-sm text-white/70">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            Active
          </label>

        </div>

        {/* RECURRENCE */}
        <div className="mb-10">
          <label className="block text-xs uppercase tracking-[0.15em] text-white/40 mb-3">
            Recurs on (leave empty for a one-off / specific-dates event)
          </label>
          <div className="flex gap-2 flex-wrap">
            {WEEKDAY_LABELS.map((label, day) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleWeekday(day)}
                className={`px-4 py-2 rounded-xl border text-sm transition-all ${
                  weekdays.includes(day)
                    ? "border-white bg-white text-black"
                    : "border-white/[0.08] bg-white/[0.02] text-white/50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-4 rounded-xl bg-white text-black font-medium disabled:opacity-50 mb-12"
        >
          {saving ? "Saving…" : "Save"}
        </button>

        {/* DATES */}
        <div className="border-t border-white/[0.08] pt-10">

          <h2 className="text-xl mb-1">
            {isRecurring ? "Specific dates" : "Occurrence dates"}
          </h2>
          <p className="text-white/40 text-sm mb-6">
            {isRecurring
              ? "Use \"Add date\" for three things: schedule a one-off occurrence on a date outside the weekly recurrence above, cancel a specific occurrence that the recurrence would otherwise create (use \"Cancel\" below), or give one occurrence a different link than the default."
              : "This event has no weekly recurrence — each date below is an actual occurrence."}
          </p>

          <div className="grid gap-3 mb-8">
            {event.dates.map((d) => (
              <div
                key={d.id}
                className="flex items-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4"
              >
                <span className={`text-sm ${d.status === "cancelled" ? "text-red-400 line-through" : "text-white"}`}>
                  {d.date}
                </span>
                {d.link_override && (
                  <span className="text-white/40 text-xs truncate flex-1">{d.link_override}</span>
                )}
                {d.note && <span className="text-white/40 text-xs">{d.note}</span>}
                <div className="ml-auto flex gap-2">
                  {isRecurring && (
                    <button
                      onClick={() => handleToggleCancelled(d)}
                      className="text-xs text-white/50 hover:text-white"
                    >
                      {d.status === "cancelled" ? "Restore" : "Cancel"}
                    </button>
                  )}
                  <button
                    onClick={() => handleRemoveDate(d.date)}
                    className="text-xs text-red-400/70 hover:text-red-400"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            {event.dates.length === 0 && (
              <p className="text-white/30 text-sm">No dates yet.</p>
            )}
          </div>

          <div className="grid gap-3 md:grid-cols-[auto_1fr_1fr_auto] items-end">
            <div>
              <label className="block text-xs text-white/40 mb-1">Date</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Link override (optional)</label>
              <input
                value={newDateLink}
                onChange={(e) => setNewDateLink(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Note (optional)</label>
              <input
                value={newDateNote}
                onChange={(e) => setNewDateNote(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white outline-none"
              />
            </div>
            <button
              onClick={handleAddDate}
              className="px-4 py-2 rounded-lg border border-white/20 text-white text-sm hover:bg-white/5"
            >
              Add date
            </button>
          </div>

        </div>

        <button
          onClick={handleDelete}
          className="mt-14 text-sm text-red-400/70 hover:text-red-400"
        >
          Delete event
        </button>

      </div>

    </main>

  );
}

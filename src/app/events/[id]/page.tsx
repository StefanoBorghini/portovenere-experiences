import { notFound } from "next/navigation";
import { getEvent } from "@/lib/supabase/eventRepository";
import { resolveEventOccurrences } from "@/lib/events/resolveEventOccurrences";

// =========================================================
// Pagina pubblica auto-generata per un evento — usata come link di
// fallback quando l'evento non ha un link_default/link_override
// personalizzato (vedi ProposalEvents.tsx). Mostra SOLO la prossima
// occorrenza da oggi in avanti, mai un calendario completo — stessa
// decisione presa per il calendario operatore.
// =========================================================

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatEventDate(dateIso: string): string {
  const date = new Date(`${dateIso}T00:00:00`);
  return date.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {

  const { id } = await params;

  const event = await getEvent(id);

  if (!event || !event.active) {
    notFound();
  }

  const today = new Date();
  const oneYearOut = new Date(today);
  oneYearOut.setFullYear(oneYearOut.getFullYear() + 1);

  const occurrences = resolveEventOccurrences(
    { link_default: event.link_default, weekdays: event.weekdays, dates: event.dates },
    toISODate(today),
    toISODate(oneYearOut)
  );

  const next = occurrences[0];

  return (
    <main className="min-h-screen bg-black text-white px-6 py-20">
      <div className="max-w-2xl mx-auto">

        {event.image_url && (
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-[320px] object-cover rounded-[32px] mb-10"
          />
        )}

        {next && (
          <p className="uppercase tracking-[0.3em] text-zinc-500 text-xs mb-4">
            {formatEventDate(next.date)}
          </p>
        )}

        <h1 className="text-4xl md:text-6xl font-light leading-[0.95] mb-8">
          {event.title}
        </h1>

        {event.description && (
          <p className="text-zinc-400 text-lg leading-relaxed mb-10">
            {event.description}
          </p>
        )}

        {!next && (
          <p className="text-zinc-500">No upcoming dates scheduled right now.</p>
        )}

      </div>
    </main>
  );
}

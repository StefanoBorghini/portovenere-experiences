import { getSupabaseAdmin } from "./adminClient";
import { resolveEventOccurrences } from "@/lib/events/resolveEventOccurrences";
import { buildEventLink } from "@/lib/events/buildEventLink";

// =========================================================
// eventRepository — CRUD per la sezione "Eventi", separata da
// experienceRepository.ts perche' gli eventi vivono in tabelle
// proprie (events, event_availability_weekdays,
// event_availability_dates), mai lette da generateProposal.ts.
// Stesso principio delle altre tabelle senza policy RLS pubblica
// (operators, partner_applications): ogni accesso passa da qui con
// la service role key, mai dal client anon.
// =========================================================

export interface EventRecord {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link_default: string | null;
  active: boolean;
}

export interface EventWeekday {
  id: string;
  event_id: string;
  weekday: number; // 0=domenica .. 6=sabato
}

export interface EventDate {
  id: string;
  event_id: string;
  date: string; // YYYY-MM-DD
  status: "scheduled" | "cancelled";
  link_override: string | null;
  note: string | null;
}

export interface EventWithAvailability extends EventRecord {
  weekdays: EventWeekday[];
  dates: EventDate[];
}

export async function listEvents(): Promise<EventRecord[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getEvent(id: string): Promise<EventWithAvailability | null> {
  const admin = getSupabaseAdmin();

  const [{ data: event, error: eventError }, { data: weekdays, error: weekdaysError }, { data: dates, error: datesError }] =
    await Promise.all([
      admin.from("events").select("*").eq("id", id).maybeSingle(),
      admin.from("event_availability_weekdays").select("*").eq("event_id", id).order("weekday"),
      admin.from("event_availability_dates").select("*").eq("event_id", id).order("date"),
    ]);

  if (eventError) throw eventError;
  if (weekdaysError) throw weekdaysError;
  if (datesError) throw datesError;

  if (!event) return null;

  return { ...event, weekdays: weekdays || [], dates: dates || [] };
}

export async function createEvent(input: {
  title: string;
  description?: string | null;
  image_url?: string | null;
  link_default?: string | null;
  active?: boolean;
}): Promise<EventRecord> {
  const { data, error } = await getSupabaseAdmin()
    .from("events")
    .insert({
      title: input.title,
      description: input.description ?? null,
      image_url: input.image_url ?? null,
      link_default: input.link_default ?? null,
      active: input.active ?? true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateEvent(
  id: string,
  input: Partial<Pick<EventRecord, "title" | "description" | "image_url" | "link_default" | "active">>
): Promise<EventRecord> {
  const { data, error } = await getSupabaseAdmin()
    .from("events")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteEvent(id: string): Promise<void> {
  // ON DELETE CASCADE su event_availability_weekdays/dates — basta
  // cancellare la riga events, il resto segue.
  const { error } = await getSupabaseAdmin().from("events").delete().eq("id", id);
  if (error) throw error;
}

// Sostituisce l'intero set di giorni ricorrenti di un evento — piu'
// semplice che fare diff riga per riga, stesso pattern "replace" gia'
// usato altrove nel progetto per i set di checkbox (es. guest/budget
// filters salvati in blocco).
export async function setEventWeekdays(eventId: string, weekdays: number[]): Promise<void> {
  const admin = getSupabaseAdmin();

  const { error: deleteError } = await admin
    .from("event_availability_weekdays")
    .delete()
    .eq("event_id", eventId);

  if (deleteError) throw deleteError;

  if (weekdays.length === 0) return;

  const { error: insertError } = await admin
    .from("event_availability_weekdays")
    .insert(weekdays.map((weekday) => ({ event_id: eventId, weekday })));

  if (insertError) throw insertError;
}

export async function upsertEventDate(
  eventId: string,
  date: string,
  input: { status?: "scheduled" | "cancelled"; link_override?: string | null; note?: string | null }
): Promise<EventDate> {
  const { data, error } = await getSupabaseAdmin()
    .from("event_availability_dates")
    .upsert(
      {
        event_id: eventId,
        date,
        status: input.status ?? "scheduled",
        link_override: input.link_override ?? null,
        note: input.note ?? null,
      },
      { onConflict: "event_id,date" }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteEventDate(eventId: string, date: string): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("event_availability_dates")
    .delete()
    .eq("event_id", eventId)
    .eq("date", date);

  if (error) throw error;
}

export interface SuggestedEvent {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  date: string; // prossima occorrenza reale nell'intervallo richiesto
  link: string | null;
}

// =========================================================
// getSuggestedEvents — usata dalla proposal page (pubblica, non
// admin): eventi attivi con almeno un'occorrenza nelle date scelte
// dal cliente. Usa comunque il client service-role (come il resto di
// questo file) perche' `events` non ha policy RLS pubbliche, stesso
// trattamento di operators/partner_applications — sicuro perche'
// chiamata solo da codice server (mai da un componente "use client").
//
// Una card per OGNI occorrenza nel soggiorno (non solo la prima):
// un evento che ricorre piu' volte nelle date del cliente compare
// una volta per ciascuna data. Diverso dalla pagina dettaglio
// auto-generata, che invece elenca tutte le occorrenze FUTURE
// indipendentemente da un soggiorno specifico — qui il concetto di
// "una per data" si applica gia' perche' il filtro e' il periodo
// del cliente, non serve un ulteriore riepilogo.
// =========================================================

export async function getSuggestedEvents(
  startDate?: string | null,
  endDate?: string | null
): Promise<SuggestedEvent[]> {

  if (!startDate || !endDate) return [];

  const { data, error } = await getSupabaseAdmin()
    .from("events")
    .select("*, event_availability_weekdays(weekday), event_availability_dates(date, status, link_override)")
    .eq("active", true);

  if (error) throw error;

  const suggestions: SuggestedEvent[] = [];

  for (const event of data || []) {

    const occurrences = resolveEventOccurrences(
      {
        link_default: event.link_default,
        weekdays: event.event_availability_weekdays || [],
        dates: event.event_availability_dates || [],
      },
      startDate,
      endDate
    );

    // Una card per OGNI occorrenza nel soggiorno, non solo la prossima
    // — un evento che ricorre piu' volte nelle date del cliente (es.
    // martedi' E mercoledi' durante un soggiorno di una settimana)
    // deve comparire una volta per ciascuna data, non una sola volta.
    for (const occurrence of occurrences) {
      suggestions.push({
        id: event.id,
        title: event.title,
        description: event.description,
        image_url: event.image_url,
        date: occurrence.date,
        link: occurrence.link ? buildEventLink(occurrence.link, event.title) : occurrence.link,
      });
    }
  }

  return suggestions.sort((a, b) => a.date.localeCompare(b.date));
}

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export interface PublicEventFeedItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  date: string;
  link: string;
}

// =========================================================
// getPublicEventFeed — feed pubblico usato dal widget embeddabile sul
// sito WordPress (vedi /api/events/feed e
// public/widget/events-widget.js), non scoperto a un cliente/date
// specifiche. Finestra fissa da oggi a un anno in avanti, stesso
// limite di sicurezza di resolveEventOccurrences.
//
// Una card per OGNI occorrenza nella finestra (non solo la prossima
// per evento) — stesso principio applicato a getSuggestedEvents: un
// evento ricorrente compare una volta per ciascuna data futura,
// fino al limite richiesto.
//
// `link` qui non e' mai null: un evento senza link_default/override
// usa /events/[id] (la pagina auto-generata) come fallback, perche'
// il widget vive su un dominio esterno e ogni card deve poter
// linkare da qualche parte.
// =========================================================

export async function getPublicEventFeed(
  limit: number = 20,
  siteUrl: string = "https://experiences.portovenere.com"
): Promise<PublicEventFeedItem[]> {

  const today = new Date();
  const oneYearOut = new Date(today);
  oneYearOut.setFullYear(oneYearOut.getFullYear() + 1);

  const { data, error } = await getSupabaseAdmin()
    .from("events")
    .select("*, event_availability_weekdays(weekday), event_availability_dates(date, status, link_override)")
    .eq("active", true);

  if (error) throw error;

  const feed: PublicEventFeedItem[] = [];

  for (const event of data || []) {

    const occurrences = resolveEventOccurrences(
      {
        link_default: event.link_default,
        weekdays: event.event_availability_weekdays || [],
        dates: event.event_availability_dates || [],
      },
      toISODate(today),
      toISODate(oneYearOut)
    );

    for (const occurrence of occurrences) {
      feed.push({
        id: event.id,
        title: event.title,
        description: event.description,
        image_url: event.image_url,
        date: occurrence.date,
        link: occurrence.link
          ? buildEventLink(occurrence.link, event.title)
          : `${siteUrl}/events/${event.id}`,
      });
    }
  }

  return feed.sort((a, b) => a.date.localeCompare(b.date)).slice(0, limit);
}

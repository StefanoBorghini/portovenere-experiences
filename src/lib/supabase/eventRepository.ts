import { getSupabaseAdmin } from "./adminClient";

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

// =========================================================
// resolveEventOccurrences — funzione pura (nessuna chiamata
// Supabase), stesso principio di resolveAvailability.ts: dato un
// evento (ricorrenza settimanale + eventuali righe data) e un
// intervallo, restituisce le occorrenze REALI che cadono in
// quell'intervallo, in ordine cronologico.
//
// Due casi, entrambi gestiti dalla stessa scansione giorno-per-giorno:
//   - Evento SENZA ricorrenza settimanale: le uniche occorrenze
//     possibili sono le righe in `dates` con status='scheduled'.
//   - Evento CON ricorrenza settimanale: occorre ogni giorno che
//     cade sul weekday giusto, SALVO che esista una riga `dates` per
//     quel giorno con status='cancelled' (occorrenza annullata). Una
//     riga `dates` con status='scheduled' su un giorno che non
//     combacia con la ricorrenza e' una data extra aggiunta a mano
//     (es. un'apertura straordinaria), non solo un override di link.
//   - In entrambi i casi, una riga `dates` presente per quel giorno
//     puo' portare un link_override che sovrascrive link_default.
// =========================================================

export interface EventOccurrence {
  date: string; // YYYY-MM-DD
  link: string | null;
}

export interface EventForOccurrences {
  link_default: string | null;
  weekdays: { weekday: number }[];
  dates: { date: string; status: "scheduled" | "cancelled"; link_override: string | null }[];
}

// Stesso limite di sicurezza gia' usato in isCompatibleWithDateRange
// (resolveAvailability.ts) per evitare scansioni indefinite su un
// intervallo malformato.
const MAX_DAYS_SCANNED = 366;

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function resolveEventOccurrences(
  event: EventForOccurrences,
  startDate: string,
  endDate: string
): EventOccurrence[] {

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return [];
  }

  const weekdaySet = new Set(event.weekdays.map((w) => w.weekday));
  const dateRows = new Map(event.dates.map((d) => [d.date, d]));

  const occurrences: EventOccurrence[] = [];

  const cursor = new Date(start);
  let daysScanned = 0;

  while (cursor <= end && daysScanned < MAX_DAYS_SCANNED) {

    const iso = toISODate(cursor);
    const row = dateRows.get(iso);

    const isWeekdayMatch = weekdaySet.has(cursor.getDay());
    const isCancelled = row?.status === "cancelled";
    const isExtraScheduled = row?.status === "scheduled" && !isWeekdayMatch;

    if ((isWeekdayMatch && !isCancelled) || isExtraScheduled) {
      occurrences.push({
        date: iso,
        link: row?.link_override || event.link_default,
      });
    }

    cursor.setDate(cursor.getDate() + 1);
    daysScanned++;
  }

  return occurrences;
}

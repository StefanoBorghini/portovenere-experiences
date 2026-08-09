// =========================================================
// AVAILABILITY RESOLVER — screening di compatibilita' di
// un'esperienza (o enhancement) con le date scelte dal cliente nel
// configuratore. Pura: nessun accesso Supabase qui, riceve le regole
// gia' allegate all'oggetto (stesso principio di
// resolveSeasonalPriceOverride in src/lib/pricing/resolveSeasonalPrice.ts
// per il prezzo stagionale — qui e' lo stesso per la disponibilita').
//
// NON e' un sistema di prenotazione: "available" significa solo
// "compatibile con il periodo scelto", non "confermato" — la conferma
// reale resta al Concierge/operatore.
//
// Priorita' (dalla piu' alla meno specifica):
//   1. Manual override    (dates, source='manual')
//   2. Specific exception (dates, source='exception')
//   3. Weekday rule
//   4. Seasonal rule
//   5. Default: available (nessuna regola configurata)
// =========================================================

export type AvailabilityStatus = "available" | "unavailable";

export interface SeasonRule {
  status: AvailabilityStatus;
  start_month: number;
  start_day: number;
  end_month: number;
  end_day: number;
}

export interface WeekdayRule {
  status: AvailabilityStatus;
  weekday: number; // 0=domenica..6=sabato (Date.getDay())
}

export interface DateRule {
  date: string; // "YYYY-MM-DD"
  status: AvailabilityStatus;
  source: "manual" | "exception";
}

export interface AvailabilityRules {
  seasons?: SeasonRule[];
  weekdays?: WeekdayRule[];
  dates?: DateRule[];
}

// month*100+day e' monotono all'interno di un anno (day <= 31 < 100),
// quindi basta per confrontare due punti mese/giorno senza dover
// validare calendari reali (bisestili, ecc.) — non ci serve qui.
function toOrdinal(month: number, day: number): number {
  return month * 100 + day;
}

// Costruito a mezzogiorno per evitare che un fuso orario/DST faccia
// scivolare la data al giorno prima/dopo durante il parsing.
function parseDateSafe(dateStr: string): Date {
  return new Date(`${dateStr}T12:00:00`);
}

function isDateInSeasonRange(month: number, day: number, rule: SeasonRule): boolean {

  const dateOrdinal = toOrdinal(month, day);
  const startOrdinal = toOrdinal(rule.start_month, rule.start_day);
  const endOrdinal = toOrdinal(rule.end_month, rule.end_day);

  // Periodo che NON attraversa il capodanno (es. 1 aprile -> 31 ottobre).
  if (startOrdinal <= endOrdinal) {
    return dateOrdinal >= startOrdinal && dateOrdinal <= endOrdinal;
  }

  // Periodo che attraversa il capodanno (es. 1 ottobre -> 31 maggio):
  // e' "dentro" se e' dopo l'inizio (ott-dic) OPPURE prima della fine
  // (gen-mag).
  return dateOrdinal >= startOrdinal || dateOrdinal <= endOrdinal;
}

// =========================================================
// Risolve lo status per UNA data precisa, applicando la gerarchia di
// priorita' in ordine. Ritorna sempre "available" se non esiste
// nessuna regola configurata (comportamento invariato per tutto cio'
// che non viene mai toccato in admin).
// =========================================================

export function resolveAvailabilityForDate(
  rules: AvailabilityRules,
  dateStr: string
): AvailabilityStatus {

  const dates = rules.dates || [];

  // 1. MANUAL OVERRIDE — priorita' massima, batte tutto il resto.
  const manualOverride = dates.find((d) => d.date === dateStr && d.source === "manual");
  if (manualOverride) return manualOverride.status;

  // 2. SPECIFIC EXCEPTION
  const exception = dates.find((d) => d.date === dateStr && d.source === "exception");
  if (exception) return exception.status;

  const date = parseDateSafe(dateStr);
  const weekday = date.getDay();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // 3. WEEKDAY RULE — se esistono righe 'available', SOLO quei giorni
  // sono ammessi (whitelist); se esistono solo righe 'unavailable',
  // tutti gli altri giorni restano ammessi (blacklist).
  const weekdayRules = rules.weekdays || [];

  if (weekdayRules.length > 0) {

    const availableWeekdays = weekdayRules.filter((w) => w.status === "available");

    if (availableWeekdays.length > 0) {
      if (!availableWeekdays.some((w) => w.weekday === weekday)) {
        return "unavailable";
      }
    } else {
      const isBlacklisted = weekdayRules.some(
        (w) => w.status === "unavailable" && w.weekday === weekday
      );
      if (isBlacklisted) return "unavailable";
    }
  }

  // 4. SEASONAL RULE — se piu' righe coprono la stessa data, vince
  // 'unavailable' su 'available' (una finestra di chiusura esplicita
  // deve poter "bucare" un periodo aperto piu' ampio).
  const seasonRules = rules.seasons || [];

  if (seasonRules.length > 0) {

    const matching = seasonRules.filter((rule) => isDateInSeasonRange(month, day, rule));

    if (matching.length > 0) {
      return matching.some((rule) => rule.status === "unavailable") ? "unavailable" : "available";
    }

    // Nessuna regola stagionale copre questa data: se sono definite
    // SOLO righe 'available' (finestre di apertura esplicite), stare
    // fuori da tutte significa non disponibile. Se sono definite solo
    // righe 'unavailable' (finestre di chiusura), stare fuori da tutte
    // significa disponibile.
    const hasAvailableWindows = seasonRules.some((rule) => rule.status === "available");
    if (hasAvailableWindows) return "unavailable";
  }

  // 5. DEFAULT
  return "available";
}

// =========================================================
// Compatibilita' con un INTERVALLO di date (o una singola data,
// quando startDate === endDate) scelto nel configuratore.
//
// requiresSpecificDate=false (caso comune, esperienze ricorrenti/
// flessibili): compatibile se esiste ALMENO un giorno disponibile
// nell'intervallo richiesto.
//
// requiresSpecificDate=true (esperienza a occorrenza fissa, es. un
// evento con una sola data reale): compatibile SOLO se esiste una riga
// ESPLICITA in `dates` con status='available' dentro l'intervallo —
// mai dedotta da una regola stagionale/settimanale generica, per non
// "inventare" disponibilita' che non e' stata dichiarata esplicitamente.
// =========================================================

export function isCompatibleWithDateRange(
  rules: AvailabilityRules,
  startDateStr: string | null | undefined,
  endDateStr: string | null | undefined,
  requiresSpecificDate: boolean = false
): boolean {

  // Nessuna data scelta dal cliente: nessun filtro da applicare.
  if (!startDateStr) return true;

  const effectiveEnd = endDateStr || startDateStr;

  if (requiresSpecificDate) {
    return (rules.dates || []).some(
      (d) =>
        d.status === "available" &&
        d.date >= startDateStr &&
        d.date <= effectiveEnd
    );
  }

  const start = parseDateSafe(startDateStr);
  const end = parseDateSafe(effectiveEnd);

  // Cap di sicurezza: un intervallo scelto nel configuratore non e'
  // mai lungo mesi, ma un limite esplicito evita un ciclo infinito se
  // per qualche motivo end < start o le date sono malformate.
  const MAX_DAYS_TO_SCAN = 366;

  for (let i = 0, cursor = new Date(start); i <= MAX_DAYS_TO_SCAN; i++) {

    if (cursor.getTime() > end.getTime()) break;

    const cursorStr = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(
      cursor.getDate()
    ).padStart(2, "0")}`;

    if (resolveAvailabilityForDate(rules, cursorStr) === "available") {
      return true;
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return false;
}

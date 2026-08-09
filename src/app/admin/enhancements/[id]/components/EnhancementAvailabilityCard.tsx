interface EnhancementAvailabilityCardProps {

  enhancement: any;

  setEnhancement: any;

}

// =========================================================
// AVAILABILITY / CALENDAR (Enhancement)
// Stessa identica logica/schema di AvailabilityCard.tsx per le
// esperienze (src/app/admin/experiences/[id]/components/AvailabilityCard.tsx)
// — screening di compatibilita' con le date scelte nel configuratore,
// NON una prenotazione. Un enhancement senza nessuna regola qui resta
// sempre disponibile (comportamento invariato). Vedi
// src/lib/availability/resolveAvailability.ts per la gerarchia di
// priorita'.
// =========================================================

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type WeekdayMode = "none" | "only_these" | "except_these";

function getWeekdayMode(weekdayRules: any[]): WeekdayMode {
  if (weekdayRules.length === 0) return "none";
  return weekdayRules.some((r) => r.status === "available") ? "only_these" : "except_these";
}

export default function EnhancementAvailabilityCard({

  enhancement,

  setEnhancement,

}: EnhancementAvailabilityCardProps) {

  const seasons = enhancement.availability_seasons || [];
  const weekdayRules = enhancement.availability_weekdays || [];
  const dateRules = enhancement.availability_dates || [];

  const weekdayMode = getWeekdayMode(weekdayRules);
  const selectedWeekdays = new Set(weekdayRules.map((r: any) => r.weekday));

  // -------------------------------------------------------
  // SEASONAL RULES
  // -------------------------------------------------------

  function updateSeason(id: string, updates: any) {
    setEnhancement({
      ...enhancement,
      availability_seasons: seasons.map((s: any) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    });
  }

  function addSeason() {
    setEnhancement({
      ...enhancement,
      availability_seasons: [
        ...seasons,
        {
          id: `new-avail-season-${Date.now()}`,
          enhancement_id: enhancement.id,
          status: "available",
          start_month: 1,
          start_day: 1,
          end_month: 12,
          end_day: 31,
          display_order: seasons.length,
          isNew: true,
        },
      ],
    });
  }

  function removeSeason(id: string) {
    setEnhancement({
      ...enhancement,
      availability_seasons: seasons.filter((s: any) => s.id !== id),
    });
  }

  // -------------------------------------------------------
  // WEEKDAY RULES — stesso principio a modalita' di
  // AvailabilityCard.tsx (mai un mix available/unavailable nello
  // stesso set).
  // -------------------------------------------------------

  function setWeekdayMode(mode: WeekdayMode) {
    if (mode === "none") {
      setEnhancement({ ...enhancement, availability_weekdays: [] });
      return;
    }

    const status = mode === "only_these" ? "available" : "unavailable";

    setEnhancement({
      ...enhancement,
      availability_weekdays: Array.from(selectedWeekdays).map((weekday) => ({
        id: `new-avail-weekday-${weekday}-${Date.now()}`,
        enhancement_id: enhancement.id,
        status,
        weekday,
        isNew: true,
      })),
    });
  }

  function toggleWeekday(weekday: number) {

    if (weekdayMode === "none") return;

    const status = weekdayMode === "only_these" ? "available" : "unavailable";
    const isSelected = selectedWeekdays.has(weekday);
    // Falso positivo di react-hooks/purity — vedi commento identico in
    // AvailabilityCard.tsx (esperienze), stessa forma sintattica.
    // eslint-disable-next-line react-hooks/purity
    const newId = `new-avail-weekday-${weekday}-${Date.now()}`;

    const newRule = {
      id: newId,
      enhancement_id: enhancement.id,
      status,
      weekday,
      isNew: true,
    };

    const nextRules = isSelected
      ? weekdayRules.filter((r: any) => r.weekday !== weekday)
      : [...weekdayRules, newRule];

    setEnhancement({ ...enhancement, availability_weekdays: nextRules });
  }

  // -------------------------------------------------------
  // DATE EXCEPTIONS & MANUAL OVERRIDES
  // -------------------------------------------------------

  function updateDateRule(id: string, updates: any) {
    setEnhancement({
      ...enhancement,
      availability_dates: dateRules.map((d: any) =>
        d.id === id ? { ...d, ...updates } : d
      ),
    });
  }

  function addDateRule() {
    setEnhancement({
      ...enhancement,
      availability_dates: [
        ...dateRules,
        {
          id: `new-avail-date-${Date.now()}`,
          enhancement_id: enhancement.id,
          date: "",
          status: "unavailable",
          source: "manual",
          note: "",
          isNew: true,
        },
      ],
    });
  }

  function removeDateRule(id: string) {
    setEnhancement({
      ...enhancement,
      availability_dates: dateRules.filter((d: any) => d.id !== id),
    });
  }

  return (

    <section
      className="
        rounded-3xl
        border
        border-white/10
        bg-zinc-950
        p-8
        mt-8
      "
    >

      <h2 className="text-2xl font-light mb-2">Availability / Calendar</h2>

      <p className="text-white/30 text-xs mb-6">
        Screening di compatibilita&apos; con le date scelte nel configuratore —
        non e&apos; una prenotazione confermata. Nessuna regola qui sotto =
        enhancement sempre disponibile (comportamento invariato).
      </p>

      <label className="flex items-center gap-3 cursor-pointer mb-8">
        <input
          type="checkbox"
          checked={enhancement.requires_specific_date ?? false}
          onChange={(e) =>
            setEnhancement({
              ...enhancement,
              requires_specific_date: e.target.checked,
            })
          }
        />
        <span className="text-sm text-white/70">
          Requires a specific date (evento a occorrenza fissa — quando il
          cliente sceglie un intervallo, richiede una riga esplicita in
          &quot;Date exceptions &amp; manual overrides&quot; dentro
          l&apos;intervallo, mai dedotta da stagione/settimana)
        </span>
      </label>

      {/* SEASONAL RULES */}

      <div className="mb-8">

        <h3 className="text-sm uppercase tracking-wide text-white/50 mb-3">
          Seasonal rules
        </h3>

        <div className="space-y-4">

          {seasons.map((season: any) => (

            <div
              key={season.id}
              className="grid md:grid-cols-6 gap-3 items-end rounded-xl border border-white/10 bg-white/5 p-4"
            >

              <div>
                <label className="block text-xs text-white/50 mb-2">Status</label>
                <select
                  value={season.status}
                  onChange={(e) => updateSeason(season.id, { status: e.target.value })}
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2"
                >
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-white/50 mb-2">Start month</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={season.start_month}
                  onChange={(e) => updateSeason(season.id, { start_month: Number(e.target.value) })}
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-xs text-white/50 mb-2">Start day</label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={season.start_day}
                  onChange={(e) => updateSeason(season.id, { start_day: Number(e.target.value) })}
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-xs text-white/50 mb-2">End month</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={season.end_month}
                  onChange={(e) => updateSeason(season.id, { end_month: Number(e.target.value) })}
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-xs text-white/50 mb-2">End day</label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={season.end_day}
                  onChange={(e) => updateSeason(season.id, { end_day: Number(e.target.value) })}
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2"
                />
              </div>

              <button
                type="button"
                onClick={() => removeSeason(season.id)}
                className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white/50 hover:text-white hover:border-white/30"
              >
                Remove
              </button>

            </div>
          ))}

          <button
            type="button"
            onClick={addSeason}
            className="rounded-xl border border-white/10 px-4 py-3 text-sm text-white/70 hover:text-white hover:border-white/30"
          >
            + Add season
          </button>

        </div>

      </div>

      {/* WEEKDAY RULES */}

      <div className="mb-8">

        <h3 className="text-sm uppercase tracking-wide text-white/50 mb-3">
          Weekday rules
        </h3>

        <div className="flex flex-wrap gap-3 mb-4">

          {(
            [
              ["none", "No restriction"],
              ["only_these", "Only available on selected days"],
              ["except_these", "Not available on selected days"],
            ] as [WeekdayMode, string][]
          ).map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              onClick={() => setWeekdayMode(mode)}
              className={`rounded-full border px-4 py-2 text-xs ${
                weekdayMode === mode
                  ? "border-white bg-white text-black"
                  : "border-white/10 text-white/60 hover:text-white hover:border-white/30"
              }`}
            >
              {label}
            </button>
          ))}

        </div>

        {weekdayMode !== "none" && (
          <div className="flex flex-wrap gap-2">
            {WEEKDAY_LABELS.map((label, weekday) => (
              <button
                key={weekday}
                type="button"
                onClick={() => toggleWeekday(weekday)}
                className={`rounded-lg border px-3 py-2 text-xs ${
                  selectedWeekdays.has(weekday)
                    ? "border-white bg-white text-black"
                    : "border-white/10 text-white/60 hover:text-white hover:border-white/30"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

      </div>

      {/* DATE EXCEPTIONS & MANUAL OVERRIDES */}

      <div>

        <h3 className="text-sm uppercase tracking-wide text-white/50 mb-3">
          Date exceptions &amp; manual overrides
        </h3>

        <p className="text-white/30 text-xs mb-4">
          Manual override batte tutto — usalo per le date che hai
          verificato tu direttamente con l&apos;operatore. Exception serve
          per un&apos;eccezione dichiarata a una regola generale.
        </p>

        <div className="space-y-4">

          {dateRules.map((rule: any) => (

            <div
              key={rule.id}
              className="grid md:grid-cols-5 gap-3 items-end rounded-xl border border-white/10 bg-white/5 p-4"
            >

              <div>
                <label className="block text-xs text-white/50 mb-2">Date</label>
                <input
                  type="date"
                  value={rule.date || ""}
                  onChange={(e) => updateDateRule(rule.id, { date: e.target.value })}
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-xs text-white/50 mb-2">Status</label>
                <select
                  value={rule.status}
                  onChange={(e) => updateDateRule(rule.id, { status: e.target.value })}
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2"
                >
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-white/50 mb-2">Source</label>
                <select
                  value={rule.source}
                  onChange={(e) => updateDateRule(rule.id, { source: e.target.value })}
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2"
                >
                  <option value="manual">Manual override</option>
                  <option value="exception">Exception</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-white/50 mb-2">Note</label>
                <input
                  type="text"
                  value={rule.note || ""}
                  onChange={(e) => updateDateRule(rule.id, { note: e.target.value })}
                  placeholder="optional"
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2"
                />
              </div>

              <button
                type="button"
                onClick={() => removeDateRule(rule.id)}
                className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white/50 hover:text-white hover:border-white/30"
              >
                Remove
              </button>

            </div>
          ))}

          <button
            type="button"
            onClick={addDateRule}
            className="rounded-xl border border-white/10 px-4 py-3 text-sm text-white/70 hover:text-white hover:border-white/30"
          >
            + Add date rule
          </button>

        </div>

      </div>

    </section>
  );
}

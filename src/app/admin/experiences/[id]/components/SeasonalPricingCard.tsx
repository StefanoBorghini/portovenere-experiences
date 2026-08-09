interface SeasonalPricingCardProps {

  experience: any;

  setExperience: any;

}

// =========================================================
// SEASONAL PRICING
// Stessa logica di editing "a lista" già usata per i Price Tiers:
// ogni riga è una fascia di date con un prezzo fisso sostitutivo.
// Le righe nuove hanno isNew=true (create al salvataggio in
// page.tsx), quelle esistenti vengono aggiornate, quelle rimosse
// da questa lista prima di salvare vengono cancellate — stesso
// identico pattern del blocco PRICE TIERS in onSave.
// =========================================================

export default function SeasonalPricingCard({

  experience,

  setExperience,

}: SeasonalPricingCardProps) {

  const ranges = experience.seasonal_pricing || [];

  function updateRange(id: string, updates: any) {

    setExperience({
      ...experience,
      seasonal_pricing: ranges.map((range: any) =>
        range.id === id ? { ...range, ...updates } : range
      ),
    });
  }

  function addRange() {

    setExperience({
      ...experience,
      seasonal_pricing: [
        ...ranges,
        {
          id: `new-season-${Date.now()}`,
          experience_id: experience.id,
          start_date: "",
          end_date: "",
          price: 0,
          display_order: ranges.length,
          isNew: true,
        },
      ],
    });
  }

  function removeRange(id: string) {

    setExperience({
      ...experience,
      seasonal_pricing: ranges.filter(
        (range: any) => range.id !== id
      ),
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

      <div className="flex items-center justify-between mb-2">

        <h2
          className="
            text-2xl
            font-light
          "
        >
          Seasonal Pricing
        </h2>

        <label
          className="
            flex
            items-center
            gap-3
            cursor-pointer
          "
        >
          <span className="text-sm text-white/50">
            Enabled
          </span>

          <input
            type="checkbox"
            checked={experience.seasonal_pricing_enabled ?? false}
            onChange={(e) =>
              setExperience({
                ...experience,
                seasonal_pricing_enabled: e.target.checked,
              })
            }
          />
        </label>

      </div>

      <p className="text-white/30 text-xs mb-6">
        Se attivo, ogni fascia qui sotto sostituisce interamente il
        Base Price di questa esperienza quando il check-in del
        cliente cade in quella fascia (le date vanno reinserite ogni
        anno, es. 01/06/2026 – 31/08/2026). Se il check-in non cade
        in nessuna fascia, si usa normalmente il Base Price. Se due
        fasce si sovrappongono, vince quella più in alto nella lista.
      </p>

      {experience.seasonal_pricing_enabled && (

        <div className="space-y-4">

          {ranges.map((range: any) => (

            <div
              key={range.id}
              className="
                grid
                md:grid-cols-4
                gap-3
                items-end
                rounded-xl
                border
                border-white/10
                bg-white/5
                p-4
              "
            >

              <div>
                <label className="block text-xs text-white/50 mb-2">
                  Dal
                </label>

                <input
                  type="date"
                  value={range.start_date || ""}
                  onChange={(e) =>
                    updateRange(range.id, {
                      start_date: e.target.value,
                    })
                  }
                  className="
                    w-full
                    rounded-lg
                    bg-white/5
                    border
                    border-white/10
                    px-3
                    py-2
                  "
                />
              </div>

              <div>
                <label className="block text-xs text-white/50 mb-2">
                  Al
                </label>

                <input
                  type="date"
                  value={range.end_date || ""}
                  onChange={(e) =>
                    updateRange(range.id, {
                      end_date: e.target.value,
                    })
                  }
                  className="
                    w-full
                    rounded-lg
                    bg-white/5
                    border
                    border-white/10
                    px-3
                    py-2
                  "
                />
              </div>

              <div>
                <label className="block text-xs text-white/50 mb-2">
                  Prezzo sostitutivo (€)
                </label>

                <input
                  type="number"
                  min={0}
                  value={range.price ?? 0}
                  onChange={(e) =>
                    updateRange(range.id, {
                      price: Number(e.target.value),
                    })
                  }
                  className="
                    w-full
                    rounded-lg
                    bg-white/5
                    border
                    border-white/10
                    px-3
                    py-2
                  "
                />
              </div>

              <button
                type="button"
                onClick={() => removeRange(range.id)}
                className="
                  rounded-lg
                  border
                  border-white/10
                  px-3
                  py-2
                  text-sm
                  text-white/50
                  hover:text-white
                  hover:border-white/30
                "
              >
                Remove
              </button>

            </div>
          ))}

          <button
            type="button"
            onClick={addRange}
            className="
              rounded-xl
              border
              border-white/10
              px-4
              py-3
              text-sm
              text-white/70
              hover:text-white
              hover:border-white/30
            "
          >
            + Add period
          </button>

        </div>
      )}

    </section>
  );
}
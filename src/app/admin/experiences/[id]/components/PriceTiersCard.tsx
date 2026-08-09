"use client";

interface PriceTiersCardProps {
  experience: any;
  setExperience: any;
}

// =========================================================
// PRICE TIERS CARD (v3)
// Il toggle "Use Guest-Based Pricing" vive QUI ORA, non nel
// menu "Price Type" di GeneralCard.tsx — pricing_type resta
// invariato, con gli stessi 4 valori di sempre. Questo flag è
// una colonna a parte (experience_content.use_guest_tiers) che
// scavalca pricing_type quando acceso, senza toccarne il valore.
// =========================================================

export default function PriceTiersCard({
  experience,
  setExperience,
}: PriceTiersCardProps) {

  const enabled = experience.use_guest_tiers === true;

  const tiers = experience.price_tiers || [];

  function toggleEnabled() {
    setExperience({
      ...experience,
      use_guest_tiers: !enabled,
    });
  }

  function updateTier(index: number, updates: any) {
    const nextTiers = [...tiers];
    nextTiers[index] = { ...nextTiers[index], ...updates };
    setExperience({ ...experience, price_tiers: nextTiers });
  }

  function addTier() {
    const lastTier = tiers[tiers.length - 1];
    const suggestedMin = lastTier ? lastTier.max_guests + 1 : 1;

    const newTier = {
      id: `new-tier-${Date.now()}`,
      isNew: true,
      experience_id: experience.id,
      min_guests: suggestedMin,
      max_guests: suggestedMin + 2,
      price: 0,
      display_order: tiers.length,
    };

    setExperience({
      ...experience,
      price_tiers: [...tiers, newTier],
    });
  }

  function removeTier(index: number) {
    const nextTiers = tiers.filter((_: any, i: number) => i !== index);
    setExperience({ ...experience, price_tiers: nextTiers });
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
      {/* TOGGLE — indipendente dal Price Type qui sopra nel form.
          Se acceso, questo prezzo VINCE su qualsiasi cosa dica
          pricing_type, che resta comunque intatto nel suo campo. */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-light mb-1">
            Guest-Based Pricing
          </h2>
          <p className="text-white/40 text-sm">
            Se attivo, il prezzo segue le fasce qui sotto invece del
            "Price Type" impostato sopra — utile per operatori come
            Aphrodite che fatturano a scaglioni di persone.
          </p>
        </div>

        <button
          type="button"
          onClick={toggleEnabled}
          className={`
            relative
            w-14
            h-8
            rounded-full
            transition-colors
            shrink-0
            ${enabled ? "bg-white" : "bg-white/10"}
          `}
          aria-pressed={enabled}
        >
          <span
            className={`
              absolute
              top-1
              w-6
              h-6
              rounded-full
              transition-all
              ${enabled ? "left-7 bg-black" : "left-1 bg-white/60"}
            `}
          />
        </button>
      </div>

      {!enabled && (
        <p className="text-white/25 text-sm mt-4">
          Disattivato — questa esperienza usa il "Price Type" scelto
          sopra (Fixed / Per Person / Included / On Request).
        </p>
      )}

      {enabled && (
        <div className="mt-6">

          <div className="flex items-center justify-end mb-4">
            <button
              type="button"
              onClick={addTier}
              className="
                px-4
                py-2
                rounded-xl
                bg-white
                text-black
                text-sm
                font-medium
              "
            >
              + Add Tier
            </button>
          </div>

          {tiers.length === 0 && (
            <p className="text-white/30 text-sm mb-4">
              Nessuna fascia configurata ancora. Aggiungine almeno una,
              altrimenti il prezzo mostrato sarà €0.
            </p>
          )}

          <div className="space-y-4">
            {tiers.map((tier: any, index: number) => (
              <div
                key={tier.id}
                className="
                  grid
                  grid-cols-1
                  md:grid-cols-[1fr_1fr_1fr_auto]
                  gap-4
                  items-end
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.02]
                  p-5
                "
              >
                <div>
                  <label className="block text-sm text-white/50 mb-2">
                    Min Guests
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={tier.min_guests}
                    onChange={(e) =>
                      updateTier(index, {
                        min_guests: Number(e.target.value),
                      })
                    }
                    className="
                      w-full
                      rounded-xl
                      bg-white/5
                      border
                      border-white/10
                      px-4
                      py-3
                    "
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/50 mb-2">
                    Max Guests
                  </label>
                  <input
                    type="number"
                    min={tier.min_guests}
                    value={tier.max_guests}
                    onChange={(e) =>
                      updateTier(index, {
                        max_guests: Number(e.target.value),
                      })
                    }
                    className="
                      w-full
                      rounded-xl
                      bg-white/5
                      border
                      border-white/10
                      px-4
                      py-3
                    "
                  />
                  <p className="text-white/30 text-xs mt-1">
                    Usa un numero alto (es. 999) per "N+"
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-white/50 mb-2">
                    Price (€)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={tier.price}
                    onChange={(e) =>
                      updateTier(index, {
                        price: Number(e.target.value),
                      })
                    }
                    className="
                      w-full
                      rounded-xl
                      bg-white/5
                      border
                      border-white/10
                      px-4
                      py-3
                    "
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeTier(index)}
                  className="
                    px-4
                    py-3
                    rounded-xl
                    border
                    border-red-400/20
                    text-red-400/70
                    hover:text-red-400
                    hover:bg-red-400/5
                    transition-all
                    text-sm
                    h-fit
                  "
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
"use client";

import { motion } from "framer-motion";

import Section from "@/components/layout/Section";
import SectionContainer from "@/components/layout/SectionContainer";
import SectionHeader from "@/components/layout/SectionHeader";
import { fadeReveal } from "@/lib/motion/fadeReveal";

// =========================================================
// ProposalEvents — sezione "sola vetrina": a differenza di
// ProposalEnhancements, qui non c'e' selezione/prezzo, solo card
// che linkano fuori (pagina evento dedicata, o un link
// personalizzato impostato in admin). Mostrata solo se ci sono
// eventi la cui prossima occorrenza cade nelle date scelte dal
// cliente — vedi getSuggestedEvents in eventRepository.ts.
//
// NOTA: testo in inglese fisso, non ancora passato dal sistema di
// traduzioni (site_copy) usato dal resto della proposal — da
// aggiungere quando la sezione sara' validata in produzione.
// =========================================================

export interface SuggestedEventCard {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  date: string;
  link: string | null;
}

interface ProposalEventsProps {
  events: SuggestedEventCard[];
}

function formatEventDate(dateIso: string): string {
  const date = new Date(`${dateIso}T00:00:00`);
  return date.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" });
}

export default function ProposalEvents({ events }: ProposalEventsProps) {

  if (events.length === 0) return null;

  return (

    <Section className="bg-black">

      <SectionContainer>

        <motion.div
          variants={fadeReveal}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <SectionHeader
            label="During your stay"
            title="Events happening while you're here"
          />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

          {events.map((event) => {

            const card = (
              <>
                {event.image_url && (
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-[220px] object-cover rounded-t-[32px] transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                )}

                <div className="p-8">
                  <p className="text-[12px] uppercase tracking-[0.25em] text-zinc-500 mb-3">
                    {formatEventDate(event.date)}
                  </p>

                  <h3 className="text-2xl md:text-3xl font-light tracking-tight mb-4">
                    {event.title}
                  </h3>

                  {event.description && (
                    <p className="text-zinc-400 leading-relaxed">{event.description}</p>
                  )}
                </div>
              </>
            );

            const className =
              "group text-left overflow-hidden flex flex-col justify-start rounded-[32px] border border-white/10 bg-white/[0.03] hover:border-white/30 transition-all duration-500 p-0";

            return event.link ? (
              <a key={event.id} href={event.link} target="_blank" rel="noopener noreferrer" className={className}>
                {card}
              </a>
            ) : (
              <a key={event.id} href={`/events/${event.id}`} className={className}>
                {card}
              </a>
            );
          })}

        </div>

      </SectionContainer>

    </Section>
  );
}

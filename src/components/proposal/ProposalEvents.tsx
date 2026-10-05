"use client";

import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";

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
// cliente — vedi getSuggestedEvents in eventRepository.ts, che ora
// passa gia' title/description nella lingua corrente (fallback
// automatico all'inglese se la traduzione non e' pronta/riuscita).
// Le etichette fisse di questa sezione (label/title/CTA) passano
// invece da site_copy, come il resto della proposal.
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

// Stessa mappa di buildProposalSummary.ts/craft-your-experience —
// duplicata qui per lo stesso motivo (file piccolo, nessun modulo
// condiviso esistente per questa costante nel progetto).
const DATE_LOCALES: Record<string, string> = {
  en: "en-US",
  it: "it-IT",
  fr: "fr-FR",
  de: "de-DE",
  es: "es-ES",
  ru: "ru-RU",
  zh: "zh-CN",
  ja: "ja-JP",
};

function formatEventDate(dateIso: string, locale: string): string {
  const date = new Date(`${dateIso}T00:00:00`);
  return date.toLocaleDateString(DATE_LOCALES[locale] ?? DATE_LOCALES.en, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ProposalEvents({ events }: ProposalEventsProps) {

  const t = useTranslations("proposal");
  const locale = useLocale();

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
            label={t("events.label")}
            title={t("events.title")}
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
                    {formatEventDate(event.date, locale)}
                  </p>

                  <h3 className="text-2xl md:text-3xl font-light tracking-tight mb-4">
                    {event.title}
                  </h3>

                  {event.description && (
                    <p className="text-zinc-400 leading-relaxed mb-5">{event.description}</p>
                  )}

                  <span className="text-[11px] uppercase tracking-[0.2em] text-white/80">
                    {t("events.details")}
                  </span>
                </div>
              </>
            );

            const className =
              "group text-left overflow-hidden flex flex-col justify-start rounded-[32px] border border-white/10 bg-white/[0.03] hover:border-white/30 transition-all duration-500 p-0";

            // key include la data: lo stesso evento puo' comparire piu'
            // volte (una card per occorrenza nel soggiorno), event.id da
            // solo non sarebbe univoco.
            const cardKey = `${event.id}-${event.date}`;

            return event.link ? (
              <a key={cardKey} href={event.link} target="_blank" rel="noopener noreferrer" className={className}>
                {card}
              </a>
            ) : (
              <a key={cardKey} href={`/events/${event.id}`} className={className}>
                {card}
              </a>
            );
          })}

        </div>

      </SectionContainer>

    </Section>
  );
}

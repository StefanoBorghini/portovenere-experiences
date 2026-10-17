import { Experience } from "@/types/experience";
import { ProposalExperienceCard } from "@/types/proposal";
import { SocialCardData, SOCIAL_CARD_CTA_PRESETS } from "@/types/socialCard";
import { MOOD_NAME_KEYS } from "@/lib/config/experienceTaxonomy";

// =========================================================
// buildSocialCardData — trasformazione pura, NON un secondo motore
// di generazione. Prende esattamente i dati gia' calcolati da
// generateProposal()/buildRendererData() in
// results/proposal/[slug]/page.tsx e li riduce a un formato
// editoriale sintetico per la Social Experience Card. Se cambia la
// configurazione a monte, questi dati cambiano di conseguenza senza
// bisogno di toccare questo file.
//
// `t` (next-intl, gia' risolto sul locale corrente dal chiamante,
// stesso identico `t` passato a buildRendererData.ts) traduce ogni
// etichetta FISSA generata qui — durata, numero di persone,
// destinazione, mood, "Private Experience", prefisso prezzo. Il
// titolo/descrizione/i nomi delle esperienze arrivano gia' localizzati
// da getBookableExperiences(locale)/generateProposal, non c'e' nulla
// da tradurre qui per quelli. Chiavi in site_copy sotto il namespace
// "socialCard" (vedi site_copy_socialcard.sql) — stesso pattern di
// "eventsPage"/"proposal.events".
// =========================================================

interface BuildSocialCardDataParams {
  slug: string;
  heroTitle: string;
  heroImage: string;
  featuredExperience: Experience;
  includedExperiences: ProposalExperienceCard[];
  galleryImages: string[];
  dynamicIntroParagraph: string;
  finalPrice: number;
  isMultiDayTrip: boolean;
  lead: {
    guests?: string | number;
    children?: string | number;
    start_date?: string;
    end_date?: string;
    moods?: string[];
  };
  locale: string;
  t: any;
}

function travelersLabel(guests: string | number | undefined, children: string | number | undefined, t: any): string {
  const adults = Number(guests) || 2;
  const kids = Number(children) || 0;
  const total = adults + kids;
  return total === 1
    ? t("socialCard.onePerson", { count: total })
    : t("socialCard.people", { count: total });
}

function durationLabel(
  isMultiDayTrip: boolean,
  startDate: string | undefined,
  endDate: string | undefined,
  t: any
): string {
  if (!isMultiDayTrip) return t("socialCard.oneDay", { count: 1 });

  if (startDate && endDate) {
    const days = Math.max(
      1,
      Math.round(
        (new Date(endDate).getTime() - new Date(startDate).getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1
    );
    return days === 1
      ? t("socialCard.oneDay", { count: days })
      : t("socialCard.days", { count: days });
  }

  return t("socialCard.multiDayEscape");
}

// Stessa mappa usata altrove nel progetto (ProposalEvents.tsx,
// events-widget.js) per formattare le date secondo il locale del
// sito invece del fisso "en-GB" precedente (es. "15 Apr" restava
// inglese anche per un visitatore italiano).
const DATE_LOCALES: Record<string, string> = {
  en: "en-GB", it: "it-IT", fr: "fr-FR", de: "de-DE",
  es: "es-ES", ru: "ru-RU", zh: "zh-CN", ja: "ja-JP",
};

function datesLabel(startDate: string | undefined, endDate: string | undefined, locale: string): string | undefined {
  if (!startDate) return undefined;

  const format = (d: string) =>
    new Date(d).toLocaleDateString(DATE_LOCALES[locale] || DATE_LOCALES.en, { day: "numeric", month: "short", year: "numeric" });

  return endDate && endDate !== startDate
    ? `${format(startDate)} – ${format(endDate)}`
    : format(startDate);
}

// Titolo breve, sintetico — mai la description lunga di una singola
// experience, che appartiene alla proposal, non alla card social.
// Preferisce fermarsi alla fine della prima frase (un punto) invece
// di tagliare comunque a un numero fisso di caratteri: una frase
// completa un po' piu' lunga legge meglio di una spezzata con "…",
// anche quando supera leggermente maxLength. Solo se la prima frase
// stessa e' spropositatamente lunga (nessun punto vicino) si ricade
// sul taglio all'ultimo spazio prima del limite — mai a meta' parola
// (altrimenti "pace" diventa "pac…").
function shortDescription(text: string, maxLength = 140): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;

  const firstSentence = trimmed.match(/^[^.!?]*[.!?]/)?.[0].trim();
  if (firstSentence && firstSentence.length <= maxLength * 1.3) {
    return firstSentence;
  }

  const sliced = trimmed.slice(0, maxLength);
  const lastSpace = sliced.lastIndexOf(" ");
  const safeSlice = lastSpace > 0 ? sliced.slice(0, lastSpace) : sliced;

  return `${safeSlice.trimEnd()}…`;
}

export function buildSocialCardData({
  slug,
  heroTitle,
  heroImage,
  featuredExperience,
  includedExperiences,
  galleryImages,
  dynamicIntroParagraph,
  finalPrice,
  isMultiDayTrip,
  lead,
  locale,
  t,
}: BuildSocialCardDataParams): SocialCardData {

  // Tutte le esperienze REALMENTE presenti in questa proposal — la
  // featured sempre prima, poi le incluse, dedup per titolo. Nessun
  // cap fisso: se la proposal ne contiene 2, la card ne mostra 2; se
  // ne contiene 4, ne mostra 4 (il massimo possibile, dato che
  // buildRendererData.ts include al piu' 3 esperienze oltre alla
  // featured). Decisione esplicita del cliente — mostrare sempre il
  // conteggio reale, non un teaser tagliato.
  // Ogni highlight porta con se' la SUA foto (non una foto generica
  // pescata dal pool), cosi' la striscia di miniature mostra
  // davvero le esperienze coinvolte, non solo la featured. Per la
  // featured, mai heroImage: e' gia' lo sfondo dell'intera card
  // (images[0], vedi sotto) — usare la stessa foto anche in miniatura
  // la rende invisibile/ridondante. detail_image e' una foto diversa
  // della stessa experience, pensata apposta per questo.
  const highlightCandidates = [
    {
      title: featuredExperience.title,
      image: featuredExperience.detail_image || featuredExperience.image || heroImage,
    },
    ...includedExperiences.map((exp) => ({ title: exp.title, image: exp.image })),
  ].filter((item) => Boolean(item.title));

  const seenTitles = new Set<string>();
  const highlights = highlightCandidates.filter((item) => {
    if (seenTitles.has(item.title)) return false;
    seenTitles.add(item.title);
    return true;
  });

  const images = Array.from(
    new Set(
      [
        heroImage,
        featuredExperience.hero_image,
        featuredExperience.image,
        featuredExperience.detail_image,
        ...galleryImages,
      ].filter((img): img is string => Boolean(img))
    )
  );

  const moodKey = lead.moods?.[0] ? MOOD_NAME_KEYS[lead.moods[0]] : undefined;

  return {
    title: heroTitle,
    destination: t("socialCard.destination"),
    duration: durationLabel(isMultiDayTrip, lead.start_date, lead.end_date, t),
    travelers: travelersLabel(lead.guests, lead.children, t),
    dates: datesLabel(lead.start_date, lead.end_date, locale),
    mood: moodKey ? t(`configurator.moodNames.${moodKey}`) : lead.moods?.[0],
    highlights,
    description: shortDescription(dynamicIntroParagraph || featuredExperience.short_description || ""),
    images,
    price: finalPrice,
    // Di default nascosto — la card social e' pensata come teaser
    // editoriale, non come preventivo. Puo' essere attivato nel modale.
    showPrice: false,
    fromLabel: t("socialCard.from"),
    privateExperienceLabel: t("socialCard.privateExperience"),
    cta: SOCIAL_CARD_CTA_PRESETS[0],
    ctaUrl: "/craft-your-experience",
    proposalUrl: `/results/proposal/${slug}`,
  };
}

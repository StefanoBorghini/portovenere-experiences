import { Experience } from "@/types/experience";
import { ProposalExperienceCard } from "@/types/proposal";
import { SocialCardData, SOCIAL_CARD_CTA_PRESETS } from "@/types/socialCard";

// =========================================================
// buildSocialCardData — trasformazione pura, NON un secondo motore
// di generazione. Prende esattamente i dati gia' calcolati da
// generateProposal()/buildRendererData() in
// results/proposal/[slug]/page.tsx e li riduce a un formato
// editoriale sintetico per la Social Experience Card. Se cambia la
// configurazione a monte, questi dati cambiano di conseguenza senza
// bisogno di toccare questo file.
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
}

const NUMBER_WORDS: Record<number, string> = {
  1: "One", 2: "Two", 3: "Three", 4: "Four", 5: "Five",
  6: "Six", 7: "Seven", 8: "Eight", 9: "Nine", 10: "Ten",
};

function travelersLabel(guests?: string | number, children?: string | number): string {
  const adults = Number(guests) || 2;
  const kids = Number(children) || 0;
  const total = adults + kids;
  const word = NUMBER_WORDS[total] || String(total);
  return `${word} ${total === 1 ? "Person" : "People"}`;
}

function durationLabel(
  isMultiDayTrip: boolean,
  startDate?: string,
  endDate?: string
): string {
  if (!isMultiDayTrip) return "One Day";

  if (startDate && endDate) {
    const days = Math.max(
      1,
      Math.round(
        (new Date(endDate).getTime() - new Date(startDate).getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1
    );
    const word = NUMBER_WORDS[days] || String(days);
    return `${word} Day${days === 1 ? "" : "s"}`;
  }

  return "Multi-Day Escape";
}

function datesLabel(startDate?: string, endDate?: string): string | undefined {
  if (!startDate) return undefined;

  const format = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  return endDate && endDate !== startDate
    ? `${format(startDate)} – ${format(endDate)}`
    : format(startDate);
}

// Titolo breve, sintetico — mai la description lunga di una singola
// experience, che appartiene alla proposal, non alla card social.
function shortDescription(text: string, maxLength = 140): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength).trimEnd()}…`;
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
}: BuildSocialCardDataParams): SocialCardData {

  // Mai la lista completa: la featured experience sempre prima,
  // poi le incluse — dedup per titolo, cap a 3. Con un 4° elemento
  // la card perde spazio per la riga editoriale (description) e
  // legge piu' come elenco che come momento curato — vedi il
  // confronto 3 vs 4 discusso con il cliente.
  const highlightTitles = [
    featuredExperience.title,
    ...includedExperiences.map((exp) => exp.title),
  ];

  const highlights = Array.from(new Set(highlightTitles))
    .filter(Boolean)
    .slice(0, 3);

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

  return {
    title: heroTitle,
    destination: "Portovenere, Italian Riviera",
    duration: durationLabel(isMultiDayTrip, lead.start_date, lead.end_date),
    travelers: travelersLabel(lead.guests, lead.children),
    dates: datesLabel(lead.start_date, lead.end_date),
    mood: lead.moods?.[0],
    highlights,
    description: shortDescription(dynamicIntroParagraph || featuredExperience.short_description || ""),
    images,
    price: finalPrice,
    // Di default nascosto — la card social e' pensata come teaser
    // editoriale, non come preventivo. Puo' essere attivato nel modale.
    showPrice: false,
    cta: SOCIAL_CARD_CTA_PRESETS[0],
    ctaUrl: "/craft-your-experience",
    proposalUrl: `/results/proposal/${slug}`,
  };
}

import { getSupabaseAdmin } from "@/lib/supabase/adminClient";
import { generateProposal } from "@/lib/generateProposal";
import { buildRendererData } from "@/lib/proposal-engine/buildRendererData";
import { getBookableExperiences } from "@/lib/supabase/experienceRepository";
import { getBookableEnhancements } from "@/lib/supabase/enhancementRepository";
import { getCurrentLocale } from "@/i18n/locale";
import { getTranslations } from "next-intl/server";
import { buildSocialCardData } from "./buildSocialCardData";
import { SocialCardData } from "@/types/socialCard";

// =========================================================
// Server-only — genera i dati della Social Experience Card a partire
// da uno slug di Proposal. Rifa' lo stesso calcolo di
// results/proposal/[slug]/page.tsx (generateProposal() +
// buildRendererData()), perche' quei dati non sono salvati da nessuna
// parte: la card e' SEMPRE una sintesi live della proposal, mai un
// export cristallizzato al momento della generazione.
//
// Usa getSupabaseAdmin() (service role) invece del client pubblico:
// questa funzione gira solo dietro alla route admin
// /api/admin/leads/[id]/social-card, gia' protetta da
// requireAdminSession — nessuna dipendenza dalle RLS policy di
// "Proposal".
// =========================================================

export async function getSocialCardDataForSlug(
  slug: string
): Promise<SocialCardData | null> {

  const supabaseAdmin = getSupabaseAdmin();

  const { data: proposal, error } = await supabaseAdmin
    .from("Proposal")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !proposal) {
    return null;
  }

  const lead = proposal.proposal_data;

  if (!lead) {
    return null;
  }

  const tripDays =
    lead.start_date && lead.end_date
      ? Math.max(
          1,
          Math.round(
            (new Date(lead.end_date).getTime() -
              new Date(lead.start_date).getTime()) /
              (1000 * 60 * 60 * 24)
          ) + 1
        )
      : undefined;

  const locale = await getCurrentLocale();

  const [dynamicExperiences, dynamicEnhancements, t] = await Promise.all([
    getBookableExperiences(locale),
    getBookableEnhancements(locale),
    getTranslations(),
  ]);

  const generatedProposal = generateProposal({
    experiencesSelected: lead.experiences || [],
    moodsSelected: lead.moods || [],
    budget: lead.budget,
    guests: lead.guests,
    children: lead.children,
    travelingWithChildren: lead.traveling_with_children || false,
    accessibility: lead.accessibility,
    tripDays,
    startDate: lead.start_date,
    endDate: lead.end_date,
    allExperiences: dynamicExperiences,
  });

  const featuredExperience = generatedProposal.featuredExperience;

  if (!featuredExperience) {
    return null;
  }

  const {
    galleryImages,
    includedExperiences,
    isMultiDayTrip,
    finalPrice,
  } = buildRendererData({
    generatedProposal,
    lead,
    enhancements: dynamicEnhancements,
    t,
    locale,
  });

  const heroTitle = generatedProposal.heroTitle || "Mediterranean Escape";
  const heroImage = generatedProposal.heroImage || "/images/default-hero.webp";
  const dynamicIntroParagraph = generatedProposal.dynamicIntroParagraph || "";

  return buildSocialCardData({
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
  });
}

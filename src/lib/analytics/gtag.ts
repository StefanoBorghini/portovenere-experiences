// =========================================================
// Helper GA4 — funzioni per tracciare pageview, eventi
// personalizzati e comportamento (scroll, tempo, hover, ecc).
// Non fanno nulla se l'utente non ha ancora dato consenso —
// gtag stesso ignora tutto finche' Iubenda non sblocca lo
// script (vedi GoogleAnalytics.tsx e MicrosoftClarity.tsx per
// il meccanismo di autoblocking).
// =========================================================

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export function pageview(url: string) {
  if (!GA_MEASUREMENT_ID || typeof window === "undefined" || !window.gtag) return;

  window.gtag("config", GA_MEASUREMENT_ID, {
    page_path: url,
  });
}

interface TrackEventParams {
  action: string;
  category: string;
  label?: string;
  value?: number;
  // Parametri extra liberi (es. experience_id, slug, percent...)
  // GA4 li accetta come custom parameters sull'evento.
  extra?: Record<string, string | number | boolean | undefined>;
}

export function trackEvent({
  action,
  category,
  label,
  value,
  extra,
}: TrackEventParams) {
  if (typeof window === "undefined" || !window.gtag) return;

  window.gtag("event", action, {
    event_category: category,
    event_label: label,
    value,
    ...extra,
  });
}

// =========================================================
// EVENTI DEL CONFIGURATORE — azioni esplicite dell'utente
// =========================================================

export function trackConfiguratorStart() {
  trackEvent({
    action: "configurator_start",
    category: "configurator",
  });
}

export function trackConfiguratorLoaded() {
  trackEvent({
    action: "configurator_loaded",
    category: "configurator",
  });
}

export function trackStepChanged(
  step: string,
  stepIndex: number
) {
  trackEvent({
    action: "step_changed",
    category: "configurator",
    label: step,
    extra: { step, step_index: stepIndex },
  });
}

// Alias esplicito — stesso payload di trackStepChanged, usato
// quando si vuole essere chiari che si tratta dell'ENTRATA in
// uno step (non del cambio generico), utile per costruire il
// funnel "step_entered" per step.
export function trackStepEntered(
  step: string,
  stepIndex: number
) {
  trackEvent({
    action: "step_entered",
    category: "configurator",
    label: step,
    extra: { step, step_index: stepIndex },
  });
}

export function trackStepBack(
  step: string,
  stepIndex: number
) {
  trackEvent({
    action: "step_back",
    category: "configurator",
    label: step,
    extra: { step, step_index: stepIndex },
  });
}

export function trackExperienceSelected(
  category: string
) {
  trackEvent({
    action: "experience_selected",
    category: "configurator",
    label: category,
    extra: { experience_category: category },
  });
}

export function trackExperienceRemoved(
  category: string
) {
  trackEvent({
    action: "experience_removed",
    category: "configurator",
    label: category,
    extra: { experience_category: category },
  });
}

export function trackMoodSelected(mood: string) {
  trackEvent({
    action: "mood_selected",
    category: "configurator",
    label: mood,
    extra: { mood },
  });
}

export function trackMoodRemoved(mood: string) {
  trackEvent({
    action: "mood_removed",
    category: "configurator",
    label: mood,
    extra: { mood },
  });
}

export function trackEnhancementAdded(
  enhancementId: number | string
) {
  trackEvent({
    action: "enhancement_added",
    category: "configurator",
    label: String(enhancementId),
    extra: { enhancement_id: enhancementId },
  });
}

export function trackEnhancementRemoved(
  enhancementId: number | string
) {
  trackEvent({
    action: "enhancement_removed",
    category: "configurator",
    label: String(enhancementId),
    extra: { enhancement_id: enhancementId },
  });
}

export function trackBudgetChanged(budget: string) {
  trackEvent({
    action: "budget_changed",
    category: "configurator",
    label: budget,
  });
}

export function trackGuestChanged(guests: string | number) {
  trackEvent({
    action: "guest_changed",
    category: "configurator",
    label: String(guests),
  });
}

export function trackDateSelected(
  startDate: string,
  endDate: string
) {
  trackEvent({
    action: "date_selected",
    category: "configurator",
    extra: { start_date: startDate, end_date: endDate },
  });
}

export function trackProposalGenerated(slug: string) {
  trackEvent({
    action: "proposal_generated",
    category: "configurator",
    label: slug,
    extra: { slug },
  });
}

// =========================================================
// EVENTI PROPOSAL PAGE — azioni esplicite
// =========================================================

export function trackProposalSent(slug: string) {
  trackEvent({
    action: "proposal_sent",
    category: "proposal",
    label: slug,
    extra: { slug },
  });
}

export function trackBookingConfirmed(slug: string) {
  trackEvent({
    action: "booking_confirmed",
    category: "proposal",
    label: slug,
    extra: { slug },
  });
}

export function trackBookingChangesConfirmed(slug: string) {
  trackEvent({
    action: "booking_changes_confirmed",
    category: "proposal",
    label: slug,
    extra: { slug },
  });
}

export function trackWhatsappClick(context: string) {
  trackEvent({
    action: "whatsapp_click",
    category: "contact",
    label: context,
  });
}

export function trackEmailClick(context: string) {
  trackEvent({
    action: "email_click",
    category: "contact",
    label: context,
  });
}

// =========================================================
// COMPORTAMENTO — scroll, tempo, hover, viewport
// =========================================================

export function trackScrollDepth(
  page: string,
  percent: 25 | 50 | 75 | 100
) {
  trackEvent({
    action: "scroll_depth",
    category: "behavior",
    label: page,
    value: percent,
    extra: { page, percent },
  });
}

// =========================================================
// LANDING — hero e CTA
// =========================================================

export function trackHeroViewed() {
  trackEvent({
    action: "hero_viewed",
    category: "landing",
  });
}

export function trackHeroVisible5s() {
  trackEvent({
    action: "hero_visible_5s",
    category: "landing",
  });
}

export function trackCtaViewed(ctaLabel: string) {
  trackEvent({
    action: "cta_viewed",
    category: "landing",
    label: ctaLabel,
    extra: { cta: ctaLabel },
  });
}

export function trackCtaClicked(ctaLabel: string) {
  trackEvent({
    action: "cta_clicked",
    category: "landing",
    label: ctaLabel,
    extra: { cta: ctaLabel },
  });
}

export function trackStepTimeSpent(
  step: string,
  seconds: number
) {
  trackEvent({
    action: "step_time_spent",
    category: "behavior",
    label: step,
    value: Math.round(seconds),
    extra: { step, seconds: Math.round(seconds) },
  });
}

export function trackStepAbandoned(
  step: string,
  seconds: number
) {
  trackEvent({
    action: "step_abandoned",
    category: "behavior",
    label: step,
    value: Math.round(seconds),
    extra: { step, time_spent: Math.round(seconds) },
  });
}

export function trackProposalScrollDepth(
  slug: string,
  percent: 25 | 50 | 75 | 100
) {
  trackEvent({
    action: "proposal_scroll_depth",
    category: "behavior",
    label: slug,
    value: percent,
    extra: { slug, percent },
  });
}

export function trackProposalHeartbeat(
  slug: string,
  seconds: number,
  sectionVisible?: string
) {
  trackEvent({
    action: "proposal_time_on_page",
    category: "behavior",
    label: slug,
    value: seconds,
    extra: {
      slug,
      seconds,
      section_visible: sectionVisible,
    },
  });
}

// =========================================================
// PROPOSAL PAGE — selezione/deselezione delle experience card
// gia' incluse nella proposal generata (diverso dalla scelta
// di categoria nel wizard, vedi trackExperienceSelected sopra:
// quella e' "preferenza dichiarata", questa e' "azione su una
// proposal gia' pronta").
// =========================================================

export function trackProposalExperienceAdded(
  experienceIdOrCategory: string
) {
  trackEvent({
    action: "proposal_experience_added",
    category: "proposal",
    label: experienceIdOrCategory,
    extra: { experience: experienceIdOrCategory },
  });
}

export function trackProposalExperienceRemoved(
  experienceIdOrCategory: string
) {
  trackEvent({
    action: "proposal_experience_removed",
    category: "proposal",
    label: experienceIdOrCategory,
    extra: { experience: experienceIdOrCategory },
  });
}

export function trackExperienceCardHover(
  experienceId: string,
  durationMs: number
) {
  trackEvent({
    action: "experience_card_hover",
    category: "behavior",
    label: experienceId,
    value: Math.round(durationMs / 1000),
    extra: {
      experience_id: experienceId,
      duration_ms: Math.round(durationMs),
    },
  });
}

export function trackSectionViewed(
  sectionName: string,
  slug?: string
) {
  trackEvent({
    action: "section_viewed",
    category: "behavior",
    label: sectionName,
    extra: { section_name: sectionName, slug },
  });
}

export function trackCtaVisible(slug?: string) {
  trackEvent({
    action: "cta_visible",
    category: "behavior",
    extra: { slug },
  });
}
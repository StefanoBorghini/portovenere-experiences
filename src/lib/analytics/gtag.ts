// =========================================================
// Helper GA4 — funzioni per tracciare pageview, eventi
// personalizzati e comportamento (scroll, tempo, hover, ecc).
// Non fanno nulla se l'utente non ha ancora dato consenso —
// gtag stesso ignora tutto finche' Iubenda non sblocca lo
// script (vedi GoogleAnalytics.tsx e MicrosoftClarity.tsx per
// il meccanismo di autoblocking).
// =========================================================

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// ID del tag Google Ads (AW-...), per le conversioni delle campagne.
// Va impostato come env var NEXT_PUBLIC_GOOGLE_ADS_ID nel progetto
// (es. "AW-322936404") — se assente, trackAdsConversion() non fa nulla.
export const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

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

  // Stesso evento anche nel dataLayer, in un formato che i trigger
  // "Evento personalizzato" di GTM possono leggere direttamente
  // (event: action) -- gtag() sopra scrive nel dataLayer col suo
  // formato interno (arguments array), che GTM non intercetta come
  // Custom Event pulito. Nessun window.dataLayer = [] qui: sia
  // GoogleAnalytics.tsx che GoogleTagManager.tsx lo inizializzano
  // gia' prima che questo possa girare (stesso gate window.gtag
  // sopra -- se gtag esiste, dataLayer esiste).
  window.dataLayer.push({
    event: action,
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

export function trackAccessibilityChanged(hasNeeds: boolean, needs: string[]) {
  trackEvent({
    action: "accessibility_changed",
    category: "configurator",
    label: hasNeeds ? needs.join(",") || "yes_unspecified" : "no",
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

// =========================================================
// GOOGLE ADS — conversioni per campagna. Separato da trackEvent()
// perche' non e' un evento GA4: e' l'evento "conversion" che
// gtag.js manda al tag Ads (AW-...), con una conversion label
// specifica per ciascuna azione da misurare.
// =========================================================

interface TrackAdsConversionParams {
  // Label della conversione cosi' come appare in Google Ads
  // (Strumenti > Conversioni > [azione] > Impostazione tag),
  // nel formato "AW-XXXXXXXXX/YYYYYYYYYYYYYYYYYYYY".
  conversionLabel: string;
  value?: number;
  currency?: string;
}

export function trackAdsConversion({
  conversionLabel,
  value,
  currency = "EUR",
}: TrackAdsConversionParams) {
  if (typeof window === "undefined" || !window.gtag) return;

  window.gtag("event", "conversion", {
    send_to: conversionLabel,
    value,
    currency,
  });
}

// Conversione "Richiesta preventivo" — scatta quando l'utente invia
// una richiesta di prenotazione/preventivo dalla pagina proposal
// (vedi proposalClient.tsx, accanto a trackProposalSent). Le altre
// conversioni Ads (click CTA homepage, avvio configuratore, proposta
// generata) sono importate direttamente dai relativi eventi GA4 via
// Google Ads > Conversioni > eventi GA4 — nessuna chiamata diretta
// necessaria per quelle, per evitare doppio conteggio.
export function trackQuoteRequestConversion() {
  trackAdsConversion({
    conversionLabel: "AW-322936404/gFuzCK6i_-UcENS8_pkB",
    value: 1.0,
    currency: "EUR",
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

// =========================================================
// SOCIAL EXPERIENCE CARD — apertura del modale "Generate Social
// Card" sulla proposal page, cambio formato e download (vedi
// src/components/social-card/).
// =========================================================

export function trackSocialCardOpened(slug: string) {
  trackEvent({
    action: "social_card_opened",
    category: "proposal",
    label: slug,
    extra: { slug },
  });
}

export function trackSocialCardFormatChanged(slug: string, format: string) {
  trackEvent({
    action: "social_card_format_changed",
    category: "proposal",
    label: format,
    extra: { slug, format },
  });
}

export function trackSocialCardDownloaded(slug: string, format: string) {
  trackEvent({
    action: "social_card_downloaded",
    category: "proposal",
    label: format,
    extra: { slug, format },
  });
}

// =========================================================
// /start — micro-landing per il traffico social (Instagram bio
// e simili). Eventi dedicati (non riusiamo trackCtaClicked) cosi'
// il funnel Instagram -> /start -> configuratore -> proposal e'
// isolabile per nome evento, non solo per label.
// =========================================================

interface StartLinkClickParams {
  linkPosition: number;
  linkDestination: string;
  sourcePage?: string;
}

export function trackStartPageView() {
  trackEvent({
    action: "start_page_view",
    category: "start",
  });
}

export function trackClickCreateExperience({
  linkPosition,
  linkDestination,
  sourcePage = "start",
}: StartLinkClickParams) {
  trackEvent({
    action: "click_create_experience",
    category: "start",
    extra: {
      link_position: linkPosition,
      link_destination: linkDestination,
      source_page: sourcePage,
    },
  });
}

export function trackClickExplorePortovenere({
  linkPosition,
  linkDestination,
  sourcePage = "start",
}: StartLinkClickParams) {
  trackEvent({
    action: "click_explore_portovenere",
    category: "start",
    extra: {
      link_position: linkPosition,
      link_destination: linkDestination,
      source_page: sourcePage,
    },
  });
}

export function trackClickCuratedExperiences({
  linkPosition,
  linkDestination,
  sourcePage = "start",
}: StartLinkClickParams) {
  trackEvent({
    action: "click_curated_experiences",
    category: "start",
    extra: {
      link_position: linkPosition,
      link_destination: linkDestination,
      source_page: sourcePage,
    },
  });
}

export function trackClickStayEatDiscover({
  linkPosition,
  linkDestination,
  sourcePage = "start",
}: StartLinkClickParams) {
  trackEvent({
    action: "click_stay_eat_discover",
    category: "start",
    extra: {
      link_position: linkPosition,
      link_destination: linkDestination,
      source_page: sourcePage,
    },
  });
}

// =========================================================
// /become-a-partner — wizard B2B step-by-step per operatori (hotel,
// ristoranti, noleggio privato, tour operator, altro). Categoria
// dedicata "partners", separata da "start" e da "configurator", cosi'
// il funnel B2B resta isolabile dal funnel turistico. Stesso schema
// di eventi step del configuratore (trackStepEntered/trackStepBack),
// per poter confrontare i due funnel con lo stesso vocabolario.
// =========================================================

export function trackPartnerPageView() {
  trackEvent({
    action: "partner_page_view",
    category: "partners",
  });
}

export function trackPartnerStepEntered(step: string, stepIndex: number) {
  trackEvent({
    action: "partner_step_entered",
    category: "partners",
    label: step,
    extra: { step, step_index: stepIndex },
  });
}

export function trackPartnerStepBack(step: string, stepIndex: number) {
  trackEvent({
    action: "partner_step_back",
    category: "partners",
    label: step,
    extra: { step, step_index: stepIndex },
  });
}

export function trackPartnerTypeSelected(category: string) {
  trackEvent({
    action: "partner_type_selected",
    category: "partners",
    label: category,
    extra: { partner_category: category },
  });
}

export function trackPartnerPlanSelected(plan: string) {
  trackEvent({
    action: "partner_plan_selected",
    category: "partners",
    label: plan,
    extra: { plan },
  });
}

export function trackPartnerApplicationSubmitted(plan: string, category: string) {
  trackEvent({
    action: "partner_application_submitted",
    category: "partners",
    label: plan,
    extra: { plan, partner_category: category },
  });
}

export function trackPartnerApplicationError(reason: string) {
  trackEvent({
    action: "partner_application_error",
    category: "partners",
    label: reason,
  });
}

// =========================================================
// /submit-experience — wizard per operatori che propongono UNA
// singola esperienza (non un'intera attivita', quello e' il funnel
// "partners" sopra). Categoria dedicata "experience_submissions",
// stesso vocabolario di eventi (step_entered/step_back) per restare
// confrontabile con gli altri due funnel.
// =========================================================

export function trackExperienceSubmissionPageView() {
  trackEvent({
    action: "experience_submission_page_view",
    category: "experience_submissions",
  });
}

export function trackExperienceSubmissionStepEntered(step: string, stepIndex: number) {
  trackEvent({
    action: "experience_submission_step_entered",
    category: "experience_submissions",
    label: step,
    extra: { step, step_index: stepIndex },
  });
}

export function trackExperienceSubmissionStepBack(step: string, stepIndex: number) {
  trackEvent({
    action: "experience_submission_step_back",
    category: "experience_submissions",
    label: step,
    extra: { step, step_index: stepIndex },
  });
}

export function trackExperienceSubmissionTypeSelected(category: string) {
  trackEvent({
    action: "experience_submission_type_selected",
    category: "experience_submissions",
    label: category,
    extra: { experience_category: category },
  });
}

export function trackExperienceSubmissionSubmitted(category: string) {
  trackEvent({
    action: "experience_submission_submitted",
    category: "experience_submissions",
    label: category,
    extra: { experience_category: category },
  });
}

export function trackExperienceSubmissionError(reason: string) {
  trackEvent({
    action: "experience_submission_error",
    category: "experience_submissions",
    label: reason,
  });
}

export function trackClickWorkWithUs({
  linkPosition,
  linkDestination,
  sourcePage = "start",
}: StartLinkClickParams) {
  trackEvent({
    action: "click_work_with_us",
    category: "start",
    extra: {
      link_position: linkPosition,
      link_destination: linkDestination,
      source_page: sourcePage,
    },
  });
}
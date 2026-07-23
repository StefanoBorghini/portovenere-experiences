"use client";
import FloatingPriceBar from "@/components/proposal/FloatingPriceBar";
import ProposalHero from "@/components/proposal/ProposalHero";
import ProposalNarrative from "@/components/proposal/ProposalNarrative";
import FeaturedExperience from "@/components/proposal/FeaturedExperience";
import IncludedExperiences from "@/components/proposal/IncludedExperiences";
import ProposalEnhancements from "@/components/proposal/ProposalEnhancements";
import CinematicGallery from "@/components/proposal/CinematicGallery";
import ReservationSection from "@/components/proposal/ReservationSection";
import ShareButton from "@/components/ShareButton";
import { calculatePrice } from "@/lib/pricing/calculatePrice";
import { resolveSeasonalPriceOverride } from "@/lib/pricing/resolveSeasonalPrice";
import { useState, useEffect, useRef } from "react";
import {
    trackProposalSent,
    trackBookingConfirmed,
    trackBookingChangesConfirmed,
    trackProposalScrollDepth,
    trackProposalHeartbeat,
} from "@/lib/analytics/gtag";
import SectionViewTracker from "@/components/analytics/SectionViewTracker";


interface ConfirmedSelection {
    experienceIds: string[];
    enhancementIds: (number | string)[];
}

interface Props {

    heroImage:any;
    heroTitle:any;
    lead:any;
    featuredExperience:any;
    includedExperiences:any[];
    includedExperiencesPreSelected:boolean;
    enhancements:any[];
    galleryImages:any[];
    expiresAt:any;
    whatsappUrl:string;
    dynamicIntroTitle:string;
    dynamicIntroParagraph:string;
    dynamicClosingParagraph:string;
    finalPrice:number;
    proposalSummary: string;
    slug: string;
    leadName: string;
    leadEmail: string;
    alreadyVerified: boolean;
    confirmedSelection?: ConfirmedSelection | null;
    isMultiDayTrip?: boolean;

}

// Confronta due liste come insiemi (stesso contenuto, ordine ininfluente)
function sameSelection(a: (string | number)[], b: (string | number)[]) {
    if (a.length !== b.length) return false;
    const setA = new Set(a.map(String));
    return b.every((item) => setA.has(String(item)));
}

export default function ProposalClient({

    heroImage,
    heroTitle,
    lead,
    featuredExperience,
    includedExperiences,
    includedExperiencesPreSelected,
    enhancements,
    galleryImages,
    expiresAt,
    whatsappUrl,
    dynamicIntroTitle,
    dynamicIntroParagraph,
    dynamicClosingParagraph,
    finalPrice,
    proposalSummary,
    slug,
    leadName,
    leadEmail,
    alreadyVerified,
    confirmedSelection: initialConfirmedSelection = null,
    isMultiDayTrip = false,

}:Props){

    // =====================================================
    // SAFETY GUARD
    // =====================================================

    if (!featuredExperience) {
        return (
            <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
                <p className="text-zinc-400 text-lg text-center max-w-xl">
                    We couldn't load this proposal correctly.
                    Please contact us directly.
                </p>
            </main>
        );
    }

    // =====================================================
    // FIX BUG "3 Experiences invece di 2": selectedExperienceIds
    // deve contenere SOLO le esperienze extra (quelle gestite da
    // IncludedExperiences), MAI la featured — perche' experienceCount
    // piu' sotto fa sempre "1 + selectedExperienceIds.length",
    // assumendo che quell'1 sia gia' la featured.
    //
    // Il problema: /api/request-booking ora salva anche l'ID della
    // featured dentro confirmed_selection.experienceIds (serve per
    // farla comparire nella pagina admin). Quando la pagina si
    // ricarica con initialConfirmedSelection dal server, se non
    // filtriamo quell'ID qui, finisce di nuovo dentro
    // selectedExperienceIds e viene contata due volte.
    // =====================================================

    const [
        selectedEnhancements,
        setSelectedEnhancements
    ] = useState<number[]>(
        initialConfirmedSelection?.enhancementIds
            ? initialConfirmedSelection.enhancementIds.map((id) => Number(id))
            : []
    );

    const [
        selectedExperienceIds,
        setSelectedExperienceIds

    ] = useState<string[]>(
        initialConfirmedSelection?.experienceIds
            ? initialConfirmedSelection.experienceIds.filter(
                  (id) => id !== featuredExperience.id
              )
            : includedExperiencesPreSelected
                ? includedExperiences.map((card: any) => card.id)
                : []
    );

    const [bookingState, setBookingState] = useState<
        "idle" | "sending" | "sent" | "error"
    >(alreadyVerified ? "sent" : "idle");

    useEffect(() => {
        if (alreadyVerified) {
            trackBookingConfirmed(slug);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const firedScrollThresholdsRef =
        useRef<Set<25 | 50 | 75 | 100>>(new Set());

    useEffect(() => {

        function handleScroll() {

            const scrollableHeight =
                document.documentElement.scrollHeight - window.innerHeight;

            if (scrollableHeight <= 0) return;

            const percentScrolled =
                (window.scrollY / scrollableHeight) * 100;

            ([25, 50, 75, 100] as const).forEach((threshold) => {

                if (
                    percentScrolled >= threshold &&
                    !firedScrollThresholdsRef.current.has(threshold)
                ) {
                    firedScrollThresholdsRef.current.add(threshold);
                    trackProposalScrollDepth(slug, threshold);
                }

            });
        }

        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {

        let activeSecondsTotal = 0;
        let secondsSinceLastHeartbeat = 0;

        function isActive() {
            return (
                document.visibilityState === "visible" &&
                document.hasFocus()
            );
        }

        const intervalId = setInterval(() => {

            if (!isActive()) return;

            activeSecondsTotal += 1;
            secondsSinceLastHeartbeat += 1;

            if (secondsSinceLastHeartbeat >= 15) {
                trackProposalHeartbeat(slug, activeSecondsTotal);
                secondsSinceLastHeartbeat = 0;
            }

        }, 1000);

        return () => {
            clearInterval(intervalId);
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [confirmedSelection, setConfirmedSelection] =
        useState<ConfirmedSelection | null>(initialConfirmedSelection);

    const [currentExpiresAt, setCurrentExpiresAt] = useState(expiresAt);

    const hasUnconfirmedChanges =
        bookingState === "sent" &&
        confirmedSelection !== null &&
        (
            !sameSelection(selectedExperienceIds, (confirmedSelection.experienceIds || []).filter(
                (id) => id !== featuredExperience.id
            )) ||
            !sameSelection(selectedEnhancements, confirmedSelection.enhancementIds || [])
        );

    // =====================================================
    // PREZZO LIVE
    // =====================================================

    const guestCount = Number(lead.guests) || 1;
    const childCount = Number(lead.children) || 0;

    const checkInDate = lead.start_date;

    const featuredSeasonalPrice = resolveSeasonalPriceOverride(
        featuredExperience,
        checkInDate
    );

    // Una singola esperienza/enhancement con un prezzo rotto (es.
    // base_price null in DB) non deve azzerare l'INTERO totale —
    // trattiamo quel singolo elemento come 0 e continuiamo.
    function safeNumber(value: number): number {
        return Number.isFinite(value) ? value : 0;
    }

    const featuredPrice = safeNumber(
        featuredSeasonalPrice !== null
            ? featuredSeasonalPrice
            : calculatePrice(
                featuredExperience?.base_price ?? 0,
                featuredExperience?.pricing_type ?? "fixed",
                guestCount,
                childCount,
                featuredExperience?.child_discount_percentage ?? 0,
                featuredExperience?.price_tiers ?? [],
                featuredExperience?.use_guest_tiers === true
            )
    );

    // Dettaglio per-esperienza EXTRA (oltre alla featured) — titolo,
    // operatore e prezzo, non solo la macro-categoria del wizard.
    const includedExperienceDetails = includedExperiences
        .filter((card: any) => selectedExperienceIds.includes(card.id))
        .map((card: any) => {

            const seasonalPrice = resolveSeasonalPriceOverride(
                card.experience,
                checkInDate
            );

            const price = safeNumber(
                seasonalPrice !== null
                    ? seasonalPrice
                    : calculatePrice(
                        card.experience?.base_price ?? 0,
                        card.experience?.pricing_type ?? "fixed",
                        guestCount,
                        childCount,
                        card.experience?.child_discount_percentage ?? 0,
                        card.experience?.price_tiers ?? [],
                        card.experience?.use_guest_tiers === true
                    )
            );

            return {
                title: card.experience?.title || card.title || "",
                operator: card.experience?.operator || card.operator || "",
                price,
            };
        });

    const includedExperiencesPrice = includedExperienceDetails.reduce(
        (sum, d) => sum + d.price,
        0
    );

    const enhancementDetails = enhancements
        .filter((enh: any) => selectedEnhancements.includes(enh.id))
        .map((enh: any) => ({
            title: enh.title || "",
            price: safeNumber(
                calculatePrice(
                    enh.base_price ?? 0,
                    enh.price_type ?? "fixed",
                    guestCount
                )
            ),
        }));

    const enhancementsPrice = enhancementDetails.reduce(
        (sum, d) => sum + d.price,
        0
    );

    const liveTotal = Math.round(
        featuredPrice +
        includedExperiencesPrice +
        enhancementsPrice
    );

    // Dettaglio completo esperienze — SEMPRE con la featured in
    // testa, poi le extra selezionate. Questo e' l'array che finisce
    // nelle mail (cliente e operatore) E nell'admin.
    const experienceDetails = [
        {
            title: featuredExperience.title || "",
            operator: featuredExperience.operator || "",
            price: featuredPrice,
        },
        ...includedExperienceDetails,
    ];

    // =====================================================
    // CONTEGGIO EXPERIENCE LIVE — il "+1" e' SEMPRE la featured,
    // mai duplicata: selectedExperienceIds contiene solo le extra
    // grazie al filtro applicato sopra in ogni punto in cui viene
    // idratato o confrontato.
    // =====================================================

    const experienceCount =
        1 + selectedExperienceIds.length;

    const priceLabel =
        `${experienceCount} Experience${experienceCount !== 1 ? "s" : ""} Included`;

    async function handleRequestBooking() {

        setBookingState("sending");

        try {

            const response = await fetch("/api/request-booking", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    slug,
                    // L'esperienza principale (featuredExperience) NON fa mai
                    // parte di selectedExperienceIds — quello stato traccia
                    // solo le esperienze EXTRA scelte in IncludedExperiences.
                    // La aggiungiamo qui SOLO nel payload inviato al server
                    // (per farla comparire in admin/mail), MAI nello stato
                    // React locale — altrimenti si ripresenta il bug del
                    // doppio conteggio.
                    experienceIds: Array.from(
                        new Set([featuredExperience.id, ...selectedExperienceIds])
                    ),
                    enhancementIds: selectedEnhancements,
                    totalPrice: liveTotal,
                    experienceDetails,
                    enhancementDetails,
                }),
            });

            const data = await response.json();

            if (!data.success) {
                setBookingState("error");
                return;
            }

            trackProposalSent(slug);

            if (data.expiresAt) {
                setCurrentExpiresAt(data.expiresAt);
            }

            setBookingState("sent");

        } catch (err) {
            console.error("request-booking failed:", err);
            setBookingState("error");
        }
    }

    async function handleConfirmChanges() {

        setBookingState("sending");

        try {

            const response = await fetch("/api/confirm-changes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    slug,
                    experienceIds: Array.from(
                        new Set([featuredExperience.id, ...selectedExperienceIds])
                    ),
                    enhancementIds: selectedEnhancements,
                }),
            });

            const data = await response.json();

            if (!data.success) {
                setBookingState("error");
                return;
            }

            // NOTA: confirmedSelection (stato locale) mantiene l'ID della
            // featured, perche' viene confrontato con hasUnconfirmedChanges
            // che ora filtra la featured da entrambi i lati prima di
            // confrontare — vedi sopra. Qui salviamo esattamente cio' che
            // e' stato inviato al server, per coerenza totale.
            setConfirmedSelection({
                experienceIds: Array.from(
                    new Set([featuredExperience.id, ...selectedExperienceIds])
                ),
                enhancementIds: selectedEnhancements,
            });

            trackBookingChangesConfirmed(slug);

            setCurrentExpiresAt(data.expiresAt);
            setBookingState("sent");

        } catch (err) {
            console.error("confirm-changes failed:", err);
            setBookingState("error");
        }
    }

    const handleAction = hasUnconfirmedChanges
        ? handleConfirmChanges
        : handleRequestBooking;

    return (

<main
    id="proposal-content"
    className="
        bg-black
        text-white
        min-h-screen

        pb-28
        md:pb-20
    "
>
 <FloatingPriceBar
        experienceCount={experienceCount}
        totalPrice={liveTotal}
        bookingState={bookingState}
        onRequestBooking={handleAction}
        hasUnconfirmedChanges={hasUnconfirmedChanges}
        leadName={leadName}
        leadEmail={leadEmail}
        alreadyVerified={alreadyVerified}
    />

    <ProposalHero
        heroImage={heroImage}
        heroTitle={heroTitle}
        guests={lead.guests}
        children={lead.children}
        totalPrice={liveTotal}
    />

    <SectionViewTracker name="narrative" slug={slug}>
        <ProposalNarrative
            title={dynamicIntroTitle}
            paragraph={proposalSummary}
        />
    </SectionViewTracker>

     <SectionViewTracker name="featured_experience" slug={slug}>
        <FeaturedExperience
            image={
                featuredExperience.detail_image ??
                featuredExperience.hero_image
            }
            operator={featuredExperience.operator}
            subtitle={featuredExperience.title}
            description={featuredExperience.description}
            essentials={featuredExperience.sections}
            facts={featuredExperience.facts ?? []}
            basePrice={
                featuredSeasonalPrice !== null
                    ? featuredSeasonalPrice
                    : featuredExperience.base_price
            }
            priceType={
                featuredSeasonalPrice !== null
                    ? "fixed"
                    : featuredExperience.pricing_type
            }
            useGuestTiers={
                featuredSeasonalPrice !== null
                    ? false
                    : featuredExperience.use_guest_tiers === true
            }
            tiers={featuredExperience.price_tiers ?? []}
            guests={guestCount}
            children={childCount}
        />
    </SectionViewTracker>

  <SectionViewTracker name="included_experiences" slug={slug}>
        <IncludedExperiences
            experiences={includedExperiences}
            onSelectionChange={setSelectedExperienceIds}
            preSelected={includedExperiencesPreSelected}
            isMultiDayTrip={isMultiDayTrip}
            guests={guestCount}
            children={childCount}
            initialSelectedIds={
                initialConfirmedSelection?.experienceIds?.filter(
                    (id) => id !== featuredExperience.id
                )
            }
        />
    </SectionViewTracker>

    <SectionViewTracker name="enhancements" slug={slug}>
        <ProposalEnhancements
            enhancements={enhancements}
            selectedEnhancements={selectedEnhancements}
            setSelectedEnhancements={setSelectedEnhancements}
        />
    </SectionViewTracker>

    <SectionViewTracker name="gallery" slug={slug}>
        <CinematicGallery
            images={galleryImages}
        />
    </SectionViewTracker>


    <section className="py-20 px-6 print:hidden">
        <div className="max-w-4xl mx-auto flex justify-center">
           <ShareButton slug={slug} />
        </div>
    </section>


    <SectionViewTracker name="reservation" slug={slug}>
        <ReservationSection
        expiresAt={currentExpiresAt}
        closingParagraph={dynamicClosingParagraph}
        whatsappUrl={whatsappUrl}
        leadName={leadName}
        leadEmail={leadEmail}
        alreadyVerified={alreadyVerified}
        bookingState={bookingState}
        onRequestBooking={handleAction}
        hasUnconfirmedChanges={hasUnconfirmedChanges}
    />
    </SectionViewTracker>

</main>

);

}
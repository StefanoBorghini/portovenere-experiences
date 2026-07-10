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

    const [
        selectedEnhancements,
        setSelectedEnhancements
    ] = useState<number[]>([]);

    // Se sono suggerimenti (categoria singola), partono deselezionati.
    // Se sono experience delle categorie che l'utente ha scelto,
    // partono già incluse, come prima.
    const [
        selectedExperienceIds,
        setSelectedExperienceIds
        
    ] = useState<string[]>(
        includedExperiencesPreSelected
            ? includedExperiences.map((card: any) => card.id)
            : []
    );

    // =====================================================
    // STATO CONDIVISO DELLA RICHIESTA DI BOOKING
    // Sia FloatingPriceBar che ReservationSection leggono e
    // innescano questo stesso stato — cliccare l'uno o l'altro
    // fa la stessa cosa, e nessuno dei due permette un doppio invio.
    // =====================================================

    const [bookingState, setBookingState] = useState<
        "idle" | "sending" | "sent" | "error"
    >(alreadyVerified ? "sent" : "idle");

    // Se la pagina carica con alreadyVerified=true, significa che
    // il cliente e' appena arrivato dal link di conferma email —
    // e' il momento in cui la "conferma booking" avviene davvero
    // dal punto di vista del funnel.
    useEffect(() => {
        if (alreadyVerified) {
            trackBookingConfirmed(slug);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // =====================================================
    // SCROLL DEPTH — soglie 25/50/75/100%, ognuna una sola
    // volta per visita sulla proposal.
    // =====================================================

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

    // =====================================================
    // HEARTBEAT — tempo ATTIVO speso sulla pagina, non tempo
    // dall'apertura alla chiusura del tab. "Attivo" = tab
    // visibile E finestra a fuoco: se il cliente passa ad
    // un'altra scheda o app, il conteggio si ferma, e riparte
    // solo quando torna davvero a guardare la proposal.
    //
    // Ogni 15 secondi ATTIVI accumulati (non di orologio)
    // mandiamo un evento con il totale cumulativo fino a quel
    // momento — cosi' in GA4 si vede facilmente "quanti minuti
    // di lettura reale" per fascia, senza il rumore di tab
    // dimenticate aperte in background per ore.
    // =====================================================

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

    // Ultima selezione confermata (dal server) — usata per capire
    // se il cliente ha cambiato qualcosa DOPO aver gia' confermato.
    const [confirmedSelection, setConfirmedSelection] =
        useState<ConfirmedSelection | null>(initialConfirmedSelection);

    // Il timer che vedi in pagina — parte come quello del server,
    // ma si aggiorna con un nuovo valore ogni volta che le modifiche
    // vengono confermate (48h fresche dal momento della conferma).
    const [currentExpiresAt, setCurrentExpiresAt] = useState(expiresAt);

    // Ci sono modifiche non ancora confermate SOLO se: la richiesta
    // e' gia' stata confermata almeno una volta, E la selezione attuale
    // e' diversa da quella salvata l'ultima volta.
    const hasUnconfirmedChanges =
        bookingState === "sent" &&
        confirmedSelection !== null &&
        (
            !sameSelection(selectedExperienceIds, confirmedSelection.experienceIds || []) ||
            !sameSelection(selectedEnhancements, confirmedSelection.enhancementIds || [])
        );

    async function handleRequestBooking() {

        setBookingState("sending");

        try {

            const response = await fetch("/api/request-booking", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    slug,
                    experienceIds: selectedExperienceIds,
                    enhancementIds: selectedEnhancements,
                }),
            });

            const data = await response.json();

            if (!data.success) {
                setBookingState("error");
                return;
            }

            trackProposalSent(slug);

            setBookingState("sent");

        } catch (err) {
            console.error("request-booking failed:", err);
            setBookingState("error");
        }
    }

    // Chiamata quando il cliente modifica la selezione DOPO aver gia'
    // confermato l'email una volta — niente nuova verifica, solo
    // salvataggio + notifica + timer allungato.
    async function handleConfirmChanges() {

        setBookingState("sending");

        try {

            const response = await fetch("/api/confirm-changes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    slug,
                    experienceIds: selectedExperienceIds,
                    enhancementIds: selectedEnhancements,
                }),
            });

            const data = await response.json();

            if (!data.success) {
                setBookingState("error");
                return;
            }

            setConfirmedSelection({
                experienceIds: selectedExperienceIds,
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

    // I due bottoni (FloatingPriceBar e ReservationSection) chiamano
    // sempre la stessa funzione — decidiamo qui, in un solo posto,
    // se deve trattarsi della primissima richiesta o di una conferma
    // di modifiche successive.
    const handleAction = hasUnconfirmedChanges
        ? handleConfirmChanges
        : handleRequestBooking;

    // =====================================================
    // PREZZO LIVE
    // =====================================================

  const guestCount = Number(lead.guests) || 1;
    const childCount = Number(lead.children) || 0;

    const featuredPrice = calculatePrice(
        featuredExperience?.base_price ?? 0,
        featuredExperience?.pricing_type ?? "fixed",
        guestCount,
        childCount,
        featuredExperience?.child_discount_percentage ?? 0
    );

    const includedExperiencesPrice = includedExperiences
        .filter((card: any) => selectedExperienceIds.includes(card.id))
        .reduce((sum: number, card: any) =>
            sum + calculatePrice(
                card.experience?.base_price ?? 0,
                card.experience?.pricing_type ?? "fixed",
                guestCount,
                childCount,
                card.experience?.child_discount_percentage ?? 0
            ), 0
        );

    const enhancementsPrice = enhancements
        .filter((enh: any) => selectedEnhancements.includes(enh.id))
        .reduce((sum: number, enh: any) =>
            sum + calculatePrice(
                enh.base_price ?? 0,
                enh.price_type ?? "fixed",
                guestCount
            ), 0
        );

    const liveTotal = Math.round(
        featuredPrice +
        includedExperiencesPrice +
        enhancementsPrice
    );
// =====================================================
    // CONTEGGIO EXPERIENCE LIVE (featured + incluse selezionate)
    // =====================================================

    const experienceCount =
        1 + selectedExperienceIds.length;

    const priceLabel =
        `${experienceCount} Experience${experienceCount !== 1 ? "s" : ""} Included`;
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
            basePrice={featuredExperience.base_price}
            priceType={featuredExperience.pricing_type}
        />
    </SectionViewTracker>

    <SectionViewTracker name="included_experiences" slug={slug}>
        <IncludedExperiences
            experiences={includedExperiences}
            onSelectionChange={setSelectedExperienceIds}
            preSelected={includedExperiencesPreSelected}
            isMultiDayTrip={isMultiDayTrip}
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
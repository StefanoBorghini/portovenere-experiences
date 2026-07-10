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
import { useState } from "react";


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
        bg-[#0C0C0C]
        text-white
        min-h-screen
    "
>
 <FloatingPriceBar
        experienceCount={experienceCount}
        totalPrice={liveTotal}
        bookingState={bookingState}
        onRequestBooking={handleAction}
        hasUnconfirmedChanges={hasUnconfirmedChanges}
    />

    <ProposalHero
        heroImage={heroImage}
        heroTitle={heroTitle}
        guests={lead.guests}
        totalPrice={liveTotal}
    />

    <ProposalNarrative
        title={dynamicIntroTitle}
        paragraph={proposalSummary}
    />

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

    <IncludedExperiences
        experiences={includedExperiences}
        onSelectionChange={setSelectedExperienceIds}
        preSelected={includedExperiencesPreSelected}
    />

    <ProposalEnhancements
        enhancements={enhancements}
        selectedEnhancements={selectedEnhancements}
        setSelectedEnhancements={setSelectedEnhancements}
    />

    <CinematicGallery
        images={galleryImages}
    />


    <section className="py-20 px-6 print:hidden">
        <div className="max-w-4xl mx-auto flex justify-center">
           <ShareButton slug={slug} />
        </div>
    </section>


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

</main>

);

}
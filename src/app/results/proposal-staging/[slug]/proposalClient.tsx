"use client";

import ProposalHero from "@/components/proposal/ProposalHero";
import ProposalNarrative from "@/components/proposal/ProposalNarrative";
import FeaturedExperience from "@/components/proposal/FeaturedExperience";
import IncludedExperiences from "@/components/proposal/IncludedExperiences";
import ProposalEnhancements from "@/components/proposal/ProposalEnhancements";
import CinematicGallery from "@/components/proposal/CinematicGallery";
import ReservationSection from "@/components/proposal/ReservationSection";
import DownloadPdfButton from "@/components/DownloadPdfButton";
import { calculatePrice } from "@/lib/pricing/calculatePrice";
import { useState } from "react";

interface Props {

    heroImage:any;
    heroTitle:any;
    lead:any;
    featuredExperience:any;
    includedExperiences:any[];
    enhancements:any[];
    galleryImages:any[];
    expiresAt:any;
    whatsappUrl:string;
    dynamicIntroTitle:string;
    dynamicIntroParagraph:string;
    dynamicClosingParagraph:string;
    finalPrice:number;
    proposalSummary: string;

}

export default function ProposalClient({

    heroImage,
    heroTitle,
    lead,
    featuredExperience,
    includedExperiences,
    enhancements,
    galleryImages,
    expiresAt,
    whatsappUrl,
    dynamicIntroTitle,
    dynamicIntroParagraph,
    dynamicClosingParagraph,
    finalPrice,
    proposalSummary,

}:Props){

    const [
        selectedEnhancements,
        setSelectedEnhancements
    ] = useState<number[]>([]);

    // Di default tutte le experience incluse sono selezionate
    // (coerente con il calcolo lato server in buildRendererData)
    const [
        selectedExperienceIds,
        setSelectedExperienceIds
    ] = useState<string[]>(
        includedExperiences.map((card: any) => card.id)
    );

    // =====================================================
    // PREZZO LIVE
    // =====================================================

    const guestCount = Number(lead.guests) || 1;

    // La featured experience è sempre inclusa, non è togglabile
    const featuredPrice = calculatePrice(
        featuredExperience?.base_price ?? 0,
        featuredExperience?.pricing_type ?? "fixed",
        guestCount
    );

    // Solo le experience incluse attualmente selezionate
    const includedExperiencesPrice = includedExperiences
        .filter((card: any) => selectedExperienceIds.includes(card.id))
        .reduce((sum: number, card: any) =>
            sum + calculatePrice(
                card.experience?.base_price ?? 0,
                card.experience?.pricing_type ?? "fixed",
                guestCount
            ), 0
        );

    // Solo gli enhancement attualmente selezionati
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

    return (

<main
    id="proposal-content"
    className="
        bg-[#0C0C0C]
        text-white
        min-h-screen
    "
>

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

            <DownloadPdfButton />

        </div>

    </section>

    <ReservationSection
        expiresAt={expiresAt}
        closingParagraph={dynamicClosingParagraph}
        whatsappUrl={whatsappUrl}
    />

</main>

);

}
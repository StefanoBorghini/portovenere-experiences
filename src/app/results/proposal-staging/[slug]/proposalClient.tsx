"use client";

import ProposalHero from "@/components/proposal/ProposalHero";

import ProposalNarrative from "@/components/proposal/ProposalNarrative";

import FeaturedExperience from "@/components/proposal/FeaturedExperience";

import IncludedExperiences from "@/components/proposal/IncludedExperiences";

import ProposalEnhancements from "@/components/proposal/ProposalEnhancements";

import CinematicGallery from "@/components/proposal/CinematicGallery";

import ReservationSection from "@/components/proposal/ReservationSection";

import DownloadPdfButton from "@/components/DownloadPdfButton";

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
        totalPrice={finalPrice}
        
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

priceType={featuredExperience.price_type}
    />

    <IncludedExperiences
        experiences={includedExperiences}
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

    <footer>
        ...
    </footer>

</main>

);

}
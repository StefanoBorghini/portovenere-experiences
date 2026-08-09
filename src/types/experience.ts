import { PriceTier } from "@/lib/pricing/calculatePrice";

// ======================================================
// EXPERIENCE FACT
// ======================================================

export interface ExperienceFact {

    id?: string;

    label: string;

    value: string;

}

// ======================================================
// EXPERIENCE SECTION
// ======================================================

export interface ExperienceSection {

    id?: string;

    title: string;

    description: string;

}

// ======================================================
// EXPERIENCE
// ======================================================

export interface Experience {

    id: string;

    title: string;

    description: string;

    short_description?: string;

    category?: string;

    operator?: string;

    image?: string;

    hero_image?: string;

    detail_image?: string;

    base_price: number;

    pricing_type?: string;

    facts: ExperienceFact[];

    sections: ExperienceSection[];

    incompatible_experiences: string[];

    incompatible_enhancements: string[];

    // NUOVI — pricing a scaglioni per numero ospiti (vedi
    // calculatePrice.ts). pricing_type sopra resta invariato,
    // questi sono un flag+dati a parte che lo scavalcano quando
    // use_guest_tiers e' true.
    use_guest_tiers?: boolean;

    price_tiers?: PriceTier[];

    // Tetto massimo esatto di partecipanti, indipendente dalle
    // fasce guest_2/guest_3_4/ecc. usate per il matching generale.
    max_participants?: number | null;

}
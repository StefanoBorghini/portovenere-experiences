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

}
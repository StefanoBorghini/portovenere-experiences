export interface BrandConfig {

  name: string;

  logo: string;

  email: string;

  phone: string;

  whatsapp: string;
}

export interface HeroConfig {

  label: string;

  title: string;

  subtitle: string;

  priceLabel: string;
}

export interface ReservationConfig {

  label: string;

  title: string;

  description: string;
}

export interface ProposalConfig {

  brand: BrandConfig;

  hero: HeroConfig;

  narrative: NarrativeConfig;

  gallery: GalleryConfig;

  enhancements: EnhancementsConfig;

  cta: CTAConfig;

  reservation: ReservationConfig;

  theme: ThemeConfig;
}

export interface NarrativeConfig {

  label: string;

  title: string;

  description: string;
}

export interface EnhancementsConfig {

  label: string;

  title: string;
}

export interface GalleryConfig {

  label: string;

  title: string;
}

export interface CTAConfig {

  primaryLabel: string;

  secondaryLabel: string;
}

export interface ThemeConfig {

  primaryColor: string;

  backgroundColor: string;

  accentColor: string;
}


export interface BrandConfig {

  name: string;

  logo: string;

  email: string;

  phone: string;

  whatsapp: string;

  primaryColor: string;

  backgroundColor: string;

  accentColor: string;

  headingFont: string;

  bodyFont: string;
}


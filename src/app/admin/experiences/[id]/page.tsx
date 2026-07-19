"use client";


import Header from "./components/Header";
import GeneralCard from "./components/GeneralCard";
import FiltersCard from "./components/FiltersCard";
import MoodCard from "./components/MoodCard";
import HeroCard from "./components/HeroCard";
import HeroTitlesCard from "./components/heroTitleCard";
import GalleryCard from "./components/GalleryCard";
import SaveBar from "./components/SaveBar";
import PriceTiersCard from "./components/PriceTiersCard";
import {
  getEnhancements,
} from "@/lib/supabase/enhancementRepository";
import CompatibilityCard
from "./components/compatibilityCard";

import { useEffect, useState } from "react";
import {
  useParams,
  useRouter,
} from "next/navigation";
import { supabase }
from "@/lib/supabase";

import {
  getFullExperiences,
  updateExperience,
  updateExperienceFilters,
  updateGalleryImage,
  createGalleryImage,
  deleteGalleryImage,
  deleteExperience,
  uploadImage,
  updateExperienceScoring,
  createExperienceSection,
updateExperienceSection,
createExperienceFact,
updateExperienceFact,
createExperienceHeroTitle,
updateExperienceHeroTitle,
getExperiencePriceTiers,
createExperiencePriceTier,
updateExperiencePriceTier,
deleteExperiencePriceTier,
} from "@/lib/supabase/experienceRepository";

import IncludedCard
from "./components/includedCard";

import FactsCard
from "./components/factsCard";



export default function ExperienceEditor() {


  const params = useParams();

  const router = useRouter();

  const [experience, setExperience] =
    useState<any>(null);

  const [allExperiences, setAllExperiences] = useState<any[]>([]);
  const [allEnhancements, setAllEnhancements] = useState<any[]>([]);

  useEffect(() => {

    async function loadExperience() {
if (!supabase) return;

const {
  data: { session },
} =
  await supabase.auth.getSession();

if (!session) {

  window.location.href =
    "/admin/login";

  return;
}
     const experiences =
  await getFullExperiences();

setAllExperiences(experiences);

const enhancements =
  await getEnhancements();

setAllEnhancements(enhancements);

const found =
  experiences.find(
    (e) => e.id === params.id
  );

setExperience(found);
    }

    loadExperience();

  }, [params.id]);

  if (!experience) {

    return (
      <div style={{ padding: "30px" }}>
        Loading...
      </div>
    );
  }

  return (



    <div
      style={{
        padding: "30px",
        maxWidth: "1000px",
        margin: "0 auto",
      }}
    >
<Header

  title={experience.title}

  operator={experience.operator}

  category={experience.category}

  active={experience.active}

  onLogout={async () => {

    if (!supabase) return;

    await supabase.auth.signOut();

    window.location.href =
      "/admin/login";

  }}

/>

<GeneralCard

  experience={experience}

  setExperience={setExperience}

/>

<PriceTiersCard

  experience={experience}

  setExperience={setExperience}

/>

<HeroTitlesCard

  experience={experience}

  setExperience={setExperience}

/>


<IncludedCard

    experience={experience}

    setExperience={setExperience}

/>

<CompatibilityCard

    experience={experience}

    setExperience={setExperience}

    experiences={allExperiences}

    enhancements={allEnhancements}

/>

<FactsCard

  experience={experience}

  setExperience={setExperience}

/>

<FiltersCard

experience={experience}

setExperience={setExperience}

/>

<MoodCard

  experience={experience}

  setExperience={setExperience}

/>

<HeroCard

  experience={experience}

  setExperience={setExperience}

/>


<GalleryCard

  experience={experience}

  setExperience={setExperience}

/>



<SaveBar

  deleteLabel="Delete Experience"

  onDelete={async () => {

    if (
      !confirm(
        "Delete this experience?"
      )
    ) return;

    const result =
      await deleteExperience(
        experience.id
      );

    if (result.success) {

      alert(
        "Experience deleted!"
      );

      router.push(
        "/admin/experiences"
      );

    } else {

      alert(
        "Unable to delete experience."
      );

    }

  }}



  onSave={async () => {
for (const fact of experience.facts) {

  if (fact.isNew) {

    await createExperienceFact({

      id: fact.id,

      experience_id: experience.id,

      label: fact.label,

      value: fact.value,

      display_order: fact.display_order,

      active: fact.active,

    });

  } else {

    await updateExperienceFact(

      fact.id,

      {

        label: fact.label,

        value: fact.value,

        display_order: fact.display_order,

        active: fact.active,

      }

    );

  }

}
    for (const section of experience.sections) {

  if (section.isNew) {

    await createExperienceSection({

      id: section.id,

      experience_id: experience.id,

      title: section.title,

      description: section.description,

      display_order: section.display_order,

      active: section.active,

    });

  } else {

    await updateExperienceSection(

      section.id,

      {

        title: section.title,

        description: section.description,

        display_order: section.display_order,

        active: section.active,

      }

    );

  }

}

    // =====================================================
    // HERO TITLES — stesso pattern esatto di facts/sections:
    // create per le nuove (isNew), update per le esistenti. Le
    // rimozioni vengono gia' gestite subito da HeroTitlesCard
    // (delete immediato al click, non batched qui).
    // =====================================================

    for (const heroTitle of experience.hero_titles || []) {

      if (heroTitle.isNew) {

        await createExperienceHeroTitle({

          id: heroTitle.id,

          experience_id: experience.id,

          title: heroTitle.title,

          display_order: heroTitle.display_order,

          active: heroTitle.active,

        });

      } else {

        await updateExperienceHeroTitle(

          heroTitle.id,

          {

            title: heroTitle.title,

            display_order: heroTitle.display_order,

            active: heroTitle.active,

          }

        );

      }
    }

    // =====================================================
    // PRICE TIERS — create per le nuove (isNew), update per le
    // esistenti, delete per quelle rimosse dall'admin prima di
    // salvare (stesso principio di facts/sections, ma qui serve
    // anche gestire le rimozioni perché incidono direttamente
    // sul prezzo mostrato al cliente).
    // =====================================================

    const existingTiersInDb =
      await getExperiencePriceTiers();

    const existingTierIdsForThisExperience = existingTiersInDb
      .filter((tier: any) => tier.experience_id === experience.id)
      .map((tier: any) => tier.id);

    const currentTierIds = (experience.price_tiers || []).map(
      (tier: any) => tier.id
    );

    for (const existingId of existingTierIdsForThisExperience) {
      if (!currentTierIds.includes(existingId)) {
        await deleteExperiencePriceTier(existingId);
      }
    }

    for (const tier of experience.price_tiers || []) {

      if (tier.isNew) {

        await createExperiencePriceTier({
          id: tier.id,
          experience_id: experience.id,
          min_guests: tier.min_guests,
          max_guests: tier.max_guests,
          price: tier.price,
          display_order: tier.display_order,
        });

      } else {

        await updateExperiencePriceTier(tier.id, {
          min_guests: tier.min_guests,
          max_guests: tier.max_guests,
          price: tier.price,
          display_order: tier.display_order,
        });

      }
    }

    const result =
      await updateExperience(

  experience.id,

  {

    title: experience.title,

    operator: experience.operator,

    base_price: experience.base_price,

    pricing_type: experience.pricing_type,

    use_guest_tiers:
      experience.use_guest_tiers,

      min_participants:
      experience.min_participants,

      max_participants:
      experience.max_participants,

    description:
      experience.description,

    short_description:
      experience.short_description,

    category:
      experience.category,

    active:
      experience.active,

    featured:
      experience.featured,

    hero_image:
      experience.hero_image,

    detail_image:
      experience.detail_image,

       children_allowed:
      experience.children_allowed,

    child_discount_percentage:
      experience.child_discount_percentage,

       incompatible_experiences:
      experience.incompatible_experiences,

    incompatible_enhancements:
      experience.incompatible_enhancements,

  }

);
    for (const image of experience.gallery) {

      await updateGalleryImage(

        image.id,

        {

          image_url:
            image.image_url,

          caption:
            image.caption,

          featured:
            image.featured,

          active:
            image.active,

          display_order:
            image.display_order,

        }

      );

    }

   const filtersResult =

      await updateExperienceFilters(

        experience.id,

        {

          guest_2:
            experience.guest_2,

          guest_3_4:
            experience.guest_3_4,

          guest_5_7:
            experience.guest_5_7,

          guest_8_12:
            experience.guest_8_12,

          guest_13_20:
            experience.guest_13_20,

          guest_20_plus:
            experience.guest_20_plus,

          budget_500_1000:
            experience.budget_500_1000,

          budget_1000_3000:
            experience.budget_1000_3000,

          budget_3000_plus:
            experience.budget_3000_plus,

          // Fascia oraria preferita — mancavano qui: lo stato
          // locale veniva aggiornato correttamente dai checkbox
          // in FiltersCard, ma senza questi 4 campi nella chiamata
          // di salvataggio non venivano mai inviati a Supabase.
          available_morning:
            experience.available_morning,

          available_afternoon:
            experience.available_afternoon,

          available_sunset:
            experience.available_sunset,

          available_full_day:
            experience.available_full_day,

        }

      );
    const scoringResult =


      await updateExperienceScoring(

        experience.id,

        {

          romantic_score:
            experience.romantic_score,

          authentic_score:
            experience.authentic_score,

          adventure_score:
            experience.adventure_score,

          cinematic_score:
            experience.cinematic_score,

        }

      );



    if (result.success) {

      alert("Experience saved!");

    } else {

      alert("Error saving experience");

    }
const experiences = await getFullExperiences();
setAllExperiences(experiences);

const enhancements =
  await getEnhancements();

setAllEnhancements(enhancements);

const updated = experiences.find(
  e => e.id === experience.id
);

setExperience(updated);
  }}

/>

</div>)}
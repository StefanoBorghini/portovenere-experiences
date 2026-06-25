"use client";
import Header from "./components/Header";
import GeneralCard from "./components/GeneralCard";
import FiltersCard from "./components/FiltersCard";
import MoodCard from "./components/MoodCard";
import HeroCard from "./components/HeroCard";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase }
from "@/lib/supabase";

import {
  getFullExperiences,
  updateExperience,
  updateExperienceFilters,
  updateGalleryImage,
  createGalleryImage,
  deleteGalleryImage,
  uploadImage,
  updateExperienceScoring,
} from "@/lib/supabase/experienceRepository";



export default function ExperienceEditor() {

  const params = useParams();

  const [experience, setExperience] =
    useState<any>(null);

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

  onSave={async () => {

    // lo collegheremo dopo

  }}

/>
<GeneralCard

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


    

    








      <hr />
<button

  onClick={async () => {

    const newImage = {

      id:
        crypto.randomUUID(),

      experience_id:
        experience.id,

      image_url: "",

      display_order:
        experience.gallery.length + 1,

      active: true,

      caption: "",

      featured: false,

    };
 await createGalleryImage(
      newImage
    );

    setExperience({

      ...experience,

      gallery: [

        ...experience.gallery,

        newImage,

      ],

    });
  }}

>

Add Image

</button>
      <h2>
        Gallery
      </h2>

      {experience.gallery?.map(
        (image: any) => (

          <div
            key={image.id}
            style={{
              marginBottom: "20px",
            }}
          >

            <input
  type="text"
  value={image.image_url}
  onChange={(e) => {

    const updatedGallery =
      experience.gallery.map(
        (g: any) =>

          g.id === image.id

            ? {
                ...g,
                image_url:
                  e.target.value,
              }

            : g
      );

    setExperience({

      ...experience,

      gallery:
        updatedGallery,

    });
  }}
  style={{
    width: "100%",
    marginBottom: "10px",
  }}
/>

            <img
              src={image.image_url}
              alt=""
              style={{
                width: "250px",
                borderRadius: "8px",
              }}
            />

            <textarea
  value={image.caption || ""}
  onChange={(e) => {

    const updatedGallery =
      experience.gallery.map(
        (g:any) =>

          g.id === image.id

            ? {
                ...g,
                caption: e.target.value,
              }

            : g
      );

    setExperience({
      ...experience,
      gallery: updatedGallery,
    });

  }}
  rows={2}
  style={{
    width: "100%",
    marginTop: "10px",
  }}
/>
<input

  type="file"

  accept="image/*"

  onChange={async (e) => {

    const file =

      e.target.files?.[0];

    if (!file) return;

    const imageUrl =

      await uploadImage(
        file
      );

    if (!imageUrl) {

      alert(
        "Upload failed"
      );

      return;
    }

    const updatedGallery =

      experience.gallery.map(

        (g: any) =>

          g.id === image.id

            ? {

                ...g,

                image_url:
                  imageUrl,

              }

            : g

      );

    setExperience({

      ...experience,

      gallery:
        updatedGallery,

    });
  }}

/>
<label>

  <input
    type="checkbox"
    checked={
      image.featured || false
    }
    onChange={() => {

      const updatedGallery =

        experience.gallery.map(

          (g: any) => ({

            ...g,

            featured:
              g.id === image.id,

          })

        );

      setExperience({

        ...experience,

        gallery:
          updatedGallery,

      });
    }}
  />

  Featured

</label>
            <button

  onClick={async () => {

    await deleteGalleryImage(
      image.id
    );

    const updatedGallery =

      experience.gallery.filter(

        (g: any) =>

          g.id !== image.id

      );

    setExperience({

      ...experience,

      gallery:
        updatedGallery,

    });
  }}

>

Delete

</button>

          </div>
        )
      )}

<button

  onClick={async () => {

    const result =
      await updateExperience(

        experience.id,

        {

          title:
            experience.title,

          operator:
            experience.operator,

          base_price:
            experience.base_price,

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

        }

      );
for (
  const image
  of experience.gallery
) {

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

      guest_8_plus:
        experience.guest_8_plus,

        budget_500_1000:
    experience.budget_500_1000,

  budget_1000_3000:
    experience.budget_1000_3000,

  budget_3000_plus:
    experience.budget_3000_plus,

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

console.log(
  "SCORING RESULT",
  scoringResult
);

console.log(
  "FILTER RESULT",
  filtersResult
);

    console.log(
      "UPDATE RESULT",
      result
    );

    if (
      result.success
    ) {

      alert(
        "Experience saved!"
      );

    } else {

      alert(
        "Error saving experience"
      );
    }
  }}

>

  Save

</button>

    </div>
  );
}
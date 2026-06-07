"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import {
  getFullExperiences,
  updateExperience,
  updateExperienceFilters,
  updateGalleryImage,
} from "@/lib/supabase/experienceRepository";

export default function ExperienceEditor() {

  const params = useParams();

  const [experience, setExperience] =
    useState<any>(null);

  useEffect(() => {

    async function loadExperience() {

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

      <h1>
        Edit Experience
      </h1>

      <hr />

      <p>
        <strong>ID:</strong>
        {" "}
        {experience.id}
      </p>

      <div style={{ marginBottom: "20px" }}>
  <label>Title</label>

  <br />

  <input
    type="text"
    value={experience.title}
    onChange={(e) =>
      setExperience({
        ...experience,
        title: e.target.value,
      })
    }
    style={{
      width: "100%",
      padding: "10px",
    }}
  />
</div>
<div style={{ marginBottom: "20px" }}>
  <label>Operator</label>

  <br />

  <input
    type="text"
    value={experience.operator || ""}
    onChange={(e) =>
      setExperience({
        ...experience,
        operator: e.target.value,
      })
    }
    style={{
      width: "100%",
      padding: "10px",
    }}
  />
</div>

      <div style={{ marginBottom: "20px" }}>

  <label>Category</label>

  <br />

  <select
    value={experience.category}
    onChange={(e) =>
      setExperience({
        ...experience,
        category: e.target.value,
      })
    }
  >

    <option value="sea_escape">
      Sea Escape
    </option>

    <option value="aerial_escape">
      Aerial Escape
    </option>

    <option value="gourmet_escape">
      Gourmet Escape
    </option>

    <option value="wild_escape">
      Wild Escape
    </option>

  </select>

</div>

<div style={{ marginBottom: "20px" }}>

  <label>
    <strong>Guests</strong>
  </label>

  <br />

  <label>
    <input
      type="checkbox"
      checked={experience.guest_2 || false}
      onChange={(e) =>
        setExperience({
          ...experience,
          guest_2: e.target.checked,
        })
      }
    />
    2 Guests
  </label>

  <br />

  <label>
    <input
      type="checkbox"
      checked={experience.guest_3_4 || false}
      onChange={(e) =>
        setExperience({
          ...experience,
          guest_3_4: e.target.checked,
        })
      }
    />
    3-4 Guests
  </label>

  <br />

  <label>
    <input
      type="checkbox"
      checked={experience.guest_5_7 || false}
      onChange={(e) =>
        setExperience({
          ...experience,
          guest_5_7: e.target.checked,
        })
      }
    />
    5-7 Guests
  </label>

  <br />

  <label>
    <input
      type="checkbox"
      checked={experience.guest_8_plus || false}
      onChange={(e) =>
        setExperience({
          ...experience,
          guest_8_plus: e.target.checked,
        })
      }
    />
    8+ Guests
  </label>

</div>

    <div style={{ marginBottom: "20px" }}>
  <label>Base Price</label>

  <br />

  <input
    type="number"
    value={experience.base_price || 0}
    onChange={(e) =>
      setExperience({
        ...experience,
        base_price: Number(
          e.target.value
        ),
      })
    }
    style={{
      width: "100%",
      padding: "10px",
    }}
  />
</div>

     <div style={{ marginBottom: "20px" }}>

  <label>Description</label>

  <br />

  <textarea
    value={experience.description || ""}
    onChange={(e) =>
      setExperience({
        ...experience,
        description: e.target.value,
      })
    }
    rows={6}
    style={{
      width: "100%",
      padding: "10px",
    }}
  />

</div>
<div style={{ marginBottom: "20px" }}>

  <label>Short Description</label>

  <br />

  <textarea
    value={experience.short_description || ""}
    onChange={(e) =>
      setExperience({
        ...experience,
        short_description:
          e.target.value,
      })
    }
    rows={3}
    style={{
      width: "100%",
      padding: "10px",
    }}
  />

</div>


<div style={{ marginBottom: "20px" }}>

  <label>

    <input
      type="checkbox"
      checked={
        experience.active || false
      }
      onChange={(e) =>
        setExperience({
          ...experience,
          active:
            e.target.checked,
        })
      }
    />

    Active

  </label>

</div>

<div style={{ marginBottom: "20px" }}>

  <label>Featured</label>

  <br />

 <input
  type="checkbox"
  checked={experience.featured || false}
  onChange={(e) =>
    setExperience({
      ...experience,
      featured: e.target.checked,
    })
  }
/>

</div>

<div style={{ marginBottom: "20px" }}>

  <label>Hero Image</label>

  <br />

  <input
    type="text"
    value={
      experience.hero_image || ""
    }
    onChange={(e) =>
      setExperience({
        ...experience,
        hero_image:
          e.target.value,
      })
    }
    style={{
      width: "100%",
    }}
  />

</div>

      <hr />

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

    image.image_url

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

    }

    

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
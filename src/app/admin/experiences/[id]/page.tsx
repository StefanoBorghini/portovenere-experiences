"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import {
  getFullExperiences,
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

      <p>
        <strong>Category:</strong>
        {" "}
        {experience.category}
      </p>

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

      <p>
        <strong>Description:</strong>
        {" "}
        {experience.description}
      </p>

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

            <p>
              {image.image_url}
            </p>

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
  onClick={() => {
    console.log(
      "SAVE",
      experience
    );
  }}
>
  Save
</button>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import {
  getEnhancements,
} from "@/lib/supabase/experienceRepository";

import EnhancementCard from "./components/EnhancementCard";
import SaveBar from "@/app/admin/experiences/[id]/components/SaveBar";

import {
  updateEnhancement,
} from "@/lib/supabase/experienceRepository";

export default function EnhancementEditor() {

  const params = useParams();

  const [enhancement,setEnhancement] =
    useState<any>(null);

  useEffect(()=>{

    async function load(){

      const data =
        await getEnhancements();

      const found =
        data.find(
          e => e.id == params.id
        );

      setEnhancement(found);

    }

    load();

  },[params.id]);

  if(!enhancement){

    return (
      <div
        className="
          min-h-screen
          bg-black
          text-white
          flex
          items-center
          justify-center
        "
      >
        Loading...
      </div>
    );

  }

  return(

    <main
      className="
        min-h-screen
        bg-black
        text-white
        px-10
        py-12
      "
    >

      <div
        className="
          max-w-5xl
          mx-auto
        "
      >

        <EnhancementCard

          enhancement={enhancement}

          setEnhancement={
            setEnhancement
          }

        />

        <SaveBar

          onSave={async()=>{

            const result =
              await updateEnhancement(

                enhancement.id,

                {

                  title:
                    enhancement.title,

                  description:
                    enhancement.description,

                  image:
                    enhancement.image,

                  button_text:
                    enhancement.button_text,

                  display_order:
                    enhancement.display_order,

                  active:
                    enhancement.active,

                }

              );

            if(result.success){

              alert(
                "Enhancement saved!"
              );

            }

          }}

        />

      </div>

    </main>

  );

}
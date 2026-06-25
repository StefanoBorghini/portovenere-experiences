import { supabase } from "@/lib/supabase";

interface HeroCardProps {

  experience: any;

  setExperience: any;

}

export default function HeroCard({

  experience,

  setExperience,

}: HeroCardProps) {

  return (

<section
className="
rounded-3xl
border
border-white/10
bg-zinc-950
p-8
mt-8
"
>

<h2
className="
text-2xl
font-light
mb-8
"
>

Hero Image

</h2>

<div
  className="
    rounded-2xl
    overflow-hidden
    border
    border-white/10
    bg-black
    mb-8
  "
>

  <img
    src={experience.hero_image}
    alt={experience.title}
    className="
      w-full
      h-[380px]
      object-cover
    "
  />

</div>

<div
  className="
    flex
    justify-end
  "
>

  <label
    className="
      h-[52px]
      px-6
      rounded-xl
      bg-white
      text-black
      font-medium
      flex
      items-center
      justify-center
      cursor-pointer
      hover:opacity-90
      transition
    "
  >

    📤 Upload Hero Image

    <input
      type="file"
      accept="image/*"
      className="hidden"

      onChange={async (e) => {

        const file =
          e.target.files?.[0];

        if (!file) return;

        if (!supabase) {

          alert("Supabase not initialized");

          return;

        }

        const fileName =
          `${Date.now()}-${file.name}`;

        const { error } =
          await supabase.storage
            .from("experience-images")
            .upload(
              `hero/${fileName}`,
              file
            );

        if (error) {

          console.error(error);

          alert("Upload failed");

          return;

        }

        const {
          data,
        } =
          supabase.storage
            .from("experience-images")
            .getPublicUrl(
              `hero/${fileName}`
            );

        setExperience({

          ...experience,

          hero_image:
            data.publicUrl,

        });

      }}

    />

  </label>

</div>

</section>

  );

}
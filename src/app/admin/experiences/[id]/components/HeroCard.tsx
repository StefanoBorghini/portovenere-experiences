import {
  uploadImage,
} from "@/lib/supabase/experienceRepository";
import {
  HERO_RESIZE_OPTIONS,
} from "@/lib/upload/resizeImageBeforeUpload";

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

Images

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
    loading="lazy"
    decoding="async"
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

        const imageUrl =
          await uploadImage(
            file,
            "hero",
            HERO_RESIZE_OPTIONS
          );

        if (!imageUrl) {

          alert("Upload failed");

          return;

        }

        setExperience({

          ...experience,

          hero_image:
            imageUrl,

        });

      }}

    />

  </label>

</div>
<hr
  className="
    my-10
    border-white/10
  "
/>

<h3
  className="
    text-xl
    font-light
    mb-6
  "
>

Detail Image

</h3>

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
    src={experience.detail_image}
    alt=""
    loading="lazy"
    decoding="async"
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

    📤 Upload Detail Image

    <input
      type="file"
      accept="image/*"
      className="hidden"

      onChange={async (e) => {

        const file =
          e.target.files?.[0];

        if (!file) return;

        const imageUrl =
          await uploadImage(
            file,
            "detail",
            HERO_RESIZE_OPTIONS
          );

        if (!imageUrl) {

          alert("Upload failed");

          return;

        }

        setExperience({

          ...experience,

          detail_image:
            imageUrl,

        });

      }}

    />

  </label>

</div>
</section>

  );

}
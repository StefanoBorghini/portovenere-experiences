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

</section>

  );

}
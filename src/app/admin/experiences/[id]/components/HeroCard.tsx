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

</section>

  );

}
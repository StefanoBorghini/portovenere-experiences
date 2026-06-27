"use client";

interface Props {

  experience:any;

  setExperience:any;

}

export default function IncludedCard({

  experience,

  setExperience,

}:Props){

  return(

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
text-3xl
font-light
mb-8
"
>

Included Sections

</h2>

<p className="text-white/40 mb-8">

Manage everything included in this experience.

</p>

</section>

  );

}
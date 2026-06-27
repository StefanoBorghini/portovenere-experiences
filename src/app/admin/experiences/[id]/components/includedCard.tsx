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

{experience.sections?.map((section:any)=>(

<div
    key={section.id}
    className="
        border
        border-white/10
        rounded-2xl
        p-5
        mb-5
    "
>

<h3 className="text-lg mb-2">

    {section.title}

</h3>

<p className="text-white/50">

    {section.description}

</p>

</div>

))}

</section>

  );

}
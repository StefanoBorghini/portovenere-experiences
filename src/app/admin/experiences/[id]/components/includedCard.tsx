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

{experience.sections?.map((section:any,index:number)=>(

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

<input

    value={section.title}

    onChange={(e)=>{

        const sections=[...experience.sections];

        sections[index].title=e.target.value;

        setExperience({

            ...experience,

            sections,

        });

    }}

    className="
        w-full
        rounded-xl
        bg-white/5
        border
        border-white/10
        px-4
        py-3
        mb-3
    "

/>

<textarea

    rows={3}

    value={section.description}

    onChange={(e)=>{

        const sections=[...experience.sections];

        sections[index].description=e.target.value;

        setExperience({

            ...experience,

            sections,

        });

    }}

    className="
        w-full
        rounded-xl
        bg-white/5
        border
        border-white/10
        px-4
        py-3
    "

/>

</div>

))}

<button

  onClick={()=>

    setExperience({

      ...experience,

      sections:[

        ...experience.sections,

        {

          id:crypto.randomUUID(),

          experience_id:
            experience.id,

          title:"New Section",

          description:"",

          display_order:
            experience.sections.length+1,

          active:true,

          isNew:true,

        }

      ]

    })

  }

  className="
    mt-4
    px-6
    py-3
    rounded-xl
    bg-white
    text-black
    font-medium
  "

>

+ Add Section

</button>

</section>

  );

}
interface FiltersCardProps {

  experience:any;

  setExperience:any;

}

export default function FiltersCard({

  experience,

  setExperience,

}:FiltersCardProps){

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

Experience Filters

</h2>

</section>

)}
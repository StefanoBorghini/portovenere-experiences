interface MoodCardProps {

  experience: any;

  setExperience: any;

}

const moods = [

  {
    label: "Romantic",
    icon: "♥",
    key: "romantic_score",
  },

  {
    label: "Authentic",
    icon: "✦",
    key: "authentic_score",
  },

  {
    label: "Adventure",
    icon: "▲",
    key: "adventure_score",
  },

  {
    label: "Cinematic",
    icon: "🎬",
    key: "cinematic_score",
  },

];

export default function MoodCard({

  experience,

  setExperience,

}: MoodCardProps) {

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

<div className="mb-8">

<h2
className="
text-2xl
font-light
"
>

Mood Scoring

</h2>

<p
className="
text-sm
text-white/40
mt-2
"
>

Fine tune how the AI perceives this experience.

</p>

</div>

<div className="space-y-8">

{moods.map((mood)=>(

<div key={mood.key}>

<div
className="
flex
justify-between
items-center
mb-3
"
>

<div
className="
flex
items-center
gap-3
"
>

<span className="text-xl">

{mood.icon}

</span>

<span>

{mood.label}

</span>

</div>

<div
className="
text-white/60
text-sm
font-medium
"
>

{experience[mood.key]}/10

</div>

</div>

<input

type="range"

min="1"

max="10"

step="1"

value={
experience[mood.key] || 5
}

onChange={(e)=>

setExperience({

...experience,

[mood.key]:
Number(e.target.value),

})

}

className="
w-full
accent-white
cursor-pointer
"

/>

</div>

))}

</div>

</section>

);

}
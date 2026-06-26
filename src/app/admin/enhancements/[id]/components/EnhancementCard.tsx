"use client";

import { supabase } from "@/lib/supabase";

import {
  uploadEnhancementImage,
} from "@/lib/supabase/experienceRepository";

interface Props {

  enhancement:any;

  setEnhancement:any;

}

export default function EnhancementCard({

  enhancement,

  setEnhancement,

}:Props){

  return(

<section
className="
rounded-3xl
border
border-white/10
bg-zinc-950
p-8
"
>

<h2
className="
text-3xl
font-light
mb-8
"
>

Enhancement

</h2>

<img

src={
  enhancement.image ||
  "/images/default.webp"
}

alt=""

className="
w-full
h-[340px]
rounded-2xl
object-cover
mb-8
"

/>

<label
className="
inline-flex
px-6
py-3
rounded-xl
bg-white
text-black
cursor-pointer
mb-8
"
>

Upload Image

<input

type="file"

accept="image/*"

className="hidden"

onChange={async(e)=>{

const file=e.target.files?.[0];

if(!file)return;

const image=

await uploadEnhancementImage(file);

if(!image)return;

setEnhancement({

...enhancement,

image,

});

}}

/>

</label>

<div className="space-y-6">

<input

value={enhancement.title}

onChange={(e)=>

setEnhancement({

...enhancement,

title:e.target.value,

})

}

placeholder="Title"

className="
w-full
rounded-xl
bg-white/5
border
border-white/10
px-5
py-4
"

/>

<textarea

rows={5}

value={enhancement.description}

onChange={(e)=>

setEnhancement({

...enhancement,

description:e.target.value,

})

}

placeholder="Description"

className="
w-full
rounded-xl
bg-white/5
border
border-white/10
px-5
py-4
"

/>

<input

value={enhancement.button_text}

onChange={(e)=>

setEnhancement({

...enhancement,

button_text:e.target.value,

})

}

placeholder="Button text"

className="
w-full
rounded-xl
bg-white/5
border
border-white/10
px-5
py-4
"

/>

<div className="flex gap-6">

<div className="flex-1">

<label className="block mb-2">

Display Order

</label>

<input

type="number"

value={enhancement.display_order}

onChange={(e)=>

setEnhancement({

...enhancement,

display_order:Number(e.target.value),

})

}

className="
w-full
rounded-xl
bg-white/5
border
border-white/10
px-5
py-4
"

/>

</div>

<div
className="
flex
items-end
"
>

<label
className="
flex
items-center
gap-3
"
>

<input

type="checkbox"

checked={enhancement.active}

onChange={(e)=>

setEnhancement({

...enhancement,

active:e.target.checked,

})

}

/>

Active

</label>

<label className="block mb-2 text-white/50">
Button Text
</label>

<input
    type="text"
    value={enhancement.button_text || ""}
    onChange={(e)=>
        setEnhancement({
            ...enhancement,
            button_text:e.target.value,
        })
    }
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

</div>

</div>

</section>

  );

}
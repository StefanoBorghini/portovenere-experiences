"use client";

import { supabase } from "@/lib/supabase";

import {
  uploadEnhancementImage,
} from "@/lib/supabase/enhancementRepository";

interface Props {

  enhancement:any;

  setEnhancement:any;

}
export const enhancementCategories = [

  {
    value: "general",
    label: "General",
  },

  {
    value: "food",
    label: "Food & Drinks",
  },

  {
    value: "transport",
    label: "Transport",
  },

  {
    value: "luxury",
    label: "Luxury",
  },

  {
    value: "photography",
    label: "Photography",
  },

  {
    value: "wellness",
    label: "Wellness",
  },

  {
    value: "activities",
    label: "Activities",
  },

];


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
    className="w-full rounded-xl bg-white/5 border border-white/10 px-5 py-4"
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
    className="w-full rounded-xl bg-white/5 border border-white/10 px-5 py-4"
  />

<div className="grid md:grid-cols-3 gap-6">

  {/* Base Price */}

  <div>

    <label className="block mb-2 text-white/50">
      Base Price (€)
    </label>

    <input
      type="number"
      value={enhancement.base_price ?? 0}
      onChange={(e)=>
        setEnhancement({
          ...enhancement,
          base_price: Number(e.target.value),
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

  {/* Price Type */}

  <div>

    <label className="block mb-2 text-white/50">
      Price Type
    </label>

    <select

      value={enhancement.price_type ?? "fixed"}

      onChange={(e)=>
        setEnhancement({
          ...enhancement,
          price_type: e.target.value,
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

    >

      <option value="fixed">
        Fixed Price
      </option>

      <option value="per_person">
        Per Person
      </option>

    </select>

  </div>

  {/* Category */}

  <div>

    <label className="block mb-2 text-white/50">
      Category
    </label>

    <select

      value={enhancement.category ?? "general"}

      onChange={(e)=>
        setEnhancement({
          ...enhancement,
          category: e.target.value,
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

    >

      {enhancementCategories.map((category) => (

        <option
          key={category.value}
          value={category.value}
        >
          {category.label}
        </option>

      ))}

    </select>

  </div>

</div>
    <div>
<div className="grid md:grid-cols-3 gap-6">
      <label className="block mb-2 text-white/50">
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
        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3"
      />

    </div>

    <div>

      <label className="block mb-2 text-white/50">
        Unselected Button
      </label>

      <input
        value={enhancement.unselected_button_text || ""}
        onChange={(e)=>
          setEnhancement({
            ...enhancement,
            unselected_button_text:e.target.value,
          })
        }
        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3"
      />

    </div>

    <div>

      <label className="block mb-2 text-white/50">
        Selected Button
      </label>

      <input
        value={enhancement.selected_button_text || ""}
        onChange={(e)=>
          setEnhancement({
            ...enhancement,
            selected_button_text:e.target.value,
          })
        }
        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3"
      />

    </div>
</div>
  </div>

  <label className="flex items-center gap-3">

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




</section>

  );

}
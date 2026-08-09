import {
  createGalleryImage,
  deleteGalleryImage,
  uploadImage,
} from "@/lib/supabase/experienceRepository";

interface GalleryCardProps {

  experience:any;

  setExperience:any;

}

export default function GalleryCard({

  experience,

  setExperience,

}:GalleryCardProps){

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
text-2xl
font-light
mb-8
"
>

Gallery

</h2>

<div className="flex justify-between items-center mb-8">

  <p className="text-white/50">

    {experience.gallery?.length || 0} images

  </p>

  <button

    onClick={async()=>{

      const newImage={

        id:crypto.randomUUID(),

        experience_id:
          experience.id,

        image_url:"",

        caption:"",

        display_order:
          experience.gallery.length+1,

        active:true,

        featured:false,

      };

      await createGalleryImage(
        newImage
      );

      setExperience({

        ...experience,

        gallery:[

          ...experience.gallery,

          newImage,

        ],

      });

    }}

    className="
      px-5
      py-3
      rounded-xl
      bg-white
      text-black
      font-medium
    "

  >

    + Add Image

  </button>

</div>

<div

className="
grid
grid-cols-1
md:grid-cols-2
gap-6
"

>
{experience.gallery?.map(

(image:any)=>(

<div

key={image.id}

className="
rounded-2xl
border
border-white/10
bg-zinc-900
overflow-hidden
"

>

<img

src={image.image_url}

alt=""

className="
w-full
h-56
object-cover
bg-black
"

/>

<div className="p-5">

<p
className="
text-white/40
text-sm
mb-4
"
>

Gallery Image

</p>

<textarea

value={image.caption || ""}

onChange={(e)=>{

const updatedGallery=

experience.gallery.map(

(g:any)=>

g.id===image.id

?{

...g,

caption:e.target.value,

}

:g

);

setExperience({

...experience,

gallery:updatedGallery,

});

}}

rows={3}

placeholder="Caption..."

className="
w-full
mt-3
rounded-xl
bg-white/5
border
border-white/10
px-4
py-3
outline-none
resize-none
"
/>
<div
  className="
    flex
    justify-between
    items-center
    mt-5
    gap-3
  "
>

  <label
    className="
      flex-1
      h-12
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

    📤 Replace Image

    <input

      type="file"

      accept="image/*"

      className="hidden"

      onChange={async (e)=>{

        const file =
          e.target.files?.[0];

        if(!file) return;

        const imageUrl =
          await uploadImage(file);

        if(!imageUrl){

          alert("Upload failed");

          return;

        }

        const updatedGallery =

          experience.gallery.map(

            (g:any)=>

              g.id===image.id

              ?{

                  ...g,

                  image_url:
                    imageUrl,

                }

              :g

          );

        setExperience({

          ...experience,

          gallery:
            updatedGallery,

        });

      }}

    />

  </label>

  <button

    onClick={async()=>{

      await deleteGalleryImage(
        image.id
      );

      setExperience({

        ...experience,

        gallery:

          experience.gallery.filter(

            (g:any)=>

              g.id!==image.id

          ),

      });

    }}

    className="
      h-12
      px-5
      rounded-xl
      bg-red-600
      text-white
      hover:bg-red-500
      transition
    "

  >

    Delete

  </button>

</div>
</div>

</div>

)

)}
</div>

</section>

  );

}
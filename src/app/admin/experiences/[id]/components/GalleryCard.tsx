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
bg-black/20
overflow-hidden
"

>

</div>

)

)}
</div>

</section>

  );

}
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

</section>

  );

}
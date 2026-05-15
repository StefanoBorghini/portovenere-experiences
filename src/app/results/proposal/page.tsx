import { supabase } from "@/lib/supabase";

interface ProposalPageProps {
  searchParams: Promise<{
    id?: string;
  }>;
}

export default async function ProposalPage({
  searchParams,
}: ProposalPageProps) {

  const params = await searchParams;

  const id = params.id;

  if (!id || !supabase) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        Missing proposal ID
      </main>
    );
  }

  const { data: lead, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !lead) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        Proposal not found
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-20">
      <h1 className="text-6xl mb-10">
        Proposal for {lead.name}
      </h1>

      <div className="space-y-4 text-xl">
        <p>Experience: {lead.experience}</p>
        <p>Mood: {lead.mood}</p>
        <p>Guests: {lead.guests}</p>
        <p>Budget: {lead.budget}</p>
      </div>
    </main>
  );
}
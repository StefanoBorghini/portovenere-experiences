import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { computeLeadPricingSnapshot } from "@/lib/pricing/computeLeadPricingSnapshot";

// =========================================================
// PAGINA DI CONFERMA — dove Stripe rimanda il cliente dopo il
// pagamento riuscito della Concierge Fee (success_url in
// /api/admin/request-payment/route.ts). Sostituisce il redirect alla
// pagina proposal editabile: da qui in poi la proposal e' congelata,
// il cliente vede solo un riepilogo di sola lettura — nessuna
// checkbox, nessun bottone "Prenota ora"/"Confirm changes".
//
// Se qualcuno prova ad aprire questa pagina PRIMA che la fee sia
// stata davvero pagata (link salvato, tentativo diretto), rimanda
// alla proposal normale invece di mostrare un riepilogo vuoto/falso —
// vedi guardia sotto.
// =========================================================

export default async function ProposalConfirmedPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {

  const { slug } = await params;

  if (!slug || !supabase) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        Missing proposal ID
      </main>
    );
  }

  const { data: proposal } = await supabase
    .from("Proposal")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!proposal) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        Proposal not found
      </main>
    );
  }

  // Fee non (ancora) pagata: questa pagina non deve esistere per
  // questo cliente, torna alla proposal editabile normale.
  if (proposal.payment_status !== "deposit_paid") {
    redirect(`/results/proposal/${slug}`);
  }

  const lead = proposal.proposal_data || {};

  const experienceIds: string[] = proposal.confirmed_selection?.experienceIds || [];
  const enhancementIds: string[] = proposal.confirmed_selection?.enhancementIds || [];

  const { finalPrice, lineItems } = await computeLeadPricingSnapshot({
    experienceIds,
    enhancementIds,
    guests: lead.guests,
    children: lead.children,
    checkInDate: lead.start_date,
  });

  const feeAmount = Number(proposal.concierge_fee_amount || 0);
  const feePercentage = Number(proposal.concierge_fee_percentage || 0);

  const contactEmail = "info@portovenere.com";
  const contactWhatsapp = "+39 348 714 0722";
  const contactWhatsappUrl = "https://wa.me/393487140722";

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-24">
      <div className="text-center max-w-2xl">

        <p className="uppercase tracking-[0.4em] text-zinc-600 text-xs mb-8">
          Concierge Active
        </p>

        <h1 className="text-4xl md:text-6xl font-light leading-[0.95] tracking-[-0.04em] mb-10">
          Your concierge is now active
        </h1>

        <p className="text-zinc-400 text-lg leading-[1.9] mb-12">
          Thank you — we&apos;ve received your Concierge Fee of{" "}
          <strong className="text-white">
            €{Math.round(feeAmount).toLocaleString("en-US")}
          </strong>
          . Our team will personally contact you shortly to coordinate every
          detail with the partners below. Each experience is settled
          directly with its operator, as arranged together — Portovenere
          only handles the coordination.
        </p>

        {lineItems.length > 0 && (
          <div className="text-left mb-12 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <p className="text-white/40 text-xs uppercase tracking-wide mb-4">
              Your experiences
            </p>
            <ul className="space-y-2 mb-4">
              {lineItems.map((item, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between text-sm text-zinc-300"
                >
                  <span>{item.title}</span>
                  <span className="text-zinc-500">
                    {item.price !== null
                      ? `€${Math.round(item.price).toLocaleString("en-US")}`
                      : "On request"}
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between text-sm border-t border-white/10 pt-4">
              <span className="text-white/70">Total experience value</span>
              <span className="text-white font-medium">
                €{Math.round(finalPrice).toLocaleString("en-US")}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-white/70">
                Concierge Fee paid ({feePercentage}%)
              </span>
              <span className="text-white font-medium">
                €{Math.round(feeAmount).toLocaleString("en-US")}
              </span>
            </div>
          </div>
        )}

        <p className="text-zinc-600 text-sm">
          Questions in the meantime? Reach us directly at{" "}
          <a
            href={contactWhatsappUrl}
            className="underline hover:text-white"
          >
            WhatsApp {contactWhatsapp}
          </a>{" "}
          or{" "}
          <a
            href={`mailto:${contactEmail}`}
            className="underline hover:text-white"
          >
            {contactEmail}
          </a>
          .
        </p>

      </div>
    </main>
  );
}

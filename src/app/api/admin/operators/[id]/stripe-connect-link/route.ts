import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSupabaseAdmin } from "@/lib/supabase/adminClient";
import { getStripe } from "@/lib/stripe/stripeClient";

// =========================================================
// POST /api/admin/operators/[id]/stripe-connect-link
// Bottone "Connect Stripe" nella scheda operatore in admin — crea
// l'account Express se non esiste ancora (un operatore puo' rilanciare
// l'onboarding piu' volte, es. se il link scade prima di completarlo:
// in quel caso riusiamo lo stesso stripe_account_id, non ne creiamo
// uno nuovo), poi genera un Account Link fresco da mandare all'operatore.
//
// Lo stato passa a 'active' solo via webhook (account.updated, quando
// charges_enabled && payouts_enabled sono entrambi true) — non qui,
// perche' arrivare in fondo all'Account Link non garantisce che Stripe
// abbia gia' approvato l'account.
// =========================================================

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {

  try {

    if (!supabase) {
      return NextResponse.json({ success: false, error: "Supabase not configured" }, { status: 500 });
    }

    const authHeader = req.headers.get("authorization");
    const accessToken = authHeader?.replace("Bearer ", "");

    if (!accessToken) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { data: userData, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !userData?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const supabaseAdmin = getSupabaseAdmin();

    const { data: operator, error: fetchError } = await supabaseAdmin
      .from("operators")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !operator) {
      return NextResponse.json({ success: false, error: "Operator not found" }, { status: 404 });
    }

    const stripe = getStripe();

    let stripeAccountId = operator.stripe_account_id as string | null;

    if (!stripeAccountId) {

      const account = await stripe.accounts.create({
        type: "express",
        email: operator.email,
        business_type: "individual",
      });

      stripeAccountId = account.id;

      await supabaseAdmin
        .from("operators")
        .update({
          stripe_account_id: stripeAccountId,
          stripe_onboarding_status: "pending",
        })
        .eq("id", id);
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://experiences.portovenere.com";

    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${siteUrl}/admin/operators/${id}?stripe=refresh`,
      return_url: `${siteUrl}/admin/operators/${id}?stripe=return`,
      type: "account_onboarding",
    });

    return NextResponse.json({ success: true, url: accountLink.url });

  } catch (err) {

    console.error("admin/operators/[id]/stripe-connect-link error:", err);

    return NextResponse.json({ success: false, error: "Unexpected error" }, { status: 500 });
  }
}

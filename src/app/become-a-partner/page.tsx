import type { Metadata } from "next";
import BecomePartnerClient from "./BecomePartnerClient";

export const metadata: Metadata = {
  title: "Diventa Partner — Portovenere Experience",
  description:
    "Entra nell'ecosistema Portovenere Experience — visibilità qualificata e opportunità di acquisire clienti per hotel, ristoranti, fornitori di esperienze e travel professional.",
};

export default function BecomePartnerPage() {
  return <BecomePartnerClient />;
}

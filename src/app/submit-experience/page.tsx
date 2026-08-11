import type { Metadata } from "next";
import SubmitExperienceClient from "./SubmitExperienceClient";

export const metadata: Metadata = {
  title: "Proponi un'esperienza — Portovenere Experience",
  description:
    "Sei un operatore e vuoi proporre una tua esperienza per il configuratore di Portovenere Experience? Raccontacela in pochi passaggi.",
};

export default function SubmitExperiencePage() {
  return <SubmitExperienceClient />;
}

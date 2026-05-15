"use client";

import { supabase } from "@/lib/supabase";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CraftYourExperience() {
  const router = useRouter();

  const [formData, setFormData] = useState({
  name: "",
  email: "",
  guests: "",
  mood: "",
  experience: "",
  budget: "",
  termsAccepted: false,
});

const [errors, setErrors] = useState<string[]>([]);

 const handleSelect = (field: string, value: string) => {
  setFormData((prev) => ({
    ...prev,
    [field]: value,
  }));

  setErrors((prev) =>
    prev.filter((error) => error !== field)
  );
};

const handleSubmit = async () => {
  const isValid = validateForm();

  if (!isValid) return;

  try {
    if (!supabase) {
  console.error("Supabase not configured");
  return;
}

const { data, error } = await supabase
      .from("leads")
      .insert([
        {
          name: formData.name,
          email: formData.email,
          guests: formData.guests,
          mood: formData.mood,
          experience: formData.experience,
          budget: formData.budget,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return;
    }

    console.log("Lead salvato:", data);

    router.push(`/results/proposal?id=${data.id}`);

  } catch (err) {
    console.error("Unexpected error:", err);
  }
};

  const validateForm = () => {
  const newErrors: string[] = [];

  if (!formData.name) newErrors.push("name");
  if (
  !formData.email ||
  !/\S+@\S+\.\S+/.test(formData.email)
) {
  newErrors.push("email");
}
  if (!formData.experience) newErrors.push("experience");
  if (!formData.mood) newErrors.push("mood");
  if (!formData.guests) newErrors.push("guests");
  if (!formData.budget) newErrors.push("budget");

  if (!formData.termsAccepted)
    newErrors.push("terms");

  setErrors(newErrors);

  return newErrors.length === 0;
};

  return (
    <main className="min-h-screen bg-[#0C0C0C] text-white px-6 py-24">
      <div className="max-w-4xl mx-auto">
        {/* TOP */}
        <div className="text-center mb-20">
          <p className="uppercase tracking-[0.4em] text-zinc-500 text-sm mb-6">
            Private Experience Curation
          </p>

          <h1 className="text-5xl md:text-7xl font-light leading-[0.95] mb-8">
            Craft Your
            <br />
            Mediterranean Escape
          </h1>

          <p className="max-w-2xl mx-auto text-zinc-400 text-lg leading-relaxed">
            Answer a few questions to receive a curated proposal tailored to
            your ideal Riviera experience.
          </p>
        </div>

        {/* FORM */}
        <div className="space-y-16">
          {/* NAME */}
          <div>
            <p className="uppercase tracking-[0.3em] text-zinc-500 text-sm mb-6">
              Your Name
            </p>

           <input
  type="text"
  placeholder="Enter your full name"
  value={formData.name}
 onChange={(e) => {
  setFormData({
    ...formData,
    name: e.target.value,
  });

  setErrors((prev) =>
    prev.filter((error) => error !== "name")
  );
}}
  className={`w-full rounded-2xl px-6 py-5 text-white placeholder:text-zinc-500 outline-none transition ${
    errors.includes("name")
      ? "border border-red-500 bg-red-500/10"
      : "border border-white/10 bg-white/5 focus:border-white/40"
  }`}
/>
          </div>

          {/* EMAIL */}
<div>
  <p className="uppercase tracking-[0.3em] text-zinc-500 text-sm mb-6">
    Email Address
  </p>

  <input
    type="email"
    placeholder="Enter your email"
    value={formData.email}
    onChange={(e) => {
  setFormData({
    ...formData,
    email: e.target.value,
  });

  setErrors((prev) =>
    prev.filter((error) => error !== "email")
  );
}}
    className={`w-full rounded-2xl px-6 py-5 text-white placeholder:text-zinc-500 outline-none transition ${
      errors.includes("email")
        ? "border border-red-500 bg-red-500/10"
        : "border border-white/10 bg-white/5 hover:border-white/40 focus:border-white/40"
    }`}
  />
</div>

          {/* EXPERIENCE */}
          <div>
            <p className="uppercase tracking-[0.3em] text-zinc-500 text-sm mb-6">
              Select Your Experience
            </p>

            <div
  className={`grid md:grid-cols-2 gap-4 rounded-3xl p-2 ${
    errors.includes("experience")
      ? "border border-red-500"
      : ""
  }`}
>
              {[
                "Private Sailing",
                "Underwater Experience",
                "Sunset Dinner",
                "Luxury Escape",
              ].map((item) => (
                <button
                 type="button"
  key={item}
                  onClick={() =>
                    handleSelect("experience", item)
                  }
                  className={`border rounded-2xl px-6 py-6 text-left transition-all duration-300 cursor-pointer ${
                    formData.experience === item
                      ? "border-white bg-white text-black"
                      : "border-white/10 bg-white/5 hover:border-white/40"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* MOOD */}
          <div>
            <p className="uppercase tracking-[0.3em] text-zinc-500 text-sm mb-6">
              Desired Atmosphere
            </p>

            <div
  className={`grid md:grid-cols-2 gap-4 rounded-3xl p-2 ${
    errors.includes("mood")
      ? "border border-red-500"
      : ""
  }`}
>
              {[
                "Romantic",
                "Cinematic",
                "Relaxed",
                "Luxury",
              ].map((item) => (
                <button
                  type="button"
  key={item}
                  onClick={() => handleSelect("mood", item)}
                  className={`border rounded-2xl px-6 py-6 text-left transition-all duration-300 cursor-pointer ${
                    formData.mood === item
                      ? "border-white bg-white text-black"
                      : "border-white/10 bg-white/5 hover:border-white/40"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* GUESTS */}
          <div>
            <p className="uppercase tracking-[0.3em] text-zinc-500 text-sm mb-6">
              Number of Guests
            </p>

           <div
  className={`grid md:grid-cols-4 gap-4 rounded-3xl p-2 ${
    errors.includes("guests")
      ? "border border-red-500"
      : ""
  }`}
>
              {["2", "4", "6", "8+"].map((item) => (
                <button
                  type="button"
  key={item}
                  onClick={() =>
                    handleSelect("guests", item)
                  }
                  className={`border rounded-2xl px-6 py-6 text-center transition-all duration-300 cursor-pointer ${
                    formData.guests === item
                      ? "border-white bg-white text-black"
                      : "border-white/10 bg-white/5 hover:border-white/40"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* BUDGET */}
          <div>
            <p className="uppercase tracking-[0.3em] text-zinc-500 text-sm mb-6">
              Estimated Investment
            </p>

<div
  className={`grid md:grid-cols-3 gap-4 rounded-3xl p-2 ${
    errors.includes("budget")
      ? "border border-red-500"
      : ""
  }`}
>              {[
                "€500 - €1000",
                "€1000 - €3000",
                "€3000+",
              ].map((item) => (
                <button
                  type="button"
  key={item}
                  onClick={() =>
                    handleSelect("budget", item)
                  }
                  className={`border rounded-2xl px-6 py-6 text-left transition-all duration-300 cursor-pointer ${
                    formData.budget === item
                      ? "border-white bg-white text-black"
                      : "border-white/10 bg-white/5 hover:border-white/40"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

      
{/* TERMS */}
<div className="flex items-start gap-4">
  <input
    type="checkbox"
    checked={formData.termsAccepted}
   onChange={(e) => {
  setFormData({
    ...formData,
    termsAccepted: e.target.checked,
  });

  setErrors((prev) =>
    prev.filter((error) => error !== "terms")
  );
}}
    className="mt-1 h-5 w-5 accent-white cursor-pointer"
  />

  <p className="text-sm text-zinc-400 leading-relaxed">
    I accept the{" "}
    <a
      href="https://www.portovenere.com/terms-conditions/"
      target="_blank"
      className="underline"
    >
      Terms & Conditions
    </a>{" "}
    and understand that reservation deposits may
    be required to secure curated experiences.
  </p>
</div>

{errors.includes("terms") && (
  <p className="text-red-500 text-sm mt-2">
    Please accept the Terms & Conditions
  </p>
)}

          {/* SUBMIT */}
          <div className="pt-10 text-center">
            <button
  type="button"
  onClick={handleSubmit}
              className="bg-white text-black px-10 py-5 rounded-full uppercase tracking-[0.25em] text-xs hover:scale-105 transition-all duration-500"
            >
              Generate Private Proposal
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
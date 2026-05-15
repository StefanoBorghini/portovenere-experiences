"use client";

import { supabase } from "@/lib/supabase";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CraftYourExperience() {

  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",

    experiences: [] as string[],
    moods: [] as string[],

    guests: "",
    budget: "",

    
  startDate: "",
  endDate: "",

  travelingWithChildren: false,

    termsAccepted: false,
  });

  

  const [errors, setErrors] =
    useState<string[]>([]);

  const [selectionWarning, setSelectionWarning] =
    useState("");

  // SINGLE SELECT

  const handleSelect = (
    field: string,
    value: string
  ) => {

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) =>
      prev.filter(
        (error) => error !== field
      )
    );
  };

  // MULTI SELECT

  const handleMultiSelect = (
    field: "experiences" | "moods",
    value: string,
    max: number
  ) => {

    setSelectionWarning("");

    setFormData((prev) => {

      const currentValues = prev[field];

      const alreadySelected =
        currentValues.includes(value);

      // DESELECT

      if (alreadySelected) {

        return {
          ...prev,
          [field]: currentValues.filter(
            (item) => item !== value
          ),
        };
      }

      // LIMIT REACHED

      if (currentValues.length >= max) {

        setSelectionWarning(
          field === "experiences"
            ? "Maximum 3 experiences allowed"
            : "Maximum 2 atmosphere selections allowed"
        );

        return prev;
      }

      // SELECT

      return {
        ...prev,
        [field]: [
          ...currentValues,
          value,
        ],
      };
    });

    setErrors((prev) =>
      prev.filter(
        (error) => error !== field
      )
    );
  };

  // VALIDATION

  const scrollToError = (
  field: string
) => {

  const map: Record<string, string> = {

    name:
      "name-section",

    email:
      "email-section",

    experiences:
      "experiences-section",

    moods:
      "moods-section",

    guests:
      "guests-section",

    budget:
      "budget-section",

    startDate:
      "dates-section",

    endDate:
      "dates-section",

    terms:
      "terms-section",
  };

  const elementId =
    map[field];

  if (!elementId) return;

  const element =
    document.getElementById(
      elementId
    );

  if (element) {

    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }
};

  const validateForm = () => {

    const newErrors: string[] = [];

    if (!formData.name)
      newErrors.push("name");

    if (
      !formData.email ||
      !/\S+@\S+\.\S+/.test(
        formData.email
      )
    ) {
      newErrors.push("email");
    }

    if (
      formData.experiences.length === 0
    ) {
      newErrors.push("experiences");
    }

    if (
      formData.moods.length === 0
    ) {
      newErrors.push("moods");
    }

    if (!formData.guests)
      newErrors.push("guests");

    if (!formData.budget)
      newErrors.push("budget");

    if (!formData.startDate)
  newErrors.push("startDate");

if (!formData.endDate)
  newErrors.push("endDate");

    if (!formData.termsAccepted)
      newErrors.push("terms");

    

  setErrors(newErrors);

if (newErrors.length > 0) {

  scrollToError(
    newErrors[0]
  );

  return false;
}

return true;
  };

  // SUBMIT

  const handleSubmit = async () => {

    const isValid = validateForm();

    if (!isValid) return;

    try {

      if (!supabase) {

        console.error(
          "Supabase not configured"
        );

        return;
      }

      // SAVE LEAD

      const {
        data: leadData,
        error: leadError,
      } = await supabase
        .from("leads")
        .insert([
          {
            name: formData.name,

            email: formData.email,

            experiences:
              formData.experiences,

            moods:
              formData.moods,

            guests:
              formData.guests,

            budget:
              formData.budget,

              start_date:
  formData.startDate,

end_date:
  formData.endDate,

traveling_with_children:
  formData.travelingWithChildren,
          },
        ])
        .select()
        .single();

      if (
        leadError ||
        !leadData
      ) {

        console.error(
          "Lead error:",
          leadError
        );

        return;
      }

      // SAFE SLUG

      const primaryExperience =
        formData.experiences[0]
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(
            /[^a-z0-9-]/g,
            ""
          );

      const safeName =
        formData.name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(
            /[^a-z0-9-]/g,
            ""
          );

      const slug =
        `${safeName}-${primaryExperience}`;

      // SAVE PROPOSAL

      const {
        data: proposalData,
        error: proposalError,
      } = await supabase
        .from("Proposal")
        .insert([
          {
            lead_id: leadData.id,

            slug,

            proposal_data: {

  name:
    formData.name,

  email:
    formData.email,

  experiences:
    formData.experiences,

  moods:
    formData.moods,

  guests:
    formData.guests,

  budget:
    formData.budget,

  start_date:
    formData.startDate,

  end_date:
    formData.endDate,

  traveling_with_children:
    formData.travelingWithChildren,
},

            total_price: 0,
          },
        ])
        .select()
        .single();

      if (
        proposalError ||
        !proposalData
      ) {

        console.error(
          "Proposal error:",
          proposalError
        );

        return;
      }

      // REDIRECT

      router.push(
        `/results/proposal/${proposalData.slug}`
      );

    } catch (err) {

      console.error(
        "Unexpected error:",
        err
      );
    }
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
            Answer a few questions to receive a curated proposal tailored to your ideal Riviera experience.
          </p>

        </div>

        {/* FORM */}

        <div className="space-y-16">

          {/* NAME */}

          <div id="name-section">

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
                  prev.filter(
                    (error) =>
                      error !== "name"
                  )
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

          <div id="email-section">

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
                  prev.filter(
                    (error) =>
                      error !== "email"
                  )
                );
              }}
              className={`w-full rounded-2xl px-6 py-5 text-white placeholder:text-zinc-500 outline-none transition ${
                errors.includes("email")
                  ? "border border-red-500 bg-red-500/10"
                  : "border border-white/10 bg-white/5 hover:border-white/40 focus:border-white/40"
              }`}
            />

          </div>

          {/* EXPERIENCES */}

          <div id="experiences-section">

            <div className="flex items-center justify-between mb-6">

              <p className="uppercase tracking-[0.3em] text-zinc-500 text-sm">
                Select up to 3 experiences
              </p>

              <p className="text-zinc-500 text-sm">
                {formData.experiences.length}/3 selected
              </p>

            </div>

            <div
              className={`grid md:grid-cols-2 gap-4 rounded-3xl p-2 ${
                errors.includes(
                  "experiences"
                )
                  ? "border border-red-500"
                  : ""
              }`}
            >

              {[
                "Sea Escape",
                "Aerial Escape",
                "Gourmet Escape",
                "Wild Escape",
               
                
              ].map((item) => (

                <button
                  type="button"
                  key={item}
                  onClick={() =>
                    handleMultiSelect(
                      "experiences",
                      item,
                      3
                    )
                  }
                  className={`border rounded-2xl px-6 py-6 text-left transition-all duration-300 cursor-pointer ${
                    formData.experiences.includes(
                      item
                    )
                      ? "border-white bg-white text-black"
                      : "border-white/10 bg-white/5 hover:border-white/40"
                  }`}
                >
                  {item}
                </button>

              ))}

            </div>

          </div>

          {/* MOODS */}

          <div id="moods-section">

            <div className="flex items-center justify-between mb-6">

              <p className="uppercase tracking-[0.3em] text-zinc-500 text-sm">
                Select up to 2 atmospheres
              </p>

              <p className="text-zinc-500 text-sm">
                {formData.moods.length}/2 selected
              </p>

            </div>

            <div
              className={`grid md:grid-cols-2 gap-4 rounded-3xl p-2 ${
                errors.includes(
                  "moods"
                )
                  ? "border border-red-500"
                  : ""
              }`}
            >

              {[
                "Romantic",
                "Cinematic",
                "Authentic",
                "Adventure",
                
                
              ].map((item) => (

                <button
                  type="button"
                  key={item}
                  onClick={() =>
                    handleMultiSelect(
                      "moods",
                      item,
                      2
                    )
                  }
                  className={`border rounded-2xl px-6 py-6 text-left transition-all duration-300 cursor-pointer ${
                    formData.moods.includes(
                      item
                    )
                      ? "border-white bg-white text-black"
                      : "border-white/10 bg-white/5 hover:border-white/40"
                  }`}
                >
                  {item}
                </button>

              ))}

            </div>

          </div>

          {/* WARNING */}

          {selectionWarning && (

            <p className="text-amber-400 text-sm">
              {selectionWarning}
            </p>

          )}

          {/* GUESTS */}

          <div id="guests-section">

            <p className="uppercase tracking-[0.3em] text-zinc-500 text-sm mb-6">
              Number of Guests
            </p>

            <div
              className={`grid md:grid-cols-3 gap-4 rounded-3xl p-2 ${
                errors.includes("guests")
                  ? "border border-red-500"
                  : ""
              }`}
            >

              {[
                "2",
                "3-4",
                "5-7",
                "8+",
              ].map((item) => (

                <button
                  type="button"
                  key={item}
                  onClick={() =>
                    handleSelect(
                      "guests",
                      item
                    )
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


              {/* DATES */}

<div id="dates-section">

  <p className="uppercase tracking-[0.3em] text-zinc-500 text-sm mb-6">
    Travel Dates
  </p>

  <div className="grid md:grid-cols-2 gap-6">

    {/* START DATE */}

    <div>

      <p className="text-sm text-zinc-500 mb-3">
        Start Date
      </p>

      <input
        type="date"
        value={formData.startDate}
        onChange={(e) => {

          setFormData({
            ...formData,
            startDate: e.target.value,
          });

          setErrors((prev) =>
            prev.filter(
              (error) =>
                error !== "startDate"
            )
          );
        }}
        className={`w-full rounded-2xl px-6 py-5 bg-white/5 border text-white outline-none transition ${
          errors.includes("startDate")
            ? "border-red-500 bg-red-500/10"
            : "border-white/10 focus:border-white/40"
        }`}
      />

    </div>

    {/* END DATE */}

    <div>

      <p className="text-sm text-zinc-500 mb-3">
        End Date
      </p>

      <input
        type="date"
        value={formData.endDate}
        onChange={(e) => {

          setFormData({
            ...formData,
            endDate: e.target.value,
          });

          setErrors((prev) =>
            prev.filter(
              (error) =>
                error !== "endDate"
            )
          );
        }}
        className={`w-full rounded-2xl px-6 py-5 bg-white/5 border text-white outline-none transition ${
          errors.includes("endDate")
            ? "border-red-500 bg-red-500/10"
            : "border-white/10 focus:border-white/40"
        }`}
      />

    </div>

  </div>

</div>

{/* CHILDREN */}

<div>

  <p className="uppercase tracking-[0.3em] text-zinc-500 text-sm mb-6">
    Traveling With Children
  </p>

  <div className="grid md:grid-cols-2 gap-4">

    {[
      {
        label: "Yes",
        value: true,
      },
      {
        label: "No",
        value: false,
      },
    ].map((item) => (

      <button
        type="button"
        key={item.label}
        onClick={() => {

          setFormData({
            ...formData,
            travelingWithChildren:
              item.value,
          });
        }}
        className={`border rounded-2xl px-6 py-6 text-left transition-all duration-300 ${
          formData.travelingWithChildren === item.value
            ? "border-white bg-white text-black"
            : "border-white/10 bg-white/5 hover:border-white/40"
        }`}
      >
        {item.label}
      </button>

    ))}

  </div>

</div>





          {/* BUDGET */}

          <div id="budget-section">

            <p className="uppercase tracking-[0.3em] text-zinc-500 text-sm mb-6">
              Estimated Investment
            </p>

            <div
              className={`grid md:grid-cols-3 gap-4 rounded-3xl p-2 ${
                errors.includes("budget")
                  ? "border border-red-500"
                  : ""
              }`}
            >

              {[
                "€500 - €1000",
                "€1000 - €3000",
                "€3000+",
              ].map((item) => (

                <button
                  type="button"
                  key={item}
                  onClick={() =>
                    handleSelect(
                      "budget",
                      item
                    )
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
              checked={
                formData.termsAccepted
              }
              onChange={(e) => {

                setFormData({
                  ...formData,
                  termsAccepted:
                    e.target.checked,
                });

                setErrors((prev) =>
                  prev.filter(
                    (error) =>
                      error !== "terms"
                  )
                );
              }}
              className="mt-1 h-5 w-5 accent-white cursor-pointer shrink-0"
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
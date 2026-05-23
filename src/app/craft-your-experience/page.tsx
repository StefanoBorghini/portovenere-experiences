"use client";

import { supabase } from "@/lib/supabase";

import { useState } from "react";
import { useRouter } from "next/navigation";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function CraftYourExperience() {

  const router = useRouter();

  // MINIMUM BOOKING DATE

  const minimumBookingDate =
    new Date();

  minimumBookingDate.setDate(
    minimumBookingDate.getDate() + 14
  );

  // STATE

  const [formData, setFormData] =
    useState({

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

  const [
    selectionWarning,
    setSelectionWarning,
  ] = useState("");

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

      const currentValues =
        prev[field];

      const alreadySelected =
        currentValues.includes(value);

      // DESELECT

      if (alreadySelected) {

        return {
          ...prev,

          [field]:
            currentValues.filter(
              (item) =>
                item !== value
            ),
        };
      }

      // LIMIT REACHED

      if (
        currentValues.length >= max
      ) {

        setSelectionWarning(

          field === "experiences"
            ? "Maximum 2 experiences allowed"
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

  // SCROLL TO ERROR

  const scrollToError = (
    field: string
  ) => {

    const map: Record<
      string,
      string
    > = {

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

  // VALIDATION

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
      newErrors.push(
        "experiences"
      );
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
      newErrors.push(
        "startDate"
      );

    if (!formData.endDate)
      newErrors.push(
        "endDate"
      );

    if (
      !formData.termsAccepted
    )
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

  const handleSubmit =
    async () => {

      const isValid =
        validateForm();

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
          ])

          .select()

          .single();

        if (
          leadError ||
          !leadData
        ) {

          console.error(
            "Lead error full:",
            JSON.stringify(
              leadError,
              null,
              2
            )
          );

          return;
        }

        // SAFE SLUG

        const primaryExperience =
          formData.experiences[0]

            .toLowerCase()

            .replace(
              /\s+/g,
              "-"
            )

            .replace(
              /[^a-z0-9-]/g,
              ""
            );

        const safeName =
          formData.name

            .toLowerCase()

            .replace(
              /\s+/g,
              "-"
            )

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

              lead_id:
                leadData.id,

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

        {/* HERO */}

        <div className="text-center pt-0 pb-16 md:pt-20 md:pb-28">

          <div className="flex justify-center -mt-15 mb-5 md:mb-8">

            <img
              src="/logo-white.png"
              alt="Portovenere Experiences"
              className="w-24 md:w-32 opacity-80"
            />

          </div>

          <p className="uppercase tracking-[0.4em] text-zinc-500 text-sm mb-6 md:mb-8">

            Private Experience Curation

          </p>

          <h1 className="text-5xl md:text-7xl font-light leading-[0.95] mb-8 md:mb-10">

            Craft Your
            <br />
            Mediterranean Escape

          </h1>

          <p className="max-w-2xl mx-auto text-zinc-400 text-lg leading-relaxed">

            Answer a few questions to receive a curated proposal tailored to your ideal Riviera experience.

          </p>

        </div>

        {/* DATES */}

        <div
          id="dates-section"
          className="space-y-6"
        >

          <p className="uppercase tracking-[0.3em] text-zinc-500 text-sm">

            Travel Dates

          </p>

          <div className="grid md:grid-cols-2 gap-6">

            {/* START DATE */}

            <div>

              <p className="text-sm text-zinc-500 mb-3">

                Start Date

              </p>

              <DatePicker

                selected={
                  formData.startDate
                    ? new Date(
                        formData.startDate
                      )
                    : null
                }

          onChange={(date: Date | null) => {

                  setFormData({
                    ...formData,

                    startDate:
                      date
                        ? date
                            .toISOString()
                            .split(
                              "T"
                            )[0]
                        : "",
                  });

                  setErrors(
                    (prev) =>
                      prev.filter(
                        (error) =>
                          error !==
                          "startDate"
                      )
                  );
                }}

                minDate={
                  minimumBookingDate
                }

                placeholderText="Select start date"

                dateFormat="MMMM d, yyyy"

                calendarClassName="custom-calendar"

                className={`w-full rounded-2xl px-6 py-6 text-lg bg-white/5 border text-white outline-none transition backdrop-blur-md ${
                  errors.includes(
                    "startDate"
                  )
                    ? "border-red-500 bg-red-500/10"
                    : "border-white/10 hover:border-white/30 focus:border-white/50"
                }`}
              />

            </div>

            {/* END DATE */}

            <div>

              <p className="text-sm text-zinc-500 mb-3">

                End Date

              </p>

              <DatePicker

                selected={
                  formData.endDate
                    ? new Date(
                        formData.endDate
                      )
                    : null
                }

           onChange={(date: Date | null) => {

                  setFormData({
                    ...formData,

                    endDate:
                      date
                        ? date
                            .toISOString()
                            .split(
                              "T"
                            )[0]
                        : "",
                  });

                  setErrors(
                    (prev) =>
                      prev.filter(
                        (error) =>
                          error !==
                          "endDate"
                      )
                  );
                }}

                minDate={
                  formData.startDate
                    ? new Date(
                        formData.startDate
                      )
                    : minimumBookingDate
                }

                placeholderText="Select end date"

                dateFormat="MMMM d, yyyy"

                calendarClassName="custom-calendar"

                className={`w-full rounded-2xl px-6 py-6 text-lg bg-white/5 border text-white outline-none transition backdrop-blur-md ${
                  errors.includes(
                    "endDate"
                  )
                    ? "border-red-500 bg-red-500/10"
                    : "border-white/10 hover:border-white/30 focus:border-white/50"
                }`}
              />

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}
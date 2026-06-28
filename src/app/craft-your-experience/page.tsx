"use client";

import Turnstile
from "react-turnstile";

import { useEffect } from "react";
import {
  getExperiences,
  getExperienceScoring,
  getExperienceFilters,
  getFullExperiences
} from "@/lib/supabase/experienceRepository";

import { supabase } from "@/lib/supabase";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { experiences } from "@/lib/experiences";
import DatePicker from "react-datepicker";
import { forwardRef } from "react";
import "react-datepicker/dist/react-datepicker.css";



export default function CraftYourExperience() {

  const [
  captchaToken,
  setCaptchaToken,
] = useState("");

  const router = useRouter();

  const CustomDateInput =
  forwardRef<
    HTMLButtonElement,
    any
  >(
    (
      {
        value,
        onClick,
        placeholder,
        className,
      },
      ref
    ) => (

      <button
        type="button"
        onClick={onClick}
        ref={ref}
        className={className}
      >

        {value || placeholder}

      </button>
    )
  );

CustomDateInput.displayName =
  "CustomDateInput";

  const minimumBookingDate =
    new Date();

  minimumBookingDate.setDate(
    minimumBookingDate.getDate() + 14
  );

  const minDate =
    minimumBookingDate
      .toLocaleDateString(
        "en-CA",
        {
          timeZone:
            "Europe/Rome",
        }
      );

  
      
      useEffect(() => {
  async function test() {
    const data = await getExperiences();

    console.log(
      "SUPABASE EXPERIENCES",
      data
    );
const fullExperiences =
  await getFullExperiences();

console.log(
  "FULL EXPERIENCES",
  fullExperiences
);
  }

  test();

  
}, []);

const [guestCount, setGuestCount] =
  useState<number | null>(null);

const [showMoreGuests, setShowMoreGuests] =
  useState(false);

const [childrenCount, setChildrenCount] =
  useState<number | null>(0);

const [showMoreChildren, setShowMoreChildren] =
  useState(false);  

  const [formData, setFormData] = useState({
    name: "",
    email: "",

    experiences: [] as string[],
    moods: [] as string[],

    guests: "",
    budget: "",
    children: 0,

    startDate: "",
    endDate: "",

    travelingWithChildren: false,

    termsAccepted: false,
  });





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
  const [errors, setErrors] =
    useState<string[]>([]);

  const [selectionWarning, setSelectionWarning] =
    useState("");

  const incompatibleExperiences:
    Record<string, string[]> = {

    "Sea Escape": [
      "Aerial Escape",
    ],

    "Aerial Escape": [
      "Sea Escape",
    ],
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

      // =====================================================
      // EXPERIENCE CONFLICTS
      // =====================================================

      if (
        field === "experiences" &&
        !alreadySelected
      ) {

        const hasConflict =

          currentValues.some(
            (selected) =>

              incompatibleExperiences[
                selected
              ]?.includes(value)
          );

        if (hasConflict) {

          setSelectionWarning(
            "These experiences cannot be combined"
          );

          return prev;
        }
      }

      // DESELECT

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

      if (currentValues.length >= max) {

        setSelectionWarning(

          field === "experiences"
            ? "Maximum 3 experiences allowed"
            : "Maximum 3 atmospheres selections allowed"

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

  

  if (!captchaToken) {

    alert(
      "Please verify you are human"
    );

    return;
  }

  const verifyResponse =
    await fetch(
      "/api/verify-turnstile",
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        token:
          captchaToken,
      }),
    }
  );

const verifyData =
  await verifyResponse.json();

if (
  !verifyData.success
) {

  setCaptchaToken("");

  alert(
    "Captcha verification failed"
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

              children:
  formData.children,
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

            lead_id:
              leadData.id,

            slug,

            expires_at:
              new Date(
                Date.now() +
                48 * 60 * 60 * 1000
              ).toISOString(),

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

                children:
  formData.children,

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

      console.log(
  "Proposal error:",
  JSON.stringify(
    proposalError,
    null,
    2
  )
);


        return;
      }

      // REDIRECT

      /*  router.push(
          `/results/proposal/${proposalData.slug}`
        );
  */
      {
        router.push(
          `/results/proposal-staging/${proposalData.slug}`
        )
      }
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

        {/* FORM */}

        <div className="space-y-16">


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
              className={`grid md:grid-cols-2 gap-4 rounded-3xl p-2 ${errors.includes(
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
                  className={`border rounded-2xl px-6 py-6 text-center transition-all duration-500
ease-out cursor-pointer ${formData.experiences.includes(
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

          )}{/* WARNING */}

          {/* MOODS */}

          <div id="moods-section">

            <div className="flex items-center justify-between mb-6">

              <p className="uppercase tracking-[0.3em] text-zinc-500 text-sm">
                Select up to 3 atmospheres
              </p>

              <p className="text-zinc-500 text-sm">
                {formData.moods.length}/3 selected
              </p>

            </div>

            <div
              className={`grid grid-cols-2 md:grid-cols-2 gap-4 rounded-3xl p-2 ${errors.includes(
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
                      3
                    )
                  }
                  className={`border rounded-2xl px-6 py-6 text-center transition-all duration-500
ease-out cursor-pointer ${formData.moods.includes(
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




          {/* GUESTS */}

          <div id="guests-section"  >

            <p className="uppercase tracking-[0.3em] text-zinc-500 text-sm mb-6">
              Number of Guests
            </p>
<div
  className={`
    grid
    grid-cols-2
    lg:grid-cols-4
    gap-4
    rounded-3xl
    p-2

    ${
      errors.includes("guests")
        ? "border border-red-500"
        : ""
    }
  `}
>

             {[
 2,
  3,
  4,
  5,
  6,
  7,
  8,
].map((item) => (

                <button
                  type="button"
                  key={item}
                 onClick={() => {

  setGuestCount(item);

  setShowMoreGuests(false);

  setFormData({
    ...formData,
guests: String(item),  });

}}
                  className={`border rounded-2xl px-6 py-6 text-center transition-all duration-500
ease-out cursor-pointer ${guestCount === item
                      ? "border-white bg-white text-black"
                      : "border-white/10 bg-white/5 hover:border-white/40"
                    }`}
                >
                  {item}
                </button>

              ))}
<button
  type="button"
  onClick={() => {

    setGuestCount(null);

    setShowMoreGuests(true);

    setFormData({
      ...formData,
      guests: "",
    });

  }}

  className={`
    h-20
rounded-2xl
border
border-white/10
bg-white/5
transition-all
duration-500
ease-out
hover:border-white/40
    cursor-pointer

    ${
      showMoreGuests
        ? "border-white bg-white text-black"
        : "border-white/10 bg-white/5 hover:border-white/40"
    }
  `}
>

  <span className="text font-light">

    9+

  </span>

</button>
            </div>

          </div>

 <div
  className={`
    overflow-hidden
    transition-all
    duration-500
ease-out
    ease-in-out

    ${
      showMoreGuests
        ? "max-h-48 opacity-100 mt-6"
        : "max-h-0 opacity-0"
    }
  `}
>

  <div>

    <p className="text-zinc-500 mb-3">

      Exact number of guests

    </p>

    <input
  type="number"
  min={9}
  max={40}
  inputMode="numeric"
  pattern="[0-9]*"
  placeholder="Enter exact number"

  value={guestCount || ""}

  onChange={(e)=>{

        setGuestCount(
          Number(e.target.value)
        );

        setFormData({

          ...formData,

          guests:e.target.value,

        });

      }}

      className="
        w-full
        rounded-2xl
        border
        border-white/10
        bg-white/5
        px-6
        py-5
        outline-none
        transition-all
        duration-500
ease-out
        focus:border-white/40
      "
    />

  </div>

</div>

          {/* CHILDREN */}

        

<div>

  <p className="uppercase tracking-[0.3em] text-zinc-500 text-sm mb-6">
    Number of Children
  </p>

  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

    {[0,1,2,3].map((item)=>(

      <button
        key={item}
        type="button"

        onClick={() => {

          setChildrenCount(item);

          setShowMoreChildren(false);

          setFormData({

            ...formData,

            children:item,

            travelingWithChildren:item > 0,

          });

        }}

        className={`

          border
          rounded-2xl
          px-6
          py-6
          transition-all
          duration-500
          ease-out

          ${
            childrenCount === item
              ? "bg-white text-black border-white"
              : "bg-white/5 border-white/10 hover:border-white/40"
          }

        `}
      >

        {item}

      </button>

    ))}

    <button

      type="button"

      onClick={() => {

        setChildrenCount(4);

setShowMoreChildren(true);

setFormData({
  ...formData,
  children:4,
  travelingWithChildren:true,
});

      }}

      className={`

        border
        rounded-2xl
        px-6
        py-6
        transition-all
        duration-500
        ease-out

        ${
          showMoreChildren
            ? "bg-white text-black border-white"
            : "bg-white/5 border-white/10 hover:border-white/40"
        }

      `}
    >

      3+

    </button>

  </div>

  <div

    className={`

      overflow-hidden
      transition-all
      duration-500
      ease-out

      ${
        showMoreChildren
          ? "max-h-48 opacity-100 mt-6"
          : "max-h-0 opacity-0"
      }

    `}

  >

    <p className="text-zinc-500 mb-3">

      How many children?

    </p>

    <input

      type="number"

      min={4}

      max={20}

      inputMode="numeric"

      pattern="[0-9]*"

      placeholder="Enter exact number"

      value={childrenCount || ""}

      onChange={(e)=>{

        const value = Number(e.target.value);

        setChildrenCount(value);

        setFormData({

          ...formData,

          children:value,

          travelingWithChildren:value > 0,

        });

      }}

      className="

        w-full
        rounded-2xl
        border
        border-white/10
        bg-white/5
        px-6
        py-5
        outline-none
        transition-all
        duration-500
        focus:border-white/40

      "

    />

  </div>

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

              <div className="flex flex-col gap-3">

                <p className="text-sm text-zinc-500">

                  Start Date

                </p>

                <DatePicker
                  customInput={

  <CustomDateInput

    className={`
      w-full
      rounded-2xl
      px-6
      py-6
      text-left
      text-lg
      bg-white/5
      border
      text-white
      outline-none
      transition
      backdrop-blur-md

      ${
        errors.includes(
          "startDate"
        )

          ? "border-red-500 bg-red-500/10"

          : "border-white/10 hover:border-white/30"
      }
    `}
  />
}

                  shouldCloseOnSelect={true}
                  selected={
                    formData.startDate
                      ? new Date(
                        formData.startDate
                      )
                      : null
                  }

                  onChange={(
                    date: Date | null
                  ) => {

                    setFormData({
                      ...formData,

                      startDate:
                        date
                          ? date
                            .toISOString()
                            .split("T")[0]
                          : "",
                    });

                    setErrors((prev) =>
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

                  wrapperClassName="w-full"

                  
                />

              </div>

              {/* END DATE */}

              <div className="flex flex-col gap-3">

                <p className="text-sm text-zinc-500">

                  End Date

                </p>

                <DatePicker

                 customInput={

  <CustomDateInput

    className={`
      w-full
      rounded-2xl
      px-6
      py-6
      text-left
      text-lg
      bg-white/5
      border
      text-white
      outline-none
      transition
      backdrop-blur-md

      ${
        errors.includes(
          "startDate"
        )

          ? "border-red-500 bg-red-500/10"

          : "border-white/10 hover:border-white/30"
      }
    `}
  />
}

                  shouldCloseOnSelect={true}

                  selected={
                    formData.endDate
                      ? new Date(
                        formData.endDate
                      )
                      : null
                  }

                  onChange={(
                    date: Date | null
                  ) => {

                    setFormData({
                      ...formData,

                      endDate:
                        date
                          ? date
                            .toISOString()
                            .split("T")[0]
                          : "",
                    });

                    setErrors((prev) =>
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

                  wrapperClassName="w-full"

                  
                />

              </div>

            </div>

          </div>


          


          




          {/* BUDGET */}

          <div id="budget-section">

            <p className="uppercase tracking-[0.3em] text-zinc-500 text-sm mb-6">
              Estimated Investment
            </p>

            <div
              className={`grid md:grid-cols-3 gap-4 rounded-3xl p-2 ${errors.includes("budget")
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
                  className={`border rounded-2xl px-6 py-6 text-center transition-all duration-500
ease-out cursor-pointer ${formData.budget === item
                      ? "border-white bg-white text-black"
                      : "border-white/10 bg-white/5 hover:border-white/40"
                    }`}
                >
                  {item}
                </button>

              ))}

            </div>

          </div>



          {/* NAME */}

          <div id="name-section">

            <p className="uppercase tracking-[0.3em] text-zinc-500 text-sm mb-6">
              Your Name
            </p>

            <input
              type="text"
              min={new Date().toISOString().split("T")[0]}
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
              className={`w-full rounded-2xl px-6 py-5 text-white placeholder:text-zinc-500 outline-none transition ${errors.includes("name")
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
              className={`w-full rounded-2xl px-6 py-5 text-white placeholder:text-zinc-500 outline-none transition ${errors.includes("email")
                  ? "border border-red-500 bg-red-500/10"
                  : "border border-white/10 bg-white/5 hover:border-white/40 focus:border-white/40"
                }`}
            />

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
              className="mt-1 h-5 w-5 accent-black cursor-pointer shrink-0"
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

          <div
  style={{
    marginTop: "10px",
    marginBottom: "30px",
  }}
>

  <Turnstile
    sitekey={
      process.env
        .NEXT_PUBLIC_TURNSTILE_SITE_KEY!
    }
    onVerify={(token) =>
      setCaptchaToken(token)
    }
  />

</div>

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
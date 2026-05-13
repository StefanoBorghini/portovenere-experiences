"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CraftYourExperience() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    guests: "",
    mood: "",
    experience: "",
    budget: "",
  });

  const handleSelect = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    localStorage.setItem(
      "experienceData",
      JSON.stringify(formData)
    );

    router.push("/results/proposal");
  };

  return (
    <main className="min-h-screen bg-black text-white px-6 py-24">
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
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                })
              }
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white placeholder:text-zinc-500 outline-none focus:border-white/40 transition"
            />
          </div>

          {/* EXPERIENCE */}
          <div>
            <p className="uppercase tracking-[0.3em] text-zinc-500 text-sm mb-6">
              Select Your Experience
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Private Sailing",
                "Underwater Experience",
                "Sunset Dinner",
                "Luxury Escape",
              ].map((item) => (
                <button
                  key={item}
                  onClick={() =>
                    handleSelect("experience", item)
                  }
                  className={`border rounded-2xl px-6 py-6 text-left transition-all duration-300 ${
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

            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Romantic",
                "Cinematic",
                "Relaxed",
                "Luxury",
              ].map((item) => (
                <button
                  key={item}
                  onClick={() => handleSelect("mood", item)}
                  className={`border rounded-2xl px-6 py-6 text-left transition-all duration-300 ${
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

            <div className="grid md:grid-cols-4 gap-4">
              {["2", "4", "6", "8+"].map((item) => (
                <button
                  key={item}
                  onClick={() =>
                    handleSelect("guests", item)
                  }
                  className={`border rounded-2xl px-6 py-6 text-center transition-all duration-300 ${
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

            <div className="grid md:grid-cols-3 gap-4">
              {[
                "€500 - €1000",
                "€1000 - €3000",
                "€3000+",
              ].map((item) => (
                <button
                  key={item}
                  onClick={() =>
                    handleSelect("budget", item)
                  }
                  className={`border rounded-2xl px-6 py-6 text-left transition-all duration-300 ${
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

          {/* SUBMIT */}
          <div className="pt-10 text-center">
            <button
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
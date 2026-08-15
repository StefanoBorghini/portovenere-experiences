"use client";

import { useOperatorsList } from "@/app/admin/components/useOperatorsList";
import RichTextEditor from "./admin/richTextEditor";

interface GeneralCardProps {

  experience: any;

  setExperience: any;

}

export default function GeneralCard({

  experience,

  setExperience,

}: GeneralCardProps) {

  const operators = useOperatorsList();

  return (

   <section
  className="
    rounded-3xl
    border
    border-white/10
    bg-zinc-950
    p-8
  "
>

  <h2
    className="
      text-2xl
      font-light
      mb-8
    "
  >
    General Information
  </h2>

  <div className="space-y-8">

    <div>

      <label className="block text-sm text-white/50 mb-2">
        Title
      </label>

      <input
        type="text"
        value={experience.title}
        onChange={(e)=>
          setExperience({
            ...experience,
            title:e.target.value,
          })
        }
        className="
          w-full
          rounded-xl
          bg-white/5
          border
          border-white/10
          px-4
          py-3
        "
      />

    </div>

    <div className="grid md:grid-cols-2 gap-6">

      <div>

        <label className="block text-sm text-white/50 mb-2">
          Operator
        </label>

        <input
          type="text"
          value={experience.operator || ""}
          onChange={(e)=>
            setExperience({
              ...experience,
              operator:e.target.value,
            })
          }
          className="
            w-full
            rounded-xl
            bg-white/5
            border
            border-white/10
            px-4
            py-3
          "
        />

      </div>

      <div>

        <label className="block text-sm text-white/50 mb-2">
          Payout Operator (Stripe)
        </label>

        <select
          value={experience.operator_id || ""}
          onChange={(e) =>
            setExperience({
              ...experience,
              operator_id: e.target.value || null,
            })
          }
          className="
            w-full
            rounded-xl
            bg-white/5
            border
            border-white/10
            px-4
            py-3
          "
        >

          <option value="">Not assigned</option>

          {operators.map((operator) => (
            <option key={operator.id} value={operator.id}>
              {operator.name}
              {operator.stripe_onboarding_status !== "active" ? " (not connected)" : ""}
            </option>
          ))}

        </select>

        <p className="text-xs text-white/30 mt-2">
          Solo con un operator &quot;active&quot; questa esperienza puo&apos; essere
          prenotata e pagata online via configuratore.
        </p>

      </div>

      <div>

        <label className="block text-sm text-white/50 mb-2">
          Base Price (€)
        </label>

        <input
          type="number"
          value={experience.base_price || 0}
          onChange={(e)=>
            setExperience({
              ...experience,
              base_price:Number(e.target.value),
            })
          }
          className="
            w-full
            rounded-xl
            bg-white/5
            border
            border-white/10
            px-4
            py-3
          "
        />

      </div>
<div>

  <label className="block text-sm text-white/50 mb-2">
    Price Type
  </label>

  <select
    value={experience.pricing_type}
    onChange={(e)=>
      setExperience({
        ...experience,
        pricing_type: e.target.value,
      })
    }
    className="
      w-full
      rounded-xl
      bg-white/5
      border
      border-white/10
      px-4
      py-3
    "
  >

    <option value="fixed">
      Fixed Price
    </option>

    <option value="per_person">
      Per Person
    </option>

    <option value="included">
      Included
    </option>

    <option value="on_request">
      On Request
    </option>

  </select>

</div>
    </div>

    <div>

      <label className="block text-sm text-white/50 mb-2">
        Description
      </label>

      <RichTextEditor
        value={experience.description || ""}
        onChange={(value) =>
          setExperience({
            ...experience,
            description: value,
          })
        }
      />

    </div>

    <div>

      <label className="block text-sm text-white/50 mb-2">
        Short Description
      </label>

      <textarea
        rows={3}
        value={experience.short_description || ""}
        onChange={(e)=>
          setExperience({
            ...experience,
            short_description:e.target.value,
          })
        }
        className="
          w-full
          rounded-xl
          bg-white/5
          border
          border-white/10
          px-4
          py-3
        "
      />

    </div>

  </div>

</section>

  );

}
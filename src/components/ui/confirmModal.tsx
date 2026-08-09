"use client";

interface ConfirmModalProps {

  open: boolean;

  title: string;

  description: string;

  confirmText?: string;

  cancelText?: string;

  onConfirm: () => void;

  onCancel: () => void;

}

export default function ConfirmModal({

  open,

  title,

  description,

  confirmText = "Delete",

  cancelText = "Cancel",

  onConfirm,

  onCancel,

}: ConfirmModalProps) {

  if (!open) return null;

  return (

    <div
      className="
        fixed
        inset-0
        z-[999]
        bg-black/70
        backdrop-blur-sm
        flex
        items-center
        justify-center
        p-6
      "
    >

      <div
        className="
          w-full
          max-w-md
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
            mb-3
          "
        >
          {title}
        </h2>

        <p
          className="
            text-white/60
            leading-relaxed
            mb-8
          "
        >
          {description}
        </p>

        <div
          className="
            flex
            justify-end
            gap-3
          "
        >

          <button

            onClick={onCancel}

            className="
              px-5
              py-3
              rounded-xl
              border
              border-white/10
              hover:bg-white/5
              transition
            "

          >
            {cancelText}
          </button>

          <button

            onClick={onConfirm}

            className="
              px-5
              py-3
              rounded-xl
              bg-red-600
              hover:bg-red-500
              transition
            "

          >
            {confirmText}
          </button>

        </div>

      </div>

    </div>

  );

}
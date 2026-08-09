interface SaveBarProps {

  onSave: () => void;

  onDelete?: () => void;

  deleteLabel?: string;

}

export default function SaveBar({

  onSave,

  onDelete,

  deleteLabel = "Delete",

}: SaveBarProps) {

  return (

    <div
      className="
      sticky
      bottom-6
      mt-10
      flex
      justify-between
      items-center
      z-50
      "
    >

      <div>

        {onDelete && (

          <button

            onClick={onDelete}

            className="
            px-8
            py-4
            rounded-2xl
            bg-red-600
            text-white
            font-medium
            hover:bg-red-500
            transition
            "

          >

            🗑 {deleteLabel}

          </button>

        )}

      </div>

      <button

        onClick={onSave}

        className="
        px-8
        py-4
        rounded-2xl
        bg-white
        text-black
        font-medium
        shadow-2xl
        hover:scale-[1.02]
        transition
        "

      >

        Save Changes

      </button>

    </div>

  );

}
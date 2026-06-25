interface SaveBarProps {

  onSave: () => void;

}

export default function SaveBar({

  onSave,

}: SaveBarProps) {

  return (

    <div
      className="
      sticky
      bottom-6
      mt-10
      flex
      justify-end
      z-50
      "
    >

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
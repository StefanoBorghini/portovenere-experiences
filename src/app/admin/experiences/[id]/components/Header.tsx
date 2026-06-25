interface HeaderProps {

  title: string;

  operator: string;

  category: string;

  active: boolean;

  onLogout: () => void;

  onSave: () => void;

}

export default function Header({

  title,

  operator,

  category,

  active,

  onLogout,

  onSave,

}: HeaderProps) {

  return (

    <header
      className="
        mb-12
      "
    >

      <button

        onClick={() =>

          window.location.href =
            "/admin/experiences"

        }

        className="
          text-sm
          text-white/40
          hover:text-white
          transition-colors
          mb-8
        "
      >

        ← Back to Dashboard

      </button>

      <div
        className="
          flex
          flex-col
          lg:flex-row
          lg:items-center
          lg:justify-between
          gap-8
        "
      >

        <div
          className="
            flex
            items-center
            gap-5
          "
        >

          <img
            src="/logo-white.png"
            alt="PV"
            className="
              h-14
              w-auto
            "
          />

          <div>

            <h1
              className="
                text-4xl
                md:text-5xl
                font-light
                tracking-tight
              "
            >

              {title}

            </h1>

            <div
              className="
                flex
                flex-wrap
                items-center
                gap-3
                mt-2
                text-white/50
              "
            >

              <span>

                {operator}

              </span>

              <span>•</span>

              <span>

                {category}

              </span>

              <span>•</span>

              <span
                className={`
                  ${
                    active

                      ? "text-emerald-400"

                      : "text-red-400"

                  }
                `}
              >

                {

                  active

                    ? "Active"

                    : "Inactive"

                }

              </span>

            </div>

          </div>

        </div>

        <div
          className="
            flex
            gap-3
          "
        >

          <button

            onClick={onLogout}

            className="
              px-5
              py-3
              rounded-xl
              border
              border-white/10
              hover:bg-white/5
              transition-all
            "
          >

            Logout

          </button>

          <button

            onClick={onSave}

            className="
              px-6
              py-3
              rounded-xl
              bg-white
              text-black
              font-medium
              hover:opacity-90
              transition-all
            "
          >

            Save Changes

          </button>

        </div>

      </div>

    </header>

  );

}
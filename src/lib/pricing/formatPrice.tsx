export function formatPrice(

  amount?: number,

  type?: string

): {

  label: string;

  value: string;

} {

  if (!amount && type !== "included") {

    return {

      label: "",

      value: "",

    };

  }

  switch (type) {

    case "fixed":

      return {

        label: "Price",

        value: `€${amount}`,

      };

    case "per_person":

      return {

        label: "Starting from",

        value: `€${amount} / person`,

      };

    case "included":

      return {

        label: "",

        value: "Included",

      };

    case "on_request":

      return {

        label: "",

        value: "On Request",

      };

    default:

      return {

        label: "Price",

        value: `€${amount}`,

      };

  }

}
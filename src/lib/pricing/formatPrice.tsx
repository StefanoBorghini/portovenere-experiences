export function formatPrice(
  amount?: number | null,
  type?: string
): {
  label: string;
  value: string;
} {

  switch (type) {

    case "fixed":

      return {
        label: amount != null ? "Price" : "",
        value: amount != null ? `€${amount}` : "",
      };

    case "per_person":

      return {
        label: "Per Person",
        value: amount != null ? `€${amount}` : "",
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
        label: "",
        value: "",
      };

  }

}
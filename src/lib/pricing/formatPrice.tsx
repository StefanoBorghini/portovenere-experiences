export function formatPrice(

  amount: number,

  type: string

) {

  if (!amount) return "";

  switch (type) {

    case "per_person":
      return `From €${amount} / person`;

    case "fixed":
      return `€${amount}`;

    case "included":
      return "Included";

    case "on_request":
      return "On Request";

    default:
      return `€${amount}`;

  }

}
// labelKey/valueKey puntano a chiavi sotto il namespace next-intl
// "proposal.featured" (perPerson/included/onRequest/priceLabel) — i
// chiamanti (componenti, con accesso a useTranslations) risolvono il
// testo effettivo, dato che questa funzione pura non puo' usare hook.
export function formatPrice(
  amount?: number | null,
  type?: string
): {
  labelKey: "perPerson" | "priceLabel" | "";
  valueKey: "included" | "onRequest" | "";
  value: string;
} {

  switch (type) {

    case "per_person":

      return {
        labelKey: "perPerson",
        valueKey: "",
        value: amount != null ? `€${amount}` : "",
      };

    case "included":

      return {
        labelKey: "",
        valueKey: "included",
        value: "",
      };

    case "on_request":

      return {
        labelKey: "",
        valueKey: "onRequest",
        value: "",
      };

    case "fixed":
    default:

      return {
        labelKey: amount != null ? "priceLabel" : "",
        valueKey: "",
        value: amount != null ? `€${amount}` : "",
      };

  }

}
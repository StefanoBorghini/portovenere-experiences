export function formatPrice(

    total: number,

    priceType?: string

): {

    label: string;

    value: string;

} {

    switch (priceType) {

        case "fixed":

            return {

                label: "Price",

                value: `€${total}`,

            };

        case "per_person":

            return {

                label: "Starting from",

                value: `€${total}`,

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

                value: `€${total}`,

            };

    }

}
export function calculatePrice(

    basePrice = 0,

    priceType = "fixed",

    guests = 1,

) {

    switch (priceType) {

        case "fixed":

            return basePrice;

        case "per_person":

            return basePrice * guests;

        case "included":

            return 0;

        case "on_request":

            return 0;

        default:

            return basePrice;

    }

}
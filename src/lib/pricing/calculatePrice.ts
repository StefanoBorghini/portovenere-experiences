export function calculatePrice(

    basePrice = 0,

    priceType = "fixed",

    guests = 1,

    children = 0,

    childDiscountPercentage = 0,

) {

    switch (priceType) {

        case "fixed":

            // Prezzo fisso indipendente dal numero di persone —
            // i bambini non aggiungono costo in questo caso.
            return basePrice;

        case "per_person": {

            const adultsTotal =
                basePrice * guests;

            // Ogni bambino paga il prezzo per persona scontato
            // della percentuale configurata su questa esperienza
            // (es. childDiscountPercentage = 50 → paga la metà).
            const childPrice =
                basePrice * (1 - childDiscountPercentage / 100);

            const childrenTotal =
                childPrice * children;

            return adultsTotal + childrenTotal;
        }

        case "included":

            return 0;

        case "on_request":

            return 0;

        default:

            return basePrice;

    }

}

function price( pickupDate, dropoffDate, type, age, license) {
    const clazz = getClazz(type);
    const days = get_days(pickupDate, dropoffDate);
    const season = getSeason(pickupDate, dropoffDate);
    let rentalprice = age * days;

    //alumine ei tee midagi, aga ilma selleta tuleb error, et "clazz is not defined"
    function getClazz(type) {
        switch (type) {
            case "Compact":
                return "Compact";
            case "Electric":
                return "Electric";
            case "Cabrio":
                return "Cabrio";
            case "Racer":
                return "Racer";
            default:
                return "Unknown";
        }
    }

    function get_days(pickupDate, dropoffDate) {
        const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
        const firstDate = new Date(pickupDate);
        const secondDate = new Date(dropoffDate);

        return Math.round(Math.abs((firstDate - secondDate) / oneDay)) + 1;
    }
    //weekday 0-6, 0 = sunday, 6 = saturday lisada
    function getSeason(pickupDate, dropoffDate) {
        const pickup = new Date(pickupDate);
        const dropoff = new Date(dropoffDate);

        const start = 4;
        const end = 10;

        const pickupMonth = pickup.getMonth();
        const dropoffMonth = dropoff.getMonth();

        if (
            (pickupMonth >= start && pickupMonth <= end) ||
            (dropoffMonth >= start && dropoffMonth <= end)
        ) {
            return "High";
        } else {
            return "Low";
        }
    }


    if (age < 18) {
        return "Driver too young - cannot quote the price";
    }

    if (license < 1) {
        return "Driver has to have a license for at least a year to rent a car";
    }

    if (license < 2) {
        rentalprice *= 1.3;
    }

    if (license < 3 && season === "High") {
        rentalprice = (age + 15) * days;
    }

    if (age <= 21 && clazz == "Compact") {
        rentalprice *= 1.0;
    }

    if (age <= 21 && clazz !== "Compact") {
        return "Drivers 21 y/o or less can only rent Compact vehicles";
    }

    if (clazz === "Racer" && age <= 25 && season === "High") {
        rentalprice *= 1.5;
    }

    if (season === "High") {
        rentalprice *= 1.15;
    }

    if (days > 10 && season === "Low") {
        rentalprice *= 0.9;
    }


    return '$' + rentalprice;
}

exports.price = price;

exports.rentalprice = rentalprice;
function price(pickupDate, dropoffDate, carType, driverAge) {
    const legalDriverAge = 18;
    const compactRentalAge = 21;
    const racerRentalAge = 25;
    const longRentalThreshold = 10;
    const lowSeasonDiscount = 0.9;
    const highSeasonMultiplier = 1.15;
    const highSeasonMultiplierRACER = 1.15;

    const rentalDuration = getRentalDuration(pickupDate, dropoffDate);
    const season = getSeason(pickupDate, dropoffDate);

    if (driverAge < legalDriverAge) {
        return "Driver too young - cannot quote the price";
    }

    if (driverAge <= compactRentalAge && carType !== "Compact") {
        return "Drivers 21 y/o or less can only rent Compact vehicles";
    }

    let rentalPrice = driverAge * rentalDuration;

    if (carType === "Racer" && driverAge <= racerRentalAge && season === "High") {
        rentalPrice *= highSeasonMultiplierRACER;
    }

    if (season === "High") {
        rentalPrice *= highSeasonMultiplier;
    }

    if (rentalDuration > longRentalThreshold && season === "Low") {
        rentalPrice *= lowSeasonDiscount;
    }

    return '$' + rentalPrice;
}

function getRentalDuration(pickupDate, dropoffDate) {
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const firstDate = new Date(pickupDate);
    const secondDate = new Date(dropoffDate);

    return Math.round(Math.abs((firstDate - secondDate) / oneDay)) + 1;
}

function getSeason(pickupDate, dropoffDate) {
    const pickup = new Date(pickupDate);
    const dropoff = new Date(dropoffDate);

    const highSeasonMonthStart = 4;
    const highSeasonMonthEnd = 10;

    const pickupMonth = pickup.getMonth();
    const dropoffMonth = dropoff.getMonth();

    if (
        (pickupMonth >= highSeasonMonthStart && pickupMonth <= highSeasonMonthEnd) ||
        (dropoffMonth >= highSeasonMonthStart && dropoffMonth <= highSeasonMonthEnd) ||
        (pickupMonth < highSeasonMonthStart && dropoffMonth > highSeasonMonthEnd)
    ) {
        return "High";
    } else {
        return "Low";
    }
}

exports.price = price;
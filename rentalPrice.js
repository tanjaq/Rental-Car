function price(pickupDate, dropoffDate, carType, driverAge, licenseDuration) {
    const legalDriverAge = 18;
    const compactRentalAge = 21;
    const racerRentalAge = 25;

    const longRentalThreshold = 10;
    const lowSeasonDiscount = 0.9;
    const highSeasonMultiplier = 1.15;
    const highSeasonMultiplierRACER = 1.5;

    const licenseLessThan1Year = 1;
    const licenseLessThan2Years = 2;
    const licenseLessThan3Years = 3;

    const newLicencePriceIncrease = 0.3;
    const highSeasonDailySubcharge = 15;

    const rentalDuration = getRentalDuration(pickupDate, dropoffDate);
    const season = getSeason(pickupDate, dropoffDate);

    if (driverAge < legalDriverAge) {
        return "Driver too young - cannot quote the price";
    }

    if (driverAge < compactRentalAge && carType !== "Compact") {
        return "Drivers 21 y/o or less can only rent Compact vehicles";
    }

    if (licenseDuration < licenseLessThan1Year) {
        return "Individuals holding a driver's license for less than a year are ineligible to rent.";
    }

    let rentalPrice = driverAge * rentalDuration;

    if (carType === "Racer" && driverAge <= racerRentalAge && season === "High") {
        rentalPrice *= highSeasonMultiplierRACER;
    }

    if (season === "High") {
        rentalPrice *= highSeasonMultiplier;
    }

    if (licenseDuration < licenseLessThan2Years) {
        rentalPrice *= (1 + newLicencePriceIncrease);
    }

    if (licenseDuration < licenseLessThan3Years && season === "High") {
        rentalPrice += highSeasonDailySubcharge * rentalDuration;
    }

    if (rentalDuration > longRentalThreshold && season === "Low") {
        rentalPrice *= lowSeasonDiscount;
    }

    return '$' + rentalPrice.toFixed(2);
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

    const highSeasonMonthStart = 3;
    const highSeasonMonthEnd = 9;

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
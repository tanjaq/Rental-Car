const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
const MONTH_NO_APRIL = 3;
const MONTH_NO_OCTOBER = 9;

function calculateRentalPrice(pickupDate, dropoffDate, carType, driverAge) {
    const rentalDays = getTotalRentalDays(pickupDate, dropoffDate);
    const highSeason = isHighSeason(pickupDate, dropoffDate);
    
    if (isDriverTooYoung(driverAge)) {
        return "Driver too young - cannot quote the price";
    }

    if (isRestrictedDriver(driverAge, carType)) {
        return "Drivers 21 y/o or less can only rent Compact vehicles";
    }

    let basePrice = calculateBaseRentalPrice(driverAge, rentalDays);

    let rentalPrice = calculateSurcharge(basePrice, driverAge, carType, rentalDays, highSeason);

    return formatRentalPrice(rentalPrice);
}

function calculateBaseRentalPrice(driverAge, rentalDays) {
    return driverAge * rentalDays;
}

function calculateSurcharge(basePrice, driverAge, carType, rentalDays, highSeason) {
    let rentalPrice = basePrice;

    if (isRacerUnder25(driverAge, carType) && highSeason) {
      rentalPrice = basePrice * 1.5;
    }

    if (highSeason) {
      rentalPrice = basePrice * 1.15;
    }

    if (isLongRental(rentalDays) && !highSeason) {
      rentalPrice = basePrice * 0.9;
    }
    return rentalPrice;
}

function getTotalRentalDays(pickupDate, dropoffDate) {
    const firstDate = new Date(pickupDate);
    const secondDate = new Date(dropoffDate);

    return Math.round((secondDate - firstDate) / DAY_IN_MILLISECONDS) + 1;
}

function isHighSeason(pickupDate, dropoffDate) {
    const pickupMonth = new Date(pickupDate).getMonth();
    const dropoffMonth = new Date(dropoffDate).getMonth();

    if ((pickupMonth >= MONTH_NO_APRIL && pickupMonth <= MONTH_NO_OCTOBER) ||
        (dropoffMonth >= MONTH_NO_APRIL && dropoffMonth <= MONTH_NO_OCTOBER) ||
        (pickupMonth < MONTH_NO_APRIL && dropoffMonth > MONTH_NO_OCTOBER)) {
        return true;
    }
}

function isDriverTooYoung(driverAge) {
    return driverAge < 18;
}

function isRestrictedDriver(driverAge, carType) {
    return driverAge <= 21 && carType !== "Compact";
}

function isRacerUnder25(driverAge, carType) {
    return driverAge <= 25 && carType === "Racer";
}

function isLongRental(rentalDays) {
    return rentalDays > 10;
}

function formatRentalPrice(rentalPrice) {
    return 'Price: $' + rentalPrice.toFixed(2);
}

exports.calculateRentalPrice = calculateRentalPrice;

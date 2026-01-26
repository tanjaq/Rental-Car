//minu mottes konstandiga on hea praktika seda teha
const SEASON = {
    HIGH: "High",
    LOW: "Low",
    HIGH_START_MONTH: 3,
    HIGH_END_MONTH: 9
    //see on month indexid. alustab nullist, ss 3 on april, 9 on oktoober
};

const CAR_CLASSES = {
    COMPACT: "Compact",
    ELECTRIC: "Electric",
    CABRIO: "Cabrio",
    RACER: "Racer"
};

function calculatePrice(carType, driverAge, licenseDate, pickupDate, dropoffDate) {
    const days = calculateRentalDays(pickupDate, dropoffDate);
    const season = getSeason(pickupDate, dropoffDate);
    const licenseYears = calculateYearsSince(licenseDate);

    const validationError = validateEligibility(carType, driverAge, licenseYears);
    if (validationError) return validationError;

    let dailyPrice = driverAge;

    // nouedest: kui license < 3 years lisame 15€ igapaeviti in High Season
    if (licenseYears < 3 && season === SEASON.HIGH) {
        dailyPrice += 15;
    }

    let totalPrice = dailyPrice * days;

    if (season === SEASON.HIGH) {
        totalPrice *= 1.15;
    }

    if (carType === CAR_CLASSES.RACER && driverAge <= 25 && season === SEASON.HIGH) {
        totalPrice *= 1.5;
    }

    // nouedest: kui license < 2 years increases total price by 30%
    if (licenseYears < 2) {
        totalPrice *= 1.3;
    }

    if (days > 10 && season === SEASON.LOW) {
        totalPrice *= 0.9;
    }

    return `$${totalPrice.toFixed(2)}`;
}

function validateEligibility(carType, age, licenseYears) {
    if (age < 18) {
        return "Driver too young - cannot quote the price";
    }

    if (age <= 21 && carType !== CAR_CLASSES.COMPACT) {
        return `Drivers 21 y/o or less can only rent ${CAR_CLASSES.COMPACT} vehicles`;
    }

    if (licenseYears < 1) {
        return "Individuals holding a driver's license for less than a year are ineligible to rent";
    }

    return null;
}

function calculateRentalDays(pickupDate, dropoffDate) {
    const oneDayMs = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    return Math.round(Math.abs((new Date(dropoffDate) - new Date(pickupDate)) / oneDayMs)) + 1;
}

function calculateYearsSince(date) {
    const diffMs = Date.now() - new Date(date).getTime();
    const ageDate = new Date(diffMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}

function getSeason(pickupDate, dropoffDate) {
    const pickupMonth = new Date(pickupDate).getMonth();
    const dropoffMonth = new Date(dropoffDate).getMonth();

    const isPickupInHigh = (pickupMonth >= SEASON.HIGH_START_MONTH && pickupMonth <= SEASON.HIGH_END_MONTH);
    const isDropoffInHigh = (dropoffMonth >= SEASON.HIGH_START_MONTH && dropoffMonth <= SEASON.HIGH_END_MONTH);
    const spansHighSeason = (pickupMonth < SEASON.HIGH_START_MONTH && dropoffMonth > SEASON.HIGH_END_MONTH);

    if (isPickupInHigh || isDropoffInHigh || spansHighSeason) {
        return SEASON.HIGH;
    }
    return SEASON.LOW;
}

exports.calculatePrice = calculatePrice;
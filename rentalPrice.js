//This is a month index. It starts at 0 (January), 3 is April, 9 is October
const SEASON = {
    HIGH: "High",
    LOW: "Low",
    HIGH_START_MONTH: 3,
    HIGH_END_MONTH: 9
};

const CAR_CLASSES = {
    COMPACT: "Compact",
    ELECTRIC: "Electric",
    CABRIO: "Cabrio",
    RACER: "Racer"
};

function calculatePrice(carType, driverAge, licenseDate, pickupDate, dropoffDate) {
    const days = calculateRentalDays(pickupDate, dropoffDate);
    const licenseYears = calculateYearsSince(licenseDate);
    const season = getSeason(pickupDate, dropoffDate);

    const validationError = validateEligibility(carType, driverAge, licenseYears);
    if (validationError) {
        return validationError;
    }
    
    let totalPrice = 0;
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    // Iterate through each day and calculate price
    for (let i = 0; i < days; i++) {
        // Calculate current date by adding milliseconds
        const currentDateMs = pickupDate + (i * ONE_DAY_MS);
        const currentDate = new Date(currentDateMs);

        let dailyPrice = driverAge;

        // Apply license-based daily surcharge during high season
        if (licenseYears < 3 && season === SEASON.HIGH) {
            dailyPrice += 15;
        }

        // Apply weekend multiplier
        if (isWeekend(currentDate)) {
            dailyPrice *= 1.05;
        }

        totalPrice += dailyPrice;
    }
    
    if (season === SEASON.HIGH) {
        totalPrice *= 1.15;
    }

    if (carType === CAR_CLASSES.RACER && driverAge <= 25 && season === SEASON.HIGH) {
        totalPrice *= 1.5;
    }

    if (licenseYears < 2) {
        totalPrice *= 1.3;
    }
    
    if (days > 10 && season === SEASON.LOW) {
        totalPrice *= 0.9;
    }
    
    return `$${totalPrice.toFixed(2)}`;
}

function validateEligibility(carType, driverAge, licenseYears) {
    if (driverAge < 18) {
        return "Driver too young - cannot quote the price";
    }

    if (driverAge <= 21 && carType !== CAR_CLASSES.COMPACT) {
        return `Drivers 21 y/o or less can only rent ${CAR_CLASSES.COMPACT} vehicles`;
    }

    if (licenseYears < 1) {
        return "Driver must have at least 1 year of driving experience to rent a car";
    }
    return null; // No eligibility issues

}

function calculateRentalDays(pickupDate, dropoffDate) {
    const oneDayMs = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    return Math.round(Math.abs((new Date(dropoffDate) - new Date(pickupDate)) / oneDayMs)) + 1;
}

function calculateYearsSince(date) {
    const diffMs = new Date() - new Date(date).getTime();
    const ageDate = new Date(diffMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}

function isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
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
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

const RULES = {
    MIN_RENTAL_AGE: 18,
    COMPACT_ONLY_MAX_AGE: 21,
    RACER_YOUNG_DRIVER_MAX_AGE: 25,

    HIGH_SEASON_INCREASE: 1.15,
    LONG_RENTAL_DISCOUNT: 0.9,

    RACER_YOUNG_DRIVER_INCREASE: 1.5,

    LICENSE_UNDER_2_YEARS_INCREASE: 1.3,
    LICENSE_HIGH_SEASON_DAILY_FEE: 15,

    WEEKEND_INCREASE: 1.05
};

function calculatePrice(pickupDate, dropoffDate, carType, driverAge, licenseYears) {
    validateEligibility(carType, driverAge, licenseYears);

    const days = calculateRentalDays(pickupDate, dropoffDate);
    const season = getSeason(pickupDate, dropoffDate);

    let totalPrice = 0;

    for (let i = 0; i < days; i++) {
        const currentDate = new Date(pickupDate);
        currentDate.setDate(currentDate.getDate() + i);

        let dailyPrice = driverAge;

        dailyPrice = applyLicenseRules(dailyPrice, licenseYears, season);

        dailyPrice = applyCarRules(dailyPrice, carType, driverAge, season);

        if (isWeekend(currentDate)) {
            dailyPrice *= 1.05;
        }

        totalPrice += dailyPrice;
    }

    totalPrice = applySeasonRules(totalPrice, season, days);

    return `$${totalPrice.toFixed(2)}`;
}

function validateEligibility(carType, age, licenseYears) {
    if (age < 18) {
        throw new Error("Driver too young");
    }

    if (licenseYears < 1) {
        throw new Error("Driver's license held for less than one year");
    }

    if (age <= 21 && carType !== "Compact") {
        throw new Error("Drivers aged 18–21 can only rent Compact cars");
    }
}

function applyCarRules(price, carType, age, season) {
    if (carType === "Racer" && age <= 25 && season === "High") {
        return price * 1.5;
    }
    return price;
}

function applyLicenseRules(price, licenseYears, season) {
    let adjustedPrice = price;

    if (licenseYears < 2) {
        adjustedPrice *= 1.3;
    }

    if (licenseYears < 3 && season === "High") {
        adjustedPrice += 15;
    }

    return adjustedPrice;
}

function applySeasonRules(totalPrice, season, days) {
    if (season === "High") {
        return totalPrice * 1.15;
    }

    if (season === "Low" && days > 10) {
        return totalPrice * 0.9;
    }

    return totalPrice;
}

function calculateRentalDays(pickupDate, dropoffDate) {
    const ONE_DAY = 24 * 60 * 60 * 1000;
    return Math.round((dropoffDate - pickupDate) / ONE_DAY) + 1;
}

function isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6;
}

function getSeason(pickupDate, dropoffDate) {
    const startMonth = new Date(pickupDate).getMonth();
    const endMonth = new Date(dropoffDate).getMonth();

    const isHigh = (startMonth >= 3 && startMonth <= 9) || (endMonth >= 3 && endMonth <= 9);
    return isHigh ? "High" : "Low";
}

module.exports = { calculatePrice };
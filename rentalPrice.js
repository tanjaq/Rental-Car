// ===== Constants =====
const MIN_RENTAL_AGE = 18;
const COMPACT_ONLY_MAX_AGE = 21;
const RACER_YOUNG_DRIVER_MAX_AGE = 25;

const HIGH_SEASON_START_MONTH = 3;
const HIGH_SEASON_END_MONTH = 9;

const HIGH_SEASON_INCREASE = 1.15;
const LONG_RENTAL_DISCOUNT = 0.9;
const RACER_YOUNG_DRIVER_INCREASE = 1.5;

const LICENSE_UNDER_2_YEARS_INCREASE = 1.3;
const LICENSE_HIGH_SEASON_DAILY_FEE = 15;

const WEEKEND_INCREASE = 1.05;

// ===== Main API =====
function calculatePrice(
    pickupDate,
    dropoffDate,
    carType,
    driverAge,
    licenseYears
) {
    validateDriver(driverAge, carType, licenseYears);

    const rentalDays = calculateDays(pickupDate, dropoffDate);
    const season = determineSeason(pickupDate);

    let totalPrice = 0;

    for (let i = 0; i < rentalDays; i++) {
        const currentDate = new Date(pickupDate);
        currentDate.setDate(currentDate.getDate() + i);

        let dailyPrice = driverAge;

        dailyPrice = applyLicenseRules(dailyPrice, licenseYears, season);
        dailyPrice = applyCarRules(dailyPrice, carType, driverAge, season);

        if (isWeekend(currentDate)) {
            dailyPrice *= WEEKEND_INCREASE;
        }

        totalPrice += dailyPrice;
    }

    totalPrice = applySeasonRules(totalPrice, season, rentalDays);

    return `$${totalPrice.toFixed(2)}`;
}

// ===== Validation =====
function validateDriver(age, carType, licenseYears) {
    if (age < MIN_RENTAL_AGE) {
        throw new Error("Driver too young");
    }

    if (licenseYears < 1) {
        throw new Error("Driver's license held for less than one year");
    }

    if (age <= COMPACT_ONLY_MAX_AGE && carType !== "Compact") {
        throw new Error("Drivers aged 18–21 can only rent Compact cars");
    }
}

// ===== Rules =====
function applyCarRules(price, carType, age, season) {
    if (
        carType === "Racer" &&
        age <= RACER_YOUNG_DRIVER_MAX_AGE &&
        season === "High"
    ) {
        return price * RACER_YOUNG_DRIVER_INCREASE;
    }
    return price;
}

function applyLicenseRules(price, licenseYears, season) {
    let result = price;

    if (licenseYears < 2) {
        result *= LICENSE_UNDER_2_YEARS_INCREASE;
    }

    if (licenseYears < 3 && season === "High") {
        result += LICENSE_HIGH_SEASON_DAILY_FEE;
    }

    return result;
}

function applySeasonRules(totalPrice, season, days) {
    if (season === "High") {
        return totalPrice * HIGH_SEASON_INCREASE;
    }

    if (season === "Low" && days > 10) {
        return totalPrice * LONG_RENTAL_DISCOUNT;
    }

    return totalPrice;
}

// ===== Helpers =====
function calculateDays(start, end) {
    const ONE_DAY = 24 * 60 * 60 * 1000;
    return Math.round((end - start) / ONE_DAY) + 1;
}

function isWeekend(date) {
    const day = new Date(date).getDay();
    return day === 0 || day === 6;
}

function determineSeason(start) {
    const month = new Date(start).getMonth();

    return (month >= HIGH_SEASON_START_MONTH &&
            month <= HIGH_SEASON_END_MONTH)
        ? "High"
        : "Low";
}

module.exports = { calculatePrice };
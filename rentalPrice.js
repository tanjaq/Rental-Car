
// ===== Constants =====
const MIN_RENTAL_AGE = 18;
const COMPACT_ONLY_MAX_AGE = 21;
const RACER_YOUNG_DRIVER_MAX_AGE = 25;

const HIGH_SEASON_START_MONTH = 3; // April (0-based)
const HIGH_SEASON_END_MONTH = 9;   // October

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
    const season = determineSeason(pickupDate, dropoffDate);

    let totalPrice = 0;

    for (let i = 0; i < rentalDays; i++) {
        const currentDate = new Date(pickupDate);
        currentDate.setDate(currentDate.getDate() + i);

        // 1️⃣ Base minimum daily price
        let dailyPrice = driverAge;

        // 2️⃣ License rules (daily)
        dailyPrice = applyLicenseRules(dailyPrice, licenseYears, season);

        // 3️⃣ Car-specific rules (daily)
        dailyPrice = applyCarRules(dailyPrice, carType, driverAge, season);

        // 4️⃣ Weekend rule (daily)
        if (isWeekend(currentDate)) {
            dailyPrice *= WEEKEND_INCREASE;
        }

        totalPrice += dailyPrice;
    }

    // 5️⃣ Season & long-rental rules (TOTAL)
    totalPrice = applySeasonRules(totalPrice, season, rentalDays);

    return `$${totalPrice.toFixed(2)}`;
}


// ===== Validation =====
function validateDriver(age, carType, licenseYears) {
    if (age < MIN_RENTAL_AGE) {
        throw new Error("Driver too young - cannot quote the price");
    }

    if (licenseYears < 1) {
        throw new Error("Driver's license held for less than one year");
    }

    if (age <= COMPACT_ONLY_MAX_AGE && carType !== "Compact") {
        throw new Error("Drivers aged 18–21 can only rent Compact cars");
    }
}

// ===== Pricing Rules =====
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
    let adjustedPrice = price;

    if (licenseYears < 2) {
        adjustedPrice *= LICENSE_UNDER_2_YEARS_INCREASE;
    }

    if (licenseYears < 3 && season === "High") {
        adjustedPrice += LICENSE_HIGH_SEASON_DAILY_FEE;
    }

    return adjustedPrice;
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
    return day === 0 || day === 6; // Sunday or Saturday
}

function determineSeason(start, end) {
    const startMonth = new Date(start).getMonth();
    const endMonth = new Date(end).getMonth();

    const isHigh =
        (startMonth >= HIGH_SEASON_START_MONTH &&
            startMonth <= HIGH_SEASON_END_MONTH) ||
        (endMonth >= HIGH_SEASON_START_MONTH &&
            endMonth <= HIGH_SEASON_END_MONTH);

    return isHigh ? "High" : "Low";
}

module.exports = { calculatePrice };
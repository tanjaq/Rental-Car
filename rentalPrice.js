const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MONTH_APRIL_INDEX = 3;
const MONTH_OCTOBER_INDEX = 9;
const LONG_RENTAL_DISCOUNT_THRESHOLD = 10;
const LONG_RENTAL_DISCOUNT_RATE = 0.1;
const HIGH_SEASON_SURCHARGE_RATE = 0.15;
const RACER_YOUNG_DRIVER_MAX_AGE = 25;
const RACER_YOUNG_DRIVER_SURCHARGE_RATE = 0.5;
const WEEKEND_SURCHARGE_RATE = 0.05;
const LICENSE_MIN_YEARS = 1;
const LICENSE_SURCHARGE_YEARS_THRESHOLD = 2;
const LICENSE_SURCHARGE_RATE = 0.3;
const LICENSE_HIGH_SEASON_YEARS_THRESHOLD = 3;
const LICENSE_HIGH_SEASON_DAILY_FEE = 15;

const SEASON = {
    HIGH: "High",
    LOW: "Low",
};

function price(pickup, dropoff, pickupDate, dropoffDate, type, age, licenseIssuedDate) {
    const carClass = normalizeCarClass(type);
    const rentalDays = calculateRentalDays(pickupDate, dropoffDate);
    const season = determineSeason(pickupDate, dropoffDate);
    const licenseYears = calculateFullYears(licenseIssuedDate, pickupDate);

    if (!carClass) {
        return "Unknown car class";
    }

    if (age < 18) {
        return "Driver too young - cannot quote the price";
    }

    if (licenseYears < LICENSE_MIN_YEARS) {
        return "Driver must hold a license for at least one year";
    }

    if (age <= 21 && carClass !== "Compact") {
        return "Drivers 21 y/o or less can only rent Compact vehicles";
    }

    const baseDailyRate = age;
    const dailyPrices = buildDailyPrices(pickupDate, rentalDays, season, baseDailyRate, licenseYears);
    let totalPrice = dailyPrices.reduce((sum, daily) => sum + daily, 0);

    if (carClass === "Racer" && age <= RACER_YOUNG_DRIVER_MAX_AGE && season === SEASON.HIGH) {
        totalPrice *= 1 + RACER_YOUNG_DRIVER_SURCHARGE_RATE;
    }

    if (season === SEASON.HIGH) {
        totalPrice *= 1 + HIGH_SEASON_SURCHARGE_RATE;
    }

    if (licenseYears < LICENSE_SURCHARGE_YEARS_THRESHOLD) {
        totalPrice *= 1 + LICENSE_SURCHARGE_RATE;
    }

    if (rentalDays > LONG_RENTAL_DISCOUNT_THRESHOLD && season === SEASON.LOW) {
        totalPrice *= 1 - LONG_RENTAL_DISCOUNT_RATE;
    }

    const minimumTotal = baseDailyRate * rentalDays;
    const finalPrice = Math.max(totalPrice, minimumTotal);

    return formatPrice(finalPrice);
}

function normalizeCarClass(type) {
    if (!type) {
        return null;
    }

    const normalized = String(type).trim().toLowerCase();

    switch (normalized) {
        case "compact":
            return "Compact";
        case "electric":
            return "Electric";
        case "cabrio":
            return "Cabrio";
        case "racer":
            return "Racer";
        default:
            return null;
    }
}

function calculateRentalDays(pickupDate, dropoffDate) {
    const start = new Date(pickupDate);
    const end = new Date(dropoffDate);

    const hasInvalidDate = Number.isNaN(start.getTime()) || Number.isNaN(end.getTime());
    const normalizedStart = hasInvalidDate ? new Date() : start;
    const normalizedEnd = hasInvalidDate ? start : end;

    const [earlier, later] = normalizedStart <= normalizedEnd ? [normalizedStart, normalizedEnd] : [normalizedEnd, normalizedStart];

    const duration = Math.abs(later - earlier);
    const days = Math.floor(duration / MS_PER_DAY) + 1;

    return days > 0 ? days : 0;
}

function determineSeason(pickupDate, dropoffDate) {
    const pickupMonth = new Date(pickupDate).getMonth();
    const dropoffMonth = new Date(dropoffDate).getMonth();

    if (
        (pickupMonth >= MONTH_APRIL_INDEX && pickupMonth <= MONTH_OCTOBER_INDEX) ||
        (dropoffMonth >= MONTH_APRIL_INDEX && dropoffMonth <= MONTH_OCTOBER_INDEX) ||
        (pickupMonth < MONTH_APRIL_INDEX && dropoffMonth > MONTH_OCTOBER_INDEX)
    ) {
        return SEASON.HIGH;
    }

    return SEASON.LOW;
}

function calculateFullYears(startDate, comparisonDate) {
    const start = new Date(startDate);
    const comparison = new Date(comparisonDate);

    if (isNaN(start) || isNaN(comparison) || comparison <= start) {
        return 0;
    }

    const years = comparison.getFullYear() - start.getFullYear();
    const hasAnniversaryPassed =
        comparison.getMonth() > start.getMonth() ||
        (comparison.getMonth() === start.getMonth() && comparison.getDate() >= start.getDate());

    return hasAnniversaryPassed ? years : years - 1;
}

function buildDailyPrices(pickupDate, rentalDays, season, baseDailyRate, licenseYears) {
    const dailyPrices = [];
    const startDate = new Date(pickupDate);

    for (let dayIndex = 0; dayIndex < rentalDays; dayIndex++) {
        const currentDay = new Date(startDate.getTime() + dayIndex * MS_PER_DAY);
        let dailyPrice = baseDailyRate;

        if (isWeekend(currentDay)) {
            dailyPrice *= 1 + WEEKEND_SURCHARGE_RATE;
        }

        if (season === SEASON.HIGH && licenseYears < LICENSE_HIGH_SEASON_YEARS_THRESHOLD) {
            dailyPrice += LICENSE_HIGH_SEASON_DAILY_FEE;
        }

        dailyPrices.push(dailyPrice);
    }

    return dailyPrices;
}

function isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6;
}

function formatPrice(price) {
    return `$${price.toFixed(2)}`;
}

exports.price = price;
exports._internal = {
    buildDailyPrices,
    calculateFullYears,
    calculateRentalDays,
    determineSeason,
    isWeekend,
    normalizeCarClass,
};
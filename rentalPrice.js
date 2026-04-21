const CAR_CLASS = {
    COMPACT: "Compact",
    ELECTRIC: "Electric",
    CABRIO: "Cabrio",
    RACER: "Racer",
};

const SEASON = {
    HIGH: "High",
    LOW: "Low",
};

const MIN_RENTAL_AGE = 18;
const COMPACT_ONLY_MAX_AGE = 21;
const RACER_SURCHARGE_MAX_AGE = 25;
const RACER_HIGH_SEASON_FACTOR = 1.5;
const HIGH_SEASON_FACTOR = 1.15;
const LONG_RENTAL_THRESHOLD_DAYS = 10;
const LONG_RENTAL_DISCOUNT = 0.9;
const MIN_LICENSE_YEARS = 1;
const LICENSE_UNDER_TWO_FACTOR = 1.3;
const LICENSE_UNDER_THREE_HIGH_SEASON_FEE = 15;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const HIGH_SEASON_START_MONTH = 3; // April (0-indexed)
const HIGH_SEASON_END_MONTH = 9; // October (0-indexed)
const WEEKEND_SURCHARGE_RATE = 0.05;

function price(pickup, dropoff, pickupDate, dropoffDate, type, age, licenseYears) {
    const carClass = getCarClass(type);
    const days = getRentalDays(pickupDate, dropoffDate);
    const weekendDays = getWeekendDays(pickupDate, dropoffDate);
    const season = getSeason(pickupDate, dropoffDate);
    const licenseDurationYears = Number.isFinite(licenseYears) ? licenseYears : 0;

    if (age < MIN_RENTAL_AGE) {
        return "Driver too young - cannot quote the price";
    }

    if (age <= COMPACT_ONLY_MAX_AGE && carClass !== CAR_CLASS.COMPACT) {
        return "Drivers 21 y/o or less can only rent Compact vehicles";
    }

    if (licenseDurationYears < MIN_LICENSE_YEARS) {
        return "Driver must hold a license for at least 1 year";
    }

    const dailyBasePrice = age;
    let rentalPrice = dailyBasePrice * days;

    if (weekendDays > 0) {
        rentalPrice += dailyBasePrice * WEEKEND_SURCHARGE_RATE * weekendDays;
    }

    if (carClass === CAR_CLASS.RACER && age <= RACER_SURCHARGE_MAX_AGE && season === SEASON.HIGH) {
        rentalPrice *= RACER_HIGH_SEASON_FACTOR;
    }

    if (season === SEASON.HIGH) {
        rentalPrice *= HIGH_SEASON_FACTOR;
    }

    if (days > LONG_RENTAL_THRESHOLD_DAYS && season === SEASON.LOW) {
        rentalPrice *= LONG_RENTAL_DISCOUNT;
    }

    if (licenseDurationYears < 2) {
        rentalPrice *= LICENSE_UNDER_TWO_FACTOR;
    }

    if (licenseDurationYears < 3 && season === SEASON.HIGH) {
        rentalPrice += LICENSE_UNDER_THREE_HIGH_SEASON_FEE * days;
    }

    return formatPrice(rentalPrice);
}

function getCarClass(type) {
    const normalized = String(type || "").trim().toLowerCase();
    switch (normalized) {
        case "compact":
            return CAR_CLASS.COMPACT;
        case "electric":
            return CAR_CLASS.ELECTRIC;
        case "cabrio":
            return CAR_CLASS.CABRIO;
        case "racer":
            return CAR_CLASS.RACER;
        default:
            return CAR_CLASS.COMPACT;
    }
}

function getRentalDays(pickupDate, dropoffDate) {
    const pickup = new Date(pickupDate);
    const dropoff = new Date(dropoffDate);
    const diff = dropoff - pickup;

    if (Number.isNaN(diff)) {
        return 1;
    }

    const rawDays = Math.round(diff / ONE_DAY_MS) + 1;
    return Math.max(rawDays, 1);
}

function getSeason(pickupDate, dropoffDate) {
    const pickup = new Date(pickupDate);
    const dropoff = new Date(dropoffDate);

    if (Number.isNaN(pickup.getTime()) || Number.isNaN(dropoff.getTime())) {
        return SEASON.LOW;
    }

    const pickupMonth = pickup.getMonth();
    const dropoffMonth = dropoff.getMonth();

    const crossesHighSeason =
        (pickupMonth >= HIGH_SEASON_START_MONTH && pickupMonth <= HIGH_SEASON_END_MONTH) ||
        (dropoffMonth >= HIGH_SEASON_START_MONTH && dropoffMonth <= HIGH_SEASON_END_MONTH) ||
        (pickupMonth < HIGH_SEASON_START_MONTH && dropoffMonth > HIGH_SEASON_END_MONTH);

    return crossesHighSeason ? SEASON.HIGH : SEASON.LOW;
}

function getWeekendDays(pickupDate, dropoffDate) {
    const pickup = new Date(pickupDate);
    const dropoff = new Date(dropoffDate);

    if (Number.isNaN(pickup.getTime()) || Number.isNaN(dropoff.getTime())) {
        return 0;
    }

    const start = dropoff < pickup ? dropoff : pickup;
    const end = dropoff < pickup ? pickup : dropoff;

    let count = 0;
    for (let current = new Date(start); current <= end; current = new Date(current.getTime() + ONE_DAY_MS)) {
        const day = current.getDay();
        if (day === 0 || day === 6) {
            count += 1;
        }
    }

    return count;
}

function formatPrice(amount) {
    if (!Number.isFinite(amount)) {
        return "$0.00";
    }
    return "$" + amount.toFixed(2);
}

exports.price = price;
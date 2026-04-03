const HIGH_SEASON_SURCHARGE = 1.15;
const RACER_YOUNG_DRIVER_SURCHARGE = 1.5;
const LONG_RENTAL_DISCOUNT = 0.9;
const HIGH_SEASON_START_MONTH = 3; // April
const HIGH_SEASON_END_MONTH = 9; // October
const MAX_LOW_SEASON_DURATION = 30 + 31 + 31 + 29 + 31;
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
const MIN_RENTAL_AGE = 18;
const COMPACT_ONLY_AGE_THRESHOLD = 21;
const RACER_SURCHARGE_AGE_LIMIT = 25;
const LONG_RENTAL_THRESHOLD_DAYS = 10;

function price(pickupLocation, dropoffLocation, pickupDate, dropoffDate, carType, driverAge) {
    const normalizedCarType = carType.toLowerCase();
    const carPickupDate = new Date(pickupDate);
    const carDropoffDate = new Date(dropoffDate);
    const rentDays = getTotalRentalDays(carPickupDate, carDropoffDate);
    const season = getSeason(carPickupDate, carDropoffDate, rentDays);

    if (driverAge < MIN_RENTAL_AGE) {
        return "Driver too young - cannot quote the price";
    }

    if (driverAge <= COMPACT_ONLY_AGE_THRESHOLD && normalizedCarType !== "compact") {
        return `Drivers ${COMPACT_ONLY_AGE_THRESHOLD} y/o or less can only rent Compact vehicles`;
    }

    let rentalprice = driverAge;

    if (season === "High") {
        rentalprice *= HIGH_SEASON_SURCHARGE;
    }

    if (normalizedCarType === "racer" && driverAge <= RACER_SURCHARGE_AGE_LIMIT && season === "High") {
        rentalprice *= RACER_YOUNG_DRIVER_SURCHARGE;
    }

    if (rentDays > LONG_RENTAL_THRESHOLD_DAYS && season === "Low") {
        rentalprice *= LONG_RENTAL_DISCOUNT;
    }

    return '$' + rentalprice.toFixed(2);
}

function getTotalRentalDays(carPickupDate, carDropoffDate) {

    return Math.round(Math.abs((carPickupDate - carDropoffDate) / ONE_DAY_IN_MS)) + 1;
}

function getSeason(carPickupDate, carDropoffDate, rentDays) {
    const pickupMonth = carPickupDate.getMonth();
    const dropoffMonth = carDropoffDate.getMonth();

    if (
        (pickupMonth >= HIGH_SEASON_START_MONTH && pickupMonth <= HIGH_SEASON_END_MONTH) ||
        (dropoffMonth >= HIGH_SEASON_START_MONTH && dropoffMonth <= HIGH_SEASON_END_MONTH) ||
        (rentDays > MAX_LOW_SEASON_DURATION)
    ) {
        return "High";
    } else {
        return "Low";
    }
}

exports.price = price;

// - Rental cars are categorized into 4 classes: Compact, Electric, Cabrio, Racer.
// - Individuals under the age of 18 are ineligible to rent a car.
// - Those aged 18-21 can only rent Compact cars.
// - For Racers, the price is increased by 50% if the driver is 25 years old or younger (except during the low season).
// - Low season is from November until end of March.
// - High season is from April until end of October.
// - If renting in High season, price is increased by 15%.
// - If renting for more than 10 days, price is decresed by 10% (except during the high season).
// - The minimum rental price per day is equivalent to the age of the driver.

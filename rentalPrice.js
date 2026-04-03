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

const MIN_LICENSE_YEARS_FOR_RENTAL = 1;
const YOUNG_LICENSE_SURCHARGE_THRESHOLD = 2;
const YOUNG_LICENSE_SURCHARGE_MULTIPLIER = 1.3;
const MID_LICENSE_FLAT_FEE_THRESHOLD = 3;
const MID_LICENSE_FLAT_FEE_AMOUNT = 15;

function price(pickupLocation, dropoffLocation, pickupDate, dropoffDate, carType, driverAge, licenseDate) {
    const normalizedCarType = carType.toLowerCase();
    const carPickupDate = new Date(pickupDate);
    const carDropoffDate = new Date(dropoffDate);
    const rentDays = getTotalRentalDays(carPickupDate, carDropoffDate);
    const season = getSeason(carPickupDate, carDropoffDate, rentDays);
    const driverLicenseDate = new Date(licenseDate);
    const driverLicenseAge = getYearsSince(driverLicenseDate, carPickupDate);

    if (driverLicenseAge < MIN_LICENSE_YEARS_FOR_RENTAL) {
        return "Driver license held less than one year - cannot quote the price"
    }

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

    if (driverLicenseAge < YOUNG_LICENSE_SURCHARGE_THRESHOLD) {
        rentalprice *= YOUNG_LICENSE_SURCHARGE_MULTIPLIER;
    }
    if (
        (driverLicenseAge < MID_LICENSE_FLAT_FEE_THRESHOLD) &&
        (season === "High")
    ) {
        rentalprice += MID_LICENSE_FLAT_FEE_AMOUNT;
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

function getYearsSince(startDate, endDate) {
    let years = endDate.getFullYear() - startDate.getFullYear();

    const monthDiff = endDate.getMonth() - startDate.getMonth();
    const dayDiff = endDate.getDate() - startDate.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        years--;
    }

    return years;
}

exports.price = price;

//  New requirements:
//   * Individuals holding a driver's license for less than a year are ineligible to rent.
//   * If the driver's license has been held for less than two years, the rental price is increased by 30%.
//   * If the driver's license has been held for less than three years, then an additional 15 euros will be added to the daily rental price during high season.
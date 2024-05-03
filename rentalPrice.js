const MIN_DRIVER_AGE = 18;
const COMPACT_AGE_LIMIT = 21;
const RACER_AGE_LIMIT = 25;
const HIGH_SEASON_MONTHS = [4, 5, 6, 7, 8, 9, 10]; // April to October
const LOW_SEASON_MONTHS = [11, 12, 1, 2, 3]; // November to March
const HIGH_SEASON_PRICE_INCREASE = 0.15;
const RACER_PRICE_INCREASE_UNDER_25 = 0.5;
const DISCOUNT_MORE_THAN_10_DAYS = 0.9;
const LICENSE_YEARS_THRESHOLD_1 = 1;
const LICENSE_YEARS_THRESHOLD_2 = 2;
const LICENSE_YEARS_THRESHOLD_3 = 3;
const LICENSE_YEARS_PRICE_INCREASE_2 = 0.3;
const LICENSE_YEARS_PRICE_INCREASE_3 = 15;

function canRentCar(age, licenseYears, carClass) {
    if (age < MIN_DRIVER_AGE) {
        return "Driver too young - cannot rent a car.";
    }
    if (licenseYears === LICENSE_YEARS_THRESHOLD_1) {
        return "Driver must hold a license for at least one year to rent a car.";
    }
    if (carClass !== "Compact" && (age >= MIN_DRIVER_AGE && age <= COMPACT_AGE_LIMIT)) {
        return "Drivers aged 18-21 can only rent Compact cars.";
    }
    return true;
}

function calculateRentalPrice(pickupDate, dropoffDate, type, age, licenseYears) {
    const days = calculateRentalDays(pickupDate, dropoffDate);
    const season = getSeason(pickupDate);
    
    const carClass = type;
    const canRent = canRentCar(age, licenseYears, carClass);
    if (canRent !== true) {
        return canRent;
    }

    let rentalPrice = age;

    if (carClass === "Racer" && age <= RACER_AGE_LIMIT && season === "High") {
        rentalPrice *= 1 + RACER_PRICE_INCREASE_UNDER_25;
    }

    if (season === "High") {
        rentalPrice *= 1 + HIGH_SEASON_PRICE_INCREASE;
    }

    if (days > 10 && season !== "High") {
        rentalPrice *= DISCOUNT_MORE_THAN_10_DAYS;
    }

    rentalPrice = applyLicenseYearsDiscount(rentalPrice, licenseYears, season, days);

    return '$' + (rentalPrice * days).toFixed(2);
}
function applyLicenseYearsDiscount(rentalPrice, licenseYears, season, days) {   

    if (licenseYears < LICENSE_YEARS_THRESHOLD_3 && season === "High") {
        rentalPrice += (LICENSE_YEARS_PRICE_INCREASE_3 * days);
    }
    return rentalPrice;

}

function calculateRentalDays(pickupDate, dropoffDate) {
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const firstDate = new Date(pickupDate);
    const secondDate = new Date(dropoffDate);

    return Math.round(Math.abs((firstDate - secondDate) / oneDay)) + 1;
}

function getSeason(date) {
    const month = new Date(date).getMonth() + 1; // JavaScript months are zero-based
    if (HIGH_SEASON_MONTHS.includes(month)) {
        return "High";
    } else if (LOW_SEASON_MONTHS.includes(month)) {
        return "Low";
    } else {
        return "Unknown";
    }
}

module.exports = {
    calculateRentalPrice
};

const MIN_AGE = 18;
const YOUNG_DRIVER_AGE = 21;
const RACER_SURCHARGE_AGE = 25;
const HIGH_SEASON_MULTIPLIER = 1.15;
const RACER_YOUNG_MULTIPLIER = 1.5;
const LONG_RENTAL_DISCOUNT = 0.9;
const LONG_RENTAL_DAYS = 10;
const HIGH_SEASON_START_MONTH = 3; // April (0-based)
const HIGH_SEASON_END_MONTH = 9; // October (0-based)
const ONE_YEAR = 1;
const TWO_YEARS = 2;
const THREE_YEARS = 3;
const LICENSE_LOW_EXPERIENCE_MULTIPLIER = 1.3;
const HIGH_SEASON_LICENSE_DAILY_SURCHARGE = 15;
const WEEKEND_SURCHARGE = 2.50;

function price(pickup, dropoff, pickupDate, dropoffDate, type, age, licenseYears) {
    const carType = type;
    const days = getDays(pickupDate, dropoffDate);
    const season = getSeason(pickupDate, dropoffDate);

    if (age < MIN_AGE) {
        return "Driver too young - cannot quote the price";
    }

    if (age <= YOUNG_DRIVER_AGE && carType !== "Compact") {
        return "Drivers 21 y/o or less can only rent Compact vehicles";
    }

    if (licenseYears < ONE_YEAR) {
        return "Driver has held a license for less than a year - cannot quote the price";
    }

    let dailyPrice = age;
    if (season === "High" && licenseYears < THREE_YEARS) {
        dailyPrice += HIGH_SEASON_LICENSE_DAILY_SURCHARGE;
    }

    let rentalPrice = dailyPrice * days;

    if (carType === "Racer" && age <= RACER_SURCHARGE_AGE && season === "High") {
        rentalPrice *= RACER_YOUNG_MULTIPLIER;
    }

    if (season === "High") {
        rentalPrice *= HIGH_SEASON_MULTIPLIER;
    }

    if (days > LONG_RENTAL_DAYS && season === "Low") {
        rentalPrice *= LONG_RENTAL_DISCOUNT;
    }

    if (licenseYears < TWO_YEARS) {
        rentalPrice *= LICENSE_LOW_EXPERIENCE_MULTIPLIER;
    }

    if (season === "Low") {
        const weekendDays = countWeekendDays(pickupDate, dropoffDate);
        rentalPrice += weekendDays * WEEKEND_SURCHARGE;
    }

    return "$" + rentalPrice;
}

function getDays(pickupDate, dropoffDate) {
    const oneDay = 24 * 60 * 60 * 1000;
    const firstDate = new Date(pickupDate);
    const secondDate = new Date(dropoffDate);

    return Math.round(Math.abs((firstDate - secondDate) / oneDay)) + 1;// Inclusive of both pickup and dropoff days
}

function getSeason(pickupDate, dropoffDate) {
    const pickup = new Date(pickupDate);
    const dropoff = new Date(dropoffDate);

    const pickupMonth = pickup.getMonth();
    const dropoffMonth = dropoff.getMonth();

    if (
        (pickupMonth >= HIGH_SEASON_START_MONTH && pickupMonth <= HIGH_SEASON_END_MONTH) ||
        (dropoffMonth >= HIGH_SEASON_START_MONTH && dropoffMonth <= HIGH_SEASON_END_MONTH) ||
        (pickupMonth < HIGH_SEASON_START_MONTH && dropoffMonth > HIGH_SEASON_END_MONTH)
    ) {
        return "High";
    }

    return "Low";
}

function countWeekendDays(pickupDate, dropoffDate) {
    const oneDay = 24 * 60 * 60 * 1000; 
    const firstDate = new Date(pickupDate);
    const secondDate = new Date(dropoffDate);
    
    let weekendCount = 0;
    let currentDate = new Date(firstDate);
    
    while (currentDate <= secondDate) {
        const dayOfWeek = currentDate.getDay();
        // Saturday = 6, Sunday = 0
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            weekendCount++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return weekendCount;
}

exports.price = price;
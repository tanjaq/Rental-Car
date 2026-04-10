const HIGH_SEASON_SURCHARGE = 1.15;
const RACER_YOUNG_DRIVER_SURCHARGE = 1.5;
const LONG_RENTAL_DISCOUNT = 0.9;
const WEEKEND_SURCHARGE = 1.05; // 5% extra
const HIGH_SEASON_START_MONTH = 3; // April
const HIGH_SEASON_END_MONTH = 9; // October
const MIN_RENTAL_AGE = 18;
const COMPACT_ONLY_AGE_THRESHOLD = 21;
const RACER_SURCHARGE_AGE_LIMIT = 25;

const MIN_LICENSE_YEARS_FOR_RENTAL = 1;
const YOUNG_LICENSE_SURCHARGE_THRESHOLD = 2;
const YOUNG_LICENSE_SURCHARGE_MULTIPLIER = 1.3;
const MID_LICENSE_FLAT_FEE_THRESHOLD = 3;
const MID_LICENSE_FLAT_FEE_AMOUNT = 15;
const LONG_RENTAL_THRESHOLD_DAYS = 10;

function price(pickupLocation, dropoffLocation, pickupDate, dropoffDate, carType, driverAge, licenseDate) {
    const normalizedCarType = carType.toLowerCase();
    const carPickupDate = new Date(pickupDate);
    const carDropoffDate = new Date(dropoffDate);
    const rentDays = getTotalRentalDays(carPickupDate, carDropoffDate);
    const driverLicenseDate = new Date(licenseDate);
    const driverLicenseAge = getYearsSince(driverLicenseDate, carPickupDate);

    if (driverLicenseAge < MIN_LICENSE_YEARS_FOR_RENTAL)
        return "Driver license held less than one year - cannot quote the price";

    if (driverAge < MIN_RENTAL_AGE)
        return "Driver too young - cannot quote the price";

    if (driverAge <= COMPACT_ONLY_AGE_THRESHOLD && normalizedCarType !== "compact") {
        return `Drivers ${COMPACT_ONLY_AGE_THRESHOLD} y/o or less can only rent Compact vehicles`;
    }

    let lowSeasonSubtotal = 0;
    let highSeasonSubtotal = 0;

    let current = new Date(carPickupDate);

    while (current <= carDropoffDate) {
        let dailyPrice = driverAge;
        const isHigh = isHighSeason(current);

        // High season
        if (isHigh) {
            dailyPrice *= HIGH_SEASON_SURCHARGE;
        }

        // Racer surcharge
        if (
            isHigh &&
            normalizedCarType === "racer" &&
            driverAge <= RACER_SURCHARGE_AGE_LIMIT
        ) {
            dailyPrice *= RACER_YOUNG_DRIVER_SURCHARGE;
        }
        // License < 2 years
        if (driverLicenseAge < YOUNG_LICENSE_SURCHARGE_THRESHOLD) {
            dailyPrice *= YOUNG_LICENSE_SURCHARGE_MULTIPLIER;
        }

        // Weekend
        const dayOfWeek = current.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            dailyPrice *= WEEKEND_SURCHARGE;
        }

        // Flat fee LAST
        if (
            driverLicenseAge < MID_LICENSE_FLAT_FEE_THRESHOLD &&
            isHigh
        ) {
            dailyPrice += MID_LICENSE_FLAT_FEE_AMOUNT;
        }

        // Add ONCE to correct subtotal
        if (isHigh) {
            highSeasonSubtotal += dailyPrice;
        } else {
            lowSeasonSubtotal += dailyPrice;
        }

        // next day
        current.setDate(current.getDate() + 1);
    }

    // Apply discount ONLY to low season
    if (rentDays > LONG_RENTAL_THRESHOLD_DAYS) {
        lowSeasonSubtotal *= LONG_RENTAL_DISCOUNT;
    }

    const totalPrice = lowSeasonSubtotal + highSeasonSubtotal;
    return '$' + totalPrice.toFixed(2);
}

function getTotalRentalDays(startDate, endDate) {
    return Math.round(Math.abs((startDate - endDate) / (24 * 60 * 60 * 1000))) + 1;
}

function getYearsSince(startDate, endDate) {
    let years = endDate.getFullYear() - startDate.getFullYear();
    if (endDate.getMonth() < startDate.getMonth() ||
        (endDate.getMonth() === startDate.getMonth() && endDate.getDate() < startDate.getDate())) {
        years--;
    }
    return years;
}

function isHighSeason(date) {
    const month = date.getMonth();
    return month >= HIGH_SEASON_START_MONTH && month <= HIGH_SEASON_END_MONTH;
}

exports.price = price;
function calculateTotalPriceAndCheckIfValid(pickupDate, dropOffDate, carType, driverAge, ageOfLicense) {
    const rentalDays = getrentalDays(pickupDate, dropOffDate);
    const Season = highSeason(pickupDate, dropOffDate);
    const currentYear = new Date().getFullYear();

    if (driverIsTooYoung(driverAge)) {
        return "Driver too young - cannot quote the price";
    }

    if (restrictedDriver(driverAge, carType)) {
        return "Drivers 21 y/o or less can only rent Compact vehicles";
    }

    if ((currentYear - ageOfLicense) < 1) {
        return "Individuals holding a drivers license for less than a year are ineligible to rent."
    }

    const basePrice = calculateBasePrice(driverAge, rentalDays);
    const rentalPrice = calculateExtraCharge(basePrice, carType, currentYear, ageOfLicense, rentalDays, Season, driverAge);

    return (rentalPrice.toFixed(2) + '$');
}

function calculateBasePrice(driverAge, rentalDays) {
    const weekdayPrice = driverAge * rentalDays.weekdays;
    const weekendPrice = driverAge * rentalDays.weekends * 1.05;
    return weekdayPrice + weekendPrice;
}

function calculateExtraCharge(basePrice, carType, currentYear, ageOfLicense, rentalDays, Season, driverAge) {
    let weekdayPrice = basePrice * rentalDays.weekdays / (rentalDays.weekdays + rentalDays.weekends);
    let weekendPrice = basePrice * rentalDays.weekends * 1.05 / (rentalDays.weekdays + rentalDays.weekends);

    if (driverAge <= 25 && carType === "Racer" && Season) {
        weekdayPrice *= 1.5;
        weekendPrice *= 1.5;
    }

    if (Season) {
        weekdayPrice *= 1.15;
        weekendPrice *= 1.15;
    }

    if ((currentYear - ageOfLicense) < 2) {
        weekdayPrice *= 1.3;
        weekendPrice *= 1.3;
    }

    if (currentYear - ageOfLicense < 3 && Season) {
        weekdayPrice += 15 * rentalDays.weekdays;
        weekendPrice += 15 * rentalDays.weekends * 1.05;
    }

    if (longRent(rentalDays) && !Season) {
        weekdayPrice *= 0.9;
        weekendPrice *= 0.9;
    }

    return weekdayPrice + weekendPrice;
}

function driverIsTooYoung(driverAge) {
    return driverAge < 18;
}

function restrictedDriver(driverAge, carType) {
    return driverAge < 21 && carType !== 'Compact';
}

function longRent(rentalDays) {
    return rentalDays.weekdays + rentalDays.weekends > 10;
}

function getrentalDays(pickupDate, dropOffDate) {
    const carpickup = new Date(pickupDate);
    const cardropoff = new Date(dropOffDate);
    let weekdays = 0;
    let weekends = 0;

    for (let d = new Date(carpickup); d <= cardropoff; d.setDate(d.getDate() + 1)) {
        if (isWeekend(d)) {
            weekends++;
        } else {
            weekdays++;
        }
    }

    return { weekdays, weekends };
}

function isWeekend(date) {
    const day = date.getDay();
    return day === 6 || day === 0; // 6 = Saturday, 0 = Sunday
}

function highSeason(pickupDate, dropOffDate) {
    const pickup = new Date(pickupDate);
    const dropoff = new Date(dropOffDate);
    const pickupMonth = pickup.getMonth();
    const dropoffMonth = dropoff.getMonth();

    if (pickupMonth >= 4 && dropoffMonth <= 10) {
        return true;
    }
    return false;
}

exports.calculateTotalPriceAndCheckIfValid = calculateTotalPriceAndCheckIfValid;
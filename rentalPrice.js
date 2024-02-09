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

    return (rentalPrice + '$');

}

function calculateBasePrice(driverAge, rentalDays) {

    return driverAge * rentalDays;

}

function calculateExtraCharge(basePrice, carType, currentYear, ageOfLicense, rentalDays, Season, driverAge) {


    let rentalPrice = basePrice;

    if (driverAge <= 25 && carType === "Racer" && Season) {

        return rentalPrice = basePrice * 1.5;

    }

    if (Season) {

        rentalPrice = basePrice * 1.15;

    }

    if ((currentYear - ageOfLicense) < 2) {

        return rentalPrice = basePrice * 1.3;

    }

    if (currentYear - ageOfLicense < 3 && Season) {

        rentalPrice = basePrice + (15 * rentalDays)

    }

    if (longRent(rentalDays) && !Season) {

        rentalPrice = basePrice * 0.9;
    }

    return rentalPrice;

}

function driverIsTooYoung(driverAge) {

    return driverAge < 18;
}

function restrictedDriver(driverAge, carType) {

    return driverAge < 21 && carType !== 'Compact';

}

function longRent(rentalDays) {

    return rentalDays > 10;

}

function getrentalDays(pickupDate, dropOffDate) {

    const carpickup = new Date(pickupDate);
    const cardropoff = new Date(dropOffDate);
    const differenceTime = Math.abs(cardropoff - carpickup);
    const differenceDays = Math.ceil(differenceTime / (1000 * 60 * 60 * 24));

    return differenceDays
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
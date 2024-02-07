
function Price(PickUp, DropOff, PickupDate, DropOffDate, type, age, AgeOfLicense) {
    const carType = getCarType(type);
    const Days = getDays(PickupDate, DropOffDate);
    const Season = highSeason(PickupDate, DropOffDate);
    const D = new Date();
    let CurrentYear = D.getFullYear();



    if (age < 18) {
        return "Driver too young - cannot quote the price";
    }

    if ((CurrentYear - AgeOfLicense) < 1) {
        return "Individuals holding a driver's license for less than a year are ineligible to rent."
    }

    if (age <= 21 && CarType !== "Compact") {
        return "Drivers 21 y/o or less can only rent Compact vehicles";
    }
    let RentalPrice = age * Days;
    if (carType === "Racer" && Age <= 25 && Season == true) {
        RentalPrice *= 1.5;
    }

    if (Season == true) {
        RentalPrice *= 1.15;
    }

    if (Days > 10 && Season === "Low") {
        RentalPrice *= 0.9;
    }
    if ((CurrentYear - AgeOfLicense) < 2) {
        RentalPrice *= 1.3;
    }

    if ((CurrentYear - AgeOfLicense) < 3 && Season == true) {
        RentalPrice = + 15 * Days;
    }
    return '$' + RentalPrice;

}

function getCarType(type) {
    var carType = {
        'Compact': 'Compact',
        'Electric': 'Electric',
        'Cabrio': 'Cabrio',
        'Racer': 'Racer'
    };
}

function getDays(PickupDate, DropOffDate) {

    const pickupDate = new Date(PickupDate);
    const dropoffDate = new Date(DropOffDate);
    const differenceTime = Math.abs(dropoffDate - pickupDate);
    const differenceDays = Math.ceil(differenceTime / (1000 * 60 * 60 * 24));

    return differenceDays
}

function highSeason(PickupDate, DropoffDate) {

    const pickup = new Date(PickupDate);
    const dropoff = new Date(DropoffDate);
    const pickupMonth = pickup.getMonth();
    const dropoffMonth = dropoff.getMonth();

    if (pickupMonth >= 4 && dropoffMonth <= 10) {
        return true;
    }
}

exports.Price = Price;
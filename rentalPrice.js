
function price(pickupDate, dropoffDate, carType, driverAge, licenseDuration) {
    const vehicleClass = getVehicleClass(carType);
    const rentalDays = getRentalDays(pickupDate, dropoffDate);
    const season = getSeason(pickupDate, dropoffDate);

    if (licenseDuration < 1) {
        return "Driver must have held a license for at least a year";
    }

    if (driverAge < 18) {
        return "Driver too young - cannot quote the price";
    }

    if (driverAge <= 21 && vehicleClass !== "Compact") {
        return "Drivers 21 y/o or less can only rent Compact vehicles";
    }

    let rentalPrice = driverAge * rentalDays;

    if (licenseDuration < 2) {
        rentalPrice *= 1.3;
    }

    if (licenseDuration < 3 && season === "High") {
        rentalPrice += 15 * rentalDays;
    }

    if (vehicleClass === "Racer" && driverAge <= 25 && season !== "Low") {
        rentalPrice *= 1.5;
    }

    if (season === "High") {
        rentalPrice *= 1.15;
    }

    if (rentalDays > 10 && season === "Low") {
        rentalPrice *= 0.9;
    }

    return '$' + rentalPrice.toFixed(2);
}

function getVehicleClass(carType) {
    const validTypes = ["Compact", "Electric", "Cabrio", "Racer"];
    return validTypes.includes(carType) ? carType : "Unknown";
}

function getRentalDays(pickupDate, dropoffDate) {
    const oneDay = 24 * 60 * 60 * 1000;
    const firstDate = new Date(pickupDate);
    const secondDate = new Date(dropoffDate);
    return Math.max(Math.round((secondDate - firstDate) / oneDay) + 1, 1);
}

function getSeason(pickupDate) {
    const month = new Date(pickupDate).getMonth() + 1;
    return (month >= 4 && month <= 10) ? "High" : "Low";
}

exports.price = price;

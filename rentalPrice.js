function price(pickupDate, dropoffDate, type, age, license) {
    const clazz = getClazz(type);
    function getClazz(type) {
        const types = ["Compact", "Electric", "Cabrio", "Racer"];
        if (!types.includes(type)) {
            return "Unknown";
        }
        return type;
    }

    const rentalDays = Math.floor((new Date(dropoffDate) - new Date(pickupDate)) / (1000 * 60 * 60 * 24))+1;
    if (age < 18) {
        return "Driver too young - cannot quote the price";
    }
    if (clazz === "Unknown") {
        return "car is not on the list of available cars";
    }

    if (license < 1) {
        return "Driver has to have a license for at least a year to rent a car";
    }

    if (age <= 21 && clazz !== "Compact") {
        return "Drivers 21 y/o or less can only rent Compact vehicles";
    }

    let currentDate = new Date(pickupDate);
    let rentalprice = 0; // Reset rentalprice to accumulate the adjusted daily prices

    while (currentDate <= new Date(dropoffDate)) {
        const season = getSeason(currentDate);
        let dayPrice = age; // daily price is age

        if (license < 2) {
            dayPrice *= 1.3; // 30% increase for license less than 2 yearsõ

        }

        if (license < 3 && season === "High") {
            dayPrice += 15; // additional 15 euros for license less than 3 years in high season

        }

        if (clazz === "Racer" && age <= 25 && season !== "Low") {
            dayPrice *= 1.5; // 50% increase for Racer and age <= 25 except in low season
        }

        if (season === "High") {
            dayPrice *= 1.15; // 15% increase for high season
        }

        if (isWeekend(currentDate)) {
            dayPrice *= 1.05; // 5% increase for weekends
        }

        rentalprice += dayPrice;

        currentDate.setDate(currentDate.getDate() + 1);

    }
    if (rentalDays > 10 && getSeason(new Date(dropoffDate)) === "Low") {
        rentalprice *= 0.9; // 10% discount for more than 10 days except in high season

    }

    return '$' + rentalprice;
}

function getSeason(date) {
    const month = date.getMonth();
    if (month >= 3 && month <= 9) { // April to October is high season
        return "High";
    } else {
        return "Low"; // November to March is low season
    }
}

function isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6; // 0 (Sunday) or 6 (Saturday)
}

exports.price = price;

function price(pickupDate, dropoffDate, type, age) {
    const days = get_days(pickupDate, dropoffDate);
    const season = getSeason(pickupDate, dropoffDate);

    if (age < 18) {
        return "Driver too young - cannot quote the price";
    }

    if (age <= 21 && type !== "Compact") {
        return "Drivers 21 y/o or less can only rent Compact vehicles";
    }

    let rentalprice = 0;
    let currentDate = new Date(pickupDate);

    for (let i = 0; i < days; i++) {
        let dailyPrice = age; // Base daily price is the driver's age

        if (isWeekend(currentDate)) {
            dailyPrice *= 1.05; // 5% increase on weekends
        }

        rentalprice += dailyPrice;
        currentDate.setDate(currentDate.getDate() + 1);
    }

    if (type === "Racer" && age <= 25 && season === "High") {
        rentalprice *= 1.5;
    }

    if (season === "High") {
        rentalprice *= 1.15;
    }

    if (days > 10 && season === "Low") {
        rentalprice *= 0.9;
    }
    return '$' + rentalprice;
}

function isWeekend(date) {
    const day = date.getDay(); // 0 = Sunday, 6 = Saturday
    return day === 0 || day === 6;
}

function get_days(pickupDate, dropoffDate) {
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const firstDate = new Date(pickupDate);
    const secondDate = new Date(dropoffDate);

    return Math.round(Math.abs((firstDate - secondDate) / oneDay)) + 1;
}

function getSeason(pickupDate, dropoffDate) {
    const pickup = new Date(pickupDate);
    const dropoff = new Date(dropoffDate);

    const start = 4;
    const end = 10;

    const pickupMonth = pickup.getMonth();
    const dropoffMonth = dropoff.getMonth();

    if (
        (pickupMonth >= start && pickupMonth <= end) ||
        (dropoffMonth >= start && dropoffMonth <= end) ||
        (pickupMonth < start && dropoffMonth > end)
    ) {
        return "High";
    } else {
        return "Low";
    }
}

exports.price = price;
function price(pickupDate, dropoffDate, type, age, license) {
    const clazz = getClazz(type);
    const days = get_days(pickupDate, dropoffDate);
    let rentalprice = age * days;
    const averageDailyPrice = rentalprice / days;

    function getClazz(type) {
        const types = ["Compact", "Electric", "Cabrio", "Racer"];
        if (!types.includes(type)) {
            return "Unknown";
        }
        return
    }

    function get_days(pickupDate, dropoffDate) {
        const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
        const firstDate = new Date(pickupDate);
        const secondDate = new Date(dropoffDate);

        return Math.round(Math.abs((firstDate - secondDate) / oneDay)) + 1;
    }

    function getSeason(date) {
        const month = new Date(date).getMonth();
        const start = 4;
        const end = 10;

        if (month >= start && month <= end) {
            return "High";
        } else {
            return "Low";
        }
    }

    function isWeekend(date) {
        const dayOfWeek = new Date(date).getDay();
        return dayOfWeek === 0 || dayOfWeek === 6; // 0 = Sunday, 6 = Saturday
    }

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
    rentalprice = 0; // Reset rentalprice to accumulate the adjusted daily prices

    while (currentDate <= new Date(dropoffDate)) {
        const season = getSeason(currentDate);
        let dayPrice = averageDailyPrice;

        if (license < 3 && season === "High") {
            dayPrice += 15;
        }

        if (clazz === "Racer" && age <= 25 && season === "High") {
            dayPrice *= 1.5;
        }

        if (season === "High") {
            dayPrice *= 1.15;
        }

        if (isWeekend(currentDate)) {
            dayPrice *= 1.05; // 5% increase for weekends
        }

        rentalprice += dayPrice;

        currentDate.setDate(currentDate.getDate() + 1);
    }

    if (days > 10 && getSeason(dropoffDate) === "Low") {
        rentalprice *= 0.9;
    }

    if (license < 2) {
        rentalprice *= 1.3;
    }

    return '$' + rentalprice;
}

exports.price = price;
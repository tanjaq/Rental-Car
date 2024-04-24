const { getPeriodInYears } = require('./utils')
const { applyExperienceCoefficients } = require('./priceCalculations');

const price = (pickup, dropoff, pickupDate, dropoffDate, type, age, dateOfLicense) => {
    if (age < 18) return "Driver too young - cannot quote the price";

    const licenseAge = getPeriodInYears(dateOfLicense, Date.now());
    if (licenseAge < 1) return 'License hasn\'t been held long enough';

    const vehicleClasses = ['compact', 'electric', 'cabrio', 'racer'];
    if (!vehicleClasses.includes(type)) return 'unknown';

    if (age <= 21 && type !== "compact") return "Drivers 21 y/o or less can only rent Compact vehicles";

    return '$'.concat(`${applyExperienceCoefficients(age, pickupDate, dropoffDate, type, licenseAge).toFixed(2)} per day`);
}

exports.price = price;

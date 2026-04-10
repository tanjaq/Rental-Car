const CAR_TYPES = ["Compact", "Electric", "Cabrio", "Racer"];
const HIGH_SEASON = "High";
const LOW_SEASON = "Low";

const RACER_AGE_LIMIT = 25; // Racer +50% alla 25
const LONG_RENT_DAYS = 10;  // Pikk rendi allahindlus
const HIGH_SEASON_SURCHARGE = 15; // uus nõue: <3 aastat juhiluba
const LICENSE_30_PERCENT = 0.3;   // uus nõue: <2 aastat juhiluba

function price(pickup, dropoff, pickupDate, dropoffDate, type, age, licenseYears) {
  const carClass = getCarClass(type);
  const days = getDays(pickupDate, dropoffDate);
  const season = getSeason(pickupDate, dropoffDate);

  validateDriver(age, carClass);

  validateLicense(licenseYears);

  let dailyPrice = age;

  dailyPrice = applySeasonalPricing(dailyPrice, carClass, age, season);

  dailyPrice = applyDiscount(dailyPrice, days, season);

  dailyPrice = applyLicensePricing(dailyPrice, licenseYears, season);

  const totalPrice = calculateTotalPriceWithWeekend(
  dailyPrice,
  pickupDate,
  dropoffDate
);

  return `$${totalPrice.toFixed(2)}`;
}


function validateDriver(age, carClass) {
  if (age < 18) throw new Error("Driver too young - cannot quote the price");
  if (age <= 21 && carClass !== "Compact")
    throw new Error("Drivers 21 y/o or less can only rent Compact vehicles");
}

function validateLicense(licenseYears) {
  if (licenseYears < 1) throw new Error("Driver must hold a license for at least 1 year");
}

function applySeasonalPricing(dailyPrice, carClass, age, season) {
  let newPrice = dailyPrice;

  if (carClass === "Racer" && age <= RACER_AGE_LIMIT && season === HIGH_SEASON) {
    newPrice *= 1.5;
  }

  if (season === HIGH_SEASON) {
    newPrice *= 1.15;
  }

  return newPrice;
}

function applyDiscount(dailyPrice, days, season) {
  if (days > LONG_RENT_DAYS && season === LOW_SEASON) {
    return dailyPrice * 0.9; // -10% ainult low season
  }
  return dailyPrice;
}

function applyLicensePricing(dailyPrice, licenseYears, season) {
  let price = dailyPrice;

  if (licenseYears < 2) {
    price *= 1 + LICENSE_30_PERCENT; // +30% alla 2 aastat
  }

  if (licenseYears < 3 && season === HIGH_SEASON) {
    price += HIGH_SEASON_SURCHARGE; // +15€ high season
  }

  return price;
}

function getCarClass(type) {
  return CAR_TYPES.includes(type) ? type : "Unknown";
}

function getDays(pickupDate, dropoffDate) {
  const oneDay = 24 * 60 * 60 * 1000; // ms ühe päeva kohta
  const startDate = new Date(pickupDate);
  const endDate = new Date(dropoffDate);

  return Math.round(Math.abs((startDate - endDate) / oneDay)) + 1;
}

function getSeason(pickupDate, dropoffDate) {
  const pickup = new Date(pickupDate);
  const dropoff = new Date(dropoffDate);

  const HIGH_START = 3; // aprill
  const HIGH_END = 9;   // oktoober

  const pickupMonth = pickup.getMonth();
  const dropoffMonth = dropoff.getMonth();

  const isHighSeason =
    (pickupMonth >= HIGH_START && pickupMonth <= HIGH_END) ||
    (dropoffMonth >= HIGH_START && dropoffMonth <= HIGH_END) ||
    (pickupMonth < HIGH_START && dropoffMonth > HIGH_END);

  return isHighSeason ? HIGH_SEASON : LOW_SEASON;
}

function calculateTotalPriceWithWeekend(dailyPrice, pickupDate, dropoffDate) {
  let total = 0;

  const current = new Date(pickupDate);
  const end = new Date(dropoffDate);

  while (current <= end) {
    const day = current.getDay(); // 0=Sunday, 6=Saturday

    let priceForDay = dailyPrice;

    // Weekend = Saturday (6) or Sunday (0)
    if (day === 0 || day === 6) {
      priceForDay *= 1.05; // +5%
    }

    total += priceForDay;

    current.setDate(current.getDate() + 1);
  }

  return total;
}

module.exports = {
  price,
  getCarClass,
  getDays,
  getSeason,
  validateDriver,
  validateLicense,
  calculateTotalPriceWithWeekend
};
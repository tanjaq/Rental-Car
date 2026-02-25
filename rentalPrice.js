
const MIN_RENTAL_AGE = 18;
const MAX_AGE_COMPACT_ONLY = 21;
const YOUNG_RACER_AGE_LIMIT = 25;
const HIGH_SEASON_START_MONTH = 3; // April (0-indexed)
const HIGH_SEASON_END_MONTH = 9;   // October (0-indexed)
const RACER_SURCHARGE = 1.5;
const HIGH_SEASON_SURCHARGE = 1.15;
const LONG_RENTAL_DISCOUNT = 0.9;
const LONG_RENTAL_THRESHOLD_DAYS = 10;
const LICENSE_INELIGIBLE_YEARS = 1;
const LICENSE_SURCHARGE_YEARS = 2;
const LICENSE_HIGH_SEASON_FEE_YEARS = 3;
const LICENSE_SURCHARGE_MULTIPLIER = 1.3;
const LICENSE_HIGH_SEASON_EXTRA_FEE = 15;

/**
 * Calculate the rental price.
 * @param {string} pickup - Pickup location (not used in price calculation)
 * @param {string} dropoff - Dropoff location (not used in price calculation)
 * @param {number} pickupDate - Pickup date (ms since epoch)
 * @param {number} dropoffDate - Dropoff date (ms since epoch)
 * @param {string} type - Car type (Compact, Electric, Cabrio, Racer)
 * @param {number} age - Driver's age
 * @param {number} licenseYears - Years the driver has held their license
 */
function price(pickup, dropoff, pickupDate, dropoffDate, type, age, licenseYears) {
  const carClass = normalizeCarClass(type);
  const rentalDays = getDays(pickupDate, dropoffDate);
  const season = getSeason(pickupDate, dropoffDate);

  if (age < MIN_RENTAL_AGE) {
    return "Driver too young - cannot quote the price";
  }

  if (age <= MAX_AGE_COMPACT_ONLY && carClass !== "Compact") {
    return "Drivers 21 y/o or less can only rent Compact vehicles";
  }

  if (licenseYears < LICENSE_INELIGIBLE_YEARS) {
    return "Driver must have held a license for at least 1 year";
  }

  let rentalPrice = age * rentalDays;

  if (carClass === "Racer" && age <= YOUNG_RACER_AGE_LIMIT && season === "High") {
    rentalPrice *= RACER_SURCHARGE;
  }

  if (season === "High") {
    rentalPrice *= HIGH_SEASON_SURCHARGE;
  }

  if (rentalDays > LONG_RENTAL_THRESHOLD_DAYS && season !== "High") {
    rentalPrice *= LONG_RENTAL_DISCOUNT;
  }

  if (licenseYears < LICENSE_SURCHARGE_YEARS) {
    rentalPrice *= LICENSE_SURCHARGE_MULTIPLIER;
  }

  if (licenseYears < LICENSE_HIGH_SEASON_FEE_YEARS && season === "High") {
    rentalPrice += LICENSE_HIGH_SEASON_EXTRA_FEE * rentalDays;
  }

  return '€' + Math.round(rentalPrice * 100) / 100;
}

function normalizeCarClass(type) {
  const normalized = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  const validClasses = ["Compact", "Electric", "Cabrio", "Racer"];
  return validClasses.includes(normalized) ? normalized : "Unknown";
}

function getDays(pickupDate, dropoffDate) {
  const oneDay = 24 * 60 * 60 * 1000;
  const firstDate = new Date(pickupDate);
  const secondDate = new Date(dropoffDate);

  return Math.round(Math.abs((firstDate - secondDate) / oneDay)) + 1;
}

function getSeason(pickupDate, dropoffDate) {
  const pickup = new Date(pickupDate);
  const dropoff = new Date(dropoffDate);

  const pickupMonth = pickup.getMonth();
  const dropoffMonth = dropoff.getMonth();

  if (
    (pickupMonth >= HIGH_SEASON_START_MONTH && pickupMonth <= HIGH_SEASON_END_MONTH) ||
    (dropoffMonth >= HIGH_SEASON_START_MONTH && dropoffMonth <= HIGH_SEASON_END_MONTH) ||
    (pickupMonth < HIGH_SEASON_START_MONTH && dropoffMonth > HIGH_SEASON_END_MONTH)
  ) {
    return "High";
  } else {
    return "Low";
  }
}

exports.price = price;
exports.getDays = getDays;
exports.getSeason = getSeason;
exports.normalizeCarClass = normalizeCarClass;
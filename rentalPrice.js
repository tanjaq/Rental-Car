const MIN_DRIVER_AGE = 18;
const COMPACT_RENTAL_MAX_AGE = 21;
const MAX_AGE_FOR_RACER_SURCHARGE = 25;
const LONG_RENTAL_THRESHOLD = 10;

const RACER_HIGH_SEASON_MULTIPLIER = 1.5;
const HIGH_SEASON_MULTIPLIER = 1.15;
const LONG_RENTAL_LOW_SEASON_DISCOUNT = 0.9;
const HIGH_SEASON_START_MONTH = 4;
const HIGH_SEASON_END_MONTH = 10;
const DAY = 24 * 60 * 60 * 1000;
const WEEKEND_SURCHARGE = 1.05;

const LICENSE_LESS_THAN_1_YEAR = 1;
const LICENSE_LESS_THAN_2_YEARS = 2;
const LICENSE_LESS_THAN_3_YEARS = 3;

const NEW_LICENSE_PRICE_INCREASE = 0.3;
const HIGH_SEASON_DAILY_SURCHARGE = 15;

/* ---------------- Helpers ---------------- */

function checkEligibility(age, licenseDuration, type) {
  if (age < MIN_DRIVER_AGE) {
    throw new Error("Driver too young - cannot quote the price");
  }

  if (licenseDuration < LICENSE_LESS_THAN_1_YEAR) {
    throw new Error("Driver's license held for less than 1 year - ineligible to rent");
  }

  if (age <= COMPACT_RENTAL_MAX_AGE && type !== "compact") {
    throw new Error("Drivers 21 y/o or less can only rent Compact vehicles");
  }
}

function getRentalDuration(pickupDate, dropOffDate) {
  const start = new Date(pickupDate);
  const end = new Date(dropOffDate);
  const duration = Math.round(Math.abs((end - start) / DAY));
  return Math.max(1, duration);
}

function getWeekdayWeekendBasePrice(pickupDate, dropOffDate, dailyRate) {
  const start = new Date(pickupDate);
  const totalDays = getRentalDuration(start, dropOffDate);
  let total = 0;

  for (let i = 0; i < totalDays; i += 1) {
    const currentDate = new Date(start.getTime() + i * DAY);
    const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
    total += dailyRate * (isWeekend ? WEEKEND_SURCHARGE : 1);
  }

  return total;
}

function getSeason(pickupDate, dropOffDate) {
  const pickupMonth = new Date(pickupDate).getMonth();
  const dropoffMonth = new Date(dropOffDate).getMonth();

  if (
    (pickupMonth >= HIGH_SEASON_START_MONTH && pickupMonth <= HIGH_SEASON_END_MONTH)
    || (dropoffMonth >= HIGH_SEASON_START_MONTH && dropoffMonth <= HIGH_SEASON_END_MONTH)
    || (pickupMonth < HIGH_SEASON_START_MONTH && dropoffMonth > HIGH_SEASON_END_MONTH)
  ) {
    return "High";
  }

  return "Low";
}
function applyRacerHighSeasonSurcharge(priceValue, type, age, season) {
  return type === "racer" && age <= MAX_AGE_FOR_RACER_SURCHARGE && season === "High"
    ? priceValue * RACER_HIGH_SEASON_MULTIPLIER
    : priceValue;
}

function applyHighSeasonMultiplier(priceValue, season) {
  return season === "High" ? priceValue * HIGH_SEASON_MULTIPLIER : priceValue;
}

function applyLicenseSurcharge(priceValue, licenseDuration) {
  return licenseDuration < LICENSE_LESS_THAN_2_YEARS
    ? priceValue * (1 + NEW_LICENSE_PRICE_INCREASE)
    : priceValue;
}

function applyHighSeasonDailyCharge(priceValue, licenseDuration, season, rentalDuration) {
  return licenseDuration < LICENSE_LESS_THAN_3_YEARS && season === "High"
    ? priceValue + HIGH_SEASON_DAILY_SURCHARGE * rentalDuration
    : priceValue;
}

function applyLongRentalLowSeasonDiscount(priceValue, rentalDuration, season) {
  return rentalDuration > LONG_RENTAL_THRESHOLD && season === "Low"
    ? priceValue * LONG_RENTAL_LOW_SEASON_DISCOUNT
    : priceValue;
}

function formatPrice(value) {
  return (Math.round(value * 100) / 100).toFixed(2);
}

/* ---------------- Main Function ---------------- */

function price(pickupDate, dropOffDate, type, age, licenseDuration) {
  checkEligibility(age, licenseDuration, type);

  const rentalDuration = getRentalDuration(pickupDate, dropOffDate);
  const season = getSeason(pickupDate, dropOffDate);

  let rentalPrice = getWeekdayWeekendBasePrice(pickupDate, dropOffDate, age);
  rentalPrice = applyRacerHighSeasonSurcharge(rentalPrice, type, age, season);
  rentalPrice = applyHighSeasonMultiplier(rentalPrice, season);
  rentalPrice = applyLicenseSurcharge(rentalPrice, licenseDuration);
  rentalPrice = applyHighSeasonDailyCharge(rentalPrice, licenseDuration, season, rentalDuration);
  rentalPrice = applyLongRentalLowSeasonDiscount(rentalPrice, rentalDuration, season);
  return `$${formatPrice(rentalPrice)}`;
}
module.exports = { price };

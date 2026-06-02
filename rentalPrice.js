// ─── Constants ────────────────────────────────────────────────────────────────

const CAR_CLASSES = ["Compact", "Electric", "Cabrio", "Racer"];

const MIN_RENTAL_AGE = 18;
const MAX_AGE_COMPACT_ONLY = 21;
const MAX_AGE_RACER_SURCHARGE = 25;
const MIN_LICENSE_YEARS_TO_RENT = 1;
const LICENSE_YEARS_SURCHARGE_THRESHOLD = 2;
const LICENSE_YEARS_HIGH_SEASON_SURCHARGE_THRESHOLD = 3;
const LONG_RENTAL_MIN_DAYS = 10;

const HIGH_SEASON_START_MONTH = 3;
const HIGH_SEASON_END_MONTH = 9;

const RACER_YOUNG_DRIVER_MULTIPLIER = 1.5;
const HIGH_SEASON_MULTIPLIER = 1.15;
const LONG_RENTAL_DISCOUNT = 0.9;
const INEXPERIENCED_DRIVER_MULTIPLIER = 1.3;
const INEXPERIENCED_DRIVER_HIGH_SEASON_SURCHARGE = 15;

const WEEKEND_DAYS = [0, 6];
const WEEKEND_MULTIPLIER = 1.05;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isHighSeason(date) {
  const month = new Date(date).getMonth();
  return month >= HIGH_SEASON_START_MONTH && month <= HIGH_SEASON_END_MONTH;
}

function isWeekend(date) {
  return WEEKEND_DAYS.includes(new Date(date).getDay());
}

function calculateRentalDays(pickupDate, dropoffDate) {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const pickup = new Date(pickupDate);
  const dropoff = new Date(dropoffDate);
  return Math.round(Math.abs((dropoff - pickup) / MS_PER_DAY)) + 1;
}

function formatPrice(value) {
  const rounded = Math.round(value * 100) / 100;
  return `$${rounded % 1 === 0 ? rounded : rounded}`;
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validateRentalEligibility(age, carClass, licenseYears) {
  if (age < MIN_RENTAL_AGE) {
    return "Driver too young - cannot quote the price";
  }

  if (age <= MAX_AGE_COMPACT_ONLY && carClass !== "Compact") {
    return "Drivers 21 y/o or less can only rent Compact vehicles";
  }

  if (!CAR_CLASSES.includes(carClass)) {
    return "Unknown car class";
  }

  if (licenseYears < MIN_LICENSE_YEARS_TO_RENT) {
    return "Driver license held for less than a year - cannot rent";
  }

  return null;
}

// ─── Price modifiers ──────────────────────────────────────────────────────────

function applyRacerYoungDriverSurcharge(rentalPrice, carClass, age, highSeason) {
  if (carClass === "Racer" && age <= MAX_AGE_RACER_SURCHARGE && highSeason) {
    return rentalPrice * RACER_YOUNG_DRIVER_MULTIPLIER;
  }
  return rentalPrice;
}

function applyHighSeasonSurcharge(rentalPrice, highSeason) {
  if (highSeason) {
    return rentalPrice * HIGH_SEASON_MULTIPLIER;
  }
  return rentalPrice;
}

function applyLongRentalDiscount(rentalPrice, days, highSeason) {
  if (days > LONG_RENTAL_MIN_DAYS && !highSeason) {
    return rentalPrice * LONG_RENTAL_DISCOUNT;
  }
  return rentalPrice;
}

function applyInexperiencedDriverSurcharge(rentalPrice, licenseYears) {
  if (licenseYears < LICENSE_YEARS_SURCHARGE_THRESHOLD) {
    return rentalPrice * INEXPERIENCED_DRIVER_MULTIPLIER;
  }
  return rentalPrice;
}

function applyInexperiencedDriverHighSeasonSurcharge(rentalPrice, licenseYears, days, highSeason) {
  if (licenseYears < LICENSE_YEARS_HIGH_SEASON_SURCHARGE_THRESHOLD && highSeason) {
    return rentalPrice + INEXPERIENCED_DRIVER_HIGH_SEASON_SURCHARGE * days;
  }
  return rentalPrice;
}

function calculateDailyPrice(baseDaily, date) {
  return isWeekend(date) ? baseDaily * WEEKEND_MULTIPLIER : baseDaily;
}

// ─── Main function ────────────────────────────────────────────────────────────

function price(pickup, dropoff, pickupDate, dropoffDate, type, age, licenseYears) {
  const eligibilityError = validateRentalEligibility(age, type, licenseYears);
  if (eligibilityError) {
    return eligibilityError;
  }

  const days = calculateRentalDays(pickupDate, dropoffDate);
  const highSeason = isHighSeason(pickupDate);

  let rentalPrice = 0;
  for (let i = 0; i < days; i += 1) {
    const currentDate = new Date(pickupDate);
    currentDate.setDate(currentDate.getDate() + i);
    rentalPrice += calculateDailyPrice(age, currentDate);
  }

  rentalPrice = applyRacerYoungDriverSurcharge(rentalPrice, type, age, highSeason);
  rentalPrice = applyHighSeasonSurcharge(rentalPrice, highSeason);
  rentalPrice = applyLongRentalDiscount(rentalPrice, days, highSeason);
  rentalPrice = applyInexperiencedDriverSurcharge(rentalPrice, licenseYears);
  rentalPrice = applyInexperiencedDriverHighSeasonSurcharge(
    rentalPrice,
    licenseYears,
    days,
    highSeason
  );

  return formatPrice(rentalPrice);
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  price,
  validateRentalEligibility,
  isHighSeason,
  isWeekend,
  calculateRentalDays,
  applyRacerYoungDriverSurcharge,
  applyHighSeasonSurcharge,
  applyLongRentalDiscount,
  applyInexperiencedDriverSurcharge,
  applyInexperiencedDriverHighSeasonSurcharge,
  calculateDailyPrice
};

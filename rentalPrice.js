//Constants

const CAR_CLASSES = ["Compact", "Electric", "Cabrio", "Racer"];

const MIN_RENTAL_AGE = 18;
const MAX_AGE_COMPACT_ONLY = 21;
const MAX_AGE_RACER_SURCHARGE = 25;
const MIN_LICENSE_YEARS_TO_RENT = 1;

const RACER_YOUNG_DRIVER_MULTIPLIER = 1.5;
const HIGH_SEASON_MULTIPLIER = 1.15;
const LONG_RENTAL_DISCOUNT = 0.9;
const INEXPERIENCED_DRIVER_MULTIPLIER = 1.3;
const INEXPERIENCED_DRIVER_HIGH_SEASON_SURCHARGE = 15;

const LONG_RENTAL_MIN_DAYS = 10;
const LICENSE_YEARS_SURCHARGE_THRESHOLD = 2;
const LICENSE_YEARS_HIGH_SEASON_SURCHARGE_THRESHOLD = 3;

const HIGH_SEASON_START_MONTH = 3; // April (0-indexed)
const HIGH_SEASON_END_MONTH = 9;   // October (0-indexed)

//Validation

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
    return "Driver must hold a license for at least 1 year";
  }

  return null; // eligible
}

//Season

function isHighSeason(date) {
  const month = new Date(date).getMonth();
  return month >= HIGH_SEASON_START_MONTH && month <= HIGH_SEASON_END_MONTH;
}

//Days

function calculateRentalDays(pickupDate, dropoffDate) {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const pickup = new Date(pickupDate);
  const dropoff = new Date(dropoffDate);
  return Math.round(Math.abs((dropoff - pickup) / MS_PER_DAY)) + 1;
}

//Price modifiers 

function applyRacerYoungDriverSurcharge(price, carClass, age, highSeason) {
  if (carClass === "Racer" && age <= MAX_AGE_RACER_SURCHARGE && highSeason) {
    return price * RACER_YOUNG_DRIVER_MULTIPLIER;
  }
  return price;
}

function applyHighSeasonSurcharge(price, highSeason) {
  if (highSeason) {
    return price * HIGH_SEASON_MULTIPLIER;
  }
  return price;
}

function applyLongRentalDiscount(price, days, highSeason) {
  if (days > LONG_RENTAL_MIN_DAYS && !highSeason) {
    return price * LONG_RENTAL_DISCOUNT;
  }
  return price;
}

function applyInexperiencedDriverSurcharge(price, licenseYears, highSeason) {
  if (licenseYears < LICENSE_YEARS_SURCHARGE_THRESHOLD) {
    price *= INEXPERIENCED_DRIVER_MULTIPLIER;
  }
  return price;
}

function applyInexperiencedDriverHighSeasonSurcharge(price, licenseYears, days, highSeason) {
  if (licenseYears < LICENSE_YEARS_HIGH_SEASON_SURCHARGE_THRESHOLD && highSeason) {
    price += INEXPERIENCED_DRIVER_HIGH_SEASON_SURCHARGE * days;
  }
  return price;
}

//Main function

function calculatePrice(pickupDate, dropoffDate, carClass, age, licenseYears) {
  const eligibilityError = validateRentalEligibility(age, carClass, licenseYears);
  if (eligibilityError) {
    return eligibilityError;
  }

  const days = calculateRentalDays(pickupDate, dropoffDate);
  const highSeason = isHighSeason(pickupDate);

  let rentalPrice = age * days;

  rentalPrice = applyRacerYoungDriverSurcharge(rentalPrice, carClass, age, highSeason);
  rentalPrice = applyHighSeasonSurcharge(rentalPrice, highSeason);
  rentalPrice = applyLongRentalDiscount(rentalPrice, days, highSeason);
  rentalPrice = applyInexperiencedDriverSurcharge(rentalPrice, licenseYears, highSeason);
  rentalPrice = applyInexperiencedDriverHighSeasonSurcharge(rentalPrice, licenseYears, days, highSeason);

  return '$' + rentalPrice.toFixed(2);
}

//Exports 

module.exports = {
  calculatePrice,
  validateRentalEligibility,
  isHighSeason,
  calculateRentalDays,
  applyRacerYoungDriverSurcharge,
  applyHighSeasonSurcharge,
  applyLongRentalDiscount,
  applyInexperiencedDriverSurcharge,
  applyInexperiencedDriverHighSeasonSurcharge,
};
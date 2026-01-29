// Constants for business rules
const MINIMUM_AGE = 18;
const YOUNG_DRIVER_AGE_LIMIT = 21;
const RACER_SURCHARGE_AGE_LIMIT = 25;
const LONG_RENTAL_DAYS_THRESHOLD = 10;
const MINIMUM_LICENSE_YEARS = 1;
const INEXPERIENCED_DRIVER_LICENSE_YEARS = 2;
const NOVICE_DRIVER_LICENSE_YEARS = 3;

const HIGH_SEASON_START_MONTH = 3; // April (0-indexed: January = 0, so April = 3)
const HIGH_SEASON_END_MONTH = 9; // October (0-indexed: October = 9)

const RACER_YOUNG_DRIVER_MULTIPLIER = 1.5;
const HIGH_SEASON_MULTIPLIER = 1.15;
const LONG_RENTAL_DISCOUNT = 0.9;
const INEXPERIENCED_DRIVER_MULTIPLIER = 1.3;
const NOVICE_DRIVER_HIGH_SEASON_DAILY_SURCHARGE = 15;

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

const CAR_TYPES = {
  COMPACT: "Compact",
  ELECTRIC: "Electric",
  CABRIO: "Cabrio",
  RACER: "Racer"
};

const SEASONS = {
  HIGH: "High",
  LOW: "Low"
};

function price(pickup, dropoff, pickupDate, dropoffDate, type, age, licenseYears) {
  const carType = getCarType(type);
  const rentalDays = calculateRentalDays(pickupDate, dropoffDate);
  const season = getSeason(pickupDate, dropoffDate);

  // Validate driver eligibility
  const eligibilityError = validateDriverEligibility(age, licenseYears, carType);
  if (eligibilityError) {
    return eligibilityError;
  }

  // Calculate base price
  let rentalPrice = calculateBasePrice(age, rentalDays);

  // Apply car type and age-based surcharges
  rentalPrice = applyRacerSurcharge(rentalPrice, carType, age, season);

  // Apply license experience surcharges
  rentalPrice = applyLicenseExperienceSurcharges(rentalPrice, licenseYears, season, rentalDays);

  // Apply seasonal pricing
  rentalPrice = applySeasonalPricing(rentalPrice, season);

  // Apply long rental discount
  rentalPrice = applyLongRentalDiscount(rentalPrice, rentalDays, season);

  // Round to 2 decimal places to avoid floating point precision issues
  rentalPrice = Math.round(rentalPrice * 100) / 100;

  return '$' + rentalPrice;
}

function validateDriverEligibility(age, licenseYears, carType) {
  if (age < MINIMUM_AGE) {
    return "Driver too young - cannot quote the price";
  }

  if (licenseYears < MINIMUM_LICENSE_YEARS) {
    return "Driver license held for less than 1 year - cannot rent";
  }

  if (age <= YOUNG_DRIVER_AGE_LIMIT && carType !== CAR_TYPES.COMPACT) {
    return "Drivers 21 y/o or less can only rent Compact vehicles";
  }

  return null;
}

function calculateBasePrice(age, rentalDays) {
  return age * rentalDays;
}

function applyRacerSurcharge(rentalPrice, carType, age, season) {
  if (carType === CAR_TYPES.RACER && age <= RACER_SURCHARGE_AGE_LIMIT && season === SEASONS.HIGH) {
    return rentalPrice * RACER_YOUNG_DRIVER_MULTIPLIER;
  }
  return rentalPrice;
}

function applyLicenseExperienceSurcharges(rentalPrice, licenseYears, season, rentalDays) {
  let price = rentalPrice;

  // 30% surcharge for drivers with less than 2 years of license
  if (licenseYears < INEXPERIENCED_DRIVER_LICENSE_YEARS) {
    price *= INEXPERIENCED_DRIVER_MULTIPLIER;
  }

  // 15 euro per day surcharge during high season for drivers with less than 3 years of license
  if (licenseYears < NOVICE_DRIVER_LICENSE_YEARS && season === SEASONS.HIGH) {
    price += NOVICE_DRIVER_HIGH_SEASON_DAILY_SURCHARGE * rentalDays;
  }

  return price;
}

function applySeasonalPricing(rentalPrice, season) {
  if (season === SEASONS.HIGH) {
    return rentalPrice * HIGH_SEASON_MULTIPLIER;
  }
  return rentalPrice;
}

function applyLongRentalDiscount(rentalPrice, rentalDays, season) {
  if (rentalDays > LONG_RENTAL_DAYS_THRESHOLD && season === SEASONS.LOW) {
    return rentalPrice * LONG_RENTAL_DISCOUNT;
  }
  return rentalPrice;
}

function getCarType(type) {
  const normalizedType = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  
  switch (normalizedType) {
    case CAR_TYPES.COMPACT:
      return CAR_TYPES.COMPACT;
    case CAR_TYPES.ELECTRIC:
      return CAR_TYPES.ELECTRIC;
    case CAR_TYPES.CABRIO:
      return CAR_TYPES.CABRIO;
    case CAR_TYPES.RACER:
      return CAR_TYPES.RACER;
    default:
      return "Unknown";
  }
}

function calculateRentalDays(pickupDate, dropoffDate) {
  const firstDate = new Date(pickupDate);
  const secondDate = new Date(dropoffDate);

  return Math.round(Math.abs((firstDate - secondDate) / MILLISECONDS_PER_DAY)) + 1;
}

function getSeason(pickupDate, dropoffDate) {
  const pickup = new Date(pickupDate);
  const dropoff = new Date(dropoffDate);

  const pickupMonth = pickup.getMonth();
  const dropoffMonth = dropoff.getMonth();

  const isHighSeason = (
    (pickupMonth >= HIGH_SEASON_START_MONTH && pickupMonth <= HIGH_SEASON_END_MONTH) ||
    (dropoffMonth >= HIGH_SEASON_START_MONTH && dropoffMonth <= HIGH_SEASON_END_MONTH) ||
    (pickupMonth < HIGH_SEASON_START_MONTH && dropoffMonth > HIGH_SEASON_END_MONTH)
  );

  return isHighSeason ? SEASONS.HIGH : SEASONS.LOW;
}

exports.price = price;
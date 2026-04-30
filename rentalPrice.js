const CAR_CLASSES = {
  COMPACT: "Compact",
  ELECTRIC: "Electric",
  CABRIO: "Cabrio",
  RACER: "Racer"
};

const CAR_CLASS_ALIASES = {
  compact: CAR_CLASSES.COMPACT,
  Compact: CAR_CLASSES.COMPACT,
  electric: CAR_CLASSES.ELECTRIC,
  Electric: CAR_CLASSES.ELECTRIC,
  cabrio: CAR_CLASSES.CABRIO,
  Cabrio: CAR_CLASSES.CABRIO,
  racer: CAR_CLASSES.RACER,
  Racer: CAR_CLASSES.RACER
};

const MINIMUM_DRIVER_AGE = 18;
const COMPACT_ONLY_MAX_AGE = 21;
const RACER_SURCHARGE_MAX_AGE = 25;

const APRIL = 3;
const OCTOBER = 9;
const SATURDAY = 6;
const SUNDAY = 0;

const HIGH_SEASON_MULTIPLIER = 1.15;
const LONG_RENTAL_DISCOUNT = 0.9;
const RACER_SURCHARGE_MULTIPLIER = 1.5;
const NEW_LICENSE_MULTIPLIER = 1.3;
const HIGH_SEASON_LICENSE_FEE = 15;
const WEEKEND_MULTIPLIER = 1.05;

function getCarClass(type) {
  return CAR_CLASS_ALIASES[type] || "Unknown";
}

function getDate(value) {
  return new Date(value);
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getRentalDays(pickupDate, dropoffDate) {
  const oneDay = 24 * 60 * 60 * 1000;
  const startDate = getDate(pickupDate);
  const endDate = getDate(dropoffDate);

  return Math.round(Math.abs((endDate - startDate) / oneDay)) + 1;
}

function isHighSeason(date) {
  const month = date.getMonth();
  return month >= APRIL && month <= OCTOBER;
}

function isWeekend(date) {
  const day = date.getDay();
  return day === SATURDAY || day === SUNDAY;
}

function hasHighSeasonDay(pickupDate, dropoffDate) {
  const days = getRentalDays(pickupDate, dropoffDate);
  const startDate = getDate(pickupDate);

  for (let dayIndex = 0; dayIndex < days; dayIndex += 1) {
    if (isHighSeason(addDays(startDate, dayIndex))) {
      return true;
    }
  }

  return false;
}

function formatPrice(totalPrice) {
  const roundedPrice = Number(totalPrice.toFixed(2));

  if (Number.isInteger(roundedPrice)) {
    return `$${roundedPrice}`;
  }

  return `$${roundedPrice.toFixed(2)}`;
}

function isLowSeasonRange(pickupDate, dropoffDate) {
  return !hasHighSeasonDay(pickupDate, dropoffDate);
}

function getLicenseYears(licenseYears) {
  if (Number.isNaN(licenseYears) || licenseYears === undefined) {
    return 10;
  }

  return licenseYears;
}

function getValidationError(age, licenseYears, carClass) {
  if (age < MINIMUM_DRIVER_AGE) {
    return "Driver too young - cannot quote the price";
  }

  if (licenseYears < 1) {
    return "License less than 1 year - cannot rent";
  }

  if (age <= COMPACT_ONLY_MAX_AGE && carClass !== CAR_CLASSES.COMPACT) {
    return "Drivers 21 y/o or less can only rent Compact vehicles";
  }

  if (carClass === "Unknown") {
    return "Unknown car class - cannot quote the price";
  }

  return null;
}

function getWeekendFee(pickupDate, days, age) {
  let weekendFee = 0;
  const startDate = getDate(pickupDate);

  for (let dayIndex = 0; dayIndex < days; dayIndex += 1) {
    const date = addDays(startDate, dayIndex);

    if (isWeekend(date)) {
      weekendFee += age * (WEEKEND_MULTIPLIER - 1);
    }
  }

  return weekendFee;
}

function getHighSeasonLicenseFee(pickupDate, days, licenseYears) {
  let licenseFee = 0;
  const startDate = getDate(pickupDate);

  for (let dayIndex = 0; dayIndex < days; dayIndex += 1) {
    const date = addDays(startDate, dayIndex);

    if (licenseYears < 3 && isHighSeason(date)) {
      licenseFee += HIGH_SEASON_LICENSE_FEE;
    }
  }

  return licenseFee;
}

function applyHighSeasonPrice(totalPrice, isRentalHighSeason) {
  if (isRentalHighSeason) {
    return totalPrice * HIGH_SEASON_MULTIPLIER;
  }

  return totalPrice;
}

function applyRacerPrice(totalPrice, carClass, age, isRentalLowSeason) {
  const isYoungRacer = carClass === CAR_CLASSES.RACER
    && age <= RACER_SURCHARGE_MAX_AGE;

  if (isYoungRacer && !isRentalLowSeason) {
    return totalPrice * RACER_SURCHARGE_MULTIPLIER;
  }

  return totalPrice;
}

function applyLicensePrice(totalPrice, licenseYears) {
  if (licenseYears < 2) {
    return totalPrice * NEW_LICENSE_MULTIPLIER;
  }

  return totalPrice;
}

function applyLongRentalDiscount(totalPrice, days, isRentalLowSeason) {
  if (days > 10 && isRentalLowSeason) {
    return totalPrice * LONG_RENTAL_DISCOUNT;
  }

  return totalPrice;
}

function calculateBasePrice(pickupDate, dropoffDate, days, age, licenseYears) {
  let totalPrice = age * days;

  totalPrice += getWeekendFee(getDate(pickupDate), days, age);
  totalPrice += getHighSeasonLicenseFee(getDate(pickupDate), days, licenseYears);

  return totalPrice;
}

function applyPriceModifiers(
  totalPrice,
  carClass,
  age,
  days,
  licenseYears,
  pickupDate,
  dropoffDate
) {
  const isRentalHighSeason = hasHighSeasonDay(pickupDate, dropoffDate);
  const isRentalLowSeason = isLowSeasonRange(pickupDate, dropoffDate);

  let result = applyHighSeasonPrice(totalPrice, isRentalHighSeason);

  result = applyRacerPrice(result, carClass, age, isRentalLowSeason);
  result = applyLicensePrice(result, licenseYears);
  result = applyLongRentalDiscount(result, days, isRentalLowSeason);

  return result;
}

function price(pickup, dropoff, pickupDate, dropoffDate, type, age, licenseYears) {
  const carClass = getCarClass(type);
  const validLicenseYears = getLicenseYears(licenseYears);
  const validationError = getValidationError(age, validLicenseYears, carClass);

  if (validationError) {
    return validationError;
  }

  const days = getRentalDays(pickupDate, dropoffDate);
  const basePrice = calculateBasePrice(pickupDate, dropoffDate, days, age, validLicenseYears);
  const totalPrice = applyPriceModifiers(
    basePrice,
    carClass,
    age,
    days,
    validLicenseYears,
    pickupDate,
    dropoffDate
  );

  return formatPrice(totalPrice);
}

exports.price = price;
exports.getRentalDays = getRentalDays;
exports.isHighSeason = isHighSeason;
exports.isWeekend = isWeekend;
exports.getHighSeasonLicenseFee = getHighSeasonLicenseFee;
exports.getWeekendFee = getWeekendFee;

const CAR_TYPES = {
  COMPACT: "Compact",
  ELECTRIC: "Electric",
  CABRIO: "Cabrio",
  RACER: "Racer"
};

const SEASONS = {
  LOW: "Low",
  HIGH: "High"
};

const MESSAGES = {
  TOO_YOUNG: "Driver too young - cannot quote the price",
  ONLY_COMPACT: "Drivers 21 y/o or less can only rent Compact vehicles",
  LICENSE_TOO_NEW: "Driver has held license for less than 1 year - cannot quote the price"
};

const MIN_DRIVER_AGE = 18;
const COMPACT_ONLY_MAX_AGE = 21;
const RACER_EXTRA_PRICE_MAX_AGE = 25;
const LONG_RENTAL_DISCOUNT_DAYS = 10;
const HIGH_SEASON_EXTRA_PERCENT = 0.15;
const LOW_SEASON_LONG_RENTAL_DISCOUNT = 0.10;
const RACER_HIGH_SEASON_SURCHARGE = 0.50;
const NEW_DRIVER_SURCHARGE = 0.30;
const WEEKEND_SURCHARGE = 0.05;
const NEW_DRIVER_HIGH_SEASON_DAILY_FEE = 15;
const MIN_LICENSE_YEARS = 1;
const NEW_DRIVER_SURCHARGE_LICENSE_YEARS = 2;
const HIGH_SEASON_DAILY_FEE_LICENSE_YEARS = 3;

function createUtcDate(value) {
  const date = new Date(value);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function getSeason(dateValue) {
  const month = createUtcDate(dateValue).getUTCMonth();
  const isHighSeasonMonth = month >= 3 && month <= 9;

  return isHighSeasonMonth ? SEASONS.HIGH : SEASONS.LOW;
}

function isWeekend(dateValue) {
  const day = createUtcDate(dateValue).getUTCDay();
  return day === 0 || day === 6;
}

function formatPrice(amount) {
  if (Number.isInteger(amount)) {
    return `$${amount}`;
  }

  return `$${amount.toFixed(2)}`;
}

function validateDriver(age, type, licenseYears) {
  if (age < MIN_DRIVER_AGE) {
    return MESSAGES.TOO_YOUNG;
  }

  if (licenseYears < MIN_LICENSE_YEARS) {
    return MESSAGES.LICENSE_TOO_NEW;
  }

  if (age <= COMPACT_ONLY_MAX_AGE && type !== CAR_TYPES.COMPACT) {
    return MESSAGES.ONLY_COMPACT;
  }

  return null;
}

function calculateDailyPrice(date, type, age, licenseYears) {
  let dailyPrice = age;
  const season = getSeason(date);

  if (type === CAR_TYPES.RACER && age <= RACER_EXTRA_PRICE_MAX_AGE && season === SEASONS.HIGH) {
    dailyPrice *= 1 + RACER_HIGH_SEASON_SURCHARGE;
  }

  if (licenseYears < NEW_DRIVER_SURCHARGE_LICENSE_YEARS) {
    dailyPrice *= 1 + NEW_DRIVER_SURCHARGE;
  }

  if (season === SEASONS.HIGH) {
    dailyPrice *= 1 + HIGH_SEASON_EXTRA_PERCENT;

    if (licenseYears < HIGH_SEASON_DAILY_FEE_LICENSE_YEARS) {
      dailyPrice += NEW_DRIVER_HIGH_SEASON_DAILY_FEE;
    }
  }

  if (isWeekend(date)) {
    dailyPrice *= 1 + WEEKEND_SURCHARGE;
  }

  return dailyPrice;
}

function getRentalDates(pickupDate, dropoffDate) {
  const startDate = createUtcDate(pickupDate);
  const endDate = createUtcDate(dropoffDate);

  if (startDate > endDate) {
    throw new Error("Pickup date must be before or equal to dropoff date");
  }

  const rentalDates = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    rentalDates.push(new Date(currentDate));
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  return rentalDates;
}

function getRentalDays(pickupDate, dropoffDate) {
  return getRentalDates(pickupDate, dropoffDate).length;
}

function everyDayIsLowSeason(rentalDates) {
  return rentalDates.every((date) => getSeason(date) === SEASONS.LOW);
}

function price(
  pickup,
  dropoff,
  pickupDate,
  dropoffDate,
  type,
  age,
  licenseYears = HIGH_SEASON_DAILY_FEE_LICENSE_YEARS
) {
  const validationMessage = validateDriver(age, type, licenseYears);

  if (validationMessage) {
    return validationMessage;
  }

  const rentalDays = getRentalDays(pickupDate, dropoffDate);
  const rentalDates = getRentalDates(pickupDate, dropoffDate);
  const totalPrice = rentalDates.reduce(
    (sum, rentalDate) => sum + calculateDailyPrice(rentalDate, type, age, licenseYears),
    0
  );

  if (rentalDays > LONG_RENTAL_DISCOUNT_DAYS && everyDayIsLowSeason(rentalDates)) {
    return formatPrice(totalPrice * (1 - LOW_SEASON_LONG_RENTAL_DISCOUNT));
  }

  return formatPrice(totalPrice);
}

module.exports = {
  price,
  calculateDailyPrice,
  createUtcDate,
  everyDayIsLowSeason,
  formatPrice,
  getRentalDates,
  getRentalDays,
  getSeason,
  isWeekend,
  validateDriver,
  CAR_TYPES,
  MESSAGES,
  SEASONS
};

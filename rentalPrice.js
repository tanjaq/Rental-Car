const CAR_CLASSES = Object.freeze({
  COMPACT: "Compact",
  ELECTRIC: "Electric",
  CABRIO: "Cabrio",
  RACER: "Racer",
  UNKNOWN: "Unknown"
});

const SEASONS = Object.freeze({
  HIGH: "High",
  LOW: "Low"
});

const MINIMUM_DRIVER_AGE = 18;
const COMPACT_ONLY_AGE_LIMIT = 21;
const RACER_SURCHARGE_AGE_LIMIT = 25;
const MINIMUM_LICENSE_YEARS = 1;
const LICENSE_SURCHARGE_YEARS = 2;
const HIGH_SEASON_DAILY_FEE_YEARS = 3;
const LONG_RENTAL_DISCOUNT_DAYS = 10;
const HIGH_SEASON_START_MONTH = 3;
const HIGH_SEASON_END_MONTH = 9;
const WEEKEND_SURCHARGE_RATE = 0.05;
const RACER_SURCHARGE_RATE = 0.5;
const HIGH_SEASON_SURCHARGE_RATE = 0.15;
const LOW_SEASON_LONG_RENTAL_DISCOUNT_RATE = 0.1;
const NEW_DRIVER_SURCHARGE_RATE = 0.3;
const HIGH_SEASON_NEW_DRIVER_DAILY_FEE = 15;
const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;
const WEEKEND_DAY_INDEXES = [0, 6];

function getCarClass(type) {
  const normalizedType = String(type).trim().toLowerCase();

  switch (normalizedType) {
  case "compact":
    return CAR_CLASSES.COMPACT;
  case "electric":
    return CAR_CLASSES.ELECTRIC;
  case "cabrio":
    return CAR_CLASSES.CABRIO;
  case "racer":
    return CAR_CLASSES.RACER;
  default:
    return CAR_CLASSES.UNKNOWN;
  }
}

function getOrderedDates(pickupDate, dropoffDate) {
  const firstDate = new Date(pickupDate);
  const secondDate = new Date(dropoffDate);

  if (firstDate <= secondDate) {
    return { startDate: firstDate, endDate: secondDate };
  }

  return { startDate: secondDate, endDate: firstDate };
}

function isHighSeasonMonth(month) {
  return month >= HIGH_SEASON_START_MONTH && month <= HIGH_SEASON_END_MONTH;
}

function getRentalDays(pickupDate, dropoffDate) {
  const { startDate, endDate } = getOrderedDates(pickupDate, dropoffDate);
  const differenceInDays = Math.round((endDate - startDate) / MILLISECONDS_IN_DAY);

  return differenceInDays + 1;
}

function getSeason(pickupDate, dropoffDate) {
  const { startDate, endDate } = getOrderedDates(pickupDate, dropoffDate);
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    if (isHighSeasonMonth(currentDate.getMonth())) {
      return SEASONS.HIGH;
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return SEASONS.LOW;
}

function countWeekendDays(pickupDate, dropoffDate) {
  const { startDate, endDate } = getOrderedDates(pickupDate, dropoffDate);
  const currentDate = new Date(startDate);
  let weekendDays = 0;

  while (currentDate <= endDate) {
    if (WEEKEND_DAY_INDEXES.includes(currentDate.getDay())) {
      weekendDays += 1;
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return weekendDays;
}

function validateRental(age, carClass, licenseYears) {
  if (age < MINIMUM_DRIVER_AGE) {
    return "Driver too young - cannot quote the price";
  }

  if (age <= COMPACT_ONLY_AGE_LIMIT && carClass !== CAR_CLASSES.COMPACT) {
    return "Drivers 21 y/o or less can only rent Compact vehicles";
  }

  if (licenseYears < MINIMUM_LICENSE_YEARS) {
    return "Driver must hold a license for at least 1 year";
  }

  return null;
}

function calculateRentalPrice({
  pickupDate,
  dropoffDate,
  age,
  licenseYears,
  carClass,
  rentalDays,
  season
}) {
  const weekendDays = countWeekendDays(pickupDate, dropoffDate);
  const weekdayDays = rentalDays - weekendDays;
  const weekdayPrice = weekdayDays * age;
  const weekendPrice = weekendDays * age * (1 + WEEKEND_SURCHARGE_RATE);
  let totalPrice = weekdayPrice + weekendPrice;

  if (season === SEASONS.HIGH && licenseYears < HIGH_SEASON_DAILY_FEE_YEARS) {
    totalPrice += rentalDays * HIGH_SEASON_NEW_DRIVER_DAILY_FEE;
  }

  if (
    carClass === CAR_CLASSES.RACER
    && age <= RACER_SURCHARGE_AGE_LIMIT
    && season === SEASONS.HIGH
  ) {
    totalPrice *= 1 + RACER_SURCHARGE_RATE;
  }

  if (season === SEASONS.HIGH) {
    totalPrice *= 1 + HIGH_SEASON_SURCHARGE_RATE;
  }

  if (season === SEASONS.LOW && rentalDays > LONG_RENTAL_DISCOUNT_DAYS) {
    totalPrice *= 1 - LOW_SEASON_LONG_RENTAL_DISCOUNT_RATE;
  }

  if (licenseYears < LICENSE_SURCHARGE_YEARS) {
    totalPrice *= 1 + NEW_DRIVER_SURCHARGE_RATE;
  }

  return totalPrice;
}
function formatPrice(amount) {
  const formattedAmount = amount.toFixed(2).replace(/\.00$/, "");

  return `$${formattedAmount}`;
}

function price(pickup, dropoff, pickupDate, dropoffDate, type, age, licenseYears = Infinity) {
  const carClass = getCarClass(type);
  const rentalDays = getRentalDays(pickupDate, dropoffDate);
  const season = getSeason(pickupDate, dropoffDate);
  const validationError = validateRental(age, carClass, licenseYears);

  if (validationError) {
    return validationError;
  }

  return formatPrice(calculateRentalPrice({
    pickupDate,
    dropoffDate,
    age,
    licenseYears,
    carClass,
    rentalDays,
    season
  }));
}

module.exports = {
  price,
  getCarClass,
  getRentalDays,
  getSeason,
  countWeekendDays
};

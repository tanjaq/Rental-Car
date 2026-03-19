
const MIN_DRIVER_AGE = 18;
const YOUNG_DRIVER_MAX_AGE = 21;
const YOUNG_RACER_MAX_AGE = 25;

const HIGH_SEASON = 'High';
const LOW_SEASON = 'Low';
const HIGH_SEASON_START_MONTH = 3;
const HIGH_SEASON_END_MONTH = 9;

const MIN_LICENSE_YEARS = 1;
const LICENSE_SURCHARGE_THRESHOLD = 2;
const HIGH_SEASON_LICENSE_THRESHOLD = 3;

const HIGH_SEASON_MULTIPLIER = 1.15;
const SHORT_LICENSE_MULTIPLIER = 1.3;
const RACER_MULTIPLIER = 1.5;
const WEEKEND_MULTIPLIER = 1.05;
const LONG_RENTAL_DISCOUNT_MULTIPLIER = 0.9;
const LONG_RENTAL_DISCOUNT_DAYS = 10;
const HIGH_SEASON_DAILY_LICENSE_SURCHARGE = 15;

const TOO_YOUNG_MESSAGE = 'Driver too young - cannot quote the price';
const COMPACT_ONLY_MESSAGE = 'Drivers 21 y/o or less can only rent Compact vehicles';
const SHORT_LICENSE_MESSAGE = "Drivers with less than 1 year of driving experience cannot rent a car";

const CAR_CLASS_BY_TYPE = {
  compact: 'Compact',
  electric: 'Electric',
  cabrio: 'Cabrio',
  racer: 'Racer',
};

function price(pickup, dropoff, pickupDate, dropoffDate, type, age, licenseYearsHeld = Number.POSITIVE_INFINITY) {
  const carClass = normalizeCarClass(type);
  const rentalDays = getRentalDays(pickupDate, dropoffDate);
  const season = getSeason(pickupDate, dropoffDate);
  const eligibilityError = validateEligibility(age, carClass, licenseYearsHeld);

  if (eligibilityError) {
    return eligibilityError;
  }

  const dailyPrice = getDailyPrice(age, season, licenseYearsHeld);
  const baseRentalPrice = getBaseRentalPrice(dailyPrice, pickupDate, dropoffDate);
  const totalPrice = applyPriceRules(baseRentalPrice, {
    carClass,
    age,
    season,
    rentalDays,
    licenseYearsHeld,
  });

  return `$${formatPrice(totalPrice)}`;
}

function normalizeCarClass(type) {
  const normalizedType = String(type).trim().toLowerCase();

  return CAR_CLASS_BY_TYPE[normalizedType] || 'Unknown';
}

function getRentalDays(pickupDate, dropoffDate) {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const firstDate = new Date(pickupDate);
  const secondDate = new Date(dropoffDate);
  const differenceInDays = Math.round(Math.abs((firstDate - secondDate) / millisecondsPerDay));

  return differenceInDays + 1;
}

function getSeason(pickupDate, dropoffDate) {
  const { startDate, endDate } = getSortedDates(pickupDate, dropoffDate);
  const monthCursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const endMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

  while (monthCursor <= endMonth) {
    if (isHighSeasonMonth(monthCursor.getMonth())) {
      return HIGH_SEASON;
    }

    monthCursor.setMonth(monthCursor.getMonth() + 1);
  }

  return LOW_SEASON;
}

function getSortedDates(firstDateValue, secondDateValue) {
  const firstDate = new Date(firstDateValue);
  const secondDate = new Date(secondDateValue);

  if (firstDate <= secondDate) {
    return { startDate: firstDate, endDate: secondDate };
  }

  return { startDate: secondDate, endDate: firstDate };
}

function isHighSeasonMonth(month) {
  return month >= HIGH_SEASON_START_MONTH && month <= HIGH_SEASON_END_MONTH;
}

function validateEligibility(age, carClass, licenseYearsHeld) {
  if (age < MIN_DRIVER_AGE) {
    return TOO_YOUNG_MESSAGE;
  }

  if (licenseYearsHeld < MIN_LICENSE_YEARS) {
    return SHORT_LICENSE_MESSAGE;
  }

  if (age <= YOUNG_DRIVER_MAX_AGE && carClass !== 'Compact') {
    return COMPACT_ONLY_MESSAGE;
  }

  return null;
}

function getDailyPrice(age, season, licenseYearsHeld) {
  let dailyPrice = age;

  if (season === HIGH_SEASON && licenseYearsHeld < HIGH_SEASON_LICENSE_THRESHOLD) {
    dailyPrice += HIGH_SEASON_DAILY_LICENSE_SURCHARGE;
  }

  return dailyPrice;
}

function getBaseRentalPrice(dailyPrice, pickupDate, dropoffDate) {
  let totalPrice = 0;

  for (const rentalDate of getRentalDates(pickupDate, dropoffDate)) {
    totalPrice += getDailyRateForDate(dailyPrice, rentalDate);
  }

  return totalPrice;
}

function getRentalDates(pickupDate, dropoffDate) {
  const { startDate, endDate } = getSortedDates(pickupDate, dropoffDate);
  const currentDate = new Date(startDate);
  const rentalDates = [];

  while (currentDate <= endDate) {
    rentalDates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return rentalDates;
}

function getDailyRateForDate(dailyPrice, rentalDate) {
  if (isWeekend(rentalDate)) {
    return dailyPrice * WEEKEND_MULTIPLIER;
  }

  return dailyPrice;
}

function isWeekend(date) {
  const dayOfWeek = date.getDay();

  return dayOfWeek === 0 || dayOfWeek === 6;
}

function applyPriceRules(basePrice, rentalDetails) {
  let totalPrice = basePrice;

  if (shouldApplyRacerSurcharge(rentalDetails)) {
    totalPrice *= RACER_MULTIPLIER;
  }

  if (rentalDetails.season === HIGH_SEASON) {
    totalPrice *= HIGH_SEASON_MULTIPLIER;
  }

  if (rentalDetails.season === LOW_SEASON && rentalDetails.rentalDays > LONG_RENTAL_DISCOUNT_DAYS) {
    totalPrice *= LONG_RENTAL_DISCOUNT_MULTIPLIER;
  }

  if (rentalDetails.licenseYearsHeld < LICENSE_SURCHARGE_THRESHOLD) {
    totalPrice *= SHORT_LICENSE_MULTIPLIER;
  }

  return totalPrice;
}

function shouldApplyRacerSurcharge({ carClass, age, season }) {
  return carClass === 'Racer' && age <= YOUNG_RACER_MAX_AGE && season === HIGH_SEASON;
}

function formatPrice(priceValue) {
  return Number(priceValue.toFixed(2));
}

exports.price = price;
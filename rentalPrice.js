const MIN_DRIVER_AGE = 18;
const YOUNG_DRIVER_MAX_AGE = 21;
const YOUNG_RACER_MAX_AGE = 25;

const HIGH_SEASON = "High";
const LOW_SEASON = "Low";
const HIGH_SEASON_START_MONTH = 3;
const HIGH_SEASON_END_MONTH = 9;

const MIN_LICENSE_YEARS = 1;
const LICENSE_SURCHARGE_THRESHOLD = 2;
const HIGH_SEASON_LICENSE_THRESHOLD = 3;
const UNRESTRICTED_LICENSE_YEARS = Number.POSITIVE_INFINITY;

const HIGH_SEASON_MULTIPLIER = 1.15;
const SHORT_LICENSE_MULTIPLIER = 1.3;
const RACER_MULTIPLIER = 1.5;
const WEEKEND_MULTIPLIER = 1.05;
const LONG_RENTAL_DISCOUNT_MULTIPLIER = 0.9;
const LONG_RENTAL_DISCOUNT_DAYS = 10;
const HIGH_SEASON_DAILY_LICENSE_SURCHARGE = 15;

const TOO_YOUNG_MESSAGE = "Driver too young - cannot quote the price";
const COMPACT_ONLY_MESSAGE = "Drivers 21 y/o or less can only rent Compact vehicles";
const SHORT_LICENSE_MESSAGE = [
  "Drivers with less than 1 year of driving experience",
  "cannot rent a car"
].join(" ");

const CAR_CLASS_BY_TYPE = {
  compact: "Compact",
  electric: "Electric",
  cabrio: "Cabrio",
  racer: "Racer"
};

function normalizeLicenseYearsHeld(licenseYearsHeld) {
  if (Number.isFinite(licenseYearsHeld)) {
    return licenseYearsHeld;
  }

  return UNRESTRICTED_LICENSE_YEARS;
}

function normalizeCarClass(type) {
  const normalizedType = String(type).trim().toLowerCase();

  return CAR_CLASS_BY_TYPE[normalizedType] || "Unknown";
}

function getSortedDates(firstDateValue, secondDateValue) {
  const firstDate = new Date(firstDateValue);
  const secondDate = new Date(secondDateValue);

  if (firstDate <= secondDate) {
    return { startDate: firstDate, endDate: secondDate };
  }

  return { startDate: secondDate, endDate: firstDate };
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

function getRentalDays(pickupDate, dropoffDate) {
  return getRentalDates(pickupDate, dropoffDate).length;
}

function isHighSeasonMonth(month) {
  return month >= HIGH_SEASON_START_MONTH && month <= HIGH_SEASON_END_MONTH;
}

function getSeason(pickupDate, dropoffDate) {
  const rentalDates = getRentalDates(pickupDate, dropoffDate);
  const includesHighSeason = rentalDates.some((rentalDate) => isHighSeasonMonth(
    rentalDate.getMonth()
  ));

  return includesHighSeason ? HIGH_SEASON : LOW_SEASON;
}

function validateEligibility(age, carClass, licenseYearsHeld) {
  if (age < MIN_DRIVER_AGE) {
    return TOO_YOUNG_MESSAGE;
  }

  if (licenseYearsHeld < MIN_LICENSE_YEARS) {
    return SHORT_LICENSE_MESSAGE;
  }

  if (age <= YOUNG_DRIVER_MAX_AGE && carClass !== "Compact") {
    return COMPACT_ONLY_MESSAGE;
  }

  return null;
}

function getDailyPrice(age, season, licenseYearsHeld) {
  if (
    season === HIGH_SEASON
    && licenseYearsHeld < HIGH_SEASON_LICENSE_THRESHOLD
  ) {
    return age + HIGH_SEASON_DAILY_LICENSE_SURCHARGE;
  }

  return age;
}

function isWeekend(date) {
  const dayOfWeek = date.getDay();

  return dayOfWeek === 0 || dayOfWeek === 6;
}

function getDailyRateForDate(dailyPrice, rentalDate) {
  if (isWeekend(rentalDate)) {
    return dailyPrice * WEEKEND_MULTIPLIER;
  }

  return dailyPrice;
}

function getBaseRentalPrice(dailyPrice, pickupDate, dropoffDate) {
  return getRentalDates(pickupDate, dropoffDate).reduce(
    (totalPrice, rentalDate) => (
      totalPrice + getDailyRateForDate(dailyPrice, rentalDate)
    ),
    0
  );
}

function shouldApplyRacerSurcharge({ carClass, age, season }) {
  return (
    carClass === "Racer"
    && age <= YOUNG_RACER_MAX_AGE
    && season === HIGH_SEASON
  );
}

function applyPriceRules(basePrice, rentalDetails) {
  let totalPrice = basePrice;

  if (shouldApplyRacerSurcharge(rentalDetails)) {
    totalPrice *= RACER_MULTIPLIER;
  }

  if (rentalDetails.season === HIGH_SEASON) {
    totalPrice *= HIGH_SEASON_MULTIPLIER;
  }

  if (
    rentalDetails.season === LOW_SEASON
    && rentalDetails.rentalDays > LONG_RENTAL_DISCOUNT_DAYS
  ) {
    totalPrice *= LONG_RENTAL_DISCOUNT_MULTIPLIER;
  }

  if (rentalDetails.licenseYearsHeld < LICENSE_SURCHARGE_THRESHOLD) {
    totalPrice *= SHORT_LICENSE_MULTIPLIER;
  }

  return totalPrice;
}

function formatPrice(priceValue) {
  return Number(priceValue.toFixed(2));
}

function price(
  pickup,
  dropoff,
  pickupDate,
  dropoffDate,
  type,
  age,
  licenseYearsHeld = UNRESTRICTED_LICENSE_YEARS
) {
  const normalizedLicenseYearsHeld = normalizeLicenseYearsHeld(
    licenseYearsHeld
  );
  const carClass = normalizeCarClass(type);
  const rentalDays = getRentalDays(pickupDate, dropoffDate);
  const season = getSeason(pickupDate, dropoffDate);
  const eligibilityError = validateEligibility(
    age,
    carClass,
    normalizedLicenseYearsHeld
  );

  if (eligibilityError) {
    return eligibilityError;
  }

  const dailyPrice = getDailyPrice(
    age,
    season,
    normalizedLicenseYearsHeld
  );
  const baseRentalPrice = getBaseRentalPrice(
    dailyPrice,
    pickupDate,
    dropoffDate
  );
  const totalPrice = applyPriceRules(baseRentalPrice, {
    carClass,
    age,
    season,
    rentalDays,
    licenseYearsHeld: normalizedLicenseYearsHeld
  });

  return `$${formatPrice(totalPrice)}`;
}

exports.price = price;

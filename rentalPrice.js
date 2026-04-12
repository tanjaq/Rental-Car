const MIN_AGE = 18;
const YOUNG_DRIVER_LIMIT = 21;
const RACER_YOUNG_DRIVER_LIMIT = 25;

const HIGH_SEASON_START = 3;
const HIGH_SEASON_END = 9;

const RACER_MULTIPLIER = 1.5;
const HIGH_SEASON_MULTIPLIER = 1.15;
const LONG_RENTAL_DISCOUNT = 0.9;

const LICENSE_LT_2_MULTIPLIER = 1.3;
const LICENSE_LT_3_HIGH_SEASON_DAILY_ADD = 15;

function getWeekdayMultiplier(date) {
  const day = new Date(date).getDay();
  return day === 0 || day === 6 ? 1.05 : 1;
}

function getCarClass(type) {
  const classes = {
    Compact: "Compact",
    Electric: "Electric",
    Cabrio: "Cabrio",
    Racer: "Racer"
  };

  return classes[type] || null;
}

function calculateRentalDays(pickupDate, dropoffDate) {
  const oneDayMs = 24 * 60 * 60 * 1000;

  const start = new Date(pickupDate);
  const end = new Date(dropoffDate);

  return Math.round(Math.abs((start - end) / oneDayMs)) + 1;
}

function getSeason(pickupDate, dropoffDate) {
  const start = new Date(pickupDate);
  const end = new Date(dropoffDate);

  const pickupMonth = start.getMonth();
  const dropoffMonth = end.getMonth();

  const isHighSeason = (pickupMonth >= HIGH_SEASON_START && pickupMonth <= HIGH_SEASON_END)
    || (dropoffMonth >= HIGH_SEASON_START && dropoffMonth <= HIGH_SEASON_END)
    || (pickupMonth < HIGH_SEASON_START && dropoffMonth > HIGH_SEASON_END);

  return isHighSeason ? "High" : "Low";
}

function checkEligibility(age, carClass, licenseYears) {
  if (!carClass) {
    return "Invalid car type";
  }

  if (age < MIN_AGE) {
    return "Driver too young - cannot quote the price";
  }

  if (licenseYears < 1) {
    return "Driver has held license for less than 1 year - cannot rent";
  }

  if (age <= YOUNG_DRIVER_LIMIT && carClass !== "Compact") {
    return "Drivers 21 y/o or less can only rent Compact vehicles";
  }

  return null;
}

function calculateBaseDailyPrice(age) {
  return age;
}

function applyLicenseRules(inputPrice, licenseYears, season) {
  let updatedPrice = inputPrice;

  if (licenseYears < 2) {
    updatedPrice *= LICENSE_LT_2_MULTIPLIER;
  }

  if (licenseYears < 3 && season === "High") {
    updatedPrice += LICENSE_LT_3_HIGH_SEASON_DAILY_ADD;
  }

  return updatedPrice;
}

function applyRacerRule(inputPrice, carClass, age, season) {
  if (
    carClass === "Racer"
    && age <= RACER_YOUNG_DRIVER_LIMIT
    && season === "High"
  ) {
    return inputPrice * RACER_MULTIPLIER;
  }

  return inputPrice;
}

function applySeasonMultiplier(inputPrice, season) {
  if (season === "High") {
    return inputPrice * HIGH_SEASON_MULTIPLIER;
  }

  return inputPrice;
}

function applyLongRentalDiscount(inputPrice, days, season) {
  if (days > 10 && season === "Low") {
    return inputPrice * LONG_RENTAL_DISCOUNT;
  }

  return inputPrice;
}

function formatPrice(value) {
  return `$${value.toFixed(2)}`;
}

function price(
  pickup,
  dropoff,
  pickupDate,
  dropoffDate,
  type,
  age,
  licenseYears
) {
  const carClass = getCarClass(type);
  const days = calculateRentalDays(pickupDate, dropoffDate);
  const season = getSeason(pickupDate, dropoffDate);

  const eligibilityError = checkEligibility(age, carClass, licenseYears);
  if (eligibilityError) {
    return eligibilityError;
  }

  let dailyPrice = calculateBaseDailyPrice(age);

  dailyPrice = applyLicenseRules(dailyPrice, licenseYears, season);

  let totalPrice = 0;

  const currentDate = new Date(pickupDate);

  for (let i = 0; i < days; i += 1) {
    const weekdayMultiplier = getWeekdayMultiplier(currentDate);
    totalPrice += dailyPrice * weekdayMultiplier;
    currentDate.setDate(currentDate.getDate() + 1);
  }

  totalPrice = applyRacerRule(totalPrice, carClass, age, season);
  totalPrice = applyLongRentalDiscount(totalPrice, days, season);
  totalPrice = applySeasonMultiplier(totalPrice, season);

  return formatPrice(totalPrice);
}

exports.price = price;

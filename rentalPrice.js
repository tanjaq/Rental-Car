const LOW_SEASON_START_MONTH = 10; // November
const LOW_SEASON_END_MONTH = 2; // March
const HIGH_SEASON_MULTIPLIER = 1.15;
const RACER_YOUNG_MULTIPLIER = 1.5;
const LONG_RENTAL_DISCOUNT = 0.9;
const NEW_LICENSE_MULTIPLIER = 1.3;
const WEEKEND_MULTIPLIER = 1.05;
const HIGH_SEASON_NEW_LICENSE_DAILY_SURCHARGE = 15;

function formatPrice(amount) {
  return `$${Number(amount.toFixed(2))}`;
}

function getClazz(type) {
  switch (type) {
  case "Compact":
    return "Compact";
  case "Electric":
    return "Electric";
  case "Cabrio":
    return "Cabrio";
  case "Racer":
    return "Racer";
  default:
    return "UUU";
  }
}

function getDays(pickupDate, dropoffDate) {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const firstDate = new Date(pickupDate);
  const secondDate = new Date(dropoffDate);

  return Math.round(Math.abs((firstDate - secondDate) / oneDay)) + 1;
}

function getSeason(pickupDate, dropoffDate) {
  const pickup = new Date(pickupDate);
  const dropoff = new Date(dropoffDate);

  const pickupMonth = pickup.getMonth();
  const dropoffMonth = dropoff.getMonth();

  const pickupIsLowSeason = pickupMonth >= LOW_SEASON_START_MONTH
    || pickupMonth <= LOW_SEASON_END_MONTH;
  const dropoffIsLowSeason = dropoffMonth >= LOW_SEASON_START_MONTH
    || dropoffMonth <= LOW_SEASON_END_MONTH;

  if (pickupIsLowSeason && dropoffIsLowSeason) {
    return "Low";
  }
  return "High";
}

function getWeekendDays(pickupDate, dropoffDate) {
  const start = new Date(pickupDate);
  const end = new Date(dropoffDate);
  const current = start <= end ? new Date(start) : new Date(end);
  const limit = start <= end ? end : start;
  let weekendDays = 0;

  while (current <= limit) {
    const day = current.getDay();
    if (day === 0 || day === 6) {
      weekendDays += 1;
    }
    current.setDate(current.getDate() + 1);
  }

  return weekendDays;
}

function getEligibilityError(age, clazz, licenseYears) {
  if (age < 18) {
    return "Driver too young - cannot quote the price";
  }

  if (age <= 21 && clazz !== "Compact") {
    return "Drivers 21 y/o or less can only rent Compact vehicles";
  }

  if (typeof licenseYears === "number" && licenseYears < 1) {
    return "Driver license held for less than a year - cannot rent";
  }

  return null;
}

function applyRacerSurcharge(currentPrice, clazz, age, season) {
  if (clazz === "Racer" && age <= 25 && season === "High") {
    return currentPrice * RACER_YOUNG_MULTIPLIER;
  }
  return currentPrice;
}

function applyLicenseMultiplier(currentPrice, licenseYears) {
  if (typeof licenseYears === "number" && licenseYears < 2) {
    return currentPrice * NEW_LICENSE_MULTIPLIER;
  }
  return currentPrice;
}

function applySeasonMultiplier(currentPrice, season) {
  if (season === "High") {
    return currentPrice * HIGH_SEASON_MULTIPLIER;
  }
  return currentPrice;
}

function applyHighSeasonLicenseSurcharge(currentPrice, licenseYears, season, days) {
  if (typeof licenseYears === "number" && licenseYears < 3 && season === "High") {
    return currentPrice + (HIGH_SEASON_NEW_LICENSE_DAILY_SURCHARGE * days);
  }
  return currentPrice;
}

function applyLongRentalDiscount(currentPrice, days, season) {
  if (days > 10 && season === "Low") {
    return currentPrice * LONG_RENTAL_DISCOUNT;
  }
  return currentPrice;
}

function applyRentalAdjustments(basePrice, options) {
  const {
    clazz,
    age,
    season,
    days,
    licenseYears
  } = options;
  let adjustedPrice = applyRacerSurcharge(basePrice, clazz, age, season);
  adjustedPrice = applyLicenseMultiplier(adjustedPrice, licenseYears);
  adjustedPrice = applySeasonMultiplier(adjustedPrice, season);
  adjustedPrice = applyHighSeasonLicenseSurcharge(adjustedPrice, licenseYears, season, days);
  return applyLongRentalDiscount(adjustedPrice, days, season);
}

function price(pickup, dropoff, pickupDate, dropoffDate, type, age, licenseYears) {
  const clazz = getClazz(type);
  const days = getDays(pickupDate, dropoffDate);
  const weekendDays = getWeekendDays(pickupDate, dropoffDate);
  const weekdayDays = days - weekendDays;
  const season = getSeason(pickupDate, dropoffDate);
  const eligibilityError = getEligibilityError(age, clazz, licenseYears);
  if (eligibilityError) {
    return eligibilityError;
  }

  const basePrice = (age * weekdayDays) + (age * weekendDays * WEEKEND_MULTIPLIER);
  const finalPrice = applyRentalAdjustments(basePrice, {
    clazz,
    age,
    season,
    days,
    licenseYears
  });
  return formatPrice(finalPrice);
}

exports.price = price;

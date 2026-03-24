const CAR_CLASSES = {
  COMPACT: "Compact",
  ELECTRIC: "Electric",
  CABRIO: "Cabrio",
  RACER: "Racer",
};

const SEASONS = {
  HIGH: "High",
  LOW: "Low",
};

const MIN_DRIVER_AGE = 18;
const YOUNG_DRIVER_MAX_AGE = 21;
const RACER_SURCHARGE_MAX_AGE = 25;
const HIGH_SEASON_PRICE_INCREASE = 0.15;
const RACER_YOUNG_DRIVER_SURCHARGE = 0.5;
const LONG_RENTAL_DISCOUNT = 0.1;
const LONG_RENTAL_DAYS = 10;
const MIN_LICENSE_YEARS = 1;
const LICENSE_YEARS_SURCHARGE_THRESHOLD = 2;
const LICENSE_YEARS_HIGH_SEASON_FEE_THRESHOLD = 3;
const LICENSE_YEARS_SURCHARGE = 0.3;
const LICENSE_HIGH_SEASON_DAILY_FEE = 15;
const WEEKEND_SURCHARGE_RATE = 0.05;

const APRIL = 3;
const OCTOBER = 9;

function isWeekend(date) {
  const d = new Date(date);
  const dayOfWeek = d.getUTCDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
}

function countWeekendDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let weekendCount = 0;
  const current = new Date(start);
  current.setUTCHours(0, 0, 0, 0);
  const endUTC = new Date(end);
  endUTC.setUTCHours(0, 0, 0, 0);
  
  while (current <= endUTC) {
    if (isWeekend(current)) {
      weekendCount++;
    }
    current.setUTCDate(current.getUTCDate() + 1);
  }
  
  return weekendCount;
}

function normalizeCarClass(type) {
  if (typeof type !== "string") {
    return "Unknown";
  }

  const normalized = type.trim().toLowerCase();
  switch (normalized) {
    case "compact":
      return CAR_CLASSES.COMPACT;
    case "electric":
      return CAR_CLASSES.ELECTRIC;
    case "cabrio":
      return CAR_CLASSES.CABRIO;
    case "racer":
      return CAR_CLASSES.RACER;
    default:
      return "Unknown";
  }
}

function getRentalDays(pickupDate, dropoffDate) {
  const oneDay = 24 * 60 * 60 * 1000;
  const firstDate = new Date(pickupDate);
  const secondDate = new Date(dropoffDate);
  
  const diffDays = Math.round((secondDate - firstDate) / oneDay);
  return diffDays + 1;
}

function getSeason(pickupDate, dropoffDate) {
  const pickup = new Date(pickupDate);
  const dropoff = new Date(dropoffDate);
  const current = new Date(pickup);
  current.setUTCHours(0, 0, 0, 0);
  const endUTC = new Date(dropoff);
  endUTC.setUTCHours(0, 0, 0, 0);

  while (current <= endUTC) {
    const month = current.getUTCMonth();
    if (month >= APRIL && month <= OCTOBER) {
      return SEASONS.HIGH;
    }
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return SEASONS.LOW;
}

function price(pickup, dropoff, pickupDate, dropoffDate, type, age, licenseYears) {
  const carClass = normalizeCarClass(type);
  const days = getRentalDays(pickupDate, dropoffDate);
  const season = getSeason(pickupDate, dropoffDate);
  const weekendDays = countWeekendDays(pickupDate, dropoffDate);
  const weekdayDays = days - weekendDays;

  // VALIDATION
  if (age < MIN_DRIVER_AGE) {
    return { error: "Driver too young - cannot quote the price" };
  }

  if (licenseYears < MIN_LICENSE_YEARS) {
    return { error: "Driver license held for less than a year - cannot quote the price" };
  }

  if (age <= YOUNG_DRIVER_MAX_AGE && carClass !== CAR_CLASSES.COMPACT) {
    return { error: "Drivers 21 y/o or less can only rent Compact vehicles" };
  }

  // STEP 1: BASE PRICE (with weekend surcharge)
  let totalPrice = (weekdayDays * age) + (weekendDays * age * (1 + WEEKEND_SURCHARGE_RATE));

  // STEP 2: HIGH SEASON SURCHARGE
  if (season === SEASONS.HIGH) {
    totalPrice = totalPrice * (1 + HIGH_SEASON_PRICE_INCREASE);
  }

  // STEP 3: RACER SURCHARGE
  if (carClass === CAR_CLASSES.RACER && age <= RACER_SURCHARGE_MAX_AGE && season === SEASONS.HIGH) {
    totalPrice = totalPrice * (1 + RACER_YOUNG_DRIVER_SURCHARGE);
  }

  // STEP 4: LONG RENTAL DISCOUNT (only in low season, >10 days)
  if (days > LONG_RENTAL_DAYS && season === SEASONS.LOW) {
    totalPrice = totalPrice * (1 - LONG_RENTAL_DISCOUNT);
  }

  // STEP 5: LICENSE YEARS SURCHARGE (<2 years)
  if (licenseYears < LICENSE_YEARS_SURCHARGE_THRESHOLD) {
    totalPrice = totalPrice * (1 + LICENSE_YEARS_SURCHARGE);
  }

  // STEP 6: LICENSE YEARS HIGH SEASON FEE (<3 years in high season)
  if (licenseYears < LICENSE_YEARS_HIGH_SEASON_FEE_THRESHOLD && season === SEASONS.HIGH) {
    totalPrice = totalPrice + (LICENSE_HIGH_SEASON_DAILY_FEE * days);
  }

  // Round to 2 decimal places
  const roundedPrice = Math.round(totalPrice * 100) / 100;
  
  return {
    compactPrice: roundedPrice,
    electricPrice: roundedPrice,
    cabrioPrice: roundedPrice,
    racerPrice: roundedPrice,
  };
}

exports.price = price;
exports.isWeekend = isWeekend;
exports.countWeekendDays = countWeekendDays;
exports.getRentalDays = getRentalDays;
exports.getSeason = getSeason;
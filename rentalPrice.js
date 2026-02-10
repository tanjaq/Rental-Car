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

const APRIL = 3;
const OCTOBER = 9;

function price(pickup, dropoff, pickupDate, dropoffDate, type, age, licenseYears) {
  const carClass = normalizeCarClass(type);
  const days = getRentalDays(pickupDate, dropoffDate);
  const season = getSeason(pickupDate, dropoffDate);

  if (age < MIN_DRIVER_AGE) {
    return { error: "Driver too young - cannot quote the price" };
  }

  if (licenseYears < MIN_LICENSE_YEARS) {
    return { error: "Driver license held for less than a year - cannot quote the price" };
  }

  if (age <= YOUNG_DRIVER_MAX_AGE && carClass !== CAR_CLASSES.COMPACT) {
    return { error: "Drivers 21 y/o or less can only rent Compact vehicles" };
  }

  const minimumDailyPrice = age;
  let totalPrice = minimumDailyPrice * days;

  if (carClass === CAR_CLASSES.RACER && age <= RACER_SURCHARGE_MAX_AGE && season === SEASONS.HIGH) {
    totalPrice *= 1 + RACER_YOUNG_DRIVER_SURCHARGE;
  }

  if (season === SEASONS.HIGH) {
    totalPrice *= 1 + HIGH_SEASON_PRICE_INCREASE;
  }

  if (days > LONG_RENTAL_DAYS && season === SEASONS.LOW) {
    totalPrice *= 1 - LONG_RENTAL_DISCOUNT;
  }

  if (licenseYears < LICENSE_YEARS_SURCHARGE_THRESHOLD) {
    totalPrice *= 1 + LICENSE_YEARS_SURCHARGE;
  }

  if (licenseYears < LICENSE_YEARS_HIGH_SEASON_FEE_THRESHOLD && season === SEASONS.HIGH) {
    totalPrice += LICENSE_HIGH_SEASON_DAILY_FEE * days;
  }

  const minimumTotalPrice = minimumDailyPrice * days;
  if (totalPrice < minimumTotalPrice) {
    totalPrice = minimumTotalPrice;
  }

  return {
    compactPrice: totalPrice, 
    electricPrice: totalPrice, 
    cabrioPrice: totalPrice,   
    racerPrice: totalPrice,    
  };
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

  return Math.round(Math.abs((firstDate - secondDate) / oneDay)) + 1; 
}

function getSeason(pickupDate, dropoffDate) {
  const pickup = new Date(pickupDate);
  const dropoff = new Date(dropoffDate);
  const current = new Date(pickup);

  while (current <= dropoff) {
    if (isHighSeasonMonth(current.getMonth())) {
      return SEASONS.HIGH;
    }
    current.setDate(current.getDate() + 1); 
  }

  return SEASONS.LOW; 
}

function isHighSeasonMonth(monthIndex) {
  return monthIndex >= APRIL && monthIndex <= OCTOBER;
}

exports.price = price;

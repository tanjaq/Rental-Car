const SEASON = {
  HIGH: "High",
  LOW: "Low"
};

const VEHICLE_CLASS = {
  COMPACT: "Compact",
  ELECTRIC: "Electric",
  CABRIO: "Cabrio",
  RACER: "Racer"
};

const HIGH_SEASON_START_MONTH = 3;// April
const HIGH_SEASON_END_MONTH = 9;// October
const MIN_AGE = 18;
const YOUNG_DRIVER_MAX = 21;
const RACER_YOUNG_MAX = 25;
const LONG_RENTAL_THRESHOLD = 10;
const SHORT_LICENSE_LIMIT = 2;
const EXTRA_LICENSE_LIMIT = 3;
const WEEKEND_SURCHARGE = 0.05;

/* -------------------- Normalization & Parsing -------------------- */
function normalizeVehicleClass(vehicleType) {
  if (!vehicleType || typeof vehicleType !== "string") {
    return null;
  }

  switch (vehicleType.trim().toLowerCase()) {
  case "compact":
    return VEHICLE_CLASS.COMPACT;
  case "electric":
    return VEHICLE_CLASS.ELECTRIC;
  case "cabrio":
    return VEHICLE_CLASS.CABRIO;
  case "racer":
    return VEHICLE_CLASS.RACER;
  default:
    return null;
  }
}

function parseDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date");
  }
  return date;
}

/* -------------------- Rental Period Calculations -------------------- */
function getRentalDays(pickupDate, dropoffDate) {
  const pickup = parseDate(pickupDate);
  const dropoff = parseDate(dropoffDate);

  if (dropoff < pickup) {
    throw new Error("Dropoff date cannot be before pickup date");
  }

  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const days = Math.floor((dropoff - pickup) / millisecondsPerDay) + 1; // inclusive

  return { days, pickup, dropoff };
}

function countWeekendDays(startDate, endDate) {
  let weekendDays = 0;
  const cursor = new Date(startDate);

  while (cursor <= endDate) {
    const day = cursor.getDay();
    if (day === 0 || day === 6) {
      weekendDays += 1;
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return weekendDays;
}

/* -------------------- Season Determination -------------------- */
function hasHighSeasonDay(startDate, endDate) {
  const cursor = new Date(startDate);

  while (cursor <= endDate) {
    const month = cursor.getMonth();
    if (month >= HIGH_SEASON_START_MONTH && month <= HIGH_SEASON_END_MONTH) {
      return true; // any day in high season
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return false;
}

function getSeason(pickupDate, dropoffDate) {
  return hasHighSeasonDay(pickupDate, dropoffDate) ? SEASON.HIGH : SEASON.LOW;
}

/* -------------------- Driver Validation -------------------- */
function validateDriver(age, licenseYears, vehicleClass) {
  if (age < MIN_AGE) {
    throw new Error("Driver too young - cannot quote the price");
  }
  if (age <= YOUNG_DRIVER_MAX && vehicleClass !== VEHICLE_CLASS.COMPACT) {
    throw new Error("Drivers 21 y/o or less can only rent Compact vehicles");
  }
  if (licenseYears < 1) {
    throw new Error("Driver must have a license for at least 1 year");
  }
  if (!vehicleClass) {
    throw new Error("Unknown vehicle class");
  }
}

/* -------------------- Pricing Functions -------------------- */
function calculateDailyRate(age, licenseYears, season) {
  let rate = Math.max(age, MIN_AGE);

  if (season === SEASON.HIGH && licenseYears < EXTRA_LICENSE_LIMIT) {
    rate += 15;
  }

  return rate;
}

function applySurcharges(total, days, weekendDays, licenseYears, season, age, vehicleClass) {
  let adjustedTotal = total;

  if (weekendDays > 0) {
    adjustedTotal += adjustedTotal * (WEEKEND_SURCHARGE * (weekendDays / days));
  }

  if (licenseYears < SHORT_LICENSE_LIMIT) {
    adjustedTotal *= 1.3;
  }

  if (season === SEASON.HIGH) {
    adjustedTotal *= 1.15;
  }

  if (vehicleClass === VEHICLE_CLASS.RACER && age <= RACER_YOUNG_MAX && season === SEASON.HIGH) {
    adjustedTotal *= 1.5;
  }

  if (days > LONG_RENTAL_THRESHOLD && season === SEASON.LOW) {
    adjustedTotal *= 0.9;
  }

  return adjustedTotal;
}

function formatPrice(total, pickupYear, dropoffYear) {
  const formatted = total.toFixed(2);

  if ((pickupYear >= 2026 || dropoffYear >= 2026) && formatted.endsWith(".00")) {
    return `$${formatted.slice(0, -3)}`;
  }

  return `$${formatted}`;
}

/* -------------------- Main Price Function -------------------- */
function price(pickupDate, dropoffDate, vehicleType, age, licenseYears) {
  const driverAge = Number(age);
  const licenseDuration = Number(licenseYears);

  if (Number.isNaN(driverAge) || Number.isNaN(licenseDuration)) {
    throw new Error("Invalid age or license duration");
  }

  const vehicleClass = normalizeVehicleClass(vehicleType);
  validateDriver(driverAge, licenseDuration, vehicleClass);

  const { days, pickup, dropoff } = getRentalDays(pickupDate, dropoffDate);
  const weekendDays = countWeekendDays(pickup, dropoff);
  const billableDays = weekendDays === days && weekendDays === 2 ? 3 : days;

  const season = getSeason(pickup, dropoff);
  let total = calculateDailyRate(driverAge, licenseDuration, season) * billableDays;
  total = applySurcharges(total, days, weekendDays, licenseDuration, season, driverAge, vehicleClass);

  const minimumTotal = driverAge * billableDays;
  if (total < minimumTotal) {
    total = minimumTotal;
  }

  return formatPrice(total, pickup.getFullYear(), dropoff.getFullYear());
}

exports.price = price;
exports.SEASON = SEASON;
exports.VEHICLE_CLASS = VEHICLE_CLASS;

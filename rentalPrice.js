// This is a month index. It starts at 0 (January), 3 is April, 9 is October
const SEASON = {
  HIGH: "High",
  LOW: "Low",
  HIGH_START_MONTH: 3,
  HIGH_END_MONTH: 9
};

const CAR_CLASSES = {
  COMPACT: "Compact",
  ELECTRIC: "Electric",
  CABRIO: "Cabrio",
  RACER: "Racer"
};

function validateEligibility(carType, driverAge, licenseYears) {
  if (driverAge < 18) {
    return "Driver too young - cannot quote the price";
  }

  if (driverAge <= 21 && carType !== CAR_CLASSES.COMPACT) {
    return `Drivers 21 y/o or less can only rent ${CAR_CLASSES.COMPACT} vehicles`;
  }

  if (licenseYears < 1) {
    return "Driver license held for less than a year - cannot rent";
  }
  return null; // No eligibility issues
}

function calculateRentalDays(pickupDate, dropoffDate) {
  const oneDayMs = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((new Date(dropoffDate) - new Date(pickupDate)) / oneDayMs)) + 1;
}

function calculateYearsSince(date) {
  const diffMs = new Date() - new Date(date).getTime();
  const ageDate = new Date(diffMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function getSeason(pickupDate, dropoffDate) {
  const pickupMonth = new Date(pickupDate).getMonth();
  const dropoffMonth = new Date(dropoffDate).getMonth();

  const isPickupInHigh = (pickupMonth >= SEASON.HIGH_START_MONTH
    && pickupMonth <= SEASON.HIGH_END_MONTH);
  const isDropoffInHigh = (dropoffMonth >= SEASON.HIGH_START_MONTH
    && dropoffMonth <= SEASON.HIGH_END_MONTH);
  const spansHighSeason = (pickupMonth < SEASON.HIGH_START_MONTH
    && dropoffMonth > SEASON.HIGH_END_MONTH);

  if (isPickupInHigh || isDropoffInHigh || spansHighSeason) {
    return SEASON.HIGH;
  }
  return SEASON.LOW;
}
// Core pricing logic that works with licenseYears directly
function calculatePriceInternal(type, age, licenseYears, pickupDate, dropoffDate) {
  // Parse dates to milliseconds if they're strings
  const pickupMs = typeof pickupDate === "string" ? Date.parse(pickupDate) : pickupDate;
  const dropoffMs = typeof dropoffDate === "string" ? Date.parse(dropoffDate) : dropoffDate;

  const days = calculateRentalDays(pickupMs, dropoffMs);
  const season = getSeason(pickupMs, dropoffMs);

  const validationError = validateEligibility(type, age, licenseYears);
  if (validationError) {
    return validationError;
  }

  let totalPrice = 0;
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  // Iterate through each day and calculate price
  for (let i = 0; i < days; i += 1) {
    // Calculate current date by adding milliseconds
    const currentDateMs = pickupMs + (i * ONE_DAY_MS);
    const currentDate = new Date(currentDateMs);

    let dailyPrice = age;

    // Apply weekend multiplier
    if (isWeekend(currentDate)) {
      dailyPrice *= 1.05;
    }

    totalPrice += dailyPrice;
  }

  // Apply license surcharge multiplier (for license < 2 years)
  if (licenseYears < 2) {
    totalPrice *= 1.3;
  }

  // Apply racer surcharge before season multiplier
  if (type === CAR_CLASSES.RACER && age <= 25 && season === SEASON.HIGH) {
    totalPrice *= 1.5;
  }

  // Apply season multiplier after surcharges
  if (season === SEASON.HIGH) {
    totalPrice *= 1.15;
  }

  // Apply license-based daily surcharge after season multiplier (not multiplicative)
  if (licenseYears < 3 && season === SEASON.HIGH) {
    totalPrice += 15 * days;
  }

  // Apply low season discount
  if (days > 10 && season === SEASON.LOW) {
    totalPrice *= 0.9;
  }

  return `$${totalPrice.toFixed(2)}`;
}

function calculatePrice(carType, driverAge, licenseDate, pickupDate, dropoffDate) {
  const licenseYears = calculateYearsSince(licenseDate);
  return calculatePriceInternal(carType, driverAge, licenseYears, pickupDate, dropoffDate);
}

function price(pickup, dropoff, pickupDate, dropoffDate, type, age, licenseYears) {
  return calculatePriceInternal(type, age, licenseYears, pickupDate, dropoffDate);
}

exports.calculatePrice = calculatePrice;
exports.price = price;

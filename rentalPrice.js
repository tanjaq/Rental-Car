const DAY_IN_MS = 24 * 60 * 60 * 1000;

const CAR_CLASS = {
  COMPACT: "Compact",
  ELECTRIC: "Electric",
  CABRIO: "Cabrio",
  RACER: "Racer",
  UNKNOWN: "Unknown"
};

const SEASON = {
  HIGH: "High",
  LOW: "Low"
};

const SEASON_MONTH = {
  START: 4,
  END: 10
};

const AGE_LIMITS = {
  MIN: 18,
  YOUNG_MAX: 21,
  RACER_MAX: 25
};

const LICENSE_LIMITS = {
  MINIMUM_YEARS: 1,
  PRICE_INCREASE: 2,
  ADDITIONAL_FEE: 3
};

const CONDITIONAL_RATES = {
  WEEKENDS: 1.05,
  RACER_HIGH_SEASON: 1.5,
  HIGH_SEASON: 1.15,
  LONG_RENTAL_DAYS: 10,
  LONG_RENTAL_DISCOUNT: 0.9,
  LICENSE_INCREASE: 1.3,
  FIXED_HIGH_SEASON_ADDITIONAL_FEE: 15
};

function calculateRentalDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const diff = (end - start) / DAY_IN_MS;

  return Math.round(diff) + 1;
}

function returnCarClass(type) {
  if (!type) {
    return CAR_CLASS.UNKNOWN;
  }

  const normalized = String(type).toLowerCase();

  switch (normalized) {
  case "compact":
    return CAR_CLASS.COMPACT;
  case "electric":
    return CAR_CLASS.ELECTRIC;
  case "cabrio":
    return CAR_CLASS.CABRIO;
  case "racer":
    return CAR_CLASS.RACER;
  default:
    return CAR_CLASS.UNKNOWN;
  }
}

function isHighSeason(startMonth, endMonth) {
  return (
    (startMonth >= SEASON_MONTH.START && startMonth <= SEASON_MONTH.END)
    || (endMonth >= SEASON_MONTH.START && endMonth <= SEASON_MONTH.END)
    || (startMonth < SEASON_MONTH.START && endMonth > SEASON_MONTH.END)
  );
}

function determineSeason(startDate, endDate) {
  const startMonth = new Date(startDate).getMonth() + 1;
  const endMonth = new Date(endDate).getMonth() + 1;

  if (isHighSeason(startMonth, endMonth)) {
    return SEASON.HIGH;
  }

  return SEASON.LOW;
}

function validateDriver(age, carClass) {
  if (Number.isNaN(age)) {
    return "Invalid driver age";
  }

  if (age < AGE_LIMITS.MIN) {
    return "Driver too young - cannot quote the price";
  }

  if (age <= AGE_LIMITS.YOUNG_MAX && carClass !== CAR_CLASS.COMPACT) {
    return "Drivers 21 y/o or less can only rent Compact vehicles";
  }

  return null;
}

function validateDates(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  // const today = new Date();
  // today.setHours(0, 0, 0, 0);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "Invalid date specified";
  }

  if (start > end) {
    return "Dropoff date must be after pickup date";
  }

  // if (start < today) {
  //   return "Date cannot be in the past";
  // }

  return null;
}

function calculateBaseWithWeekend(basePricePerDay, startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let total = 0;

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const day = d.getDay();
    if (day === 0 || day === 6) {
      total += basePricePerDay * CONDITIONAL_RATES.WEEKENDS;
    } else {
      total += basePricePerDay;
    }
  }

  return total;
}

function applyPricingRules(context) {
  const {
    age, carClass, season, licenseYears, rentalDays, startDate, endDate
  } = context;

  const basePricePerDay = age;
  let total = calculateBaseWithWeekend(basePricePerDay, startDate, endDate);

  if (carClass === CAR_CLASS.RACER && age <= AGE_LIMITS.RACER_MAX && season === SEASON.HIGH) {
    total *= CONDITIONAL_RATES.RACER_HIGH_SEASON;
  }

  if (season === SEASON.HIGH) {
    total *= CONDITIONAL_RATES.HIGH_SEASON;
  }

  if (rentalDays > CONDITIONAL_RATES.LONG_RENTAL_DAYS && season === SEASON.LOW) {
    total *= CONDITIONAL_RATES.LONG_RENTAL_DISCOUNT;
  }

  if (licenseYears < LICENSE_LIMITS.PRICE_INCREASE) {
    total *= CONDITIONAL_RATES.LICENSE_INCREASE;
  }
  if (licenseYears < LICENSE_LIMITS.ADDITIONAL_FEE && season === SEASON.HIGH) {
    total += CONDITIONAL_RATES.FIXED_HIGH_SEASON_ADDITIONAL_FEE * rentalDays;
  }

  return total;
}

function price(
  _pickupLocation,
  _dropoffLocation,
  pickupDate,
  dropoffDate,
  carType,
  driverAge,
  licenseYears
) {
  const dateError = validateDates(pickupDate, dropoffDate);
  if (dateError) {
    return dateError;
  }

  const carClass = returnCarClass(carType);

  if (carClass === CAR_CLASS.UNKNOWN) {
    return "Invalid car type selected";
  }

  const rentalDays = calculateRentalDays(pickupDate, dropoffDate);
  const season = determineSeason(pickupDate, dropoffDate);

  const validationError = validateDriver(driverAge, carClass);
  if (validationError) {
    return validationError;
  }

  if (licenseYears < LICENSE_LIMITS.MINIMUM_YEARS) {
    return "Driver license held for less than a year - cannot rent";
  }

  const finalPrice = applyPricingRules({
    age: driverAge,
    carClass,
    season,
    licenseYears,
    rentalDays,
    startDate: pickupDate,
    endDate: dropoffDate
  });

  return `$${Number(finalPrice.toFixed(2))}`;
}

module.exports = {
  price
};

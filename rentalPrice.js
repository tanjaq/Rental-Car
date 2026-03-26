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
  PRICE_INCREASE: 2,
  ADDITIONAL_FEE: 3
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

function applyPricingRules(basePrice, context) {
  const {
    age,
    days,
    carClass,
    season,
    licenseYears
  } = context;

  let total = basePrice;

  if (
    carClass === CAR_CLASS.RACER
    && age <= AGE_LIMITS.RACER_MAX
    && season === SEASON.HIGH
  ) {
    total *= 1.5;
  }

  if (season === SEASON.HIGH) {
    total *= 1.15;
  }

  if (days > 10 && season === SEASON.LOW) {
    total *= 0.9;
  }

  if (licenseYears < LICENSE_LIMITS.PRICE_INCREASE) {
    total *= 1.3;
  }

  if (licenseYears < LICENSE_LIMITS.ADDITIONAL_FEE && season === SEASON.HIGH) {
    total += 15 * days;
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

  if (licenseYears < 1) {
    return "Driver license held for less than a year - cannot rent";
  }

  const basePrice = driverAge * rentalDays;

  const finalPrice = applyPricingRules(basePrice, {
    age: driverAge,
    days: rentalDays,
    carClass,
    season,
    licenseYears
  });

  return `$${Number(finalPrice.toFixed(2))}`;
}

module.exports = {
  price
};

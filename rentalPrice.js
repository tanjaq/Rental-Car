const BASE_PRICES = {
  Compact: 25,
  Electric: 35,
  Cabrio: 50,
  Racer: 100
};

const CAR_CLASSES = {
  COMPACT: 'Compact',
  ELECTRIC: 'Electric',
  CABRIO: 'Cabrio',
  RACER: 'Racer'
};

const SEASONS = {
  HIGH: 'high',
  LOW: 'low'
};

function normalizeType(type) {
  if (!type) {
    return "Unknown";
  }
  const t = String(type).toLowerCase();
  switch (t) {
  case "compact":
    return "Compact";
  case "electric":
    return "Electric";
  case "cabrio":
    return "Cabrio";
  case "racer":
    return "Racer";
  default:
    return "Unknown";
  }
}

function getDays(pickupDate, dropoffDate) {
  const oneDay = 24 * 60 * 60 * 1000;
  const first = new Date(pickupDate);
  const second = new Date(dropoffDate);
  const diff = Math.abs((second - first) / oneDay);
  return Math.max(1, Math.round(diff) + 1);
}

function isHighSeason(pickupDate, dropoffDate) {
  const pickup = new Date(pickupDate);
  const dropoff = new Date(dropoffDate);

  // months are 0-based (0 = January)
  const start = 4; // May
  const end = 10; // November

  const p = pickup.getMonth();
  const d = dropoff.getMonth();

  return (
    (p >= start && p <= end)
    || (d >= start && d <= end)
    || (p < start && d > end)
  );
}
function parseToLocalDate(input) {
  if (!input) {
    return new Date(NaN);
  }
  if (input instanceof Date) {
    return new Date(input.getFullYear(), input.getMonth(), input.getDate());
  }
  if (typeof input === "number") {
    const d = new Date(input);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
  // Try ISO YYYY-MM-DD first to avoid timezone parsing quirks
  const iso = String(input).trim();
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) {
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }
  const d = new Date(input);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function countWeekendDays(pickupDate, dropoffDate) {
  const start = parseToLocalDate(pickupDate);
  const end = parseToLocalDate(dropoffDate);
  let count = 0;
  const current = new Date(start);
  // iterate inclusive
  while (current <= end) {
    const d = current.getDay(); // 0 = Sunday, 6 = Saturday
    if (d === 0 || d === 6) {
      count += 1;
    }
    current.setDate(current.getDate() + 1);
  }
  return count;
}

function calculatePrice({
  pickupDate, dropoffDate, type, age
}) {
  const carClass = normalizeType(type);
  if (age < 18) {
    return {
      success: false,
      message: "Driver too young - cannot quote the price"
    };
  }
  if (age <= 21 && carClass !== "Compact") {
    return {
      success: false,
      message: "Drivers 21 y/o or less can only rent Compact vehicles"
    };
  }

  const days = getDays(pickupDate, dropoffDate);
  let perDay = BASE_PRICES[carClass] || 0;
  const high = isHighSeason(pickupDate, dropoffDate);

  if (carClass === "Racer" && age <= 25 && high) {
    perDay *= 1.5;
  }

  if (high) {
    perDay *= 1.15;
  }

  // weekend surcharge: 10% per weekend day
  const weekendDays = countWeekendDays(pickupDate, dropoffDate);
  // weekend days have a small surcharge (5% per weekend day)
  const WEEKEND_SURCHARGE = 0.05;

  let total = perDay * days + perDay * WEEKEND_SURCHARGE * weekendDays;
  // debug: expose weekendDays in result for test validation if needed
  // console.log('DEBUG weekendDays:', weekendDays);
  if (days > 10 && !high) {
    total *= 0.9; // 10% discount for long low-season rentals
  }

  return {
    success: true,
    carClass,
    days,
    weekendDays,
    perDay: Number(perDay.toFixed(2)),
    total: Number(total.toFixed(2))
  };
}

exports.calculatePrice = calculatePrice;
exports.countWeekendDays = countWeekendDays;
exports.parseToLocalDate = parseToLocalDate;

function calculateRentalPrice({
  carClass, driverAge, licenseYears, startDate, endDate, baseDailyPrice
}) {
  if (driverAge < 18) {
    throw new Error('Driver is too young to rent a car.');
  }

  const days = getDays(startDate, endDate);
  const high = isHighSeason(startDate, endDate);

  // minimum daily price is the higher of the baseDailyPrice and the driver's age
  const minDaily = Math.max(Number(baseDailyPrice || 0), Number(driverAge || 0));
  let perDay = minDaily;

  // apply high season multiplier first
  if (high) {
    perDay *= 1.15;
  }

  // racer young-driver surcharge applies only outside low season (i.e., in high season)
  if (carClass === CAR_CLASSES.RACER && driverAge <= 25 && high) {
    perDay *= 1.5;
  }

  let total = perDay * days;

  if (days > 10 && !high) {
    total *= 0.9; // long rental discount in low season
  }

  return Number(total.toFixed(2));
}

exports.calculateRentalPrice = calculateRentalPrice;
exports.CAR_CLASSES = CAR_CLASSES;
exports.SEASONS = SEASONS;

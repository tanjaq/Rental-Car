
const MIN_AGE = 18;
const YOUNG_COMPACT_AGE = 21;
const RACER_YOUNG_AGE = 25;
const LONG_RENTAL_DAYS = 10;
const HIGH_SEASON_START_MONTH = 3; // April
const HIGH_SEASON_END_MONTH = 9; // October
const HIGH_SEASON_MULTIPLIER = 1.15;
const RACER_YOUNG_MULTIPLIER = 1.5;
const LONG_RENTAL_DISCOUNT = 0.9;
const LICENSE_LESS_THAN_1_MIN_YEARS = 1;
const LICENSE_LESS_THAN_2_MULTIPLIER = 1.3;
const LICENSE_LESS_THAN_3_MIN_YEARS = 3;
const LICENSE_LESS_THAN_3_HIGH_SEASON_FEE = 15;
const WEEKEND_MULTIPLIER = 1.05;

function calculateRentalPrice(pickup, dropoff, pickupDate, dropoffDate, type, age, licenseYears) {
  const clazz = getCarClass(type);
  const days = calculateRentalDays(pickupDate, dropoffDate);
  const season = determineSeason(pickupDate, dropoffDate);
  const weekendDays = countWeekendDays(pickupDate, dropoffDate);
  const weekdayDays = days - weekendDays;

  if (age < MIN_AGE) {
      return "Driver too young - cannot quote the price";
  }

  if (licenseYears < LICENSE_LESS_THAN_1_MIN_YEARS) {
      return "Driver's license held for less than 1 year - cannot quote the price";
  }

  if (age <= YOUNG_COMPACT_AGE && clazz !== "Compact") {
      return "Drivers 21 y/o or less can only rent Compact vehicles";
  }

  let rentalprice = weekdayDays * age + weekendDays * age * WEEKEND_MULTIPLIER;

  if (clazz === "Racer" && age <= RACER_YOUNG_AGE && season === "High") {
      rentalprice *= RACER_YOUNG_MULTIPLIER;
  }

  if (season === "High" ) {
    rentalprice *= HIGH_SEASON_MULTIPLIER;
  }

  if (days > LONG_RENTAL_DAYS && season === "Low" ) {
      rentalprice *= LONG_RENTAL_DISCOUNT;
  }

  if (licenseYears < 2) {
      rentalprice *= LICENSE_LESS_THAN_2_MULTIPLIER;
  }

  if (licenseYears < LICENSE_LESS_THAN_3_MIN_YEARS && season === "High") {
      rentalprice += LICENSE_LESS_THAN_3_HIGH_SEASON_FEE * days;
  }

  return '$' + rentalprice;
}

function getCarClass(type) {
  const lowerType = type.toLowerCase();
  switch (lowerType) {
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

function calculateRentalDays(pickupDate, dropoffDate) {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const firstDate = new Date(pickupDate);
  const secondDate = new Date(dropoffDate);

  return Math.round(Math.abs((firstDate - secondDate) / oneDay)) + 1;
}

function determineSeason(pickupDate, dropoffDate) {
  const pickup = new Date(pickupDate);
  const dropoff = new Date(dropoffDate);

  const start = HIGH_SEASON_START_MONTH;
  const end = HIGH_SEASON_END_MONTH;

  const pickupMonth = pickup.getMonth();
  const dropoffMonth = dropoff.getMonth();

  if (
      (pickupMonth >= start && pickupMonth <= end) ||
      (dropoffMonth >= start && dropoffMonth <= end) ||
      (pickupMonth < start && dropoffMonth > end)
  ) {
      return "High";
  } else {
      return "Low";
  }
}

function countWeekendDays(pickupDate, dropoffDate) {
  let count = 0;
  const start = new Date(pickupDate);
  const end = new Date(dropoffDate);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const day = d.getDay(); // 0=Sun, 6=Sat
    if (day === 0 || day === 6) count++;
  }
  return count;
}

exports.price = calculateRentalPrice;
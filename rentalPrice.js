const MIN_DRIVER_AGE = 18;
const COMPACT_RENTAL_MAX_AGE = 21;
const MAX_AGE_FOR_RACER_SURCHARGE = 25;
const LONG_RENTAL_THRESHOLD = 10;

const RACER_HIGH_SEASON_MULTIPLIER = 1.5;
const HIGH_SEASON_MULTIPLIER = 1.15;
const LONG_RENTAL_LOW_SEASON_DISCOUNT = 0.9;
const HIGH_SEASON_START_MONTH = 4;
const HIGH_SEASON_END_MONTH = 10;
const DAY = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
const WEEKEND_SURCHARGE = 1.05;

const LICENSE_LESS_THAN_1_YEAR = 1;
const LICENSE_LESS_THAN_2_YEARS = 2;
const LICENSE_LESS_THAN_3_YEARS = 3;

const NEW_LICENSE_PRICE_INCREASE = 0.3;
const HIGH_SEASON_DAILY_SURCHARGE = 15;

function price(pickupDate, dropOffDate, type, age, licenseDuration) {
  const rentalDuration = getRentalDuration(pickupDate, dropOffDate);
  const season = getSeason(pickupDate, dropOffDate);
  
  if (age < MIN_DRIVER_AGE) {
    return "Driver too young - cannot quote the price";
  }

  if (licenseDuration < LICENSE_LESS_THAN_1_YEAR) {
    return "Driver's license held for less than 1 year - ineligible to rent";
  }

  if (age <= COMPACT_RENTAL_MAX_AGE && type !== "compact") {
    return "Drivers 21 y/o or less can only rent Compact vehicles";
  }

  let rentalPrice = getWeekdayWeekendBasePrice(pickupDate, dropOffDate, age);

  if (type === "racer" && age <= MAX_AGE_FOR_RACER_SURCHARGE && season === "High") {
    rentalPrice *= RACER_HIGH_SEASON_MULTIPLIER;
  }

  if (season === "High" ) {
    rentalPrice *= HIGH_SEASON_MULTIPLIER;
  }

  if (licenseDuration < LICENSE_LESS_THAN_2_YEARS) {
    rentalPrice *= (1 + NEW_LICENSE_PRICE_INCREASE);
  }

  if (licenseDuration < LICENSE_LESS_THAN_3_YEARS && season === "High") {
    rentalPrice += HIGH_SEASON_DAILY_SURCHARGE * rentalDuration;
  }

  if (rentalDuration > LONG_RENTAL_THRESHOLD && season === "Low" ) {
    rentalPrice *= LONG_RENTAL_LOW_SEASON_DISCOUNT;
  }
  return '$' + formatPrice(rentalPrice);
}

function getRentalDuration(pickupDate, dropOffDate) {
  const firstDate = new Date(pickupDate);
  const secondDate = new Date(dropOffDate);

  const duration = Math.round(Math.abs((secondDate - firstDate) / DAY));
  return Math.max(1, duration);
}

function getWeekdayWeekendBasePrice(pickupDate, dropOffDate, dailyRate) {
  const firstDate = new Date(pickupDate);
  const secondDate = new Date(dropOffDate);
  const totalDays = getRentalDuration(firstDate, secondDate);
  let total = 0;

  for (let i = 0; i < totalDays; i += 1) {
    const currentDate = new Date(firstDate.getTime() + i * DAY);
    const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
    total += dailyRate * (isWeekend ? WEEKEND_SURCHARGE : 1);
  }

  return total;
}

function getSeason(pickupDate, dropOffDate) {
  const pickup = new Date(pickupDate);
  const dropoff = new Date(dropOffDate);

  const pickupMonth = pickup.getMonth();
  const dropoffMonth = dropoff.getMonth();

  if (
    (pickupMonth >= HIGH_SEASON_START_MONTH && pickupMonth <= HIGH_SEASON_END_MONTH) ||
    (dropoffMonth >= HIGH_SEASON_START_MONTH && dropoffMonth <= HIGH_SEASON_END_MONTH) ||
    (pickupMonth < HIGH_SEASON_START_MONTH && dropoffMonth > HIGH_SEASON_END_MONTH)
  ) {
    return "High";
  } else {
    return "Low";
  }
}

function formatPrice(value) {
  const rounded = Math.round(value * 100) / 100;
  return rounded.toString();
}

exports.price = price;
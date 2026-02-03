
// rentalPrice.js - refactored and extended
const MIN_DRIVER_AGE = 18;
const MAX_AGE_FOR_RESTRICTED = 21;
const RACER_YOUNG_AGE = 25;
const RACER_SURCHARGE = 1.5;
const HIGH_SEASON_MULT = 1.15;
const LONG_RENTAL_DAYS = 10;
const LONG_RENTAL_DISCOUNT = 0.9;
const LICENSE_SHORT_YEARS_SURCHARGE = 1.3; // +30%
const HIGH_SEASON_LICENSE_ADDITION = 15; // per day
const WEEKEND_SURCHARGE = 1.05; // +5% on weekends

function normalizeClazz(type) {
  if (!type) return 'Unknown';
  const t = String(type).toLowerCase();
  if (t === 'compact') return 'Compact';
  if (t === 'electric') return 'Electric';
  if (t === 'cabrio') return 'Cabrio';
  if (t === 'racer') return 'Racer';
  return 'Unknown';
}

function getRentalDays(pickupDate, dropoffDate) {
  const start = new Date(pickupDate);
  const end = new Date(dropoffDate);
  const days = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }
  return days;
}

function isWeekend(date) {
  const day = date.getDay(); // 0 - Sunday, 6 - Saturday
  return day === 0 || day === 6;
}

function getSeason(pickupDate, dropoffDate) {
  // High season: April (3) .. October (9)
  const days = getRentalDays(pickupDate, dropoffDate);
  const highMonths = new Set([3, 4, 5, 6, 7, 8, 9]);
  for (const d of days) {
    if (highMonths.has(d.getMonth())) return 'High';
  }
  return 'Low';
}

function formatCurrency(amount) {
  // If integer, don't show decimals, otherwise show two decimals
  if (Number.isInteger(amount)) return `$${amount}`;
  return `$${amount.toFixed(2)}`;
}

function price(pickup, dropoff, pickupDate, dropoffDate, type, age, licenseYears = 0) {
  const clazz = normalizeClazz(type);
  const days = getRentalDays(pickupDate, dropoffDate);
  const daysCount = days.length;
  const season = getSeason(pickupDate, dropoffDate);

  if (age < MIN_DRIVER_AGE) return 'Driver too young - cannot quote the price';
  if (age <= MAX_AGE_FOR_RESTRICTED && clazz !== 'Compact') return 'Drivers 21 y/o or less can only rent Compact vehicles';
  if (licenseYears < 1) return "Drivers license held for less than a year - cannot quote the price";

  let total = 0;

  for (const day of days) {
    let perDay = age; // minimum per-day price equal to driver's age

    // Racer surcharge for young drivers (except during low season)
    if (clazz === 'Racer' && age <= RACER_YOUNG_AGE && season !== 'Low') {
      perDay *= RACER_SURCHARGE;
    }

    // Season surcharge (High season +15%)
    if (season === 'High') {
      perDay *= HIGH_SEASON_MULT;
    } else {
      // Low season: discount for long rentals (>10 days)
      if (daysCount > LONG_RENTAL_DAYS) {
        perDay *= LONG_RENTAL_DISCOUNT;
      }
    }

    // License based increases
    if (licenseYears < 2) {
      perDay *= LICENSE_SHORT_YEARS_SURCHARGE;
    }

    // Additional fixed amount per day for licenses held less than 3 years during high season
    if (licenseYears < 3 && season === 'High') {
      perDay += HIGH_SEASON_LICENSE_ADDITION;
    }

    // Weekend surcharge
    if (isWeekend(day)) {
      perDay *= WEEKEND_SURCHARGE;
    }

    // Enforce minimum per-day price equal to driver's age
    if (perDay < age) perDay = age;

    total += perDay;
  }

  return formatCurrency(Number(total.toFixed(2)));
}

module.exports = { price, getSeason, getRentalDays, normalizeClazz };
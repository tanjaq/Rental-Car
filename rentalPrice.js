const DAY_MS = 24 * 60 * 60 * 1000;
const MIN_AGE = 18;
const COMPACT_ONLY_AGE = 21;
const YOUNG_RACER_AGE = 25;
const HIGH_START_MONTH = 3;
const HIGH_END_MONTH = 9;
const HIGH_SEASON_RATE = 1.15;
const YOUNG_RACER_RATE = 1.5;
const NEW_DRIVER_RATE = 1.3;
const NEW_DRIVER_DAILY_FEE = 15;
const LONG_RENTAL_DAYS = 10;
const LONG_RENTAL_RATE = 0.9;
const ONE_WAY_FEE = 25;
const WEEKEND_RATE = 1.05;
const SATURDAY = 6;
const SUNDAY = 0;
const CAR_TYPES = ["compact", "electric", "cabrio", "racer"];

function calendarDay(value) {
  const date = new Date(value);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function rentalDays(firstDay, lastDay) {
  const days = [];
  for (let day = firstDay; day <= lastDay; day += DAY_MS) {
    days.push(new Date(day));
  }
  return days;
}

function isHighSeason(day) {
  const month = day.getUTCMonth();
  return month >= HIGH_START_MONTH && month <= HIGH_END_MONTH;
}

function dailyPrice(age, licenseYears, type, highSeason, days) {
  let amount = age;
  if (highSeason) {
    if (type === "racer" && age <= YOUNG_RACER_AGE) {
      amount *= YOUNG_RACER_RATE;
    }
    amount *= HIGH_SEASON_RATE;
  } else if (days > LONG_RENTAL_DAYS) {
    amount *= LONG_RENTAL_RATE;
  }
  if (licenseYears < 2) {
    amount *= NEW_DRIVER_RATE;
  }
  if (highSeason && licenseYears < 3) {
    amount += NEW_DRIVER_DAILY_FEE;
  }
  return amount;
}

function driverError(driverAge, experience, carType) {
  if (!Number.isFinite(driverAge) || !Number.isFinite(experience)) {
    return "Age and licence years must be numbers";
  }
  if (driverAge < MIN_AGE) {
    return "Driver too young - cannot quote the price";
  }
  if (experience < 1) {
    return "Driver must hold a licence for at least one year";
  }
  if (!CAR_TYPES.includes(carType)) {
    return "Unknown car type";
  }
  if (driverAge <= COMPACT_ONLY_AGE && carType !== "compact") {
    return "Drivers 21 y/o or less can only rent Compact vehicles";
  }
  return "";
}

function price(pickup, dropoff, pickupDate, dropoffDate, type, age, licenseYears) {
  const driverAge = Number(age);
  const experience = Number(licenseYears);
  const carType = String(type).toLowerCase();
  const error = driverError(driverAge, experience, carType);
  if (error) {
    return error;
  }
  const firstDay = calendarDay(pickupDate);
  const lastDay = calendarDay(dropoffDate);
  if (!Number.isFinite(firstDay) || !Number.isFinite(lastDay) || lastDay < firstDay) {
    return "Invalid rental dates";
  }
  const days = rentalDays(firstDay, lastDay);
  const highSeason = days.some(isHighSeason);
  const perDay = dailyPrice(driverAge, experience, carType, highSeason, days.length);
  const total = days.reduce((sum, day) => {
    const weekday = day.getUTCDay();
    const weekend = weekday === SATURDAY || weekday === SUNDAY;
    return sum + perDay * (weekend ? WEEKEND_RATE : 1);
  }, 0);
  const oneWayFee = pickup === dropoff ? 0 : ONE_WAY_FEE;
  return `$${(total + oneWayFee).toFixed(2)}`;
}

module.exports = { price };

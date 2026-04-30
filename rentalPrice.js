const HIGH_SEASON_START = 3;
const HIGH_SEASON_END = 9;

function price(pickup, dropoff, pickupDate, dropoffDate, type, age, licenseYears) {
  const days = getDays(pickupDate, dropoffDate);

  if (age < 18) {
    return "Driver too young - cannot quote the price";
  }

  if (licenseYears < 1) {
    return "License less than 1 year - cannot rent";
  }

  if (age <= 21 && type !== "Compact") {
    return "Drivers 21 y/o or less can only rent Compact vehicles";
  }

  let total = 0;

  for (let i = 0; i < days; i++) {
    const date = addDays(new Date(pickupDate), i);
    let daily = age;

    if (isHighSeason(date)) {
      daily *= 1.15;
    }

    if (type === "Racer" && age <= 25 && isHighSeason(date)) {
      daily *= 1.5;
    }

    if (licenseYears < 2) {
      daily *= 1.3;
    }

    if (licenseYears < 3 && isHighSeason(date)) {
      daily += 15;
    }

    if (isWeekend(date)) {
      daily *= 1.05;
    }

    total += Math.max(daily, age);
  }

  if (days > 10 && isLowSeasonRange(pickupDate, dropoffDate)) {
    total *= 0.9;
  }

  return "$" + total.toFixed(2);
}


function getDays(start, end) {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((end - start) / oneDay)) + 1;
}

function isHighSeason(date) {
  const m = date.getMonth();
  return m >= HIGH_SEASON_START && m <= HIGH_SEASON_END;
}

function isLowSeasonRange(start, end) {
  const days = getDays(start, end);

  for (let i = 0; i < days; i++) {
    if (isHighSeason(addDays(new Date(start), i))) {
      return false;
    }
  }
  return true;
}

function isWeekend(date) {
  const d = date.getDay();
  return d === 0 || d === 6;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

exports.price = price;
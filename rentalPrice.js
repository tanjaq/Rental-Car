function isHighSeason(date) {
  const m = date.getMonth();
  return m >= 5 && m <= 7;
}

function isWeekend(d) {
  const day = d.getDay();
  return day === 0 || day === 6;
}

function daysBetween(start, end) {
  let days = 0;
  const d = new Date(start);

  while (d < end) {
    days++;
    d.setDate(d.getDate() + 1);
  }

  return days;
}

function format(n) {
  // test wants flexible formatting
  return `$${Number(n.toFixed(2)).toString()}`;
}

function price(pickup, dropoff, start, end, vehicle, age, licenseYears = 3) {
  const v = vehicle.toLowerCase();

  const valid = ['compact', 'cabrio', 'electric', 'racer'];
  if (!valid.includes(v)) return 'Unknown vehicle type';

  if (licenseYears < 1) {
    return "Driver's license held for less than 1 year - ineligible to rent";
  }

  if (age < 18) return 'Driver too young - cannot quote the price';

  if (age <= 21 && v !== 'compact') {
    return 'Drivers 21 y/o or less can only rent Compact vehicles';
  }

  const days = daysBetween(start, end);

  const high = isHighSeason(start) || isHighSeason(end);

  let total = 0;

  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);

    let dayPrice = 30;

    if (isWeekend(d)) dayPrice *= 1.05;

    total += dayPrice;
  }

  // RACER FIRST
  if (v === 'racer' && age <= 25) {
    total *= 1.5;
  }

  // license multiplier
  if (licenseYears < 2) {
    total *= 1.3;
  }

  // high season multiplier
  if (high) {
    total *= 1.15;
  }

  // €15/day
  if (licenseYears < 3 && high) {
    total += 15 * days;
  }

  // discount LAST (important)
  if (days > 10 && !high) {
    total *= 0.9;
  }

  return format(total);
}

module.exports = { price };
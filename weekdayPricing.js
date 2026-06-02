const WEEKEND_DAYS = [0, 6]; // 0 = Sunday, 6 = Saturday
const WEEKEND_MULTIPLIER = 1.05;

function isWeekend(date) {
  return WEEKEND_DAYS.includes(new Date(date).getDay());
}

function getDayPrice(basePrice, date) {
  return isWeekend(date) ? basePrice * WEEKEND_MULTIPLIER : basePrice;
}

/**
 * Calculates total rental price considering weekday/weekend pricing.
 * @param {string} startDate  - ISO date string (e.g. '2024-01-01')
 * @param {string} carClass   - Car class
 * @param {number} age        - Driver's age (used as base daily price)
 * @param {number} licenseYears
 * @param {number} days       - Number of rental days (default 1)
 */
function calculatePriceByDates(startDate, carClass, age, licenseYears, days = 1) {
  const dailyBase = age;
  let total = 0;

  for (let i = 0; i < days; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + i);
    total += getDayPrice(dailyBase, currentDate);
  }

  return total;
}

module.exports = {
  calculatePriceByDates,
  isWeekend,
  getDayPrice,
};

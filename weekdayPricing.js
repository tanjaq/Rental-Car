const WEEKEND_DAYS = [0, 6];
const WEEKEND_MULTIPLIER = 1.05;

function isWeekend(date) {
  return WEEKEND_DAYS.includes(new Date(date).getDay());
}

function getDayPrice(basePrice, date) {
  return isWeekend(date) ? basePrice * WEEKEND_MULTIPLIER : basePrice;
}

function calculatePriceByDates(startDate, carClass, age, licenseYears, days = 1) {
  const dailyBase = age;
  let total = 0;

  for (let i = 0; i < days; i += 1) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + i);
    total += getDayPrice(dailyBase, currentDate);
  }

  return total;
}

module.exports = {
  calculatePriceByDates,
  isWeekend,
  getDayPrice
};

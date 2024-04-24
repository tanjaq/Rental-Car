const oneDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds

const getPeriodInYears = (startDate, endDate) => {
    const startYear = new Date(startDate);
    const endYear = new Date(endDate);

    const oneYear = 365 * oneDay;

    return Number((Math.abs(endYear - startYear) / oneYear).toFixed(1));
}

const getDays = (pickupDate, dropoffDate) => {
  const firstDate = new Date(pickupDate);
  const secondDate = new Date(dropoffDate);

  const result = Math.round(Math.abs((firstDate - secondDate) / oneDay))

  return result !== 0 ? result : 1;
}

const getSeason = (pickupDate, dropoffDate) => {
  const pickup = new Date(pickupDate);
  const dropoff = new Date(dropoffDate);

  const seasonStartMonth = 4;
  const seasonEndMonth = 10;

  const pickupMonth = pickup.getMonth() + 1;
  const dropoffMonth = dropoff.getMonth() + 1;

  if (
    (pickupMonth >= seasonStartMonth && pickupMonth <= seasonEndMonth) ||
    (dropoffMonth >= seasonStartMonth && dropoffMonth <= seasonEndMonth) ||
    (pickupMonth < seasonStartMonth && dropoffMonth > seasonEndMonth)
    ) {
    return "high";
  }
  else {
    return "low";
  }
}

exports.getPeriodInYears = getPeriodInYears;
exports.getDays = getDays;
exports.getSeason = getSeason;

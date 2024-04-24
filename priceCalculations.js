const { getDays, getSeason } = require('./utils');

const seasonPrice = (age, pickupDate, dropoffDate, licenseAge) => {
  const days = getDays(pickupDate, dropoffDate);
  const season = getSeason(pickupDate, dropoffDate);
  const coefficients = {
      lowDiscounted: 0.9, // 10+ days period
      low: 1,
      high: 1.15
  };
  const inexperiencedDriverAddition = 15;

  let price = age * days;

  if (licenseAge < 3 && season === 'high') price += inexperiencedDriverAddition * days;

  if (days > 10 && season === 'low') return price * coefficients['lowDiscounted'];

  return price * coefficients[season];
};

const applyExperienceCoefficients = (age, pickupDate, dropoffDate, type, licenseAge) => {
  const youngRacerCoefficient = 1.5; // <=25 years old + racer class
  const inexperiencedDriverCoefficient = 1.3; // less than 2 years license

  let price = seasonPrice(age, pickupDate, dropoffDate, licenseAge);

  if (type === 'racer' && age <= 25) price *= youngRacerCoefficient;
  if (licenseAge < 2) price *= inexperiencedDriverCoefficient;

  return price;
}

exports.applyExperienceCoefficients = applyExperienceCoefficients;

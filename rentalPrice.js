const carClasses = Object.freeze({
  compact: 'Compact',
  electric: 'Electric',
  cabrio: 'Cabrio',
  racer: 'Racer',
  unknown: 'Unknown',
});

const seasons = Object.freeze({
  low: 'Low',
  high: 'High',
});

const rules = Object.freeze({
  minimumDriverAge: 18,
  compactOnlyMaxAge: 21,
  racerSurchargeMaxAge: 25,
  minimumLicenseYears: 1,
  shortLicenseSurchargeYears: 2,
  extraDailyFeeLicenseYears: 3,
  extraDailyFeeInHighSeason: 15,
  longRentalThresholdDays: 10,
  highSeasonMultiplier: 1.15,
  racerYoungDriverMultiplier: 1.5,
  longRentalDiscountMultiplier: 0.9,
  shortLicenseMultiplier: 1.3,
  weekendDayMultiplier: 1.05,
  millisecondsInOneDay: 24 * 60 * 60 * 1000,
  highSeasonStartMonth: 3, // April
  highSeasonEndMonth: 9,   // October
});

function price({ pickupDate, dropoffDate, type, age, licenseYearsHeld }) {
  const carClass = getCarClass(type);
  const rentalDays = calculateRentalDays(pickupDate, dropoffDate);
  const season = determineSeason(pickupDate, dropoffDate);

  const eligibilityError = validateDriverEligibility({
    age,
    carClass,
    licenseYearsHeld,
  });

  if (eligibilityError) {
    return eligibilityError;
  }

  const dailyBasePrice = calculateDailyBasePrice({
    age,
    season,
    licenseYearsHeld,
  });

  const baseRentalPrice = calculateBaseRentalPrice({
    dailyBasePrice,
    pickupDate,
    dropoffDate
   });

  const finalPrice = applyPricingRules({
    baseRentalPrice,
    age,
    carClass,
    season,
    rentalDays,
    licenseYearsHeld,
  });

  return formatPrice(finalPrice);
}

function calculateBaseRentalPrice({ dailyBasePrice, pickupDate, dropoffDate }) {
  const rentalDays = calculateRentalDays(pickupDate, dropoffDate);
  const weekendDays = countWeekendDays(pickupDate, dropoffDate);
  const weekdayDays = rentalDays - weekendDays;

  const weekdayPrice = weekdayDays * dailyBasePrice;
  const weekendPrice =
    weekendDays * dailyBasePrice * rules.weekendDayMultiplier;

  return weekdayPrice + weekendPrice;
}

function countWeekendDays(pickupDate, dropoffDate) {
  const startDate = new Date(Math.min(pickupDate, dropoffDate));
  const rentalDays = calculateRentalDays(pickupDate, dropoffDate);

  let weekendDays = 0;
  const currentDate = new Date(startDate);

  for (let dayIndex = 0; dayIndex < rentalDays; dayIndex += 1) {
    if (isWeekend(currentDate)) {
      weekendDays += 1;
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return weekendDays;
}

function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function getCarClass(type) {
	const normalizedType = String(type).trim().toLowerCase();

  const classMap = {
    compact: carClasses.compact,
    electric: carClasses.electric,
    cabrio: carClasses.cabrio,
    racer: carClasses.racer,
	};

  return classMap[normalizedType] ?? carClasses.unknown;
}

function calculateRentalDays(pickupDate, dropoffDate) {
  const differenceInDays = Math.round(
    Math.abs(dropoffDate - pickupDate) / rules.millisecondsInOneDay
  );

  return differenceInDays + 1;
}

function determineSeason(pickupDate, dropoffDate) {
  const startDate = new Date(Math.min(pickupDate, dropoffDate));
  const endDate = new Date(Math.max(pickupDate, dropoffDate));

  const currentMonth = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    1
  );

  const lastMonth = new Date(
    endDate.getFullYear(),
    endDate.getMonth(),
    1
  );

  while (currentMonth <= lastMonth) {
    if (isHighSeasonMonth(currentMonth.getMonth())) {
      return seasons.high;
    }

    currentMonth.setMonth(currentMonth.getMonth() + 1);
  }

  return seasons.low;
}

function isHighSeasonMonth(month) {
  return (
    month >= rules.highSeasonStartMonth &&
    month <= rules.highSeasonEndMonth
  );
}

function validateDriverEligibility({ age, carClass, licenseYearsHeld }) {
  if (carClass === carClasses.unknown) {
    return 'Unknown car type';
  }

  if (age < rules.minimumDriverAge) {
    return 'Driver too young - cannot quote the price';
  }

  if (licenseYearsHeld < rules.minimumLicenseYears) {
    return 'Driver has held a license for less than a year - cannot quote the price';
  }

  if (age <= rules.compactOnlyMaxAge && carClass !== carClasses.compact) {
    return 'Drivers aged 18-21 can only rent Compact vehicles';
  }

  return null;
}

function calculateDailyBasePrice({ age, season, licenseYearsHeld }) {
  let dailyPrice = age;

  if (
    season === seasons.high &&
    licenseYearsHeld < rules.extraDailyFeeLicenseYears
  ) {
    dailyPrice += rules.extraDailyFeeInHighSeason;
  }

  return dailyPrice;
}

function applyPricingRules({
  baseRentalPrice,
  age,
  carClass,
  season,
  rentalDays,
  licenseYearsHeld,
}) {
  let finalPrice = baseRentalPrice;

  if (shouldApplyRacerSurcharge({ age, carClass, season })) {
    finalPrice *= rules.racerYoungDriverMultiplier;
  }

  if (season === seasons.high) {
    finalPrice *= rules.highSeasonMultiplier;
  }

  if (shouldApplyLongRentalDiscount({ rentalDays, season })) {
    finalPrice *= rules.longRentalDiscountMultiplier;
  }

  if (licenseYearsHeld < rules.shortLicenseSurchargeYears) {
    finalPrice *= rules.shortLicenseMultiplier;
  }

  return finalPrice;
}

function shouldApplyRacerSurcharge({ age, carClass, season }) {
  return (
    carClass === carClasses.racer &&
    age <= rules.racerSurchargeMaxAge &&
    season === seasons.high
  );
}

function shouldApplyLongRentalDiscount({ rentalDays, season }) {
  return (
    rentalDays > rules.longRentalThresholdDays &&
    season === seasons.low
  );
}

function formatPrice(amount) {
  return `$${Number(amount.toFixed(2))}`;
}

module.exports = {
  price,
  getCarClass,
  calculateRentalDays,
  determineSeason,
  isHighSeasonMonth,
  validateDriverEligibility,
  calculateDailyBasePrice,
  applyPricingRules,
  shouldApplyRacerSurcharge,
  shouldApplyLongRentalDiscount,
  calculateBaseRentalPrice,
  countWeekendDays,
  isWeekend,
};
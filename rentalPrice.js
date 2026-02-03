// Constants
const MINIMUM_DRIVER_AGE = 18;
const YOUNG_DRIVER_AGE = 21;
const RACER_INSURANCE_AGE = 25;
const YOUNG_DRIVER_MIN_DAYS = 10;

const DRIVER_LICENSE_MINIMUM_YEARS = 1;
const DRIVER_LICENSE_PRICE_INCREASE_YEARS = 2;
const DRIVER_LICENSE_HIGH_SEASON_SURCHARGE_YEARS = 3;

const YOUNG_DRIVER_RACER_MULTIPLIER = 1.5;
const HIGH_SEASON_MULTIPLIER = 1.15;
const LONG_RENTAL_DISCOUNT = 0.9;
const DRIVER_LICENSE_PRICE_INCREASE_PERCENTAGE = 0.30; // 30%
const DRIVER_LICENSE_HIGH_SEASON_SURCHARGE = 15; // euros
const WEEKEND_MULTIPLIER = 1.05; // 5% weekend rate increase

function price(pickup, dropoff, pickupDate, dropoffDate, vehicleType, driverAge, licenseYears) {
  const vehicleClass = normalizeVehicleType(vehicleType);
  const season = determineSeason(pickupDate, dropoffDate);

  // Validation: Check driver's license eligibility
  if (licenseYears < DRIVER_LICENSE_MINIMUM_YEARS) {
      return "Driver's license held for less than 1 year - ineligible to rent";
  }

  // Validation: Check driver age
  if (driverAge < MINIMUM_DRIVER_AGE) {
      return "Driver too young - cannot quote the price";
  }

  // Validation: Check young driver restrictions
  if (driverAge <= YOUNG_DRIVER_AGE && vehicleClass !== "Compact") {
      return "Drivers 21 y/o or less can only rent Compact vehicles";
  }

  // Calculate price with weekday/weekend breakdown
  const priceData = calculatePriceWithWeekendBreakdown(driverAge, pickupDate, dropoffDate, vehicleClass, season);

  // Apply driver's license surcharges
  let rentalPrice = applyLicenseSurcharges(priceData.price, licenseYears, priceData.days, season);

  return '$' + Math.round(rentalPrice * 100) / 100;
}

function calculatePriceWithWeekendBreakdown(driverAge, pickupDate, dropoffDate, vehicleClass, season) {
  const startDate = new Date(pickupDate);
  const endDate = new Date(dropoffDate);
  
  let totalPrice = 0;
  let dayCount = 0;
  let currentDate = new Date(startDate);
  
  // Iterate through each day from pickup to dropoff (exclusive)
  while (currentDate < endDate) {
    const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
    
    // Calculate daily rate
    let dailyRate = driverAge;
    
    // Apply weekend multiplier if applicable
    if (isWeekend) {
      dailyRate *= WEEKEND_MULTIPLIER;
    }
    
    // Apply racer surcharge for age <= 25 in high season
    if (vehicleClass === "Racer" && driverAge <= RACER_INSURANCE_AGE && season === "High") {
      dailyRate *= YOUNG_DRIVER_RACER_MULTIPLIER;
    }
    
    // Apply high season multiplier
    if (season === "High") {
      dailyRate *= HIGH_SEASON_MULTIPLIER;
    }
    
    totalPrice += dailyRate;
    dayCount++;
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Apply long rental discount (0.9x for > 10 days in low season)
  // Note: This discount applies to the entire rental, not individual days
  if (dayCount > YOUNG_DRIVER_MIN_DAYS && season === "Low") {
    totalPrice *= LONG_RENTAL_DISCOUNT;
  }
  
  return { price: totalPrice, days: dayCount };
}

function applyLicenseSurcharges(basePrice, licenseYears, rentalDays, season) {
  let adjustedPrice = basePrice;

  // If license held for less than 2 years: 30% price increase
  if (licenseYears < DRIVER_LICENSE_PRICE_INCREASE_YEARS) {
      adjustedPrice *= (1 + DRIVER_LICENSE_PRICE_INCREASE_PERCENTAGE);
  }

  // If license held for less than 3 years: additional 15 euros per day during high season
  if (licenseYears < DRIVER_LICENSE_HIGH_SEASON_SURCHARGE_YEARS && season === "High") {
      adjustedPrice += DRIVER_LICENSE_HIGH_SEASON_SURCHARGE * rentalDays;
  }

  return adjustedPrice;
}

function normalizeVehicleType(type) {
  const normalizedType = String(type).toLowerCase();
  
  switch (normalizedType) {
      case "compact":
          return "Compact";
      case "electric":
          return "Electric";
      case "cabrio":
          return "Cabrio";
      case "racer":
          return "Racer";
      default:
          return "Unknown";
  }
}

function calculateRentalDays(pickupDate, dropoffDate) {
  const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
  const pickupDateTime = new Date(pickupDate);
  const dropoffDateTime = new Date(dropoffDate);

  return Math.round(Math.abs((pickupDateTime - dropoffDateTime) / MILLISECONDS_PER_DAY)) + 1;
}

function determineSeason(pickupDate, dropoffDate) {
  const pickupDateTime = new Date(pickupDate);
  const dropoffDateTime = new Date(dropoffDate);

  const HIGH_SEASON_START_MONTH = 4;  // May (0-indexed: 4)
  const HIGH_SEASON_END_MONTH = 10;   // November (0-indexed: 10)

  const pickupMonth = pickupDateTime.getMonth();
  const dropoffMonth = dropoffDateTime.getMonth();

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

exports.price = price;
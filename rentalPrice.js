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

function price(pickup, dropoff, pickupDate, dropoffDate, vehicleType, driverAge, licenseYears) {
  const vehicleClass = normalizeVehicleType(vehicleType);
  const rentalDays = calculateRentalDays(pickupDate, dropoffDate);
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

  // Calculate base price
  let rentalPrice = calculateBasePrice(driverAge, rentalDays, vehicleClass, season);

  // Apply driver's license surcharges
  rentalPrice = applyLicenseSurcharges(rentalPrice, licenseYears, rentalDays, season);

  return '$' + Math.round(rentalPrice * 100) / 100;
}

function calculateBasePrice(driverAge, rentalDays, vehicleClass, season) {
  let basePrice = driverAge * rentalDays;

  if (vehicleClass === "Racer" && driverAge <= RACER_INSURANCE_AGE && season === "High") {
      basePrice *= YOUNG_DRIVER_RACER_MULTIPLIER;
  }

  if (season === "High") {
    basePrice *= HIGH_SEASON_MULTIPLIER;
  }

  if (rentalDays > YOUNG_DRIVER_MIN_DAYS && season === "Low") {
      basePrice *= LONG_RENTAL_DISCOUNT;
  }

  return basePrice;
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
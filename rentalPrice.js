function getRentalPrice(
  pickupDate,
  dropoffDate,
  carClass,
  driverAge,
  licenseIssueDate,
  licenseExpiryDate
) {
  carClass = getCarClass(carClass);

  const rentalDays = getRentalDays(pickupDate, dropoffDate);
  const rentalSeason = getRentalSeason(pickupDate, dropoffDate);

  if (driverAge < 18) {
    return "Driver too young - cannot quote the price";
  }

  if (driverAge <= 21 && carClass !== "Compact") {
    return "Drivers 21 y/o or less can only rent Compact vehicles";
  }

  const rentalPrice = calculateRentalPrice(
    licenseIssueDate,
    licenseExpiryDate,
    driverAge,
    rentalDays,
    rentalSeason,
    carClass
  );

  return rentalPrice;
}

function calculateRentalPrice(
  licenseIssueDate,
  licenseExpiryDate,
  driverAge,
  rentalDays,
  rentalSeason,
  carClass
) {
  const licenseIssue = new Date(licenseIssueDate);
  const licenseExpiry = new Date(licenseExpiryDate);
  const licenseDurationInYears =
    (licenseExpiry - licenseIssue) / (1000 * 60 * 60 * 24 * 365);

  if (licenseDurationInYears < 1) {
    return "Individuals holding a driver's license for less than a year are ineligible to rent.";
  }

  let rentalPrice = driverAge * rentalDays;

  if (licenseDurationInYears < 2) {
    rentalPrice *= 1.3; // Increase price by 30%
  }

  if (licenseDurationInYears < 3 && rentalSeason === "High") {
    rentalPrice += 15 * rentalDays; // Add 15 euros to the daily rental price
  }

  if (carClass === "Racer" && driverAge <= 25 && rentalSeason === "High") {
    rentalPrice *= 1.5;
  }

  if (rentalSeason === "High") {
    rentalPrice *= 1.15;
  }

  if (rentalDays > 10 && rentalSeason === "Low") {
    rentalPrice *= 0.9;
  }

  return "$" + rentalPrice;
}

function getCarClass(carClass) {
  switch (carClass) {
    case "Compact":
      return "Compact";
    case "Electric":
      return "Electric";
    case "Cabrio":
      return "Cabrio";
    case "Racer":
      return "Racer";
    default:
      return "Unknown";
  }
}

function getRentalDays(pickupDate, dropoffDate) {
  const oneDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds

  const firstDate = new Date(pickupDate);
  const secondDate = new Date(dropoffDate);

  const timeDifference = Math.abs(firstDate - secondDate);
  const days = Math.round(timeDifference / oneDay) + 1;

  return days;
}

function getRentalSeason(pickupDate, dropoffDate) {
  const highSeasonStartMonth = 4; // May
  const highSeasonEndMonth = 10; // November

  const pickupMonth = new Date(pickupDate).getMonth();
  const dropoffMonth = new Date(dropoffDate).getMonth();

  const isHighSeason =
    (pickupMonth >= highSeasonStartMonth &&
      pickupMonth <= highSeasonEndMonth) ||
    (dropoffMonth >= highSeasonStartMonth &&
      dropoffMonth <= highSeasonEndMonth) ||
    (pickupMonth < highSeasonStartMonth && dropoffMonth > highSeasonEndMonth);

  return isHighSeason ? "High" : "Low";
}

module.exports = { getRentalPrice };

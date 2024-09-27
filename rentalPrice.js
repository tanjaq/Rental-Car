function price(pickupDate, dropoffDate, type, age, licenseDate) {
  const rentDays = getRentalDays(pickupDate, dropoffDate);
  const season = getRentalSeason(pickupDate, dropoffDate);
  const license = calculateLicenseHoldingDays(licenseDate);
  const carClass = getCarClass(type);
  const YearToDays = 365;

  // Check if the driver is eligible to rent
  if (age < 18) {
    return "Driver too young - cannot quote the price";
  }

  if (age <= 21 && carClass !== "Compact") {
    return "Drivers 21 y/o or less can only rent Compact vehicles";
  }

  if (license < YearToDays) {
    return "Drivers holding a driver's license for less than a year are ineligible to rent";
  } 

  let rentalPrice = calculatePrice(carClass, season, license, rentDays, age);
  return rentalPrice.toFixed(2);
}

function calculatePrice(carClass, season, license, rentDays, age) {
  const YearToDays = 365;

  // The minimum rental price per day is equivalent to the age of the driver.
  let rentalPrice = age * rentDays;

  // If the driver's license has been held for less than two years, the rental price is increased by 30%.
  if (license < YearToDays * 2) {
    rentalPrice *= 1.3;
  }

  // For Racers, the price is increased by 50% if the driver is 25 years old or younger (except during the low season).
  if (carClass === "Racer" && age <= 25 && season === "High") {
    rentalPrice *= 1.5;
  }

  // If renting in High season, price is increased by 15%.
  if (season === "High") {
    rentalPrice *= 1.15;
  }

  // If the driver's license has been held for less than three years, an additional 15 euros will be added to the daily rental price during high season.
  if (license < YearToDays * 3 && season === "High") {
    rentalPrice += 15 * rentDays;
  }

  // If renting for more than 10 days, the price is decreased by 10% (except during the high season).
  if (rentDays > 10 && season === "Low") {
    rentalPrice *= 0.9;
  }

  return rentalPrice;
}

function getCarClass(type) {
  switch (type) {
    case "Compact":
      return "Compact";
    case "Electric":
      return "Electric";
    case "Cabrio":
      return "Cabrio";
    case "Racer":
      return "Racer";
    default:
      return "Compact";
  }
}

function getRentalDays(pickupDate, dropoffDate) {
  const millisecondsInDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
  const rentStart = new Date(pickupDate);
  const rentEnd = new Date(dropoffDate);

  return Math.round(Math.abs((rentEnd - rentStart) / millisecondsInDay)) + 1;
}

function getRentalSeason(pickupDate, dropoffDate) {
  const rentStart = new Date(pickupDate);
  const rentEnd = new Date(dropoffDate);

  const HighSeasonStart = 4; // May 
  const HighSeasonEnd = 9; // October 

  const rentStartMonth = rentStart.getMonth(); // getMonth() 
  const rentEndMonth = rentEnd.getMonth();

  if (
    (rentStartMonth >= HighSeasonStart && rentStartMonth <= HighSeasonEnd) ||
    (rentEndMonth >= HighSeasonStart && rentEndMonth <= HighSeasonEnd) ||
    (rentStartMonth < HighSeasonStart && rentEndMonth > HighSeasonEnd)
  ) {
    return "High";
  } else {
    return "Low";
  }
}


function calculateLicenseHoldingDays(licenseDate) {
  const millisecondsInDay = 24 * 60 * 60 * 1000;
  const licenseObtainDate = new Date(licenseDate);
  const currentDate = new Date();
  const timeDifference = currentDate - licenseObtainDate;
  const daysHeld = Math.ceil(timeDifference / millisecondsInDay);
  return daysHeld;
}

function isWeekend(rentDate) {
  let dayOfWeek = new Date(rentDate).getDay(); 
  return dayOfWeek === 0 || dayOfWeek === 6;
}

function getWeekendPrice(pickupDate, age, rentDays) {
  let totalPrice = 0;
  let clientAge = parseInt(age);
  let currentLoopDay = new Date(pickupDate);

  for (let i = 0; i < rentDays; i++) {
    if (isWeekend(currentLoopDay)) {
      totalPrice += clientAge * 1.05;
    } else {
      totalPrice += clientAge;
    }

    currentLoopDay.setDate(currentLoopDay.getDate() + 1);
  }

  return parseFloat(totalPrice.toFixed(2));
}


exports.price = price;
exports.getWeekendPrice = getWeekendPrice;
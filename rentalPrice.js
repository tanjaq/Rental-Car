
function price(pickup, dropoff, pickupDate, dropoffDate, type, age, licenseCreationDate) {
  const vihicleClass = getVihicleType(type);
  const days = get_days(pickupDate, dropoffDate);
  const season = getSeason(pickupDate, dropoffDate);

  if (age < 18) {
      return "Driver too young - cannot quote the price";
  }

  if (age <= 21 && vihicleClass !== "Compact") {
      return "Drivers 21 y/o or less can only rent Compact vehicles";
  }

  // Date variables
  var currentYear = new Date().getFullYear();
  var licenseCreationYear = new Date(licenseCreationDate).getFullYear();

  // Check that individuals holding a driver's license for less than a year
  if (licenseCreationYear > (currentYear - 1)){
    return "Individuals holding a driver's license for less than a year are ineligible to rent";
  }

  // Calculate price
  let rentalprice = age * days;

  // Check that driver's license has been held for less than two years
  if (licenseCreationYear > (currentYear - 2)){
    rentalprice *= 1.3;
  }

  // Check that driver's license has been held for less than three years
  if (licenseCreationYear <= (currentYear - 3) && season === "High"){
    // Additional 15 euros added to the daily rental price during high season
    rentalprice += 15;
    console.log("aaa");
  }

  if (vihicleClass === "Racer" && age <= 25 && season === "High") {
      rentalprice *= 1.5;
  }

  if (season === "High" ) {
    rentalprice *= 1.15;
  }

  if (days > 10 && season === "Low" ) {
      rentalprice *= 0.9;
  }
  return '$' + rentalprice;
}

function getVihicleType(type) {
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
          return "Unknown";
  }
}

function get_days(pickupDate, dropoffDate) {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const pickUp = new Date(pickupDate);
  const dropOff = new Date(dropoffDate);

  return Math.round(Math.abs((pickUp - dropOff) / oneDay)) + 1;
}

function getSeason(pickupDate, dropoffDate) {
  const pickup = new Date(pickupDate);
  const dropoff = new Date(dropoffDate);

  const April = 4; 
  const October = 10;

  const pickupMonth = pickup.getMonth();
  const dropoffMonth = dropoff.getMonth();

  if (
      (pickupMonth >= April && pickupMonth <= October) ||
      (dropoffMonth >= April && dropoffMonth <= October) ||
      (pickupMonth < April && dropoffMonth > October)
  ) {
      return "High";
  } else {
      return "Low";
  }
}

exports.price = price;
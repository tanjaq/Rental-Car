const SEASONS = {
  HIGH: 'High',
  LOW: 'Low'
};

const CLASSES = {
  COMPACT: 'Compact',
  ELECTRIC: 'Electric',
  CABRIO: 'Cabrio',
  RACER: 'Racer'
};

const SEASON_START = 4; // April
const SEASON_END = 10; // October

function price(pickup, dropoff, pickupDate, dropoffDate, type, age, licenseYears) {
  const clazz = getClazz(type);
  const days = getDays(pickupDate, dropoffDate);
  const season = getSeason(pickupDate, dropoffDate);

  if (age < 18) {
      return "Driver too young - cannot quote the price";
  }
  if (age <= 21 && clazz !== CLASSES.COMPACT) {
      return "Drivers 21 y/o or less can only rent Compact vehicles";
  }
  if (licenseYears < 1) {
      return "Driver must hold a license for at least one year";
  }

  let rentalPrice = age * days;

  if (licenseYears < 2) {
      rentalPrice *= 1.3;
  }

  if (licenseYears >= 2 && licenseYears < 3 && season === SEASONS.HIGH) {
      rentalPrice += 15 * days;
  }

  if (clazz === CLASSES.RACER && age <= 25 && season === SEASONS.HIGH) {
      rentalPrice *= 1.5;
  }

  if (season === SEASONS.HIGH) {
      rentalPrice *= 1.15;
  }

  if (days > 10 && season === SEASONS.LOW) {
      rentalPrice *= 0.9;
  }

  return `$${rentalPrice.toFixed(2)}`;
}
function getClazz(type) {
  switch (type) {
    case CLASSES.COMPACT:
      return CLASSES.COMPACT;
    case CLASSES.ELECTRIC:
      return CLASSES.ELECTRIC;
    case CLASSES.CABRIO:
      return CLASSES.CABRIO;
    case CLASSES.RACER:
      return CLASSES.RACER;
    default:
      return "Unknown";
  }
}

function getDays(pickupDate, dropoffDate) {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const firstDate = new Date(pickupDate);
  const secondDate = new Date(dropoffDate);

  return Math.round(Math.abs((firstDate - secondDate) / oneDay)) + 1;
}

function getSeason(pickupDate, dropoffDate) {
  const pickup = new Date(pickupDate);
  const dropoff = new Date(dropoffDate);

  const pickupMonth = pickup.getMonth() + 1; // getMonth() returns 0-11
  const dropoffMonth = dropoff.getMonth() + 1;

  if (
    (pickupMonth >= SEASON_START && pickupMonth <= SEASON_END) ||
    (dropoffMonth >= SEASON_START && dropoffMonth <= SEASON_END) ||
    (pickupMonth < SEASON_START && dropoffMonth > SEASON_END)
  ) {
    return SEASONS.HIGH;
  } else {
    return SEASONS.LOW;
  }
}

exports.price = price;
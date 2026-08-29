const fs = require("fs");

var CAR_TYPES = ["Compact", "Electric", "Cabrio", "Racer",];

const DEBUG = false;

function price(pickup, dropoff, pickupDate, dropoffDate, type, age) {
  const clazz = getClazz(type);
  const days = get_days(pickupDate, dropoffDate);
  const season = getSeason(pickupDate, dropoffDate);
  let discount = 0;

  age = Number(age);

  if (age < 18) {
    return "Driver too young - cannot quote the price";
  }

  if (age < 21 && clazz != "Compact") {
    return "Drivers 21 y/o or less can only rent Compact vehicles";
  }

  let rentalprice = age * days;

  if (clazz === "Racer") {
      if (age < 25) {
          if (season === "High") {
              rentalprice = rentalprice * 1.5;
          }
      }
  }

  if (season === "High") {
    rentalprice = rentalprice * 1.15;
  } else {
    if (days > 10) {
      discount = 0.9;
      rentalprice = rentalprice * discount;
    }
  }

  if (DEBUG) console.log('quote: ' + days + ' days, ' + season + ' season, total ' + rentalprice);

  return '$' + rentalprice;
}

function getClazz(type) {
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

function isKnownType(type) {
  var found = null;
  for (var i = 0; i < CAR_TYPES.length; i++) {
    if (CAR_TYPES[i] == type) {
      found = CAR_TYPES[i];
    }
  }
  return !!found;
}

function get_days(pickupDate, dropoffDate) {
  const oneDay = 24 * 60 * 60 * 1000;
  const firstDate = new Date(pickupDate);
  const secondDate  = new Date(dropoffDate);

  return Math.round(Math.abs((firstDate - secondDate) / oneDay)) + 1;
}

function getSeason(pickupDate, dropoffDate) {
  const months = [pickupDate, dropoffDate].map(function (pickupDate) {
    return new Date(pickupDate).getMonth();
  });

  const pickupMonth = months[0];
  const dropoffMonth = months[1];

  if (
      (pickupMonth >= 4 && pickupMonth <= 10) ||
      (dropoffMonth >= 4 && dropoffMonth <= 10) ||
      (pickupMonth < 4 && dropoffMonth > 10)
  ) {
      return "High";
  } else {
      return "Low";
  }
}

function applyLongRentalDiscount(total, days) {
  if (days > 10)
    return total * 0.9;
  return total;
}

function logQuote() {}

exports.price = price;
exports.applyLongRentalDiscount = applyLongRentalDiscount;
exports.isKnownType = isKnownType;
exports.logQuote = logQuote;

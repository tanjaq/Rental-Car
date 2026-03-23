const { price } = require('./rentalPrice');

const parsePrice = (value) => Number.parseFloat(value.replace('$', ''));

const daysBetweenInclusive = (start, end) => {
  const oneDay = 24 * 60 * 60 * 1000;
  const firstDate = new Date(start);
  const secondDate = new Date(end);
  return Math.round(Math.abs((firstDate - secondDate) / oneDay)) + 1;
};

test('driver under 18 is ineligible', () => {
  const res = price('A', 'B', '2025-06-01', '2025-06-02', 'Compact', 17, 5);
  expect(res).toBe('Driver too young - cannot quote the price');
});

test('driver 21 or younger can only rent Compact cars', () => {
  const res = price('A', 'B', '2025-06-01', '2025-06-02', 'Electric', 21, 5);
  expect(res).toBe('Drivers 21 y/o or less can only rent Compact vehicles');
});

test('driver has held a license for less than a year', () => {
  const res = price('A', 'B', '2025-06-01', '2025-06-02', 'Compact', 25, 0.5);
  expect(res).toBe('Driver has held a license for less than a year - cannot quote the price');
});

test('high season adds daily surcharge for license under 3 years', () => {
  const res = price('A', 'B', '2025-06-01', '2025-06-02', 'Compact', 22, 2);
  expect(parsePrice(res)).toBeCloseTo(85.1, 5);
});

test('young racer in high season gets racer and season multipliers', () => {
  const res = price('A', 'B', '2025-07-10', '2025-07-10', 'Racer', 25, 3);
  expect(parsePrice(res)).toBeCloseTo(43.125, 5);
});

test('long rental in low season gets discount and low-experience multiplier', () => {
  const res = price('A', 'B', '2025-11-01', '2025-11-12', 'Compact', 30, 1.5);
  expect(parsePrice(res)).toBeCloseTo(431.2, 5);
});

test('season detection treats rentals spanning high season as high', () => {
  const start = '2025-02-01';
  const end = '2025-11-01';
  const res = price('A', 'B', start, end, 'Compact', 40, 5);
  const days = daysBetweenInclusive(start, end);
  const expected = 40 * days * 1.15;
  expect(parsePrice(res)).toBeCloseTo(expected, 5);
});

// Example 1: 50 year old driver rents a car for three days: Monday, Tuesday, Wednesday - Total price $150
test('50 year old driver weekday rental (Mon-Wed) - $150', () => {
  const res = price('A', 'B', '2025-02-17', '2025-02-19', 'Compact', 50, 5);
  // Feb 17-19, 2025 (Monday-Wednesday)
  expect(parsePrice(res)).toBeCloseTo(150, 5);
});

// Example 2: 50 year old driver rents a car for three days: Thursday, Friday, Saturday - Total price $152.50
test('50 year old driver weekend rental (Thu-Sat) - $152.50', () => {
  const res = price('A', 'B', '2025-02-20', '2025-02-22', 'Compact', 50, 5);
  // Feb 20-22, 2025 (Thursday-Saturday)
  expect(parsePrice(res)).toBeCloseTo(152.50, 5);
});
const { price } = require('./rentalPrice');

const formatPrice = (price) => {
  return `$${price.toFixed(2)} per day`;
}

test('Individuals under the age of 18 are ineligible to rent', () => {
  expect(price('Tallinn', 'Tartu', '2024-04-24', '2024-04-25', 'racer', 17)).toBe('Driver too young - cannot quote the price');
});

test("Individuals holding a driver's license for less than a year are ineligible to rent", () => {
  expect(price('Tallinn', 'Tartu', '2024-04-24', '2024-04-25', 'racer', 25, '2023-05-25')).toBe("License hasn't been held long enough");
});

test('Unknown is returned for price when vehicle class does not exist', () => {
  expect(price('Tallinn', 'Tartu', '2024-04-23', '2024-04-25', 'Why are months counted from 0 and not 1???', 25, '2022-03-20')).toBe('unknown');
})

test('Individuals under 21 can only rent Compact cars', () => {
  expect(price('Tallinn', 'Tartu', '2024-04-23', '2024-04-25', 'cabrio', 20, '2022-03-20')).toBe('Drivers 21 y/o or less can only rent Compact vehicles');
});

test('Racer price is increased by 50% if the driver is 25 years old or younger', () => {
  const expectedPrice = 2 * 25 * 1.5 * 1.15;

  expect(price('Tallinn', 'Tartu', '2024-05-23', '2024-05-25', 'racer', 25, '2020-03-20')).toBe(formatPrice(expectedPrice));
})

test('Price coefficient is 1.15 during High season', () => {
  const expectedPrice = 2 * 23 * 1.15;

  expect(price('Tallinn', 'Tartu', '2024-05-23', '2024-05-25', 'electric', 23, '2020-03-20')).toBe(formatPrice(expectedPrice));
});

test('Price coefficient is 0.9 when renting for more than 10 days during Low season', () => {
  const expectedPrice = 11 * 23 * 0.9;

  expect(price('Tallinn', 'Tartu', '2025-03-20', '2025-03-31', 'compact', 23, '2020-01-01')).toBe(formatPrice(expectedPrice));
});

test('Price coefficient is 1 when renting for 10 days or less during Low season', () => {
  const expectedPrice = 10 * 23;

  expect(price('Tallinn', 'Tartu', '2025-03-20', '2025-03-30', 'cabrio', 23, '2020-01-01')).toBe(formatPrice(expectedPrice));
});

test('The minimum rental price per day is equivalent to the age of the driver', () => {
  const expectedPrice = 26 * 2;

  expect(price('Tallinn', 'Tartu', '2024-02-10', '2024-02-12', 'cabrio', 26, '2020-01-01')).toBe(formatPrice(expectedPrice));
});

test("If the license has been held for less than two years, rental price is increased by 30%", () => {
  const expectedPrice = 26 * 2 * 1.3;

  expect(price('Tallinn', 'Tartu', '2024-02-10', '2024-02-12', 'cabrio', 26, '2023-01-01')).toBe(formatPrice(expectedPrice));
});

test("If the license has been held for less than three years, and rental period is during high season, additional 15 euros are added to the daily rental price", () => {
  const expectedPrice = ((26 * 5) + (15 * 5)) * 1.15 * 1.3;

  expect(price('Tallinn', 'Tartu', '2024-04-10', '2024-04-15', 'cabrio', 26, '2023-01-01')).toBe(formatPrice(expectedPrice));
});

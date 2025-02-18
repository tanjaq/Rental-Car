const rental = require('./rentalPrice');

test('Driver too young', () => {
  expect(rental.price('A', 'B', '2023-04-01', '2023-04-10', 'Compact', 17, 2)).toBe("Driver too young - cannot quote the price");
});

test('Drivers 21 y/o or less can only rent Compact vehicles', () => {
  expect(rental.price('A', 'B', '2023-04-01', '2023-04-10', 'Racer', 20, 2)).toBe("Drivers 21 y/o or less can only rent Compact vehicles");
});

test('Driver must hold a license for at least one year', () => {
  expect(rental.price('A', 'B', '2023-04-01', '2023-04-10', 'Compact', 25, 0)).toBe("Driver must hold a license for at least one year");
});

test('Rental price calculation with license years less than 2', () => {
  expect(rental.price('A', 'B', '2023-04-01', '2023-04-10', 'Compact', 25, 1)).toBe("$373.75");
});

test('Rental price calculation with license years less than 3 during high season', () => {
  expect(rental.price('A', 'B', '2023-04-01', '2023-04-10', 'Compact', 25, 2)).toBe("$460.00");
});

test('Rental price calculation for Racer with age <= 25 during high season', () => {
  expect(rental.price('A', 'B', '2023-04-01', '2023-04-10', 'Racer', 24, 3)).toBe("$414.00");
});

test('Rental price calculation for more than 10 days during low season', () => {
  expect(rental.price('A', 'B', '2023-01-01', '2023-01-12', 'Compact', 25, 3)).toBe("$270.00");
});
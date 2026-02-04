const rentalPrice = require('./rentalPrice');


test('rejects drivers under minimum age', () => {
  const result = rentalPrice.price('2026-01-10', '2026-01-12', 'Compact', 17, 5);
  expect(result).toBe('Driver too young - cannot quote the price');
});

test('rejects drivers with license under 1 year', () => {
  const result = rentalPrice.price('2026-01-10', '2026-01-12', 'Compact', 25, 0.5);
  expect(result).toBe("Individuals holding a driver's license for less than a year are ineligible to rent.");
});

test('limits young drivers to Compact', () => {
  const result = rentalPrice.price('2026-01-10', '2026-01-12', 'Electric', 20, 5);
  expect(result).toBe('Drivers 21 y/o or less can only rent Compact vehicles');
});

test('applies racer surcharge in high season for young drivers', () => {
  const result = rentalPrice.price('2026-06-01', '2026-06-01', 'Racer', 24, 5);
  expect(result).toBe('$41.4');
});

test('applies high season multiplier without racer surcharge', () => {
  const result = rentalPrice.price('2026-06-01', '2026-06-01', 'Compact', 30, 5);
  expect(result).toBe('$34.5');
});

test('applies new license 30% increase for < 2 years', () => {
  const result = rentalPrice.price('2026-01-10', '2026-01-12', 'Compact', 30, 1.5);
  expect(result).toBe('$117');
});

test('adds high-season daily surcharge for < 3 years', () => {
  const result = rentalPrice.price('2026-06-01', '2026-06-03', 'Compact', 30, 2.5);
  expect(result).toBe('$148.5');
});

test('applies long rental discount in low season', () => {
  const result = rentalPrice.price('2026-01-01', '2026-01-12', 'Compact', 30, 5);
  expect(result).toBe('$324');
});
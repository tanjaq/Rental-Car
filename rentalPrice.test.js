const { price } = require('./rentalPrice');

describe('price', () => {
  test('returns error for underage drivers', () => {
    expect(
      price('Tallinn', 'Tartu', '2025-01-01', '2025-01-02', 'Compact', 17, 2)
    ).toBe('Driver too young - cannot quote the price');
  });

  test('returns error for insufficient license years', () => {
    expect(
      price('Tallinn', 'Pärnu', '2025-02-01', '2025-06-01', 'Electric', 30, 0.5)
    ).toBe('Driver license held for less than 1 year - cannot rent');
  });

  test('restricts young drivers to compact vehicles', () => {
    expect(
      price('Tallinn', 'Tartu', '2025-07-01', '2025-07-03', 'cAbRiO', 21, 2)
    ).toBe('Drivers 21 y/o or less can only rent Compact vehicles');
  });

  test('calculates high-season racer pricing with surcharges', () => {
    expect(
      price('Tallinn', 'Tartu', '2025-06-01', '2025-06-05', 'rAcEr', 25, 1.5)
    ).toBe('$366.56');
  });

  test('applies long rental discounts in low season', () => {
    expect(
      price('Tallinn', 'Tartu', '2025-01-01', '2025-01-12', 'Compact', 30, 5)
    ).toBe('$324');
  });

  test('handles unknown car types across seasons', () => {
    expect(
      price('Tallinn', 'Tartu', '2025-02-01', '2025-11-01', 'Truck', 30, 5)
    ).toBe('$9453');
  });

  test('handles non-string car type values', () => {
    expect(
      price('Tallinn', 'Tartu', '2025-03-01', '2025-03-03', 123, 30, 5)
    ).toBe('$90');
  });
});
const rentalPrice = require('./rentalPrice');

describe('rental price calculator', () => {
  const pickup = 'Tallinn';
  const dropoff = 'Tartu';

  test('rejects drivers younger than 18', () => {
    expect(
      rentalPrice.price(pickup, dropoff, Date.parse('2026-01-10'), Date.parse('2026-01-10'), 'Compact', 17, 5),
    ).toBe('Driver too young - cannot quote the price');
  });

  test('rejects drivers with less than one year of license history', () => {
    expect(
      rentalPrice.price(pickup, dropoff, Date.parse('2026-01-10'), Date.parse('2026-01-10'), 'Compact', 25, 0.9),
    ).toBe('Drivers with less than 1 year of driving experience cannot rent a car');
  });

  test('drivers aged 18-21 can only rent compact cars', () => {
    expect(
      rentalPrice.price(pickup, dropoff, Date.parse('2026-01-10'), Date.parse('2026-01-10'), 'Electric', 21, 5),
    ).toBe('Drivers 21 y/o or less can only rent Compact vehicles');
  });

  test('accepts lowercase compact type values after normalization', () => {
    expect(
      rentalPrice.price(pickup, dropoff, Date.parse('2026-01-05'), Date.parse('2026-01-05'), 'compact', 20, 5),
    ).toBe('$20');
  });

  test('treats unknown car types as non-compact for young drivers', () => {
    expect(
      rentalPrice.price(pickup, dropoff, Date.parse('2026-01-10'), Date.parse('2026-01-10'), 'spaceship', 20, 5),
    ).toBe('Drivers 21 y/o or less can only rent Compact vehicles');
  });

  test('applies high season surcharge already in april', () => {
    expect(
      rentalPrice.price(pickup, dropoff, Date.parse('2026-04-10'), Date.parse('2026-04-10'), 'Compact', 30, 5),
    ).toBe('$34.5');
  });

  test('applies long rental discount during low season', () => {
    expect(
      rentalPrice.price(pickup, dropoff, Date.parse('2026-11-01'), Date.parse('2026-11-11'), 'Compact', 30, 5),
    ).toBe('$301.05');
  });

  test('applies racer surcharge for young drivers during high season', () => {
    expect(
      rentalPrice.price(pickup, dropoff, Date.parse('2026-07-10'), Date.parse('2026-07-10'), 'Racer', 25, 5),
    ).toBe('$43.13');
  });

  test('adds 30 percent for drivers with less than two years of license history', () => {
    expect(
      rentalPrice.price(pickup, dropoff, Date.parse('2026-01-10'), Date.parse('2026-01-10'), 'Compact', 30, 1.5),
    ).toBe('$40.95');
  });

  test('adds 15 euros per day during high season for drivers with less than three years of license history', () => {
    expect(
      rentalPrice.price(pickup, dropoff, Date.parse('2026-07-10'), Date.parse('2026-07-11'), 'Compact', 30, 2.5),
    ).toBe('$106.09');
  });

  test('combines the high season and short-license surcharges correctly', () => {
    expect(
      rentalPrice.price(pickup, dropoff, Date.parse('2026-07-10'), Date.parse('2026-07-11'), 'Compact', 30, 1.5),
    ).toBe('$137.91');
  });

  test('keeps the old API working when license years are omitted on a weekday rental', () => {
    expect(
      rentalPrice.price(pickup, dropoff, Date.parse('2026-01-05'), Date.parse('2026-01-05'), 'Compact', 30),
    ).toBe('$30');
  });

  test('calculates the same rental length when dates are provided in reverse order, including weekend pricing', () => {
    expect(
      rentalPrice.price(pickup, dropoff, Date.parse('2026-01-12'), Date.parse('2026-01-10'), 'Compact', 30, 5),
    ).toBe('$93');
  });

  test('uses regular pricing for weekday-only rentals', () => {
    expect(
      rentalPrice.price(pickup, dropoff, Date.parse('2026-01-05'), Date.parse('2026-01-07'), 'Compact', 50, 5),
    ).toBe('$150');
  });

  test('adds a 5 percent increase for weekend days in the rental period', () => {
    expect(
      rentalPrice.price(pickup, dropoff, Date.parse('2026-01-08'), Date.parse('2026-01-10'), 'Compact', 50, 5),
    ).toBe('$152.5');
  });

  test('applies the weekend increase to both saturday and sunday', () => {
    expect(
      rentalPrice.price(pickup, dropoff, Date.parse('2026-01-09'), Date.parse('2026-01-11'), 'Compact', 50, 5),
    ).toBe('$155');
  });
});

const rental = require('./rentalPrice');

const toTimestamp = (dateStr) => Date.parse(dateStr);

describe('rental price rules', () => {
  test('rejects drivers under 18', () => {
    const result = rental.price(
      'A',
      'B',
      toTimestamp('2026-06-01T00:00:00Z'),
      toTimestamp('2026-06-03T00:00:00Z'),
      'Compact',
      17,
      2
    );

    expect(result).toBe('Driver too young - cannot quote the price');
  });

  test('rejects drivers with license under 1 year', () => {
    const result = rental.price(
      'A',
      'B',
      toTimestamp('2026-06-01T00:00:00Z'),
      toTimestamp('2026-06-03T00:00:00Z'),
      'Compact',
      30,
      0
    );

    expect(result).toBe('Driver license held for less than a year - cannot quote the price');
  });

  test('drivers 21 or under can only rent compact', () => {
    const result = rental.price(
      'A',
      'B',
      toTimestamp('2026-06-01T00:00:00Z'),
      toTimestamp('2026-06-03T00:00:00Z'),
      'Electric',
      21,
      3
    );

    expect(result).toBe('Drivers 21 y/o or less can only rent Compact vehicles');
  });

  test('low season long rental discount cannot go below minimum price', () => {
    const result = rental.price(
      'A',
      'B',
      toTimestamp('2026-12-01T00:00:00Z'),
      toTimestamp('2026-12-12T00:00:00Z'),
      'Compact',
      30,
      3
    );

    expect(result).toBe('$360.00');
  });

  test('high season racer and license surcharges apply', () => {
    const result = rental.price(
      'A',
      'B',
      toTimestamp('2026-06-01T00:00:00Z'),
      toTimestamp('2026-06-03T00:00:00Z'),
      'Racer',
      25,
      1.5
    );

    expect(result).toBe('$213.19');
  });

  test('high season applies when any day is in high season', () => {
    const result = rental.price(
      'A',
      'B',
      toTimestamp('2026-03-31T00:00:00Z'),
      toTimestamp('2026-04-02T00:00:00Z'),
      'Compact',
      30,
      3
    );

    expect(result).toBe('$103.50');
  });

  test('non-string car type is treated as unknown', () => {
    const result = rental.price(
      'A',
      'B',
      toTimestamp('2026-11-02T00:00:00Z'),
      toTimestamp('2026-11-03T00:00:00Z'),
      null,
      30,
      3
    );

    expect(result).toBe('$60.00');
  });

  test('unknown string car type is accepted', () => {
    const result = rental.price(
      'A',
      'B',
      toTimestamp('2026-11-03T00:00:00Z'),
      toTimestamp('2026-11-03T00:00:00Z'),
      'Truck',
      30,
      3
    );

    expect(result).toBe('$30.00');
  });

  test('cabrio type is normalized', () => {
    const result = rental.price(
      'A',
      'B',
      toTimestamp('2026-07-10T00:00:00Z'),
      toTimestamp('2026-07-10T00:00:00Z'),
      'Cabrio',
      30,
      3
    );

    expect(result).toBe('$34.50');
  });

  test('weekday rental keeps regular daily price', () => {
    const result = rental.price(
      'A',
      'B',
      toTimestamp('2026-12-07T00:00:00Z'),
      toTimestamp('2026-12-09T00:00:00Z'),
      'Compact',
      50,
      3
    );

    expect(result).toBe('$150.00');
  });

  test('weekend days add a 5 percent daily increase', () => {
    const result = rental.price(
      'A',
      'B',
      toTimestamp('2026-12-10T00:00:00Z'),
      toTimestamp('2026-12-12T00:00:00Z'),
      'Compact',
      50,
      3
    );

    expect(result).toBe('$152.50');
  });
});

const { price, _internal } = require('./rentalPrice');

const parseDate = (value) => Date.parse(value);

describe('price() rules', () => {
  test('rejects unknown car class', () => {
    expect(price('A', 'B', parseDate('2025-01-01'), parseDate('2025-01-02'), 'unknown', 30, parseDate('2010-01-01')))
      .toBe('Unknown car class');
  });

  test('rejects driver younger than 18', () => {
    expect(price('A', 'B', parseDate('2025-07-01'), parseDate('2025-07-02'), 'compact', 17, parseDate('2020-01-01')))
      .toBe('Driver too young - cannot quote the price');
  });

  test('rejects license held under one year', () => {
    expect(price('A', 'B', parseDate('2025-05-01'), parseDate('2025-05-02'), 'compact', 30, parseDate('2024-12-01')))
      .toBe('Driver must hold a license for at least one year');
  });

  test('under 21 can only rent compact', () => {
    expect(price('A', 'B', parseDate('2025-07-01'), parseDate('2025-07-02'), 'racer', 20, parseDate('2020-01-01')))
      .toBe('Drivers 21 y/o or less can only rent Compact vehicles');
  });

  test('applies weekend surcharge only on weekend days', () => {
    const result = price('A', 'B', parseDate('2025-02-06'), parseDate('2025-02-08'), 'compact', 50, parseDate('2010-01-01'));
    expect(result).toBe('$152.50');
  });

  test('weekday-only rental stays at base rate', () => {
    const result = price('A', 'B', parseDate('2025-02-03'), parseDate('2025-02-05'), 'compact', 50, parseDate('2010-01-01'));
    expect(result).toBe('$150.00');
  });

  test('high season license under three years adds fixed daily fee and under two years adds 30% surcharge', () => {
    const result = price('A', 'B', parseDate('2025-07-01'), parseDate('2025-07-02'), 'compact', 30, parseDate('2023-08-01'));
    expect(result).toBe('$134.55');
  });

  test('racer young driver surcharge applies only in high season', () => {
    const result = price('A', 'B', parseDate('2025-07-01'), parseDate('2025-07-02'), 'racer', 25, parseDate('2010-01-01'));
    expect(result).toBe('$86.25');
  });

  test('long low-season rental respects minimum daily rate after discount', () => {
    const result = price('A', 'B', parseDate('2024-11-01'), parseDate('2024-11-12'), 'compact', 40, parseDate('2010-01-01'));
    expect(result).toBe('$480.00');
  });
});

describe('_internal helpers', () => {
  test('calculateRentalDays handles reversed dates', () => {
    const days = _internal.calculateRentalDays(parseDate('2025-03-10'), parseDate('2025-03-08'));
    expect(days).toBe(3);
  });

  test('calculateRentalDays returns 0 on invalid dates', () => {
    const days = _internal.calculateRentalDays('not-a-date', 'also-not-a-date');
    expect(days).toBe(0);
  });

  test('determineSeason marks April as high season', () => {
    const season = _internal.determineSeason(parseDate('2025-04-01'), parseDate('2025-04-05'));
    expect(season).toBe('High');
  });

  test('determineSeason marks February as low season', () => {
    const season = _internal.determineSeason(parseDate('2025-02-01'), parseDate('2025-02-05'));
    expect(season).toBe('Low');
  });

  test('calculateFullYears handles exact anniversaries', () => {
    const years = _internal.calculateFullYears(parseDate('2020-05-10'), parseDate('2025-05-10'));
    expect(years).toBe(5);
  });

  test('calculateFullYears returns 0 when comparison precedes start', () => {
    const years = _internal.calculateFullYears(parseDate('2025-05-10'), parseDate('2024-05-09'));
    expect(years).toBe(0);
  });

  test('normalizeCarClass maps inputs case-insensitively', () => {
    expect(_internal.normalizeCarClass('Electric')).toBe('Electric');
    expect(_internal.normalizeCarClass('cabrio')).toBe('Cabrio');
    expect(_internal.normalizeCarClass('unknown')).toBeNull();
  });

  test('normalizeCarClass returns null when type is missing', () => {
    expect(_internal.normalizeCarClass(undefined)).toBeNull();
  });

  test('isWeekend detects Saturday and Sunday', () => {
    expect(_internal.isWeekend(new Date('2025-02-08'))).toBe(true);
    expect(_internal.isWeekend(new Date('2025-02-09'))).toBe(true);
    expect(_internal.isWeekend(new Date('2025-02-10'))).toBe(false);
  });
});

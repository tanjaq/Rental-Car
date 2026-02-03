const { price, getSeason, getRentalDays, normalizeClazz } = require('../rentalPrice');

describe('Car rental price calculator', () => {
  test('Driver under 18 is ineligible', () => {
    const res = price(null, null, '2026-02-01', '2026-02-02', 'Compact', 17, 5);
    expect(res).toBe('Driver too young - cannot quote the price');
  });

  test('Drivers 21 y/o or less can only rent Compact vehicles', () => {
    const res = price(null, null, '2026-02-01', '2026-02-02', 'Cabrio', 20, 5);
    expect(res).toBe('Drivers 21 y/o or less can only rent Compact vehicles');
  });

  test('Drivers license held less than a year ineligible', () => {
    const res = price(null, null, '2026-02-01', '2026-02-02', 'Compact', 30, 0.5);
    expect(res).toBe("Drivers license held for less than a year - cannot quote the price");
  });

  test('License less than 2 years increases price by 30%', () => {
    const res = price(null, null, '2026-02-05', '2026-02-05', 'Compact', 30, 1.5);
    // per-day: 30 * 1.3 = 39
    expect(res).toBe('$39');
  });

  test('License less than 3 years and high season adds 15 per day', () => {
    // High season date
    const res = price(null, null, '2026-07-01', '2026-07-01', 'Compact', 30, 2.5);
    // per-day: 30 * 1.15 = 34.5, +15 => 49.5
    expect(res).toBe('$49.50');
  });

  test('Racer surcharge for young drivers in High season', () => {
    const res = price(null, null, '2026-07-01', '2026-07-01', 'Racer', 25, 5);
    // 25 * 1.5 * 1.15 = 43.125 -> rounded to 43.13
    expect(res).toBe('$43.13');
  });

  test('Long rentals (>10 days) in low season get 10% discount but not below minimum per-day (age)', () => {
    // Low season dates (January), 11 days
    const res = price(null, null, '2026-01-01', '2026-01-11', 'Compact', 20, 5);
    // per-day before min: 20 * 0.9 = 18 -> min is 20 -> total = 20*11 = 220
    expect(res).toBe('$220');
  });

  test('Weekday pricing example (Mon,Tue,Wed) => $150', () => {
    // 2026-02-02 Mon to 2026-02-04 Wed
    const res = price(null, null, '2026-02-02', '2026-02-04', 'Compact', 50, 5);
    expect(res).toBe('$150');
  });

  test('Weekend pricing example (Thu,Fri,Sat) => $152.50', () => {
    // 2026-02-05 Thu to 2026-02-07 Sat
    const res = price(null, null, '2026-02-05', '2026-02-07', 'Compact', 50, 5);
    expect(res).toBe('$152.50');
  });

  test('normalizeClazz is case-insensitive', () => {
    expect(normalizeClazz('compact')).toBe('Compact');
    expect(normalizeClazz('RACER')).toBe('Racer');
  });

  test('getSeason returns High if any day is in high season', () => {
    const season = getSeason('2026-03-31', '2026-04-02');
    expect(season).toBe('High');
  });
});

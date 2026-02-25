const { price, getDays, getSeason, normalizeCarClass, getWeekendDays } = require('./rentalPrice');

// Helper: create a date string for a given month (0-indexed) and year
function dateMs(year, month, day) {
  return new Date(year, month, day).getTime();
}

// High season dates (April=3 through October=9), weekdays only
const highPickup = dateMs(2024, 5, 3);  // June 3, Monday
const highDropoff = dateMs(2024, 5, 7); // June 7, Friday

// Low season dates (November=10 through March=2), weekdays only
const lowPickup = dateMs(2024, 11, 2);  // December 2, Monday
const lowDropoff = dateMs(2024, 11, 6); // December 6, Friday

describe('normalizeCarClass', () => {
  test('Compact (exact)', () => expect(normalizeCarClass('Compact')).toBe('Compact'));
  test('Electric (exact)', () => expect(normalizeCarClass('Electric')).toBe('Electric'));
  test('Cabrio (exact)', () => expect(normalizeCarClass('Cabrio')).toBe('Cabrio'));
  test('Racer (exact)', () => expect(normalizeCarClass('Racer')).toBe('Racer'));
  test('compact (lowercase)', () => expect(normalizeCarClass('compact')).toBe('Compact'));
  test('CABRIO (uppercase)', () => expect(normalizeCarClass('CABRIO')).toBe('Cabrio'));
  test('racer (lowercase)', () => expect(normalizeCarClass('racer')).toBe('Racer'));
  test('unknown type', () => expect(normalizeCarClass('Truck')).toBe('Unknown'));
});

describe('getDays', () => {
  test('same day = 1', () => {
    expect(getDays(dateMs(2024, 5, 1), dateMs(2024, 5, 1))).toBe(1);
  });
  test('5-day rental = 5', () => {
    expect(getDays(highPickup, highDropoff)).toBe(5);
  });
  test('11-day rental = 11', () => {
    expect(getDays(dateMs(2024, 11, 1), dateMs(2024, 11, 11))).toBe(11);
  });
});

describe('getSeason', () => {
  test('April pickup = High', () => {
    expect(getSeason(dateMs(2024, 3, 1), dateMs(2024, 3, 5))).toBe('High');
  });
  test('October dropoff = High', () => {
    expect(getSeason(dateMs(2024, 9, 1), dateMs(2024, 9, 10))).toBe('High');
  });
  test('December = Low', () => {
    expect(getSeason(lowPickup, lowDropoff)).toBe('Low');
  });
  test('January = Low', () => {
    expect(getSeason(dateMs(2024, 0, 1), dateMs(2024, 0, 5))).toBe('Low');
  });
  test('March = Low', () => {
    expect(getSeason(dateMs(2024, 2, 1), dateMs(2024, 2, 5))).toBe('Low');
  });
  test('spans low-to-high boundary = High', () => {
    // pickup in Feb (month 1), dropoff in Nov (month 10) → straddles High season
    expect(getSeason(dateMs(2024, 1, 1), dateMs(2024, 10, 1))).toBe('High');
  });
  test('pickup in High season, dropoff in Low = High', () => {
    expect(getSeason(dateMs(2024, 5, 1), dateMs(2024, 11, 1))).toBe('High');
  });
});

describe('price - car type validation', () => {
  test('invalid car type returns error', () => {
    expect(price('A', 'B', highPickup, highDropoff, 'Truck', 30, 3))
      .toBe('Invalid car type - must be Compact, Electric, Cabrio, or Racer');
  });
});

describe('price - age validation', () => {
  test('age < 18 returns ineligibility error', () => {
    expect(price('A', 'B', highPickup, highDropoff, 'Compact', 17, 3))
      .toBe('Driver too young - cannot quote the price');
  });

  test('age 18-21 with non-Compact returns restriction message', () => {
    expect(price('A', 'B', highPickup, highDropoff, 'Electric', 20, 3))
      .toBe('Drivers 21 y/o or less can only rent Compact vehicles');
  });

  test('age 18-21 with Compact is allowed', () => {
    const result = price('A', 'B', highPickup, highDropoff, 'Compact', 20, 3);
    expect(result).toMatch(/^€/);
  });
});

describe('price - license validation', () => {
  test('licenseYears < 1 returns ineligibility error', () => {
    expect(price('A', 'B', highPickup, highDropoff, 'Compact', 25, 0))
      .toBe('Driver must have held a license for at least 1 year');
  });

  test('licenseYears >= 1 is allowed', () => {
    const result = price('A', 'B', highPickup, highDropoff, 'Compact', 25, 1);
    expect(result).toMatch(/^€/);
  });
});

describe('price - base price', () => {
  test('base price = age * days (low season, no surcharges)', () => {
    // age=30, 5 days, Low season, licenseYears=5
    const result = price('A', 'B', lowPickup, lowDropoff, 'Compact', 30, 5);
    // 30 * 5 = 150
    expect(result).toBe('€150');
  });
});

describe('price - High season surcharge', () => {
  test('High season applies 1.15 surcharge', () => {
    // age=30, 5 days, High season, licenseYears=5, Compact
    const result = price('A', 'B', highPickup, highDropoff, 'Compact', 30, 5);
    // 30 * 5 * 1.15 = 172.5
    expect(result).toBe('€172.5');
  });

  test('Low season does not apply surcharge', () => {
    const result = price('A', 'B', lowPickup, lowDropoff, 'Compact', 30, 5);
    expect(result).toBe('€150');
  });
});

describe('price - Racer surcharge', () => {
  test('Racer + age <= 25 + High season applies 50% surcharge', () => {
    // age=25, 5 days, High season, Racer, licenseYears=5
    const result = price('A', 'B', highPickup, highDropoff, 'Racer', 25, 5);
    // 25 * 5 * 1.5 * 1.15 = 215.625
    expect(result).toBe('€215.62');
  });

  test('Racer + age <= 25 + Low season: no Racer surcharge', () => {
    // age=25, 5 days, Low season, Racer, licenseYears=5
    const result = price('A', 'B', lowPickup, lowDropoff, 'Racer', 25, 5);
    // 25 * 5 = 125 (no racer surcharge, no high season surcharge)
    expect(result).toBe('€125');
  });

  test('Racer + age > 25 + High season: no Racer surcharge', () => {
    // age=30, 5 days, High season, Racer, licenseYears=5
    const result = price('A', 'B', highPickup, highDropoff, 'Racer', 30, 5);
    // 30 * 5 * 1.15 = 172.5 (only high season surcharge)
    expect(result).toBe('€172.5');
  });
});

describe('price - long rental discount', () => {
  test('> 10 days in Low season applies 10% discount', () => {
    // age=30, 11 days, Low season, Compact, licenseYears=5
    const p = dateMs(2024, 11, 2);
    const d = dateMs(2024, 11, 12);
    const result = price('A', 'B', p, d, 'Compact', 30, 5);
    // 9 weekdays + 2 weekend days: 30*9 + 30*1.05*2 = 333, * 0.9 = 299.7
    expect(result).toBe('€299.7');
  });

  test('> 10 days in High season: no discount', () => {
    const p = dateMs(2024, 5, 3);
    const d = dateMs(2024, 5, 13);
    const result = price('A', 'B', p, d, 'Compact', 30, 5);
    // 9 weekdays + 2 weekend days: 30*9 + 30*1.05*2 = 333, * 1.15 = 382.95
    expect(result).toBe('€382.95');  });

  test('<= 10 days in Low season: no discount', () => {
    const result = price('A', 'B', lowPickup, lowDropoff, 'Compact', 30, 5);
    // 30 * 5 = 150
    expect(result).toBe('€150');
  });
});

describe('price - license surcharge', () => {
  test('licenseYears < 2 applies 30% increase', () => {
    // age=30, 5 days, Low season, licenseYears=1, Compact
    const result = price('A', 'B', lowPickup, lowDropoff, 'Compact', 30, 1);
    // 30 * 5 * 1.3 = 195
    expect(result).toBe('€195');
  });

  test('licenseYears < 3 + High season adds €15/day', () => {
    // age=30, 5 days, High season, licenseYears=2, Compact
    const result = price('A', 'B', highPickup, highDropoff, 'Compact', 30, 2);
    // 30 * 5 * 1.15 = 172.5, then + 15*5 = 75 => 247.5
    expect(result).toBe('€247.5');
  });

  test('licenseYears < 3 + Low season: no extra fee', () => {
    // age=30, 5 days, Low season, licenseYears=2, Compact
    const result = price('A', 'B', lowPickup, lowDropoff, 'Compact', 30, 2);
    // 30 * 5 = 150, no extra fee (low season), but licenseYears=2 >= 2 so no 30% either
    expect(result).toBe('€150');
  });

  test('licenseYears >= 3: no surcharge', () => {
    const result = price('A', 'B', lowPickup, lowDropoff, 'Compact', 30, 3);
    expect(result).toBe('€150');
  });

  test('licenseYears=1 (<2) applies 30% + High season adds €15/day', () => {
    // age=30, 5 days, High season, licenseYears=1
    const result = price('A', 'B', highPickup, highDropoff, 'Compact', 30, 1);
    // 30*5*1.15*1.3 + 15*5 = 224.25 + 75 = 299.25
    expect(result).toBe('€299.25');
  });
});

describe('getWeekendDays', () => {
  test('Mon-Fri = 0 weekend days', () => {
    expect(getWeekendDays(dateMs(2024, 5, 3), dateMs(2024, 5, 7))).toBe(0);
  });
  test('Sat-Sun = 2 weekend days', () => {
    expect(getWeekendDays(dateMs(2025, 0, 11), dateMs(2025, 0, 12))).toBe(2);
  });
  test('Thu-Sat = 1 weekend day', () => {
    expect(getWeekendDays(dateMs(2025, 0, 9), dateMs(2025, 0, 11))).toBe(1);
  });
  test('Mon-Sun (full week) = 2 weekend days', () => {
    expect(getWeekendDays(dateMs(2025, 0, 6), dateMs(2025, 0, 12))).toBe(2);
  });
  test('11 days starting Monday = 2 weekend days', () => {
    expect(getWeekendDays(dateMs(2024, 11, 2), dateMs(2024, 11, 12))).toBe(2);
  });
});

describe('price - weekday/weekend pricing', () => {
  test('weekday-only rental has no weekend surcharge', () => {
    // age=50, Mon-Wed (Jan 6-8, 2025), 3 weekdays, Low season, licenseYears=5
    const result = price('A', 'B', dateMs(2025, 0, 6), dateMs(2025, 0, 8), 'Compact', 50, 5);
    // 50 * 3 = 150
    expect(result).toBe('€150');
  });

  test('mixed weekday/weekend rental applies 5% surcharge on weekend days', () => {
    // age=50, Thu-Sat (Jan 9-11, 2025), 2 weekdays + 1 weekend, Low season, licenseYears=5
    const result = price('A', 'B', dateMs(2025, 0, 9), dateMs(2025, 0, 11), 'Compact', 50, 5);
    // Thu($50) + Fri($50) + Sat($52.50) = 152.50
    expect(result).toBe('€152.5');
  });

  test('weekend-only rental applies 5% surcharge on all days', () => {
    // age=50, Sat-Sun (Jan 11-12, 2025), 2 weekend days, Low season, licenseYears=5
    const result = price('A', 'B', dateMs(2025, 0, 11), dateMs(2025, 0, 12), 'Compact', 50, 5);
    // 50*1.05*2 = 105
    expect(result).toBe('€105');
  });

  test('each rental day is evaluated individually', () => {
    // age=40, Fri-Mon (Jan 10-13, 2025), 2 weekdays + 2 weekend days, Low season, licenseYears=5
    const result = price('A', 'B', dateMs(2025, 0, 10), dateMs(2025, 0, 13), 'Compact', 40, 5);
    // Fri($40) + Sat($42) + Sun($42) + Mon($40) = 164
    expect(result).toBe('€164');
  });
});

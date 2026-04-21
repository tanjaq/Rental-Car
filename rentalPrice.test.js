const rental = require('./rentalPrice');

const { CAR_TYPES, MESSAGES, SEASONS } = rental;

describe('validateDriver', () => {
  test('returns message when driver is too young', () => {
    expect(rental.validateDriver(17, CAR_TYPES.COMPACT, 3)).toBe(MESSAGES.TOO_YOUNG);
  });

  test('returns message when license is newer than one year', () => {
    expect(rental.validateDriver(30, CAR_TYPES.COMPACT, 0.5)).toBe(MESSAGES.LICENSE_TOO_NEW);
  });

  test('returns message when young driver tries to rent non compact car', () => {
    expect(rental.validateDriver(21, CAR_TYPES.CABRIO, 3)).toBe(MESSAGES.ONLY_COMPACT);
  });

  test('returns null for valid driver', () => {
    expect(rental.validateDriver(30, CAR_TYPES.ELECTRIC, 3)).toBeNull();
  });
});

describe('date helpers', () => {
  test('createUtcDate removes time part', () => {
    const date = rental.createUtcDate('2026-04-10T15:44:12Z');

    expect(date.toISOString()).toBe('2026-04-10T00:00:00.000Z');
  });

  test('getRentalDates returns inclusive rental period', () => {
    const rentalDates = rental.getRentalDates('2026-03-02', '2026-03-04');

    expect(rentalDates.map((date) => date.toISOString())).toEqual([
      '2026-03-02T00:00:00.000Z',
      '2026-03-03T00:00:00.000Z',
      '2026-03-04T00:00:00.000Z',
    ]);
  });

  test('getRentalDates throws error when dates are reversed', () => {
    expect(() => rental.getRentalDates('2026-03-05', '2026-03-04')).toThrow(
      'Pickup date must be before or equal to dropoff date',
    );
  });

  test('getRentalDays returns correct amount of days', () => {
    expect(rental.getRentalDays('2026-03-02', '2026-03-04')).toBe(3);
  });

  test('getSeason returns low season', () => {
    expect(rental.getSeason('2026-03-04')).toBe(SEASONS.LOW);
  });

  test('getSeason returns high season', () => {
    expect(rental.getSeason('2026-04-04')).toBe(SEASONS.HIGH);
  });

  test('isWeekend returns true for saturday', () => {
    expect(rental.isWeekend('2026-03-07')).toBe(true);
  });

  test('isWeekend returns false for monday', () => {
    expect(rental.isWeekend('2026-03-02')).toBe(false);
  });

  test('everyDayIsLowSeason returns true when all dates are in low season', () => {
    expect(
      rental.everyDayIsLowSeason([
        new Date('2026-03-01T00:00:00.000Z'),
        new Date('2026-03-02T00:00:00.000Z'),
      ]),
    ).toBe(true);
  });

  test('everyDayIsLowSeason returns false when at least one date is in high season', () => {
    expect(
      rental.everyDayIsLowSeason([
        new Date('2026-03-31T00:00:00.000Z'),
        new Date('2026-04-01T00:00:00.000Z'),
      ]),
    ).toBe(false);
  });
});

describe('formatPrice', () => {
  test('returns integer price without decimals', () => {
    expect(rental.formatPrice(150)).toBe('$150');
  });

  test('returns decimal price with two decimals', () => {
    expect(rental.formatPrice(152.5)).toBe('$152.50');
  });
});

describe('calculateDailyPrice', () => {
  test('uses regular weekday price in low season', () => {
    expect(rental.calculateDailyPrice('2026-03-02', CAR_TYPES.COMPACT, 50, 5)).toBe(50);
  });

  test('adds weekend surcharge', () => {
    expect(rental.calculateDailyPrice('2026-03-07', CAR_TYPES.COMPACT, 50, 5)).toBe(52.5);
  });

  test('adds racer surcharge for young driver in high season', () => {
    expect(rental.calculateDailyPrice('2026-04-06', CAR_TYPES.RACER, 25, 5)).toBe(43.125);
  });

  test('does not add racer surcharge in low season', () => {
    expect(rental.calculateDailyPrice('2026-03-06', CAR_TYPES.RACER, 25, 5)).toBe(25);
  });

  test('adds 30 percent surcharge when license is less than two years', () => {
    expect(rental.calculateDailyPrice('2026-03-04', CAR_TYPES.COMPACT, 20, 1.5)).toBe(26);
  });

  test('adds extra 15 euros in high season when license is less than three years', () => {
    expect(rental.calculateDailyPrice('2026-04-06', CAR_TYPES.COMPACT, 20, 2.5)).toBe(38);
  });
});

describe('price', () => {
  test('returns validation message for underage driver', () => {
    expect(rental.price('Tallinn', 'Tartu', '2026-03-02', '2026-03-04', CAR_TYPES.COMPACT, 17, 5))
      .toBe(MESSAGES.TOO_YOUNG);
  });

  test('returns validation message for new license holder', () => {
    expect(rental.price('Tallinn', 'Tartu', '2026-03-02', '2026-03-04', CAR_TYPES.COMPACT, 30, 0.8))
      .toBe(MESSAGES.LICENSE_TOO_NEW);
  });

  test('calculates weekday rental like in TDD example', () => {
    expect(rental.price('Tallinn', 'Tartu', '2026-03-02', '2026-03-04', CAR_TYPES.COMPACT, 50, 5))
      .toBe('$150');
  });

  test('calculates weekday and weekend rental like in TDD example', () => {
    expect(rental.price('Tallinn', 'Tartu', '2026-03-05', '2026-03-07', CAR_TYPES.COMPACT, 50, 5))
      .toBe('$152.50');
  });

  test('applies low season discount for rentals longer than ten days', () => {
    expect(rental.price('Tallinn', 'Tartu', '2026-03-01', '2026-03-11', CAR_TYPES.COMPACT, 30, 5))
      .toBe('$301.05');
  });

  test('does not apply long rental discount when at least one day is in high season', () => {
    expect(rental.price('Tallinn', 'Tartu', '2026-03-25', '2026-04-04', CAR_TYPES.COMPACT, 30, 5))
      .toBe('$352.73');
  });

  test('uses default license years value for backward compatibility', () => {
    expect(rental.price('Tallinn', 'Tartu', '2026-03-02', '2026-03-02', CAR_TYPES.COMPACT, 40))
      .toBe('$40');
  });
});
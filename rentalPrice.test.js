const rental = require('./rentalPrice');

describe('Rental Price Calculation - 8 Core Business Rules', () => {

  // Rule 1: Driver must have license for at least 1 year
  test('Rule 1: Reject driver with license < 1 year', () => {
    const result = rental.price('Tallinn', 'Tartu', new Date('2026-02-01'), new Date('2026-02-03'), 'compact', 25, 0.5);
    expect(result).toBe("Driver's license held for less than 1 year - ineligible to rent");
  });

  // Rule 2: Driver must be at least 18 years old
  test('Rule 2: Reject driver under 18 years old', () => {
    const result = rental.price('Tallinn', 'Tartu', new Date('2026-02-01'), new Date('2026-02-03'), 'compact', 17, 2);
    expect(result).toBe('Driver too young - cannot quote the price');
  });

  // Rule 3: Drivers 21 and under can only rent Compact vehicles
  test('Rule 3: Reject age 21 driver renting non-Compact vehicle', () => {
    const result = rental.price('Tallinn', 'Tartu', new Date('2026-02-01'), new Date('2026-02-03'), 'racer', 21, 2);
    expect(result).toBe('Drivers 21 y/o or less can only rent Compact vehicles');
  });

  // Rule 4: Apply 30% surcharge for license held < 2 years
  test('Rule 4: Apply 30% license surcharge for license < 2 years', () => {
    const result = rental.price('Tallinn', 'Tartu', new Date('2026-01-06'), new Date('2026-01-09'), 'compact', 30, 1.9);
    // Base: 30 * 3 = 90, 30% increase: 90 * 1.30 = 117
    expect(result).toBe('$117');
  });

  // Rule 5: Apply 1.15x high season multiplier (June-August)
  test('Rule 5: Apply 1.15x high season multiplier for June', () => {
    const result = rental.price('Tallinn', 'Tartu', new Date('2026-06-02'), new Date('2026-06-05'), 'compact', 30, 3);
    // Base: 30 * 3 = 90, High season: 90 * 1.15 = 103.5
    expect(result).toBe('$103.5');
  });

  // Rule 6: Apply 0.9x discount for rentals > 10 days in low season
  test('Rule 6: Apply 0.9x discount for > 10 days in low season', () => {
    const result = rental.price('Tallinn', 'Tartu', new Date('2026-02-02'), new Date('2026-02-13'), 'compact', 25, 3);
    // 11 days: 9 weekdays + 2 weekends = 9*25 + 2*25*1.05 = 277.5
    // Discount: 277.5 * 0.9 = 249.75
    expect(result).toBe('$249.75');
  });

  // Rule 7: Apply 1.5x surcharge for Racer vehicle when driver <= 25 in high season
  test('Rule 7: Apply 1.5x Racer surcharge for age <= 25 in high season', () => {
    const result = rental.price('Tallinn', 'Tartu', new Date('2026-06-02'), new Date('2026-06-05'), 'racer', 25, 3);
    // Base: 25 * 3 = 75, Racer: 75 * 1.5 = 112.5, High season: 112.5 * 1.15 = 129.375
    expect(result).toBe('$129.38');
  });

  // Rule 8: Add €15/day surcharge for license < 3 years in high season
  test('Rule 8: Add €15/day surcharge for license < 3 years in high season', () => {
    const result = rental.price('Tallinn', 'Tartu', new Date('2026-06-02'), new Date('2026-06-07'), 'compact', 30, 2.5);
    // 6 days: 4 weekdays + 1 weekend (Sat) = 4*30 + 1*30*1.05 = 151.5
    // High season: 151.5 * 1.15 = 174.225
    // License surcharge: 174.225 + (15 * 5) = 249.225 -> $249.23
    expect(result).toBe('$249.23');
  });

});

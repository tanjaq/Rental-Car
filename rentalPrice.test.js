//Tegin ül 3 koos Relinaga, need on tema testid  | Relinal oli pickup ja dropff location, aga ma eemaldasin need, kuna need on kasutud.
const rental = require('./rentalPrice');

describe('Rental Price Calculation - 8 Core Business Rules', () => {

  test('Rule 1: Reject driver with license < 1 year', () => {
    const result = rental.price(new Date('2026-02-01'), new Date('2026-02-03'), 'compact', 25, 0.5);
    expect(result).toBe("Driver's license held for less than 1 year - ineligible to rent");
  });

  test('Rule 2: Reject driver under 18 years old', () => {
    const result = rental.price(new Date('2026-02-01'), new Date('2026-02-03'), 'compact', 17, 2);
    expect(result).toBe('Driver too young - cannot quote the price');
  });

  test('Rule 3: Reject age 21 driver renting non-Compact vehicle', () => {
    const result = rental.price(new Date('2026-02-01'), new Date('2026-02-03'), 'racer', 21, 2);
    expect(result).toBe('Drivers 21 y/o or less can only rent Compact vehicles');
  });

  test('Rule 4: Apply 30% license surcharge for license < 2 years', () => {
    const result = rental.price(new Date('2026-01-06'), new Date('2026-01-09'), 'compact', 30, 1.9);
    expect(result).toBe('$117');
  });

  test('Rule 5: Apply 1.15x high season multiplier for June', () => {
    const result = rental.price(new Date('2026-06-02'), new Date('2026-06-05'), 'compact', 30, 3);
    expect(result).toBe('$103.5');
  });

  test('Rule 6: Apply 0.9x discount for > 10 days in low season', () => {
    const result = rental.price(new Date('2026-02-02'), new Date('2026-02-13'), 'compact', 25, 3);
    expect(result).toBe('$249.75');
  });

  test('Rule 7: Apply 1.5x Racer surcharge for age <= 25 in high season', () => {
    const result = rental.price(new Date('2026-06-02'), new Date('2026-06-05'), 'racer', 25, 3);
    expect(result).toBe('$129.38');
  });

  test('Rule 8: Add €15/day surcharge for license < 3 years in high season', () => {
    const result = rental.price(new Date('2026-06-02'), new Date('2026-06-07'), 'compact', 30, 2.5);
    expect(result).toBe('$249.23');
  });

});

describe('Weekday/Weekend Pricing', () => {

  test('Weekday-only rental: Monday-Wednesday should have no weekend surcharge', () => {
    const result = rental.price(new Date('2026-02-02'), new Date('2026-02-05'), 'compact', 50, 3);
    expect(result).toBe('$150');
  });

  test('Weekend day rental should apply 5% surcharge on Saturday', () => {
    const result = rental.price(new Date('2026-02-07'), new Date('2026-02-08'), 'compact', 50, 3);
    expect(result).toBe('$52.5');
  });

  test('Mixed weekday-weekend rental: Thursday-Friday-Saturday should apply 5% surcharge only on Saturday', () => {
    const result = rental.price(new Date('2026-02-05'), new Date('2026-02-08'), 'compact', 50, 3);
    expect(result).toBe('$152.5');
  });

  test('Sunday rental should apply 5% surcharge', () => {
    const result = rental.price(new Date('2026-02-08'), new Date('2026-02-09'), 'compact', 30, 3);
    expect(result).toBe('$31.5');
  });

  test('Full weekend rental: Saturday-Sunday should have 5% surcharge on both days', () => {
    const result = rental.price(new Date('2026-02-07'), new Date('2026-02-09'), 'compact', 40, 3);
    expect(result).toBe('$84');
  });

  test('Week-long rental with weekdays and weekends', () => {
    const result = rental.price(new Date('2026-02-02'), new Date('2026-02-09'), 'compact', 25, 3);
    expect(result).toBe('$177.5');
  });

  test('Verify 5% weekend surcharge is correctly applied', () => {
    const result = rental.price(new Date('2026-02-14'), new Date('2026-02-15'), 'compact', 100, 3);
    expect(result).toBe('$105');
  });

  test('Weekday-heavy rental: Monday-Saturday with 5 weekdays and 1 weekend', () => {
    const result = rental.price(new Date('2026-02-09'), new Date('2026-02-15'), 'compact', 50, 3);
    expect(result).toBe('$302.5');
  });

  test('Two-week rental spans multiple weekend days', () => {
    const result = rental.price(new Date('2026-02-02'), new Date('2026-02-16'), 'compact', 30, 3);
    expect(result).toBe('$383.4');
  });

  test('Weekend surcharge applies independently with license surcharge', () => {
    const result = rental.price(new Date('2026-02-07'), new Date('2026-02-08'), 'compact', 50, 1.5);
    expect(result).toBe('$68.25');
  });

});
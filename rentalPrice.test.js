const { price } = require('./rentalPrice');

describe('Rental price calculator', () => {
  describe('Current business requirements', () => {
    test('supports all four car classes', () => {
      expect(price('A', 'B', '2024-02-10', '2024-02-10', 'Compact', 30)).toBe('$30');
      expect(price('A', 'B', '2024-02-10', '2024-02-10', 'Electric', 30)).toBe('$30');
      expect(price('A', 'B', '2024-02-10', '2024-02-10', 'Cabrio', 30)).toBe('$30');
      expect(price('A', 'B', '2024-02-10', '2024-02-10', 'Racer', 30)).toBe('$30');
    });

    test('drivers under 18 cannot rent', () => {
      expect(price('A', 'B', '2024-02-10', '2024-02-10', 'Compact', 17)).toBe(
        'Driver too young - cannot quote the price'
      );
    });

    test('drivers aged 18-21 can only rent Compact', () => {
      expect(price('A', 'B', '2024-02-10', '2024-02-10', 'Compact', 21)).toBe('$21');
      expect(price('A', 'B', '2024-02-10', '2024-02-10', 'Electric', 21)).toBe(
        'Drivers 21 y/o or less can only rent Compact vehicles'
      );
    });

    test('racer surcharge: age 25 or less in high season gets +50%', () => {
      expect(price('A', 'B', '2024-06-10', '2024-06-10', 'Racer', 25)).toBe('$43.125');
    });

    test('racer surcharge does not apply in low season', () => {
      expect(price('A', 'B', '2024-02-10', '2024-02-10', 'Racer', 25)).toBe('$25');
    });

    test('high season (April-October) adds 15%', () => {
      expect(price('A', 'B', '2024-04-01', '2024-04-01', 'Compact', 100)).toBe('$115');
      expect(price('A', 'B', '2024-10-31', '2024-10-31', 'Compact', 100)).toBe('$115');
    });

    test('low season (November-March) has no 15% increase', () => {
      expect(price('A', 'B', '2024-03-31', '2024-03-31', 'Compact', 100)).toBe('$100');
      expect(price('A', 'B', '2024-11-01', '2024-11-01', 'Compact', 100)).toBe('$100');
    });

    test('more than 10 days in low season gets 10% discount', () => {
      expect(price('A', 'B', '2024-02-10', '2024-02-20', 'Compact', 100)).toBe('$990');
    });

    test('more than 10 days in high season does not get 10% discount', () => {
      expect(price('A', 'B', '2024-06-10', '2024-06-20', 'Compact', 100)).toBe('$1265');
    });

    test('minimum daily price equals driver age', () => {
      expect(price('A', 'B', '2024-02-10', '2024-02-10', 'Compact', 37)).toBe('$37');
      expect(price('A', 'B', '2024-02-10', '2024-02-12', 'Compact', 37)).toBe('$111');
    });
  });

  describe('Task 1 new requirements (TDD expectations)', () => {
    test('driver with less than one year license cannot rent', () => {
      expect(price('A', 'B', '2024-02-10', '2024-02-10', 'Compact', 30, 0.5)).toBe(
        'Driver license held for less than a year - cannot rent'
      );
    });

    test('driver with one year license can rent', () => {
      expect(price('A', 'B', '2024-02-10', '2024-02-10', 'Compact', 30, 1)).toBe('$30');
    });

    test('driver with less than two years license gets +30%', () => {
      expect(price('A', 'B', '2024-02-10', '2024-02-10', 'Compact', 30, 1.5)).toBe('$39');
    });

    test('driver with two years license does not get +30%', () => {
      expect(price('A', 'B', '2024-02-10', '2024-02-10', 'Compact', 30, 2)).toBe('$30');
    });

    test('driver with less than three years license gets +15 euros/day in high season', () => {
      expect(price('A', 'B', '2024-06-10', '2024-06-12', 'Compact', 30, 2.5)).toBe('$148.5');
    });
  });

  describe('Task 3 weekday/weekend pricing (TDD expectations)', () => {
    test('weekday-only rental keeps regular pricing', () => {
      expect(price('A', 'B', '2024-01-08', '2024-01-10', 'Compact', 50)).toBe('$150');
    });

    test('README example: Thursday-Friday-Saturday totals $152.50', () => {
      expect(price('A', 'B', '2024-01-11', '2024-01-13', 'Compact', 50)).toBe('$152.5');
    });

    test('Friday-Saturday-Sunday applies weekend increase for two days', () => {
      expect(price('A', 'B', '2024-01-12', '2024-01-14', 'Compact', 50)).toBe('$155');
    });
  });
});

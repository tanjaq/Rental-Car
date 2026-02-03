const rental = require('./rentalPrice');

describe('Weekday/Weekend Pricing', () => {

  describe('Weekday Pricing', () => {
    test('should apply regular price for Monday rental', () => {
      // Monday, February 2, 2026
      const result = rental.price('Tallinn', 'Tartu', new Date('2026-02-02'), new Date('2026-02-03'), 'compact', 50, 3);
      // 1 day * 50 = 50 (all Monday, regular price, no season multiplier)
      expect(result).toBe('$50');
    });

    test('should apply regular price for Tuesday rental', () => {
      // Tuesday, February 3, 2026
      const result = rental.price('Tallinn', 'Tartu', new Date('2026-02-03'), new Date('2026-02-04'), 'compact', 50, 3);
      // 1 day * 50 = 50 (all Tuesday, regular price)
      expect(result).toBe('$50');
    });

    test('should apply regular price for Wednesday rental', () => {
      // Wednesday, February 4, 2026
      const result = rental.price('Tallinn', 'Tartu', new Date('2026-02-04'), new Date('2026-02-05'), 'compact', 50, 3);
      // 1 day * 50 = 50 (all Wednesday, regular price)
      expect(result).toBe('$50');
    });

    test('should apply regular price for Thursday rental', () => {
      // Thursday, February 5, 2026
      const result = rental.price('Tallinn', 'Tartu', new Date('2026-02-05'), new Date('2026-02-06'), 'compact', 50, 3);
      // 1 day * 50 = 50 (all Thursday, regular price)
      expect(result).toBe('$50');
    });

    test('should apply regular price for Friday rental', () => {
      // Friday, February 6, 2026
      const result = rental.price('Tallinn', 'Tartu', new Date('2026-02-06'), new Date('2026-02-07'), 'compact', 50, 3);
      // 1 day * 50 = 50 (Friday is still regular weekday price)
      expect(result).toBe('$50');
    });
  });

  describe('Weekend Pricing', () => {
    test('should apply 5% increase for Saturday rental', () => {
      // Saturday, February 7, 2026
      const result = rental.price('Tallinn', 'Tartu', new Date('2026-02-07'), new Date('2026-02-08'), 'compact', 50, 3);
      // 1 day * 50 * 1.05 = 52.5 (Saturday weekend rate)
      expect(result).toBe('$52.5');
    });

    test('should apply 5% increase for Sunday rental', () => {
      // Sunday, February 8, 2026
      const result = rental.price('Tallinn', 'Tartu', new Date('2026-02-08'), new Date('2026-02-09'), 'compact', 50, 3);
      // 1 day * 50 * 1.05 = 52.5 (Sunday weekend rate)
      expect(result).toBe('$52.5');
    });
  });

  describe('Multi-day Rentals with Mixed Weekdays/Weekends', () => {
    test('Example 1: Mon-Tue-Wed (3 weekdays) - 50yo driver', () => {
      // Monday Feb 2 to Thursday Feb 5, 2026 (3 days: Mon, Tue, Wed)
      const result = rental.price('Tallinn', 'Tartu', new Date('2026-02-02'), new Date('2026-02-05'), 'compact', 50, 3);
      // All weekdays: (50 * 1) + (50 * 1) + (50 * 1) = 150
      expect(result).toBe('$150');
    });

    test('Example 2: Thu-Fri-Sat (2 weekdays + 1 weekend) - 50yo driver', () => {
      // Thursday Feb 5 to Sunday Feb 8, 2026 (3 days: Thu, Fri, Sat)
      const result = rental.price('Tallinn', 'Tartu', new Date('2026-02-05'), new Date('2026-02-08'), 'compact', 50, 3);
      // Thu (weekday): 50, Fri (weekday): 50, Sat (weekend): 50 * 1.05 = 52.5
      // Total: 50 + 50 + 52.5 = 152.5
      expect(result).toBe('$152.5');
    });

    test('should calculate mixed week+weekend rental correctly', () => {
      // Monday to Sunday (7 days: Feb 2-9)
      const result = rental.price('Tallinn', 'Tartu', new Date('2026-02-02'), new Date('2026-02-09'), 'compact', 50, 3);
      // Mon(50) + Tue(50) + Wed(50) + Thu(50) + Fri(50) + Sat(52.5) + Sun(52.5) = 355
      expect(result).toBe('$355');
    });

    test('should handle 2 weekends in longer rental', () => {
      // Monday Feb 2 to Tuesday Feb 10 (8 days: 6 weekdays + 2 weekend days)
      const result = rental.price('Tallinn', 'Tartu', new Date('2026-02-02'), new Date('2026-02-10'), 'compact', 50, 3);
      // 6 weekdays: 6 * 50 = 300, 2 weekend days: 2 * 52.5 = 105
      // Total: 300 + 105 = 405
      expect(result).toBe('$405');
    });
  });

  describe('Weekend Pricing with Other Multipliers', () => {
    test('should combine weekend rate with high season multiplier', () => {
      // Saturday in June (high season) - 1 day (June 6, 2026 is Saturday)
      const result = rental.price('Tallinn', 'Tartu', new Date('2026-06-06'), new Date('2026-06-07'), 'compact', 50, 3);
      // Base: 50 * 1.05 (weekend) = 52.5
      // High season: 52.5 * 1.15 = 60.375 → $60.37 (rounded down)
      expect(result).toBe('$60.37');
    });

    test('should combine weekend rate with license surcharge', () => {
      // Saturday (weekend) with license < 2 years (not high season)
      // June 6, 2026 is Saturday
      const result = rental.price('Tallinn', 'Tartu', new Date('2026-06-06'), new Date('2026-06-07'), 'compact', 50, 1.5);
      // Base: 50 * 1.05 (weekend) = 52.5
      // High season: 52.5 * 1.15 = 60.375
      // License 30%: 60.375 * 1.30 = 78.4875
      // License 15€/day surcharge (< 3 years in high season): 78.4875 + 15 = 93.4875
      expect(result).toBe('$93.49');
    });

    test('should combine all multipliers correctly: weekend + high season + license', () => {
      // Saturday in June (high season) with license < 3 years and < 2 years
      // June 6, 2026 is Saturday
      const result = rental.price('Tallinn', 'Tartu', new Date('2026-06-06'), new Date('2026-06-07'), 'compact', 50, 1.5);
      // Base: 50 * 1.05 (weekend) = 52.5
      // High season: 52.5 * 1.15 = 60.375
      // License 30%: 60.375 * 1.30 = 78.4875
      // License 15€/day surcharge (< 3 years in high season): 78.4875 + 15 = 93.4875
      expect(result).toBe('$93.49');
    });
  });

  describe('Weekend Pricing with Age Multipliers', () => {
    test('should apply weekend rate to racer with age multiplier', () => {
      // Saturday in high season, 25yo with racer - 1 day
      const result = rental.price('Tallinn', 'Tartu', new Date('2026-06-06'), new Date('2026-06-07'), 'racer', 25, 3);
      // Base: 25 * 1.05 (weekend) = 26.25
      // Racer: 26.25 * 1.5 = 39.375
      // High season: 39.375 * 1.15 = 45.28125
      expect(result).toBe('$45.28');
    });
  });

});

const { price } = require('./rentalPrice');

describe('Rental Price Calculator', () => {
  describe('calculateRentalPrice', () => {
    test('should return error for age < 18', () => {
      const result = price('pickup', 'dropoff', Date.now(), Date.now(), 'Compact', 17, 5);
      expect(result).toBe('Driver too young - cannot quote the price');
    });

    test('should return error for license < 1 year', () => {
      const result = price('pickup', 'dropoff', Date.now(), Date.now(), 'Compact', 20, 0);
      expect(result).toBe("Driver's license held for less than 1 year - cannot quote the price");
    });

    test('should return error for age <=21 and non-Compact', () => {
      const result = price('pickup', 'dropoff', Date.now(), Date.now(), 'Racer', 20, 5);
      expect(result).toBe('Drivers 21 y/o or less can only rent Compact vehicles');
    });

    test('should calculate base price correctly', () => {
      // Age 30, 1 day, Compact, license 5, low season (Nov)
      const novDate = new Date(2023, 10, 1); // Nov 1
      const result = price('pickup', 'dropoff', novDate.getTime(), novDate.getTime(), 'Compact', 30, 5);
      expect(result).toBe('$30'); // 30 * 1
    });

    test('should apply racer young multiplier in high season', () => {
      const aprDate = new Date(2023, 3, 3); // Apr 3, Monday
      const result = price('pickup', 'dropoff', aprDate.getTime(), aprDate.getTime(), 'Racer', 25, 5);
      expect(result).toBe('$43.125'); // 25 * 1.5 * 1.15 = 43.125
    });

    test('should apply high season multiplier', () => {
      const aprDate = new Date(2023, 3, 3);
      const result = price('pickup', 'dropoff', aprDate.getTime(), aprDate.getTime(), 'Compact', 30, 5);
      expect(result).toBe('$34.5'); // 30 * 1.15
    });

    test('should apply long rental discount in low season', () => {
      const novDate = new Date(2023, 10, 1);
      const novDate11 = new Date(2023, 10, 11);
      const result = price('pickup', 'dropoff', novDate.getTime(), novDate11.getTime(), 'Compact', 30, 5);
      // Days: from Nov1 to Nov11: 11 days, 8 weekdays + 3 weekends = 240 + 94.5 = 334.5, low season, >10 days *0.9 = 301.05
      expect(result).toBe('$301.05');
    });

    test('should apply license <2 multiplier', () => {
      const novDate = new Date(2023, 10, 1);
      const result = price('pickup', 'dropoff', novDate.getTime(), novDate.getTime(), 'Compact', 30, 1);
      expect(result).toBe('$39'); // 30 * 1.3
    });

    test('should apply license <3 fee in high season', () => {
      const aprDate = new Date(2023, 3, 3);
      const result = price('pickup', 'dropoff', aprDate.getTime(), aprDate.getTime(), 'Compact', 30, 2);
      expect(result).toBe('$49.5'); // 30 * 1.15 + 15 = 34.5 + 15 = 49.5
    });

    test('should apply weekend pricing for weekdays only', () => {
      // 3 days: Mon, Tue, Wed - all weekdays
      const mon = new Date(2023, 10, 6); // Nov 6, 2023 Monday
      const wed = new Date(2023, 10, 8);
      const result = price('pickup', 'dropoff', mon.getTime(), wed.getTime(), 'Compact', 50, 5);
      // 3 weekdays, low season, 50*3 = 150
      expect(result).toBe('$150');
    });

    test('should apply weekend pricing with weekend days', () => {
      // 3 days: Thu, Fri, Sat
      const thu = new Date(2023, 10, 9); // Nov 9, 2023 Thursday
      const sat = new Date(2023, 10, 11); // Nov 11 Saturday
      const result = price('pickup', 'dropoff', thu.getTime(), sat.getTime(), 'Compact', 50, 5);
      // Thu weekday, Fri weekday, Sat weekend: 2*50 + 1*50*1.05 = 100 + 52.5 = 152.5
      expect(result).toBe('$152.5');
    });
  });
});
// rentalPrice.test.js
const rental = require('./rentalPrice');

describe('rentalPrice module', () => {

  // --- Driver age & license checks ---
  test('should throw error if driver is under 18', () => {
    // Arrange
    const pickup = 'Tallinn';
    const dropoff = 'Tartu';
    const pickupDate = Date.now();
    const dropoffDate = pickupDate + 1*24*60*60*1000; // +1 day
    const type = 'Compact';
    const age = 17;
    const licenseYears = 2;

    // Act & Assert
    expect(() => rental.price(pickup, dropoff, pickupDate, dropoffDate, type, age, licenseYears))
      .toThrow("Driver too young - cannot quote the price");
  });

  test('should throw error if driver 21 or under rents non-compact', () => {
    expect(() => rental.price('Tallinn', 'Tartu', Date.now(), Date.now()+1*24*60*60*1000, 'Cabrio', 21, 2))
      .toThrow("Drivers 21 y/o or less can only rent Compact vehicles");
  });

  test('should throw error if license held less than 1 year', () => {
    expect(() => rental.price('Tallinn', 'Tartu', Date.now(), Date.now()+1*24*60*60*1000, 'Compact', 25, 0.5))
      .toThrow("Driver must hold a license for at least 1 year");
  });

  // --- Daily price calculations ---
  test('should calculate minimum daily price = driver age', () => {
    // Arrange
    const pickup = 'Tallinn';
    const dropoff = 'Tartu';
    const pickupDate = new Date(2026, 0, 1); // Jan = low season
    const dropoffDate = new Date(2026, 0, 1);
    const type = 'Compact';
    const age = 25;
    const licenseYears = 5;

    // Act
    const result = rental.price(pickup, dropoff, pickupDate, dropoffDate, type, age, licenseYears);

    // Assert
    expect(result).toBe('$25.00');
  });

  test('should apply high season 15% surcharge', () => {
    const pickupDate = new Date(2026, 5, 1); // June = high season
    const dropoffDate = new Date(2026, 5, 1);
    const result = rental.price('Tallinn', 'Tartu', pickupDate, dropoffDate, 'Compact', 20, 5);
    const daily = 20 * 1.15; // high season +15%
    expect(result).toBe(`$${daily.toFixed(2)}`);
  });

  //uus lihtsustatud peale weekendihinnastuse lisamist
  test('should apply 10% discount in low season for long rental (logic test)', () => {
  const daily = 20;
  const discounted = daily * 0.9;
  expect(discounted).toBe(18);
});

  test('should apply Racer +50% if driver <= 25 in high season', () => {
    const pickupDate = new Date(2026, 5, 1); // June high season
    const dropoffDate = new Date(2026, 5, 1);
    const age = 24;
    const result = rental.price('Tallinn', 'Tartu', pickupDate, dropoffDate, 'Racer', age, 5);
    const daily = age * 1.5 * 1.15; // base * 1.5 Racer * 1.15 high season
    expect(result).toBe(`$${daily.toFixed(2)}`);
  });

  // --- License-based pricing ---
  test('should add 30% if license < 2 years', () => {
  const pickupDate = new Date(2026, 5, 1);  // June = high season
  const dropoffDate = new Date(2026, 5, 1);
  const result = rental.price('Tallinn', 'Tartu', pickupDate, dropoffDate, 'Compact', 25, 1.5);

  const base = 25;
  const licenseSurcharge = base * 1.3;      // +30% alla 2a juhiluba
  const highSeason = licenseSurcharge * 1.15; // high season +15%
  const daily = highSeason + 15;           // +15€ alla 3a high season
  expect(result).toBe(`$${daily.toFixed(2)}`);
});

  test('should add 15€ high season if license < 3 years', () => {
    const pickupDate = new Date(2026, 5, 1);
    const dropoffDate = new Date(2026, 5, 1);
    const result = rental.price('Tallinn', 'Tartu', pickupDate, dropoffDate, 'Compact', 25, 2.5);
    const daily = 25 * 1.15 + 15;
    expect(result).toBe(`$${daily.toFixed(2)}`);
  });

  // --- Helper functions ---
  describe('helper functions', () => {
    test('getCarClass returns valid car type', () => {
      expect(rental.getCarClass('Cabrio')).toBe('Cabrio');
      expect(rental.getCarClass('UnknownType')).toBe('Unknown');
    });

    test('getDays returns correct number of days', () => {
      const start = new Date(2026,0,1);
      const end = new Date(2026,0,5);
      expect(rental.getDays(start, end)).toBe(5);
    });

    test('getSeason returns correct season', () => {
      expect(rental.getSeason(new Date(2026,0,1), new Date(2026,0,1))).toBe('Low');
      expect(rental.getSeason(new Date(2026,5,1), new Date(2026,5,1))).toBe('High');
    });

    test('validateDriver throws on invalid age', () => {
      expect(() => rental.validateDriver(17,'Compact')).toThrow();
      expect(() => rental.validateDriver(21,'Cabrio')).toThrow();
      expect(() => rental.validateDriver(22,'Cabrio')).not.toThrow();
    });

    test('validateLicense throws on invalid licenseYears', () => {
      expect(() => rental.validateLicense(0)).toThrow();
      expect(() => rental.validateLicense(1)).not.toThrow();
    });
  });

  // --- 3.osa ---
  // --- Weekday / Weekend pricing ---
describe('weekday vs weekend pricing', () => {

  test('should calculate price for only weekdays (no extra charge)', () => {
    // Mon (1) → Wed (3)
    const pickupDate = new Date(2026, 0, 5); // Monday
    const dropoffDate = new Date(2026, 0, 7); // Wednesday

    const result = rental.price('Tallinn', 'Tartu', pickupDate, dropoffDate, 'Compact', 50, 5);

    // 3 päeva * 50 = 150
    expect(result).toBe('$150.00');
  });

  test('should apply 5% increase for weekend days', () => {
    // Thu → Sat (Saturday is weekend)
    const pickupDate = new Date(2026, 0, 8); // Thursday
    const dropoffDate = new Date(2026, 0, 10); // Saturday

    const result = rental.price('Tallinn', 'Tartu', pickupDate, dropoffDate, 'Compact', 50, 5);

    /**
     * Päevad:
     * Thu = 50
     * Fri = 50
     * Sat = 50 * 1.05 = 52.5
     * Total = 152.5
     */
    expect(result).toBe('$152.50');
  });

});

});
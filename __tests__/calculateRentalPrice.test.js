const {
  calculateRentalPrice,
  CAR_CLASSES,
  SEASONS,
} = require('../rentalPrice');

describe('calculateRentalPrice', () => {
  test('calculates correct price for a simple Compact rental in low season', () => {
    // Arrange
    const input = {
      carClass: CAR_CLASSES.COMPACT,
      driverAge: 40,
      licenseYears: 10,
      startDate: '2024-01-01', // low season
      endDate: '2024-01-03',
      baseDailyPrice: 30,
    };

    // Act
    const result = calculateRentalPrice(input);

    // Assert
    // min daily price = max(baseDailyPrice, driverAge) = 40
    // 3 days → 40 * 3 = 120
    expect(result).toBe(120);
  });

  test('throws an error when driver is under 18', () => {
    // Arrange
    const input = {
      carClass: CAR_CLASSES.COMPACT,
      driverAge: 17,
      licenseYears: 2,
      startDate: '2024-01-01',
      endDate: '2024-01-02',
      baseDailyPrice: 20,
    };

    // Act + Assert
    expect(() => calculateRentalPrice(input))
      .toThrow('Driver is too young to rent a car.');
  });

  test('applies high‑season increase correctly', () => {
    // Arrange
    const input = {
      carClass: CAR_CLASSES.COMPACT,
      driverAge: 30,
      licenseYears: 5,
      startDate: '2024-07-10', // high season
      endDate: '2024-07-10',
      baseDailyPrice: 50,
    };

    // Act
    const result = calculateRentalPrice(input);

    // Assert
    // high season → +15% → 50 * 1.15 = 57.5
    expect(result).toBeCloseTo(57.5);
  });

  test('applies young driver surcharge for Racer class', () => {
    // Arrange
    const input = {
      carClass: CAR_CLASSES.RACER,
      driverAge: 23,
      licenseYears: 5,
      startDate: '2024-07-10', // high season
      endDate: '2024-07-10',
      baseDailyPrice: 100,
    };

    // Act
    const result = calculateRentalPrice(input);

    // Assert
    // base 100 → high season 115 → young racer +50% = 172.5
    expect(result).toBeCloseTo(172.5);
  });

  test('applies long‑rental discount in low season', () => {
    // Arrange
    const input = {
      carClass: CAR_CLASSES.COMPACT,
      driverAge: 40,
      licenseYears: 10,
      startDate: '2024-02-01',
      endDate: '2024-02-12', // 12 days
      baseDailyPrice: 40,
    };

    // Act
    const result = calculateRentalPrice(input);

    // Assert
    // daily price = 40 (age is 40)
    // 12 days → 480
    // long rental discount 10% → 432
    expect(result).toBe(432);
  });
});

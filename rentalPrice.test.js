const {
  price,
  getCarClass,
  calculateRentalDays,
  determineSeason,
  isHighSeasonMonth,
  validateDriverEligibility,
  calculateDailyBasePrice,
  applyPricingRules,
  shouldApplyRacerSurcharge,
  shouldApplyLongRentalDiscount,
  calculateBaseRentalPrice,
  countWeekendDays,
  isWeekend,
} = require('./rentalPrice');

describe('getCarClass', () => {
  test('returns Compact when type is Compact', () => {
    // Arrange
    const type = 'Compact';

    // Act
    const result = getCarClass(type);

    // Assert
    expect(result).toBe('Compact');
  });

  test('returns Unknown when type is not supported', () => {
    // Arrange
    const type = 'Truck';

    // Act
    const result = getCarClass(type);

    // Assert
    expect(result).toBe('Unknown');
  });
});

describe('calculateRentalDays', () => {
  test('returns 1 when pickup and dropoff are on the same day', () => {
    // Arrange
    const pickupDate = Date.parse('2026-01-10');
    const dropoffDate = Date.parse('2026-01-10');

    // Act
    const result = calculateRentalDays(pickupDate, dropoffDate);

    // Assert
    expect(result).toBe(1);
  });

  test('returns inclusive amount of rental days', () => {
    // Arrange
    const pickupDate = Date.parse('2026-01-10');
    const dropoffDate = Date.parse('2026-01-12');

    // Act
    const result = calculateRentalDays(pickupDate, dropoffDate);

    // Assert
    expect(result).toBe(3);
  });
});

describe('isHighSeasonMonth', () => {
  test('returns true for April', () => {
    // Arrange
    const month = 3;

    // Act
    const result = isHighSeasonMonth(month);

    // Assert
    expect(result).toBe(true);
  });

  test('returns true for October', () => {
    // Arrange
    const month = 9;

    // Act
    const result = isHighSeasonMonth(month);

    // Assert
    expect(result).toBe(true);
  });

  test('returns false for March', () => {
    // Arrange
    const month = 2;

    // Act
    const result = isHighSeasonMonth(month);

    // Assert
    expect(result).toBe(false);
  });

  test('returns false for November', () => {
    // Arrange
    const month = 10;

    // Act
    const result = isHighSeasonMonth(month);

    // Assert
    expect(result).toBe(false);
  });
});

describe('determineSeason', () => {
  test('returns Low when rental stays fully in low season', () => {
    // Arrange
    const pickupDate = Date.parse('2026-01-10');
    const dropoffDate = Date.parse('2026-01-15');

    // Act
    const result = determineSeason(pickupDate, dropoffDate);

    // Assert
    expect(result).toBe('Low');
  });

  test('returns High when rental stays fully in high season', () => {
    // Arrange
    const pickupDate = Date.parse('2026-06-10');
    const dropoffDate = Date.parse('2026-06-15');

    // Act
    const result = determineSeason(pickupDate, dropoffDate);

    // Assert
    expect(result).toBe('High');
  });

  test('returns High when rental overlaps low and high season', () => {
    // Arrange
    const pickupDate = Date.parse('2026-03-31');
    const dropoffDate = Date.parse('2026-04-02');

    // Act
    const result = determineSeason(pickupDate, dropoffDate);

    // Assert
    expect(result).toBe('High');
  });
});

describe('validateDriverEligibility', () => {
  test('returns an error for unknown car type', () => {
    // Arrange
    const input = {
      age: 30,
      carClass: 'Unknown',
      licenseYearsHeld: 5,
    };

    // Act
    const result = validateDriverEligibility(input);

    // Assert
    expect(result).toBe('Unknown car type');
  });

  test('returns an error when driver is under 18', () => {
    // Arrange
    const input = {
      age: 17,
      carClass: 'Compact',
      licenseYearsHeld: 2,
    };

    // Act
    const result = validateDriverEligibility(input);

    // Assert
    expect(result).toBe('Driver too young - cannot quote the price');
  });

  test('returns an error when license has been held for less than one year', () => {
    // Arrange
    const input = {
      age: 30,
      carClass: 'Compact',
      licenseYearsHeld: 0.5,
    };

    // Act
    const result = validateDriverEligibility(input);

    // Assert
    expect(result).toBe(
      'Driver has held a license for less than a year - cannot quote the price'
    );
  });

  test('returns an error when a driver aged 18-21 tries to rent a non-Compact car', () => {
    // Arrange
    const input = {
      age: 20,
      carClass: 'Electric',
      licenseYearsHeld: 2,
    };

    // Act
    const result = validateDriverEligibility(input);

    // Assert
    expect(result).toBe(
      'Drivers aged 18-21 can only rent Compact vehicles'
    );
  });

  test('returns null for an eligible driver', () => {
    // Arrange
    const input = {
      age: 30,
      carClass: 'Electric',
      licenseYearsHeld: 5,
    };

    // Act
    const result = validateDriverEligibility(input);

    // Assert
    expect(result).toBeNull();
  });
});

describe('calculateDailyBasePrice', () => {
  test('returns age as the daily base price in low season', () => {
    // Arrange
    const input = {
      age: 30,
      season: 'Low',
      licenseYearsHeld: 2.5,
    };

    // Act
    const result = calculateDailyBasePrice(input);

    // Assert
    expect(result).toBe(30);
  });

  test('adds 15 euros per day in high season when license has been held for less than three years', () => {
    // Arrange
    const input = {
      age: 30,
      season: 'High',
      licenseYearsHeld: 2.5,
    };

    // Act
    const result = calculateDailyBasePrice(input);

    // Assert
    expect(result).toBe(45);
  });

  test('does not add 15 euros per day in high season when license has been held for at least three years', () => {
    // Arrange
    const input = {
      age: 30,
      season: 'High',
      licenseYearsHeld: 3,
    };

    // Act
    const result = calculateDailyBasePrice(input);

    // Assert
    expect(result).toBe(30);
  });
});

describe('shouldApplyRacerSurcharge', () => {
  test('returns true for Racer in high season when driver is 25 or younger', () => {
    // Arrange
    const input = {
      age: 25,
      carClass: 'Racer',
      season: 'High',
    };

    // Act
    const result = shouldApplyRacerSurcharge(input);

    // Assert
    expect(result).toBe(true);
  });

  test('returns false for Racer in low season', () => {
    // Arrange
    const input = {
      age: 25,
      carClass: 'Racer',
      season: 'Low',
    };

    // Act
    const result = shouldApplyRacerSurcharge(input);

    // Assert
    expect(result).toBe(false);
  });
});

describe('shouldApplyLongRentalDiscount', () => {
  test('returns true when rental is longer than 10 days in low season', () => {
    // Arrange
    const input = {
      rentalDays: 11,
      season: 'Low',
    };

    // Act
    const result = shouldApplyLongRentalDiscount(input);

    // Assert
    expect(result).toBe(true);
  });

  test('returns false when rental is longer than 10 days in high season', () => {
    // Arrange
    const input = {
      rentalDays: 11,
      season: 'High',
    };

    // Act
    const result = shouldApplyLongRentalDiscount(input);

    // Assert
    expect(result).toBe(false);
  });
});

describe('applyPricingRules', () => {
  test('applies young Racer surcharge and high season multiplier', () => {
    // Arrange
    const input = {
      baseRentalPrice: 100,
      age: 25,
      carClass: 'Racer',
      season: 'High',
      rentalDays: 3,
      licenseYearsHeld: 5,
    };

    // Act
    const result = applyPricingRules(input);

    // Assert
    expect(result).toBe(172.5);
  });

  test('applies only high season multiplier for non-Racer rental', () => {
    // Arrange
    const input = {
      baseRentalPrice: 100,
      age: 30,
      carClass: 'Compact',
      season: 'High',
      rentalDays: 3,
      licenseYearsHeld: 5,
    };

    // Act
    const result = applyPricingRules(input);

    // Assert
    expect(result).toBeCloseTo(115);
  });

  test('applies long rental discount in low season', () => {
    // Arrange
    const input = {
      baseRentalPrice: 100,
      age: 30,
      carClass: 'Compact',
      season: 'Low',
      rentalDays: 11,
      licenseYearsHeld: 5,
    };

    // Act
    const result = applyPricingRules(input);

    // Assert
    expect(result).toBe(90);
  });

  test('applies 30 percent surcharge when license has been held for less than two years', () => {
    // Arrange
    const input = {
      baseRentalPrice: 100,
      age: 30,
      carClass: 'Compact',
      season: 'Low',
      rentalDays: 5,
      licenseYearsHeld: 1.5,
    };

    // Act
    const result = applyPricingRules(input);

    // Assert
    expect(result).toBe(130);
  });

  test('returns base rental price unchanged when no pricing rule applies', () => {
    // Arrange
    const input = {
      baseRentalPrice: 100,
      age: 30,
      carClass: 'Compact',
      season: 'Low',
      rentalDays: 5,
      licenseYearsHeld: 5,
    };

    // Act
    const result = applyPricingRules(input);

    // Assert
    expect(result).toBe(100);
  });
});

describe('price', () => {
  test('returns rejection message when driver is under 18', () => {
    // Arrange
    const input = {
      pickupDate: Date.parse('2026-01-10'),
      dropoffDate: Date.parse('2026-01-12'),
      type: 'Compact',
      age: 17,
      licenseYearsHeld: 2,
    };

    // Act
    const result = price(input);

    // Assert
    expect(result).toBe('Driver too young - cannot quote the price');
  });

  test('returns rejection message when license has been held for less than one year', () => {
    // Arrange
    const input = {
      pickupDate: Date.parse('2026-01-10'),
      dropoffDate: Date.parse('2026-01-12'),
      type: 'Compact',
      age: 30,
      licenseYearsHeld: 0.5,
    };

    // Act
    const result = price(input);

    // Assert
    expect(result).toBe(
      'Driver has held a license for less than a year - cannot quote the price'
    );
  });

  test('returns rejection message when a driver aged 18-21 tries to rent a non-Compact car', () => {
    // Arrange
    const input = {
      pickupDate: Date.parse('2026-01-10'),
      dropoffDate: Date.parse('2026-01-12'),
      type: 'Electric',
      age: 20,
      licenseYearsHeld: 2,
    };

    // Act
    const result = price(input);

    // Assert
    expect(result).toBe('Drivers aged 18-21 can only rent Compact vehicles');
  });

  test('calculates low season Compact rental price correctly', () => {
    // Arrange
    const input = {
      pickupDate: Date.parse('2026-01-05'),
      dropoffDate: Date.parse('2026-01-07'),
      type: 'Compact',
      age: 30,
      licenseYearsHeld: 5,
    };

    // Act
    const result = price(input);

    // Assert
    expect(result).toBe('$90');
  });

  test('calculates high season Racer rental with young driver surcharge correctly', () => {
    // Arrange
    const input = {
      pickupDate: Date.parse('2026-06-10'),
      dropoffDate: Date.parse('2026-06-12'),
      type: 'Racer',
      age: 24,
      licenseYearsHeld: 5,
    };

    // Act
    const result = price(input);

    // Assert
    expect(result).toBe('$124.2');
  });

  test('calculates low season long rental discount correctly', () => {
    // Arrange
    const input = {
      pickupDate: Date.parse('2026-01-01'),
      dropoffDate: Date.parse('2026-01-11'),
      type: 'Compact',
      age: 30,
      licenseYearsHeld: 5,
    };

    // Act
    const result = price(input);

    // Assert
    expect(result).toBe('$302.4');
  });

  test('calculates 30 percent surcharge for license held less than two years', () => {
    // Arrange
    const input = {
      pickupDate: Date.parse('2026-01-05'),
      dropoffDate: Date.parse('2026-01-07'),
      type: 'Compact',
      age: 30,
      licenseYearsHeld: 1.5,
    };

    // Act
    const result = price(input);

    // Assert
    expect(result).toBe('$117');
  });

  test('adds 15 euros per day in high season when license has been held for less than three years', () => {
    // Arrange
    const input = {
      pickupDate: Date.parse('2026-06-10'),
      dropoffDate: Date.parse('2026-06-12'),
      type: 'Compact',
      age: 30,
      licenseYearsHeld: 2.5,
    };

    // Act
    const result = price(input);

    // Assert
    expect(result).toBe('$155.25');
  });

  test('combines high season daily fee and short license surcharge correctly', () => {
    // Arrange
    const input = {
      pickupDate: Date.parse('2026-06-10'),
      dropoffDate: Date.parse('2026-06-12'),
      type: 'Compact',
      age: 31,
      licenseYearsHeld: 1.5,
    };

    // Act
    const result = price(input);

    // Assert
    expect(result).toBe('$206.31');
  });
});

// Task 3 test, calculateBaseRentalPrice implemented before updatinf rentalPrice.js for TDD.
describe('calculateBaseRentalPrice', () => {
  test('returns regular price for weekday-only rental', () => {
    // Arrange
    const input = {
      dailyBasePrice: 50,
      pickupDate: Date.parse('2026-01-05'),
      dropoffDate: Date.parse('2026-01-07'),
    };

    // Act
    const result = calculateBaseRentalPrice(input);

    // Assert
    expect(result).toBe(150);
  });

  test('adds 5 percent increase for weekend day pricing', () => {
    // Arrange
    const input = {
      dailyBasePrice: 50,
      pickupDate: Date.parse('2026-01-08'),
      dropoffDate: Date.parse('2026-01-10'),
    };

    // Act
    const result = calculateBaseRentalPrice(input);

    // Assert
    expect(result).toBeCloseTo(152.5, 10);
  });
});

describe('isWeekend', () => {
  test('returns true for Saturday', () => {
    // Arrange
    const date = new Date('2026-01-10');

    // Act
    const result = isWeekend(date);

    // Assert
    expect(result).toBe(true);
  });

  test('returns true for Sunday', () => {
    // Arrange
    const date = new Date('2026-01-11');

    // Act
    const result = isWeekend(date);

    // Assert
    expect(result).toBe(true);
  });

  test('returns false for Wednesday', () => {
    // Arrange
    const date = new Date('2026-01-07');

    // Act
    const result = isWeekend(date);

    // Assert
    expect(result).toBe(false);
  });
});

describe('countWeekendDays', () => {
  test('returns 0 for a Monday to Wednesday rental period', () => {
    // Arrange
    const pickupDate = Date.parse('2026-01-05');
    const dropoffDate = Date.parse('2026-01-07');

    // Act
    const result = countWeekendDays(pickupDate, dropoffDate);

    // Assert
    expect(result).toBe(0);
  });

  test('returns 1 for a Thursday to Saturday rental period', () => {
    // Arrange
    const pickupDate = Date.parse('2026-01-08');
    const dropoffDate = Date.parse('2026-01-10');

    // Act
    const result = countWeekendDays(pickupDate, dropoffDate);

    // Assert
    expect(result).toBe(1);
  });

  test('returns 2 for a Saturday to Sunday rental period', () => {
    // Arrange
    const pickupDate = Date.parse('2026-01-10');
    const dropoffDate = Date.parse('2026-01-11');

    // Act
    const result = countWeekendDays(pickupDate, dropoffDate);

    // Assert
    expect(result).toBe(2);
  });
});

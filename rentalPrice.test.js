const { price, isWeekend, countWeekendDays } = require('./rentalPrice');

function createUTCDate(year, month, day) {
  return new Date(Date.UTC(year, month, day));
}

describe('Car Rental Price Calculator - Unit Tests', () => {
  
  // ==================== VALIDATSIOONI TESTID ====================
  
  describe('Validation Tests', () => {
    test('should return error if driver is under 18', () => {
      const result = price('Tallinn', 'Tartu', Date.now(), Date.now(), 'Compact', 17, 5);
      expect(result).toEqual({ error: "Driver too young - cannot quote the price" });
    });

    test('should return error if license held less than 1 year', () => {
      const result = price('Tallinn', 'Tartu', Date.now(), Date.now(), 'Compact', 25, 0);
      expect(result).toEqual({ error: "Driver license held for less than a year - cannot quote the price" });
    });

    test('should return error if driver 21 or younger tries to rent non-Compact vehicle', () => {
      const result = price('Tallinn', 'Tartu', Date.now(), Date.now(), 'Racer', 21, 5);
      expect(result).toEqual({ error: "Drivers 21 y/o or less can only rent Compact vehicles" });
    });

    test('should allow driver 21 or younger to rent Compact vehicle', () => {
      const result = price('Tallinn', 'Tartu', Date.now(), Date.now(), 'Compact', 21, 5);
      expect(result.error).toBeUndefined();
      expect(result.compactPrice).toBeDefined();
    });

    test('should allow driver 22 to rent any vehicle', () => {
      const result = price('Tallinn', 'Tartu', Date.now(), Date.now(), 'Racer', 22, 5);
      expect(result.error).toBeUndefined();
    });
  });

  // ==================== PÕHIHINNA TESTID ====================
  
  describe('Base Price Calculation', () => {
    test('should calculate base price with weekday pricing only', () => {
      const pickupDate = createUTCDate(2025, 0, 6);
      const dropoffDate = createUTCDate(2025, 0, 8);
      const result = price('Tallinn', 'Tartu', pickupDate, dropoffDate, 'Compact', 30, 5);
      expect(result.compactPrice).toBe(90);
    });

    test('should calculate base price with weekend surcharge', () => {
      const pickupDate = createUTCDate(2025, 0, 9);
      const dropoffDate = createUTCDate(2025, 0, 11);
      const result = price('Tallinn', 'Tartu', pickupDate, dropoffDate, 'Compact', 30, 5);
      expect(result.compactPrice).toBe(91.5);
    });
  });

  // ==================== NÄDALAPÄEVA TESTID ====================
  
  describe('Weekend Detection Tests', () => {
    test('Should detect Saturday as weekend', () => {
      const date = createUTCDate(2025, 0, 11);
      expect(isWeekend(date)).toBe(true);
    });
    
    test('Should detect Sunday as weekend', () => {
      const date = createUTCDate(2025, 0, 12);
      expect(isWeekend(date)).toBe(true);
    });
    
    test('Should detect Monday as weekday', () => {
      const date = createUTCDate(2025, 0, 6);
      expect(isWeekend(date)).toBe(false);
    });
    
    test('Should detect Friday as weekday', () => {
      const date = createUTCDate(2025, 0, 10);
      expect(isWeekend(date)).toBe(false);
    });
  });

  describe('Weekend Days Counting', () => {
    test('Should count 0 weekend days for Mon-Wed', () => {
      const pickupDate = createUTCDate(2025, 0, 6);
      const dropoffDate = createUTCDate(2025, 0, 8);
      const weekendCount = countWeekendDays(pickupDate, dropoffDate);
      expect(weekendCount).toBe(0);
    });

    test('Should count 1 weekend day for Thu-Sat', () => {
      const pickupDate = createUTCDate(2025, 0, 9);
      const dropoffDate = createUTCDate(2025, 0, 11);
      const weekendCount = countWeekendDays(pickupDate, dropoffDate);
      expect(weekendCount).toBe(1);
    });

    test('Should count 2 weekend days for Sat-Mon', () => {
      const pickupDate = createUTCDate(2025, 0, 11);
      const dropoffDate = createUTCDate(2025, 0, 13);
      const weekendCount = countWeekendDays(pickupDate, dropoffDate);
      expect(weekendCount).toBe(2);
    });

    test('Should count correct weekend days for full week', () => {
      const pickupDate = createUTCDate(2025, 0, 6);
      const dropoffDate = createUTCDate(2025, 0, 12);
      const weekendCount = countWeekendDays(pickupDate, dropoffDate);
      expect(weekendCount).toBe(2);
    });
  });

  // ==================== NÄDALAPÄEVA HINNA TESTID ====================
  
  describe('Weekday/Weekend Pricing Tests', () => {
    
    test('Scenario 1: 50yo driver, 3 weekdays (Mon, Tue, Wed) - regular price', () => {
      const pickupDate = createUTCDate(2025, 0, 6);
      const dropoffDate = createUTCDate(2025, 0, 8);
      const result = price('Tallinn', 'Tartu', pickupDate, dropoffDate, 'Compact', 50, 10);
      expect(result.compactPrice).toBe(150);
    });
    
    test('Scenario 2: 50yo driver, 3 days including weekend (Thu, Fri, Sat) - weekend surcharge', () => {
      const pickupDate = createUTCDate(2025, 0, 9);
      const dropoffDate = createUTCDate(2025, 0, 11);
      const result = price('Tallinn', 'Tartu', pickupDate, dropoffDate, 'Compact', 50, 10);
      expect(result.compactPrice).toBe(152.5);
    });
    
    test('Scenario 3: Multiple weekend days - correct surcharge for each weekend day', () => {
      const pickupDate = createUTCDate(2025, 0, 11);
      const dropoffDate = createUTCDate(2025, 0, 15);
      const result = price('Tallinn', 'Tartu', pickupDate, dropoffDate, 'Compact', 50, 10);
      expect(result.compactPrice).toBe(255);
    });
    
    test('Scenario 4: Only weekend days - surcharge applies to all days', () => {
      const pickupDate = createUTCDate(2025, 0, 11);
      const dropoffDate = createUTCDate(2025, 0, 12);
      const result = price('Tallinn', 'Tartu', pickupDate, dropoffDate, 'Compact', 50, 10);
      expect(result.compactPrice).toBe(105);
    });
    
    test('Scenario 5: Full week rental - correct weekend surcharge calculation', () => {
      const pickupDate = createUTCDate(2025, 0, 6);
      const dropoffDate = createUTCDate(2025, 0, 12);
      const result = price('Tallinn', 'Tartu', pickupDate, dropoffDate, 'Compact', 50, 10);
      expect(result.compactPrice).toBe(355);
    });
    
    test('Scenario 6: Weekend surcharge should apply BEFORE other surcharges', () => {
      const pickupDate = createUTCDate(2025, 0, 11);
      const dropoffDate = createUTCDate(2025, 0, 12);
      const result = price('Tallinn', 'Tartu', pickupDate, dropoffDate, 'Compact', 25, 1);
      expect(result.compactPrice).toBeCloseTo(68.25, 2);
    });
  });

  // ==================== HOOAAJA TESTID ====================
  
  describe('Season Tests', () => {
    test('should apply high season surcharge (April - October)', () => {
      const pickupDate = createUTCDate(2025, 6, 15);
      const dropoffDate = createUTCDate(2025, 6, 16);
      const result = price('Tallinn', 'Tartu', pickupDate, dropoffDate, 'Compact', 30, 5);
      expect(result.compactPrice).toBe(69);
    });

    test('should NOT apply high season surcharge in low season (November - March)', () => {
      const pickupDate = createUTCDate(2025, 0, 15);
      const dropoffDate = createUTCDate(2025, 0, 17);
      const result = price('Tallinn', 'Tartu', pickupDate, dropoffDate, 'Compact', 30, 5);
      expect(result.compactPrice).toBe(90);
    });

    test('should apply high season if ANY day falls in high season', () => {
      const pickupDate = createUTCDate(2025, 2, 31);
      const dropoffDate = createUTCDate(2025, 3, 2);
      const result = price('Tallinn', 'Tartu', pickupDate, dropoffDate, 'Compact', 30, 5);
      expect(result.compactPrice).toBeCloseTo(103.5, 1);
    });
  });

  // ==================== RACER LISATASU TESTID ====================
  
  describe('Racer Surcharge Tests', () => {
    test('should apply 50% surcharge for Racer with age <=25 in high season', () => {
      const pickupDate = createUTCDate(2025, 6, 15);
      const dropoffDate = createUTCDate(2025, 6, 17);
      const result = price('Tallinn', 'Tartu', pickupDate, dropoffDate, 'Racer', 25, 10);
      expect(result.racerPrice).toBeCloseTo(129.38, 2);
    });

    test('should NOT apply Racer surcharge for age 26 in high season', () => {
      const pickupDate = createUTCDate(2025, 6, 15);
      const dropoffDate = createUTCDate(2025, 6, 17);
      const result = price('Tallinn', 'Tartu', pickupDate, dropoffDate, 'Racer', 26, 10);
      expect(result.racerPrice).toBeCloseTo(89.7, 1);
    });

    test('should NOT apply Racer surcharge in low season even if age <=25', () => {
      const pickupDate = createUTCDate(2025, 0, 15);
      const dropoffDate = createUTCDate(2025, 0, 17);
      const result = price('Tallinn', 'Tartu', pickupDate, dropoffDate, 'Racer', 25, 10);
      expect(result.racerPrice).toBe(75);
    });
  });

  // ==================== PIKA RENDI SOODUSTUSE TESTID ====================
  
describe('Long Rental Discount Tests', () => {
  test('should apply 10% discount for rentals over 10 days in low season', () => {
    const pickupDate = createUTCDate(2025, 0, 1);
    const dropoffDate = createUTCDate(2025, 0, 12);
    const result = price('Tallinn', 'Tartu', pickupDate, dropoffDate, 'Compact', 30, 10);
    expect(result.compactPrice).toBeCloseTo(329.4, 1);
  });

test('should NOT apply discount for exactly 10 days', () => {
  const pickupDate = createUTCDate(2025, 0, 1);
  const dropoffDate = createUTCDate(2025, 0, 10);
  const result = price('Tallinn', 'Tartu', pickupDate, dropoffDate, 'Compact', 30, 10);
  // 10 päeva: nädalavahetuse päevad = 2 (4. ja 5. jaanuar)
  // Arvutus: (8 * 30) + (2 * 30 * 1.05) = 240 + 63 = 303
  expect(result.compactPrice).toBe(303);
});

  test('should NOT apply discount in high season even for long rental', () => {
    const pickupDate = createUTCDate(2025, 6, 1);
    const dropoffDate = createUTCDate(2025, 6, 15);
    const result = price('Tallinn', 'Tartu', pickupDate, dropoffDate, 'Compact', 30, 10);
    expect(result.compactPrice).toBeGreaterThan(0);
  });
});

  // ==================== LOASTAŽI TESTID ====================
  
  describe('License Years Tests', () => {
    test('should add 30% surcharge for license less than 2 years', () => {
      const pickupDate = createUTCDate(2025, 0, 6);
      const dropoffDate = createUTCDate(2025, 0, 8);
      const result = price('Tallinn', 'Tartu', pickupDate, dropoffDate, 'Compact', 30, 1);
      expect(result.compactPrice).toBe(117);
    });

    test('should NOT add license surcharge for 2+ years', () => {
      const pickupDate = createUTCDate(2025, 0, 6);
      const dropoffDate = createUTCDate(2025, 0, 8);
      const result = price('Tallinn', 'Tartu', pickupDate, dropoffDate, 'Compact', 30, 2);
      expect(result.compactPrice).toBe(90);
    });

test('should add $15 daily fee for license <3 years in high season', () => {
  const pickupDate = createUTCDate(2025, 6, 1);
  const dropoffDate = createUTCDate(2025, 6, 3);
  const result = price('Tallinn', 'Tartu', pickupDate, dropoffDate, 'Compact', 30, 2);
  expect(result.compactPrice).toBeCloseTo(148.5, 2);
});

    test('should NOT add $15 daily fee for license 3+ years', () => {
      const pickupDate = createUTCDate(2025, 6, 1);
      const dropoffDate = createUTCDate(2025, 6, 3);
      const result = price('Tallinn', 'Tartu', pickupDate, dropoffDate, 'Compact', 30, 3);
      expect(result.compactPrice).toBeCloseTo(103.5, 1);
    });
  });

  // ==================== MINIMUMHINNA TESTID ====================
  
  describe('Minimum Price Tests', () => {
    test('should enforce minimum total price (age * days)', () => {
      const pickupDate = createUTCDate(2025, 6, 1);
      const dropoffDate = createUTCDate(2025, 6, 3);
      const result = price('Tallinn', 'Tartu', pickupDate, dropoffDate, 'Compact', 30, 10);
      expect(result.compactPrice).toBeGreaterThanOrEqual(90);
    });
  });

  // ==================== KÕIKIDE AUTOKLASSIDE TESTID ====================
  
  describe('All Car Classes Return Same Price', () => {
    test('should return same price for all car classes', () => {
      const pickupDate = createUTCDate(2025, 0, 6);
      const dropoffDate = createUTCDate(2025, 0, 8);
      const result = price('Tallinn', 'Tartu', pickupDate, dropoffDate, 'Compact', 30, 5);
      
      expect(result.compactPrice).toBe(result.electricPrice);
      expect(result.compactPrice).toBe(result.cabrioPrice);
      expect(result.compactPrice).toBe(result.racerPrice);
    });
  });

  // ==================== KOMBINEERITUD STSENAARIUMID ====================
  
  describe('Complex Scenarios', () => {
test('young driver (21) with Compact in high season including weekend', () => {
  const pickupDate = createUTCDate(2025, 6, 11);
  const dropoffDate = createUTCDate(2025, 6, 13);
  const result = price('Tallinn', 'Tartu', pickupDate, dropoffDate, 'Compact', 21, 2);
  expect(result.compactPrice).toBe(119.86);
});

    test('experienced driver (30) with Racer in low season long rental with weekend', () => {
      const pickupDate = createUTCDate(2025, 0, 9);
      const dropoffDate = createUTCDate(2025, 0, 20);
      const result = price('Tallinn', 'Tartu', pickupDate, dropoffDate, 'Racer', 30, 10);
      expect(result.racerPrice).toBeCloseTo(329.4, 1);
    });

    test('young driver (24) with Racer in high season including weekend', () => {
      const pickupDate = createUTCDate(2025, 6, 11);
      const dropoffDate = createUTCDate(2025, 6, 13);
      const result = price('Tallinn', 'Tartu', pickupDate, dropoffDate, 'Racer', 24, 1);
      expect(result.racerPrice).toBeCloseTo(211.84, 2);
    });
  });

  // ==================== NORMALISERIMISE TESTID ====================
  
  describe('Car Type Normalization', () => {
    test('should handle case-insensitive car type', () => {
      const pickupDate = createUTCDate(2025, 0, 6);
      const dropoffDate = createUTCDate(2025, 0, 8);
      const result1 = price('Tallinn', 'Tartu', pickupDate, dropoffDate, 'compact', 30, 5);
      const result2 = price('Tallinn', 'Tartu', pickupDate, dropoffDate, 'COMPACT', 30, 5);
      
      expect(result1.compactPrice).toBe(result2.compactPrice);
    });

    test('should handle trimmed car type', () => {
      const pickupDate = createUTCDate(2025, 0, 6);
      const dropoffDate = createUTCDate(2025, 0, 8);
      const result = price('Tallinn', 'Tartu', pickupDate, dropoffDate, '  Compact  ', 30, 5);
      
      expect(result.error).toBeUndefined();
    });
  });
});
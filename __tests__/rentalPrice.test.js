const { calculatePrice } = require('../rentalPrice');

describe('calculatePrice (Car rental pricing)', () => {
  test('Under 18 returns a helpful error (Driver too young)', () => {
    // Arrange
    const input = { pickup: 'A', dropoff: 'B', pickupDate: '2026-03-01', dropoffDate: '2026-03-01', type: 'Compact', age: 17 };
    // Act
    const result = calculatePrice(input);
    // Assert
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/too young/i);
  });

  test('Drivers 21 or younger cannot rent non-Compact cars', () => {
    // Arrange
    const input = { pickup: 'A', dropoff: 'B', pickupDate: '2026-03-01', dropoffDate: '2026-03-02', type: 'Electric', age: 21 };
    // Act
    const result = calculatePrice(input);
    // Assert
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/only rent Compact/i);
  });

  test('Drivers age 21 can rent Compact (type normalization handles lowercase)', () => {
    // Arrange
    const input = { pickup: 'A', dropoff: 'B', pickupDate: '2026-03-01', dropoffDate: '2026-03-02', type: 'compact', age: 21 };
    // Act
    const result = calculatePrice(input);
    // Assert
    expect(result.success).toBe(true);
    expect(result.carClass).toBe('Compact');
    expect(result.days).toBeGreaterThanOrEqual(1);
  });

  test('Racer young driver in high season: applies racer surcharge and high-season multiplier', () => {
    // Arrange
    const input = {
      pickup: 'A',
      dropoff: 'B',
      pickupDate: '2026-06-01',
      dropoffDate: '2026-06-03',
      type: 'Racer',
      age: 24,
    };
    // Act
    const result = calculatePrice(input);
    // Assert
    // base 100 -> racer surcharge 1.5 => 150 -> high season 1.15 => 172.5
    expect(result.success).toBe(true);
    expect(result.carClass).toBe('Racer');
    expect(result.days).toBe(3);
    expect(result.perDay).toBeCloseTo(172.5, 2);
    expect(result.total).toBeCloseTo(172.5 * 3, 2);
  });

  test('High season multiplier applies to non-racer vehicles', () => {
    // Arrange
    const input = {
      pickup: 'A',
      dropoff: 'B',
      pickupDate: '2026-06-01',
      dropoffDate: '2026-06-02',
      type: 'Electric',
      age: 30,
    };
    // Act
    const result = calculatePrice(input);
    // Assert
    // base 35 -> high season 1.15 => 40.25
    expect(result.success).toBe(true);
    expect(result.perDay).toBeCloseTo(40.25, 2);
    expect(result.days).toBe(2);
    expect(result.total).toBeCloseTo(40.25 * 2, 2);
  });

  test('Long low-season rentals (>10 days) receive 10% discount on total only', () => {
    // Arrange
    const input = {
      pickup: 'A',
      dropoff: 'B',
      pickupDate: '2026-01-01',
      dropoffDate: '2026-01-12',
      type: 'Cabrio',
      age: 35,
    };
    // Act
    const result = calculatePrice(input);
    // Assert
    // days should be 12, base 50 -> total 600
    // weekend days between 2026-01-01 and 2026-01-12: 4 -> surcharge = 50 * 0.1 * 4 = 20
    // total before discount = 620 -> 10% discount => 558
    expect(result.success).toBe(true);
    expect(result.days).toBe(12);
    expect(result.perDay).toBe(50);
    expect(result.total).toBe(558);
  });

  test('Unknown car type yields zero price but still returns a quote', () => {
    // Arrange
    const input = { pickup: 'A', dropoff: 'B', pickupDate: '2026-03-01', dropoffDate: '2026-03-01', type: 'Spaceship', age: 30 };
    // Act
    const result = calculatePrice(input);
    // Assert
    expect(result.success).toBe(true);
    expect(result.carClass).toBe('Unknown');
    expect(result.perDay).toBe(0);
    expect(result.total).toBe(0);
  });

  test('Missing type yields Unknown class and zero price', () => {
    // Arrange
    const input = { pickup: 'A', dropoff: 'B', pickupDate: '2026-03-01', dropoffDate: '2026-03-01', age: 30 };
    // Act
    const result = calculatePrice(input);
    // Assert
    expect(result.success).toBe(true);
    expect(result.carClass).toBe('Unknown');
    expect(result.perDay).toBe(0);
    expect(result.total).toBe(0);
  });

  test('High season when dropoff is in range but pickup is not (second operand)', () => {
    // Arrange: pickup in April (not in high), dropoff in June (high)
    const input = {
      pickup: 'A',
      dropoff: 'B',
      pickupDate: '2026-04-15',
      dropoffDate: '2026-06-01',
      type: 'Electric',
      age: 30,
    };
    // Act
    const result = calculatePrice(input);
    // Assert: high season multiplier applies
    expect(result.success).toBe(true);
    expect(result.perDay).toBeCloseTo(35 * 1.15, 2);
  });

  test('High season when rental spans before start and after end (third operand)', () => {
    // Arrange: pickup in April (before start), dropoff in December (after end)
    const input = {
      pickup: 'A',
      dropoff: 'B',
      pickupDate: '2026-04-01',
      dropoffDate: '2026-12-01',
      type: 'Racer',
      age: 30,
    };
    // Act
    const result = calculatePrice(input);
    // Assert: high season multiplier applies (no racer surcharge because age > 25)
    expect(result.success).toBe(true);
    expect(result.perDay).toBeCloseTo(100 * 1.15, 2);
  });

  test('Weekend surcharge applies for weekend days (10% per weekend day)', () => {
    // Arrange: Friday -> Sunday including Sat+Sun -> 2 weekend days
    const input = {
      pickup: 'A',
      dropoff: 'B',
      pickupDate: '2026-06-05',
      dropoffDate: '2026-06-07',
      type: 'Electric',
      age: 30,
    };
    // Act
    const result = calculatePrice(input);
    // Assert
    // base 35 -> high season 1.15 => 40.25 per day
    // days = 3 -> base total = 120.75
    // weekend surcharge = 10% per weekend day -> 0.1 * 40.25 * 2 = 8.05
    // expected total = 120.75 + 8.05 = 128.8
    expect(result.success).toBe(true);
    expect(result.days).toBe(3);
    expect(result.perDay).toBeCloseTo(40.25, 2);
    expect(result.weekendDays).toBe(2);
    expect(result.total).toBeCloseTo(128.8, 2);
  });

  test('No weekend surcharge when rental is only weekdays', () => {
    // Arrange: Monday -> Wednesday (no weekend)
    const input = {
      pickup: 'A',
      dropoff: 'B',
      pickupDate: '2026-06-08',
      dropoffDate: '2026-06-10',
      type: 'Electric',
      age: 30,
    };
    // Act
    const result = calculatePrice(input);
    // Assert: perDay 40.25, days 3, total = 40.25 * 3
    expect(result.success).toBe(true);
    expect(result.days).toBe(3);
    expect(result.weekendDays).toBe(0);
    expect(result.total).toBeCloseTo(40.25 * 3, 2);
  });

  test('Accepts numeric timestamps for dates (covers number parse branch)', () => {
    // Arrange: use timestamps for a Fri-Sun range that includes Sat+Sun
    const startTs = Date.parse('2026-06-05');
    const endTs = Date.parse('2026-06-07');
    const input = { pickupDate: startTs, dropoffDate: endTs, type: 'Electric', age: 30 };
    // Act
    const result = calculatePrice(input);
    // Assert: weekendDays 2
    expect(result.weekendDays).toBe(2);
    expect(result.total).toBeCloseTo(128.8, 2);
  });

  test('Accepts non-ISO date strings (fallback parsing branch)', () => {
    // Arrange: use a human-readable date string
    const input = { pickupDate: 'June 5, 2026', dropoffDate: 'June 7, 2026', type: 'Electric', age: 30 };
    // Act
    const result = calculatePrice(input);
    // Assert: weekendDays 2
    expect(result.weekendDays).toBe(2);
    expect(result.total).toBeCloseTo(128.8, 2);
  });

  test('parseToLocalDate handles undefined and Date inputs (covers first branches)', () => {
    const rp = require('../rentalPrice');
    const pd = rp.parseToLocalDate(new Date('2026-06-05'));
    expect(pd.getFullYear()).toBe(2026);
    expect(pd.getMonth()).toBe(5);
    expect(pd.getDate()).toBe(5);

    const invalid = rp.parseToLocalDate(undefined);
    expect(Number.isNaN(invalid.getTime())).toBe(true);
  });
});

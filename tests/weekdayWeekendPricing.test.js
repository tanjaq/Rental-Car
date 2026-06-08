const { calculatePrice } = require('../rentalPrice');

describe('Weekday vs Weekend pricing (TDD)', () => {

  test('Weekday rental has regular price', () => {
    // Monday 2024-04-01 → Wednesday 2024-04-03
    const start = Date.parse('2024-04-01');
    const end = Date.parse('2024-04-03');

    const result = calculatePrice(start, end, 'Compact', 50, 10);

    // 3 weekdays * 50 = 150
    expect(result).toBe('$150.00');
  });

  test('Weekend day has 5% price increase', () => {
    // Thursday → Saturday (Saturday = weekend)
    const start = Date.parse('2024-04-04');
    const end = Date.parse('2024-04-06');

    const result = calculatePrice(start, end, 'Compact', 50, 10);

    // Thu 50 + Fri 50 + Sat (50 * 1.05 = 52.5)
    // Total = 152.5
    expect(result).toBe('$152.50');
  });

});